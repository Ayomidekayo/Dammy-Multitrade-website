import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { authService } from "../modules/auth/auth.service";

interface AdminTokenPayload {
  sub: string;
  role: string;
  tokenVersion?: number;
}

export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = _req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      typeof decoded.sub !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const payload = decoded as jwt.JwtPayload & AdminTokenPayload;

    const tokenVersion =
      typeof payload.tokenVersion === "number"
        ? payload.tokenVersion
        : 0;

    const admin = await authService.getCurrentAdmin(payload.sub);

    if (admin.tokenVersion !== tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    res.locals.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return next(error);
  }
}