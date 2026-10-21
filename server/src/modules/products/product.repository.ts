
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import type {
  ProductListFilters,
} from "./product.types";

const productInclude = {
  category: true,
  images: {
    orderBy: [
      { isPrimary: "desc" as const },
      { displayOrder: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
} satisfies Prisma.ProductInclude;

export const productRepository = {
  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
  },

  findByCategoryId(categoryId: string) {
    return prisma.category.findUnique({
      where: { id: categoryId },
    });
  },

  async findMany(filters: ProductListFilters) {
    const {
      categoryId,
      availability,
      isPublished,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(categoryId ? { categoryId } : {}),
      ...(availability ? { availability } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                slug: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: productInclude,
    });
  },

  update(
    id: string,
    data: Prisma.ProductUpdateInput,
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });
  },

  delete(id: string) {
    return prisma.product.delete({
      where: { id },
      include: productInclude,
    });
  },

  findSlugConflict(slug: string, excludeId?: string) {
    return prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
  },

  createImage(
    data: Prisma.ProductImageUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.productImage.create({ data });
  },

  updateImage(
    id: string,
    data: Prisma.ProductImageUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.productImage.update({
      where: { id },
      data,
    });
  },

  deleteImage(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.productImage.delete({
      where: { id },
    });
  },

  async setPrimaryImage(
    productId: string,
    imageId: string,
    tx: Prisma.TransactionClient,
  ) {
    await tx.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    return tx.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  },
};
