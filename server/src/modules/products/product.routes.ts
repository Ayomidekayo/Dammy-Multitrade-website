
import { Router } from "express";

import { productController } from "./product.controller";
import { upload } from "../../middleware/upload.middleware";
import { requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public catalogue routes
|--------------------------------------------------------------------------
*/

// List published products.
router.get("/", productController.getPublicProducts);

// View a published product by slug.
router.get("/slug/:slug", productController.getPublicProductBySlug);

/*
|--------------------------------------------------------------------------
| Protected admin routes
|--------------------------------------------------------------------------
*/

// List all products, including unpublished products.
router.get(
  "/admin/all",
  requireAdmin,
  productController.getAllProducts,
);

// View a product by ID.
router.get(
  "/admin/:id",
  requireAdmin,
  productController.getProductById,
);

// Create a product with up to 10 images.
router.post(
  "/",
  requireAdmin,
  upload.array("images", 10),
  productController.createProduct,
);

// Update a product and optionally append images.
router.patch(
  "/:id",
  requireAdmin,
  upload.array("images", 10),
  productController.updateProduct,
);

// Select a product's primary image.
router.patch(
  "/:id/images/:imageId/primary",
  requireAdmin,
  productController.setPrimaryProductImage,
);

// Delete a product image.
router.delete(
  "/:id/images/:imageId",
  requireAdmin,
  productController.deleteProductImage,
);

// Delete a product and its associated images.
router.delete(
  "/:id",
  requireAdmin,
  productController.deleteProduct,
);

export default router;
