import { categoryRepository } from "./category.repository";
import {
  deleteCloudinaryImage,
  uploadImage,
} from "../../utils/cloudinary-upload";
import { createSlug } from "../../utils/create-slug"
type CreateCategoryInput = {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
};

type UpdateCategoryInput = {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

function validateCategoryName(name: string): string {
  const normalized = name.trim();

  if (normalized.length < 2 || normalized.length > 100) {
    throw new Error(
      "Category name must contain between 2 and 100 characters.",
    );
  }

  return normalized;
}

function validateDisplayOrder(value: number | undefined): void {
  if (
    value !== undefined &&
    (!Number.isInteger(value) || value < 0)
  ) {
    throw new Error(
      "Display order must be a non-negative integer.",
    );
  }
}

export const categoryService = {
  async getPublicCategories() {
    return categoryRepository.findAll(false);
  },

  async getAllCategories() {
    return categoryRepository.findAll(true);
  },

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found.");
    }

    return category;
  },

  async createCategory(
    input: CreateCategoryInput,
    image?: Express.Multer.File,
  ) {
    const name = validateCategoryName(input.name);
    validateDisplayOrder(input.displayOrder);

    const baseSlug = createSlug(name);

    if (!baseSlug) {
      throw new Error(
        "The category name must contain letters or numbers.",
      );
    }

    const existing = await categoryRepository.findBySlug(baseSlug);

    if (existing) {
      throw new Error(
        "A category with this name already exists.",
      );
    }

    let uploadedImage:
      | { url: string; publicId: string }
      | undefined;

    if (image) {
      uploadedImage = await uploadImage(
        image.buffer,
        "categories",
      );
    }

    try {
      return await categoryRepository.create({
        name,
        slug: baseSlug,
        description: input.description?.trim() || null,
        displayOrder: input.displayOrder ?? 0,
        isActive: input.isActive ?? true,
        coverImageUrl: uploadedImage?.url ?? null,
        coverImagePublicId: uploadedImage?.publicId ?? null,
      });
    } catch (error) {
      if (uploadedImage) {
        try {
          await deleteCloudinaryImage(uploadedImage.publicId);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up a category image:",
            cleanupError,
          );
        }
      }

      throw error;
    }
  },

  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    image?: Express.Multer.File,
  ) {
    const existing = await categoryRepository.findById(id);

    if (!existing) {
      throw new Error("Category not found.");
    }

    validateDisplayOrder(input.displayOrder);

    let name: string | undefined;
    let slug: string | undefined;

    if (input.name !== undefined) {
      name = validateCategoryName(input.name);
      slug = createSlug(name);

      if (!slug) {
        throw new Error(
          "The category name must contain letters or numbers.",
        );
      }

      const existingSlug =
        await categoryRepository.findBySlug(slug);

      if (
        existingSlug &&
        existingSlug.id !== id
      ) {
        throw new Error(
          "Another category already uses this name.",
        );
      }
    }

    let uploadedImage:
      | { url: string; publicId: string }
      | undefined;

    if (image) {
      uploadedImage = await uploadImage(
        image.buffer,
        "categories",
      );
    }

    try {
      const updated = await categoryRepository.update(id, {
        ...(name !== undefined ? { name, slug } : {}),
        ...(input.description !== undefined
          ? {
              description:
                input.description?.trim() || null,
            }
          : {}),
        ...(input.displayOrder !== undefined
          ? { displayOrder: input.displayOrder }
          : {}),
        ...(input.isActive !== undefined
          ? { isActive: input.isActive }
          : {}),
        ...(uploadedImage
          ? {
              coverImageUrl: uploadedImage.url,
              coverImagePublicId: uploadedImage.publicId,
            }
          : {}),
      });

      if (
        uploadedImage &&
        existing.coverImagePublicId
      ) {
        try {
          await deleteCloudinaryImage(
            existing.coverImagePublicId,
          );
        } catch (cleanupError) {
          console.error(
            "The old category image could not be deleted:",
            cleanupError,
          );
        }
      }

      return updated;
    } catch (error) {
      if (uploadedImage) {
        try {
          await deleteCloudinaryImage(uploadedImage.publicId);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up a replacement category image:",
            cleanupError,
          );
        }
      }

      throw error;
    }
  },

  async deleteCategory(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found.");
    }

    const hasProducts =
      await categoryRepository.hasProducts(id);

    if (hasProducts) {
      throw new Error(
        "This category contains products. Move or delete its products before deleting the category.",
      );
    }

    await categoryRepository.delete(id);

    if (category.coverImagePublicId) {
      try {
        await deleteCloudinaryImage(
          category.coverImagePublicId,
        );
      } catch (cleanupError) {
        console.error(
          "The category was deleted, but its Cloudinary image could not be removed:",
          cleanupError,
        );
      }
    }

    return {
      message: "Category deleted successfully.",
    };
  },
};