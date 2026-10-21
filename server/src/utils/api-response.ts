import type { Response } from "express";

interface ApiResponseOptions<T> {
  message: string;
  data?: T;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions<T>,
) {
  return res.status(statusCode).json({
    success: true,
    message: options.message,
    data: options.data ?? null,
  });
}