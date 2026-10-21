import multer from "multer";
import type { Request } from "express";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(
      new Error(
        "Only JPEG, PNG, WebP, and AVIF images are allowed.",
      ),
    );
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});