import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../config/prisma";
import { env } from "../../config/env";

import type {
  LoginInput,
  ChangePasswordInput,
} from "./auth.validation";

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be configured with a sufficiently long random secret.",
  );
}

const jwtExpiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export class AuthService {
  /**
   * Admin login
   */
  async login(input: LoginInput) {
    const admin = await prisma.admin.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthError("Invalid email or password.", 401);
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthError("Invalid email or password.", 401);
    }

    const token = jwt.sign(
      {
        role: admin.role,
        tokenVersion: admin.tokenVersion,
      },
      env.JWT_SECRET,
      {
        subject: admin.id,
        expiresIn: jwtExpiresIn,
      },
    );

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Get authenticated admin
   */
  async getCurrentAdmin(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        tokenVersion: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthError(
        "Admin account not found or inactive.",
        401,
      );
    }

    return admin;
  }

  /**
   * Change admin password
   */
  async changePassword(
    adminId: string,
    input: ChangePasswordInput,
  ) {
    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthError(
        "Admin account not found or inactive.",
        401,
      );
    }

    const passwordMatches = await bcrypt.compare(
      input.currentPassword,
      admin.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthError(
        "Your current password is incorrect.",
        400,
      );
    }

    const passwordHash = await bcrypt.hash(
      input.newPassword,
      12,
    );

    await prisma.admin.update({
      where: {
        id: adminId,
      },
      data: {
        passwordHash,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    return {
      message:
        "Password changed successfully. Please log in again.",
    };
  }
}

/**
 * Authentication errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = new AuthService();