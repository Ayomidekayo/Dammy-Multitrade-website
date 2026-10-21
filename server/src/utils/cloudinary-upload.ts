import { cloudinary, assertCloudinaryConfigured } from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

interface UploadImageResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<UploadImageResult> {
  assertCloudinaryConfigured();

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Cannot upload an empty image buffer.");
  }

  console.log("\n========== CLOUDINARY UPLOAD STARTED ==========");
  console.log("Upload folder:", `dammy-multitrade/${folder}`);
  console.log("Image buffer size:", buffer.length);
  console.log("Cloudinary cloud:", cloudinary.config().cloud_name);

  try {
    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `dammy-multitrade/${folder}`,
            resource_type: "image",
          },
          (error, uploadResult) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
              return;
            }

            if (!uploadResult) {
              reject(
                new Error("Cloudinary returned no upload result."),
              );
              return;
            }

            resolve(uploadResult);
          },
        );

        stream.on("error", (error: Error) => {
          console.error("Cloudinary stream error:", error);
          reject(error);
        });

        stream.end(buffer);
      },
    );

    console.log("Cloudinary upload successful.");
    console.log("Image URL:", result.secure_url);
    console.log("Image public ID:", result.public_id);
    console.log("================================================\n");

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: unknown) {
    console.error("========== CLOUDINARY UPLOAD FAILED ==========");
    console.error("Full error:", error);
    console.error("===============================================\n");

    throw new Error(
      error instanceof Error
        ? `Cloudinary upload failed: ${error.message}`
        : "Cloudinary upload failed.",
    );
  }
}

export async function deleteCloudinaryImage(
  publicId: string,
): Promise<void> {
  assertCloudinaryConfigured();

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      `Cloudinary image deletion failed: ${result.result}`,
    );
  }

  console.log("Cloudinary image deleted:", publicId);
}