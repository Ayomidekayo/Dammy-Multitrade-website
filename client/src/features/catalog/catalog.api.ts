

import type {
  Category,
  Product,
  SiteSettings,
} from "./catalog.types";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const result: any = await response.json();

  // Support common API shapes:
  // { data: [...] }, { success: true, data: [...] }, or a raw array/object.
  return result?.data?.data ?? result?.data ?? result;
}

function normalizeCategory(raw: any): Category {
  return {
    id: String(raw.id),
    name: raw.name ?? raw.title ?? "Untitled category",
    slug: raw.slug ?? String(raw.id),
    description: raw.description ?? null,
    coverImageUrl: raw.coverImageUrl ?? raw.imageUrl ?? null,
    productCount: raw.productCount ?? raw._count?.products ?? undefined,
  };
}

function normalizeProduct(raw: any): Product {
  const images = Array.isArray(raw.images)
    ? raw.images.map((image: any) => ({
        id: image.id,
        url: image.url ?? image.imageUrl ?? "",
        isPrimary: Boolean(image.isPrimary ?? image.isPrimaryImage),
      }))
    : [];

  return {
    id: String(raw.id),
    name: raw.name ?? raw.title ?? "Untitled product",
    slug: raw.slug,
    sku: raw.sku ?? null,
    description: raw.description ?? null,
    categoryId: String(raw.categoryId ?? raw.category?.id ?? ""),
    category: raw.category ? normalizeCategory(raw.category) : undefined,
    images: images.filter((image: any) => image.url),
    imageUrl: raw.imageUrl ?? raw.primaryImageUrl ?? null,
  };
}

export const catalogApi = {
  async getCategories(): Promise<Category[]> {
    const result = await request<any>("/categories");
    const items = Array.isArray(result)
      ? result
      : result?.categories ?? result?.items ?? [];

    return items
      .filter((item: any) => item.isActive !== false)
      .map(normalizeCategory);
  },

  async getCategory(slug: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find((category) => category.slug === slug);
  },

  async getProducts(): Promise<Product[]> {
    const result = await request<any>("/products");
    const items = Array.isArray(result)
      ? result
      : result?.products ?? result?.items ?? [];

    return items
      .filter((item: any) => item.isActive !== false)
      .map(normalizeProduct);
  },

  async getSettings(): Promise<SiteSettings> {
    return request<SiteSettings>("/site-settings");
  },
};
