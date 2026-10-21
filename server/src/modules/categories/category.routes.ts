import { Router } from "express";

import { categoryController } from "./category.controller";
import { upload } from "../../middleware/upload.middleware";

// Replace this import with your actual authentication middleware.
import { requireAdmin } from "../../middleware/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// List active categories.
router.get("/", categoryController.getPublicCategories);

// View a category.
router.get("/:id", categoryController.getCategoryById);

/*
|--------------------------------------------------------------------------
| Protected administrative routes
|--------------------------------------------------------------------------
*/

// List all categories, including inactive categories.
router.get(
  "/admin/all",
  requireAdmin,
  categoryController.getAllCategories,
);

// Create a category, optionally with a cover image.
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  categoryController.createCategory,
);

// Update a category, optionally replacing its cover image.
router.patch(
  "/:id",
  requireAdmin,
  upload.single("image"),
  categoryController.updateCategory,
);

// Delete a category.
router.delete(
  "/:id",
  requireAdmin,
  categoryController.deleteCategory,
);

export default router;