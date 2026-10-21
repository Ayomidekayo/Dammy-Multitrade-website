import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing from your .env file.");
  }

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured.",
    );
  }

  if (password.length < 12) {
    throw new Error(
      "The admin password must contain at least 12 characters.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        isActive: true,
      },
      create: {
        name,
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    console.log("Admin account created or updated successfully.");
    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Admin seeding failed:", error);
  process.exitCode = 1;
});