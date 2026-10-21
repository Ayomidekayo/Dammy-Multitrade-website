
import { Prisma } from "../../generated/prisma/client";
import type { ProductAvailability } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import {
  deleteCloudinaryImage,
  uploadImage,
} from "../../utils/cloudinary-upload";
import { productRepository } from "./product.repository";
import type {
  CreateProductInput,
  ProductListFilters,
  UpdateProductInput,
} from "./product.types";

type UploadedImage = {
  url: string;
  publicId: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProductBaseSlug(name?: string | null): string {
  const base = slugify(name?.trim() || "product");
  return base || "product";
}

async function generateUniqueSlug(
  name: string | null | undefined,
  excludeId?: string,
): Promise<string> {
  const base = getProductBaseSlug(name);

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate =
      attempt === 0
        ? base
        : `${base}-${crypto.randomUUID().slice(0, 8)}`;

    const conflict = await productRepository.findSlugConflict(
      candidate,
      excludeId,
    );

    if (!conflict) {
      return candidate;
    }
  }

  throw new Error(
    "Unable to generate a unique product slug. Please try again.",
  );
}

function normalizeProductName(
  name: string | null | undefined,
): string | null | undefined {
  if (name === undefined || name === null) {
    return name;
  }

  const normalized = name.trim();

  return normalized || null;
}

async function uploadProductImages(
  files: Express.Multer.File[],
): Promise<UploadedImage[]> {
  const uploaded: UploadedImage[] = [];

  try {
    for (const file of files) {
      const image = await uploadImage(file.buffer, "products");

      uploaded.push(image);
    }

    return uploaded;
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) =>
        deleteCloudinaryImage(image.publicId),
      ),
    );

    throw error;
  }
}

export const productService = {
  async getPublicProducts(filters: ProductListFilters) {
    const result = await productRepository.findMany({
      ...filters,
      isPublished: true,
    });

    return {
      ...result,
      items: result.items.filter(
        (product) => product.category.isActive,
      ),
    };
  },

  async getAllProducts(filters: ProductListFilters) {
    return productRepository.findMany(filters);
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found.");
    }

    return product;
  },

  async getPublicProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);

    if (
      !product ||
      !product.isPublished ||
      !product.category.isActive
    ) {
      throw new Error("Product not found.");
    }

    return product;
  },

  async createProduct(
    input: CreateProductInput,
    files: Express.Multer.File[] = [],
  ) {
    const category = await productRepository.findByCategoryId(
      input.categoryId,
    );

    if (!category) {
      throw new Error("Category not found.");
    }

    const name = normalizeProductName(input.name);
    const slug = await generateUniqueSlug(name);

    const uploadedImages = await uploadProductImages(files);

    try {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            categoryId: input.categoryId,
            name,
            slug,
            availability:
              input.availability ?? "ON_REQUEST",
            isPublished: input.isPublished ?? true,
            isFeatured: input.isFeatured ?? false,
            displayOrder: input.displayOrder ?? 0,
          },
        });

        if (uploadedImages.length > 0) {
          await tx.productImage.createMany({
            data: uploadedImages.map((image, index) => ({
              productId: product.id,
              url: image.url,
              publicId: image.publicId,
              isPrimary: index === 0,
              displayOrder: index,
            })),
          });
        }

        return tx.product.findUniqueOrThrow({
          where: { id: product.id },
          include: {
            category: true,
            images: {
              orderBy: [
                { isPrimary: "desc" },
                { displayOrder: "asc" },
              ],
            },
          },
        });
      });
    } catch (error) {
      await Promise.allSettled(
        uploadedImages.map((image) =>
          deleteCloudinaryImage(image.publicId),
        ),
      );

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(
          "A product with this slug already exists. Please try again.",
        );
      }

      throw error;
    }
  },

  async updateProduct(
    id: string,
    input: UpdateProductInput,
    files: Express.Multer.File[] = [],
  ) {
    const existing = await productRepository.findById(id);

    if (!existing) {
      throw new Error("Product not found.");
    }

    if (input.categoryId) {
      const category = await productRepository.findByCategoryId(
        input.categoryId,
      );

      if (!category) {
        throw new Error("Category not found.");
      }
    }

    const normalizedName = normalizeProductName(input.name);

    const slug =
      input.name !== undefined
        ? await generateUniqueSlug(normalizedName, id)
        : existing.slug;

    const uploadedImages = await uploadProductImages(files);

    try {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...(input.categoryId !== undefined
              ? { categoryId: input.categoryId }
              : {}),
            ...(input.name !== undefined
              ? { name: normalizedName, slug }
              : {}),
            ...(input.availability !== undefined
              ? { availability: input.availability }
              : {}),
            ...(input.isPublished !== undefined
              ? { isPublished: input.isPublished }
              : {}),
            ...(input.isFeatured !== undefined
              ? { isFeatured: input.isFeatured }
              : {}),
            ...(input.displayOrder !== undefined
              ? { displayOrder: input.displayOrder }
              : {}),
          },
        });

        if (uploadedImages.length > 0) {
          await tx.productImage.createMany({
            data: uploadedImages.map((image, index) => ({
              productId: id,
              url: image.url,
              publicId: image.publicId,
              isPrimary: existing.images.length === 0 && index === 0,
              displayOrder: existing.images.length + index,
            })),
          });
        }

        return tx.product.findUniqueOrThrow({
          where: { id },
          include: {
            category: true,
            images: {
              orderBy: [
                { isPrimary: "desc" },
                { displayOrder: "asc" },
              ],
            },
          },
        });
      });

      return updated;
    } catch (error) {
      await Promise.allSettled(
        uploadedImages.map((image) =>
          deleteCloudinaryImage(image.publicId),
        ),
      );

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(
          "A product with this slug already exists. Please try again.",
        );
      }

      throw error;
    }
  },

  async deleteProduct(id: string) {
    const existing = await productRepository.findById(id);

    if (!existing) {
      throw new Error("Product not found.");
    }

    const deleted = await productRepository.delete(id);

    const cleanup = await Promise.allSettled(
      deleted.images.map((image) =>
        deleteCloudinaryImage(image.publicId),
      ),
    );

    const failedCleanupCount = cleanup.filter(
      (result) => result.status === "rejected",
    ).length;

    return {
      message: "Product deleted successfully.",
      failedImageCleanupCount: failedCleanupCount,
    };
  },

  async deleteProductImage(productId: string, imageId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    const image = product.images.find(
      (item) => item.id === imageId,
    );

    if (!image) {
      throw new Error("Product image not found.");
    }

    await productRepository.deleteImage(image.id);

    try {
      await deleteCloudinaryImage(image.publicId);
    } catch (error) {
      console.error(
        "Product image was deleted from the database but Cloudinary cleanup failed:",
        error,
      );
    }

    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "asc" },
        ],
      });

      if (nextImage) {
        await prisma.$transaction(async (tx) => {
          await tx.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });

          await tx.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        });
      }
    }

    return { message: "Product image deleted successfully." };
  },

  async setPrimaryProductImage(
    productId: string,
    imageId: string,
  ) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    if (!product.images.some((image) => image.id === imageId)) {
      throw new Error("Product image not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      await tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });

    return productRepository.findById(productId);
  },
};
