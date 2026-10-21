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

// A valid one-pixel PNG.
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ1sAAAAASUVORK5CYII=",
  "base64",
);

const timestamp = Math.floor(Date.now() / 1000);
const params = {
  folder: "dammy-multitrade/test",
  timestamp,
};

const signature = cloudinary.utils.api_sign_request(
  params,
  apiSecret,
);

const form = new FormData();

form.append("file", new Blob([image], { type: "image/png" }), "test.png");
form.append("api_key", apiKey);
form.append("timestamp", String(timestamp));
form.append("folder", params.folder);
form.append("signature", signature);

try {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  console.log("HTTP status:", response.status);
  console.log("X-Cld-Error:", response.headers.get("X-Cld-Error"));
  console.log("Content-Type:", response.headers.get("content-type"));
  console.log("Response body:", await response.text());
} catch (error) {
  console.error("HTTP request failed:", error);
}