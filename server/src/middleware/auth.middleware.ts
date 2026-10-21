import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { authService } from "../modules/auth/auth.service";

interface AdminTokenPayload {
  sub: string;
  role: string;
}

export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = res.req?.headers.authorization;

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

    const payload: AdminTokenPayload = {
      sub: decoded.sub,
      role: typeof decoded.role === "string" ? decoded.role : "",
    };

    const admin = await authService.getCurrentAdmin(payload.sub);

    res.locals.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired.",
      });
    }

    return next(error);
  }
}