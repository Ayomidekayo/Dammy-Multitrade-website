import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const error = new Error(
    `Route ${req.method} ${req.originalUrl} not found`,
  ) as Error & { statusCode?: number };

  error.statusCode = 404;

  next(error);
}