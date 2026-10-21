
import { z } from "zod";

export const productAvailabilitySchema = z.enum([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "ON_REQUEST",
]);

const optionalNameSchema = z
  .string()
  .trim()
  .max(200, "Product name cannot exceed 200 characters.")
  .nullable()
  .optional();

const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "Category is required.");

const displayOrderSchema = z
  .number()
  .int("Display order must be a whole number.")
  .min(0, "Display order cannot be negative.");

export const createProductSchema = z
  .object({
    categoryId: categoryIdSchema,
    name: optionalNameSchema,
    availability: productAvailabilitySchema.optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    displayOrder: displayOrderSchema.optional(),
  })
  .strict();

export const updateProductSchema = z
  .object({
    categoryId: categoryIdSchema.optional(),
    name: optionalNameSchema,
    availability: productAvailabilitySchema.optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    displayOrder: displayOrderSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Provide at least one field to update.",
    },
  );

export const productListFiltersSchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  availability: productAvailabilitySchema.optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductPayload = z.infer<
  typeof createProductSchema
>;

export type UpdateProductPayload = z.infer<
  typeof updateProductSchema
>;

export type ProductListFiltersPayload = z.infer<
  typeof productListFiltersSchema
>;
