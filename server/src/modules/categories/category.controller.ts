import type { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction,
) {
  if (
    error instanceof Error &&
    (
      error.message === "Category not found." ||
      error.message === "A category with this name already exists." ||
      error.message === "Another category already uses this name." ||
      error.message === "This category contains products. Move or delete its products before deleting the category."
    )
  ) {
    const status =
      error.message === "Category not found."
        ? 404
        : 409;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error instanceof Error &&
    (
      error.message.includes("Category name must") ||
      error.message.includes("Display order must") ||
      error.message.includes("category name must contain")
    )
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
}

export const categoryController = {
 async getPublicCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories =
      await categoryService.getPublicCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
},

  async getAllCategories(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const categories =
        await categoryService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {

        const categoryId = req.params.id;

if (typeof categoryId !== "string") {
  return res.status(400).json({
    success: false,
    message: "Invalid category ID.",
  });
}

const category =
  await categoryService.getCategoryById(categoryId);
      

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

 async createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("\n========== CREATE CATEGORY ==========");
  console.log("Request content type:", req.headers["content-type"]);
  console.log("Request body:", req.body);
  console.log("Image received:", Boolean(req.file));

  if (req.file) {
    console.log("Image filename:", req.file.originalname);
    console.log("Image MIME type:", req.file.mimetype);
    console.log("Image size:", req.file.size);
    console.log("Image buffer exists:", Boolean(req.file.buffer));
    console.log("Image buffer length:", req.file.buffer?.length);
  } else {
    console.warn("NO IMAGE RECEIVED BY MULTER");
  }

  try {
    if (
      typeof req.body.name !== "string" ||
      !req.body.name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const category = await categoryService.createCategory(
      {
        name: req.body.name,
        description: req.body.description,
        displayOrder:
          req.body.displayOrder === undefined
            ? undefined
            : Number(req.body.displayOrder),
        isActive:
          req.body.isActive === undefined
            ? undefined
            : req.body.isActive === "true" ||
              req.body.isActive === true,
      },
      req.file,
    );

    console.log("CATEGORY CREATED SUCCESSFULLY");
    console.log("Category ID:", category.id);
    console.log("Category image URL:", category.coverImageUrl);
    console.log("Category image public ID:", category.coverImagePublicId);
    console.log("=====================================\n");

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("CATEGORY CREATION FAILED:", error);
    return handleError(error, res, next);
  }
},

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const categoryId = req.params.id;

if (typeof categoryId !== "string") {
  return res.status(400).json({
    success: false,
    message: "Invalid category ID.",
  });
}

const category =
  await categoryService.updateCategory(
    categoryId,
          {
            name: req.body.name,
            description: req.body.description,
            displayOrder:
              req.body.displayOrder === undefined
                ? undefined
                : Number(req.body.displayOrder),
            isActive:
              req.body.isActive === undefined
                ? undefined
                : req.body.isActive === "true" ||
                  req.body.isActive === true,
          },
          req.file,
        );

      return res.status(200).json({
        success: true,
        message: "Category updated successfully.",
        data: category,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {

        
     const categoryId = req.params.id;

if (typeof categoryId !== "string") {
  return res.status(400).json({
    success: false,
    message: "Invalid category ID.",
  });
}

const result =
  await categoryService.deleteCategory(categoryId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },
};