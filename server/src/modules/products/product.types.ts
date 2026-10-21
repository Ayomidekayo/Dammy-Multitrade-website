
import type { ProductAvailability } from "../../generated/prisma/client";

export type { ProductAvailability };

export interface CreateProductInput {
  categoryId: string;
  name?: string | null;
  availability?: ProductAvailability;
  isPublished?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateProductInput {
  categoryId?: string;
  name?: string | null;
  availability?: ProductAvailability;
  isPublished?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface CreateProductImageInput {
  url: string;
  publicId: string;
  altText?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface UpdateProductImageInput {
  altText?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface ProductListFilters {
  categoryId?: string;
  availability?: ProductAvailability;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductImageUploadResult {
  url: string;
  publicId: string;
}
