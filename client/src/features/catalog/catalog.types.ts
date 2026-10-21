
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  productCount?: number;
}

export interface ProductImage {
  id?: string;
  url: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string | null;
  description?: string | null;
  categoryId: string;
  category?: Category;
  images?: ProductImage[];
  imageUrl?: string | null;
}


export interface SiteSettings {
  businessName?: string;
  slogan?: string | null;
  description?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  openingHours?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
}

