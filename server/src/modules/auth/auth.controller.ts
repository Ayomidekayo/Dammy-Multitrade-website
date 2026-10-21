import type { Request, Response } from "express";

import { env } from "../../config/env";
import { AuthError, authService } from "./auth.service";
import { loginSchema } from "./auth.validation";

export class AuthController {
  async login(req: Request, res: Response) {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    try {
      const result = await authService.login(validation.data);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Admin login failed:", error);

      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred during login.",
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const adminId = res.locals.admin?.id as string | undefined;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Authentication is required.",
        });
      }

      const admin = await authService.getCurrentAdmin(adminId);

      return res.status(200).json({
        success: true,
        message: "Admin profile retrieved successfully.",
        data: admin,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error("Fetching admin profile failed:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve the admin profile.",
      });
    }
  }
}

export const authController = new AuthController();