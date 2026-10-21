import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are missing.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

async function testUpload() {
  console.log("Cloud name:", cloudName);
  console.log("Testing signed image upload...");

  const imageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ1sAAAAASUVORK5CYII=",
    "base64",
  );

  try {
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBuffer.toString("base64")}`,
      {
        folder: "dammy-multitrade/test",
        resource_type: "image",
      },
    );

    console.log("UPLOAD SUCCESSFUL");
    console.log("Public ID:", result.public_id);
    console.log("Secure URL:", result.secure_url);
  } catch (error) {
    console.error("UPLOAD FAILED");
    console.dir(error, { depth: 10 });

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }
  }
}

void testUpload();