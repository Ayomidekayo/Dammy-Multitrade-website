import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { LoginInput } from "./auth.validation";


if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be configured with a sufficiently long random secret.",
  );
}

const jwtExpiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export class AuthService {
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
      },
    });

    if (!admin || !admin.isActive) {
      throw new AuthError("Admin account not found or inactive.", 401);
    }

    return admin;
  }
}

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