import express from "express";
import cors from "cors";

import { env } from "./config/env";

import { notFoundHandler } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";

import authRoutes from "./modules/auth/auth.routes";
import categoriesRoutes from "./modules/categories/category.routes";
import productsRoutes from "./modules/products/product.routes";
import siteSettingsRoutes from "./modules/site-settings/site-settings.routes";

const app = express();

app.disable("x-powered-by");

const allowedOrigins = [
  "http://localhost:5173",
  "https://dammy-multitrade-website-client-self.vercel.app",
  env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Dammy Multitrade API is running.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/site-settings", siteSettingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;