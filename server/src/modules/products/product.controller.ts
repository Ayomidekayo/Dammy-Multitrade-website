
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { productService } from "./product.service";
import {
  createProductSchema,
  updateProductSchema,
  productListFiltersSchema,
} from "./product.validation";

function parseBooleanQuery(value: unknown): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof Error) {
    const notFoundMessages = [
      "Product not found.",
      "Product image not found.",
      "Category not found.",
    ];

    if (notFoundMessages.includes(error.message)) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    const conflictMessages = [
      "A product with this slug already exists. Please try again.",
    ];

    if (conflictMessages.includes(error.message)) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
  }

  return next(error);
}

function getStringParam(
  value: string | string[] | undefined,
): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

export const productController = {
  async getPublicProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = productListFiltersSchema.safeParse({
        categoryId: req.query.categoryId,
        availability: req.query.availability,
        isFeatured: parseBooleanQuery(req.query.isFeatured),
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product filters.",
          errors: parsed.error.flatten(),
        });
      }

      const result = await productService.getPublicProducts(
        parsed.data,
      );

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getPublicProductBySlug(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = getStringParam(req.params.slug);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Invalid product slug.",
        });
      }

      const product =
        await productService.getPublicProductBySlug(slug);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = productListFiltersSchema.safeParse({
        categoryId: req.query.categoryId,
        availability: req.query.availability,
        isPublished: parseBooleanQuery(req.query.isPublished),
        isFeatured: parseBooleanQuery(req.query.isFeatured),
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product filters.",
          errors: parsed.error.flatten(),
        });
      }

      const result = await productService.getAllProducts(
        parsed.data,
      );

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  },

  async getProductById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getStringParam(req.params.id);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      const product = await productService.getProductById(id);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const body = {
        ...req.body,
        ...(req.body?.displayOrder !== undefined
          ? { displayOrder: Number(req.body.displayOrder) }
          : {}),
        ...(req.body?.isPublished !== undefined
          ? { isPublished: parseBooleanQuery(req.body.isPublished) }
          : {}),
        ...(req.body?.isFeatured !== undefined
          ? { isFeatured: parseBooleanQuery(req.body.isFeatured) }
          : {}),
      };

      const parsed = createProductSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data.",
          errors: parsed.error.flatten(),
        });
      }

      const files = Array.isArray(req.files)
        ? req.files
        : [];

      const product = await productService.createProduct(
        parsed.data,
        files,
      );

      return res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getStringParam(req.params.id);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      const body = {
        ...req.body,
        ...(req.body?.displayOrder !== undefined
          ? { displayOrder: Number(req.body.displayOrder) }
          : {}),
        ...(req.body?.isPublished !== undefined
          ? { isPublished: parseBooleanQuery(req.body.isPublished) }
          : {}),
        ...(req.body?.isFeatured !== undefined
          ? { isFeatured: parseBooleanQuery(req.body.isFeatured) }
          : {}),
      };

      const parsed = updateProductSchema.safeParse(body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid product update data.",
          errors: parsed.error.flatten(),
        });
      }

      const files = Array.isArray(req.files)
        ? req.files
        : [];

      const product = await productService.updateProduct(
        id,
        parsed.data,
        files,
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: product,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = getStringParam(req.params.id);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      const result = await productService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async deleteProductImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const productId = getStringParam(req.params.id);
      const imageId = getStringParam(req.params.imageId);

      if (!productId || !imageId) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or image ID.",
        });
      }

      const result = await productService.deleteProductImage(
        productId,
        imageId,
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },

  async setPrimaryProductImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const productId = getStringParam(req.params.id);
      const imageId = getStringParam(req.params.imageId);

      if (!productId || !imageId) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or image ID.",
        });
      }

      const product =
        await productService.setPrimaryProductImage(
          productId,
          imageId,
        );

      return res.status(200).json({
        success: true,
        message: "Primary product image updated successfully.",
        data: product,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },
};
