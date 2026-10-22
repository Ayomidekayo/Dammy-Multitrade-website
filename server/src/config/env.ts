import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: nodeEnv,

  CLIENT_URL:
    process.env.CLIENT_URL || "http://localhost:5173",

  DATABASE_URL: requiredEnv("DATABASE_URL"),

  JWT_SECRET: requiredEnv("JWT_SECRET"),

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME || "",

  CLOUDINARY_API_KEY:
    process.env.CLOUDINARY_API_KEY || "",

  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET || "",
};