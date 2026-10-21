import { prisma } from "../../config/prisma";


export const categoryRepository = {
  findAll(includeInactive = false) {
    return prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
  },

  create(data: {
    name: string;
    slug: string;
    description?: string | null;
    coverImageUrl?: string | null;
    coverImagePublicId?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return prisma.category.create({
      data,
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      coverImageUrl?: string | null;
      coverImagePublicId?: string | null;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

  async hasProducts(id: string) {
    const count = await prisma.product.count({
      where: { categoryId: id },
    });

    return count > 0;
  },
};