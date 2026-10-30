import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeft,
  CheckCircle2,
  Eye,
  ImageOff,
  Layers3,
  LoaderCircle,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import ProductFormModal from "../../components/admin/component/ProductFormModel";

type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "ON_REQUEST";
type PublicationFilter = "all" | "published" | "draft";
type AvailabilityFilter = "all" | Availability;

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  _count?: { products: number };
}

interface ProductCategory {
  id: string;
  name: string;
  isActive: boolean;
}

interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

interface Product {
  id: string;
  name: string | null;
  slug: string;
  sku?: string | null;
  description?: string | null;
  categoryId: string;
  category: ProductCategory;
  availability: Availability;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  images: ProductImage[];
  createdAt: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function responseBody(response: unknown): any {
  const outer = response as { data?: unknown } | null;
  return outer?.data ?? response;
}

function extractList<T>(response: unknown): T[] {
  const body = responseBody(response);
  if (Array.isArray(body)) return body as T[];
  if (body && typeof body === "object") {
    const nested = body as { data?: unknown; items?: unknown; products?: unknown; categories?: unknown };
    if (Array.isArray(nested.data)) return nested.data as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
    if (Array.isArray(nested.products)) return nested.products as T[];
    if (Array.isArray(nested.categories)) return nested.categories as T[];
  }
  throw new Error("The admin API returned an unexpected list response.");
}

function extractTotalPages(response: unknown): number {
  const body = responseBody(response) as { pagination?: { totalPages?: number } };
  const totalPages = Number(body?.pagination?.totalPages ?? 1);
  return Number.isFinite(totalPages) && totalPages > 0 ? Math.min(Math.ceil(totalPages), 100) : 1;
}

const availabilityLabels: Record<Availability, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  ON_REQUEST: "On request",
};

const availabilityStyles: Record<Availability, string> = {
  IN_STOCK: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OUT_OF_STOCK: "border-rose-200 bg-rose-50 text-rose-700",
  ON_REQUEST: "border-amber-200 bg-amber-50 text-amber-800",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  tone: "violet" | "gold" | "green" | "blue";
}) {
  const tones = {
    violet: "from-violet-600 to-purple-800 shadow-violet-900/10",
    gold: "from-amber-400 to-yellow-500 shadow-amber-500/10",
    green: "from-emerald-500 to-teal-700 shadow-emerald-900/10",
    blue: "from-indigo-500 to-blue-700 shadow-blue-900/10",
  };
  const iconTone = tone === "gold" ? "text-[#27143A]" : "text-white";
  return (
    <article className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} p-4 text-white shadow-lg transition duration-200 hover:-translate-y-0.5 sm:p-5`}>
      <div aria-hidden="true" className="absolute -right-7 -top-8 size-28 rounded-full border-[14px] border-white/10" />
      <div className="relative flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold ${tone === "gold" ? "text-[#3F2B14]" : "text-white/80"}`}>{label}</p>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-[#241333]/15 ${iconTone}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className={`relative mt-3 text-3xl font-extrabold tracking-tight ${tone === "gold" ? "text-[#27143A]" : "text-white"}`}>{value}</p>
    </article>
  );
}

export default function AdminCategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [sortOrder, setSortOrder] = useState<"display" | "newest" | "name">("display");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      setError("The category link is incomplete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // These are the same protected admin endpoints used by ProductsPage.
      const [categoryResponse, firstProductResponse] = await Promise.all([
        apiRequest<Category[] | ApiResponse<Category[]>>("/categories/admin/all"),
        apiRequest<Product[] | ApiResponse<Product[]>>("/products/admin/all?page=1&limit=100"),
      ]);
      const categoryData = extractList<Category>(categoryResponse);
      const productPages = [extractList<Product>(firstProductResponse)];
      const totalPages = extractTotalPages(firstProductResponse);

      // Fetch any remaining admin product pages so this category view is not
      // limited to the first 100 records when the backend returns pagination.
      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            apiRequest<Product[] | ApiResponse<Product[]>>(
              `/products/admin/all?page=${index + 2}&limit=100`,
            ),
          ),
        );
        productPages.push(...remainingPages.map((response) => extractList<Product>(response)));
      }
      const productData = productPages.flat();
      const selectedCategory = categoryData.find((item) => item.id === id) ?? null;

      setCategories(categoryData);
      setCategory(selectedCategory);
      setProducts(selectedCategory
        ? productData.filter((product) => product.categoryId === selectedCategory.id)
        : []);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesSearch = !query ||
        (product.name ?? "").toLowerCase().includes(query) ||
        (product.sku ?? "").toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);
      const matchesPublication = publicationFilter === "all" ||
        (publicationFilter === "published" ? product.isPublished : !product.isPublished);
      const matchesAvailability = availabilityFilter === "all" || product.availability === availabilityFilter;
      return matchesSearch && matchesPublication && matchesAvailability;
    });

    if (sortOrder === "newest") {
      return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortOrder === "name") {
      return result.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }
    return result.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [products, search, publicationFilter, availabilityFilter, sortOrder]);

  const publishedCount = products.filter((product) => product.isPublished).length;
  const draftCount = products.length - publishedCount;
  const featuredCount = products.filter((product) => product.isFeatured).length;

  function openCreateForm() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function handleSaved(saved: Product) {
    setProducts((current) => {
      const remaining = current.filter((product) => product.id !== saved.id);
      return saved.categoryId === id ? [saved, ...remaining] : remaining;
    });
    setNotice(editingProduct ? "Product updated successfully." : "Product created successfully.");
    setShowForm(false);
    setEditingProduct(null);
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/products/${deleteTarget.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      setNotice(`“${deleteTarget.name || "Product"}” was deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!loading && !error && !category) {
    return (
      <section className="mx-auto max-w-5xl space-y-5">
        <Link to="/admin/categories" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#D9B6F2] hover:text-violet-900">
          <ArrowLeft size={16} /> Back to categories
        </Link>
        <div className="rounded-3xl border border-[#5A426E] bg-[#241333] px-5 py-16 text-center shadow-sm">
          <Layers3 className="mx-auto text-violet-500" size={34} />
          <h1 className="mt-4 text-xl font-extrabold text-[#241333]">Category not found</h1>
          <p className="mt-2 text-sm text-[#B7A7C9]">This category may have been removed or is no longer available.</p>
          <Link to="/admin/categories" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#26143B] px-4 text-sm font-bold text-white hover:bg-[#3A2056]">Return to categories</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-5 pb-6 text-[#FAF7FF] sm:space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/categories" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[#D9B6F2] transition hover:bg-[#332047] hover:text-violet-950">
          <ArrowLeft size={16} /> All categories
        </Link>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#5A426E] bg-[#241333] px-3.5 text-sm font-semibold text-[#E7D3F6] transition hover:bg-[#332047] disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <header className="relative isolate overflow-hidden rounded-3xl border border-violet-800/60 bg-gradient-to-br from-[#170B25] via-[#241238] to-[#38204F] p-5 text-white shadow-[0_18px_50px_rgba(38,20,59,0.18)] sm:p-7 lg:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border-[28px] border-white/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-1/4 size-52 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#241333]/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5B942]">
              <Layers3 size={14} /> Admin catalogue · Category detail
            </span>
            <h1 className="mt-4 break-words text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              {loading && !category ? "Loading category…" : category?.name ?? "Category products"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100/80 sm:text-base">
              {category?.description || "Manage every product assigned to this category, including publication status, availability and product details."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {category && <span className={`rounded-full border px-3 py-1.5 ${category.isActive ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-[#241333]/10 text-violet-100"}`}>{category.isActive ? "Active category" : "Inactive category"}</span>}
              {category && <span className="rounded-full border border-white/15 bg-[#241333]/10 px-3 py-1.5 text-violet-100">/{category.slug}</span>}
            </div>
          </div>
          <button type="button" onClick={openCreateForm} disabled={!category} className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-5 text-sm font-extrabold text-[#241333] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#FFD36C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#241238] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            <Plus size={18} /> Add product to category
          </button>
        </div>
      </header>

      {notice && <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><p className="min-w-0 flex-1">{notice}</p><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={16} /></button></div>}
      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 shrink-0" size={18} /><p className="min-w-0 flex-1 break-words">{error}</p><button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="shrink-0 rounded-lg border border-rose-200 bg-[#241333] px-3 py-1.5 text-xs font-bold hover:bg-rose-100">Retry</button><button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
        <StatCard label="Products in category" value={loading ? "—" : products.length} icon={Package} tone="violet" />
        <StatCard label="Published" value={loading ? "—" : publishedCount} icon={Eye} tone="green" />
        <StatCard label="Featured" value={loading ? "—" : featuredCount} icon={Star} tone="gold" />
        <StatCard label="Drafts" value={loading ? "—" : draftCount} icon={ShieldCheck} tone="blue" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#5A426E]/80 bg-[#241333] shadow-[0_10px_32px_rgba(36,19,56,0.06)]">
        <div className="border-b border-[#493459] bg-gradient-to-r from-[#241333] to-[#332047] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#241333] sm:text-lg">Products assigned to this category</h2>
              <p className="mt-1 text-xs leading-5 text-[#B7A7C9] sm:text-sm">Search, review, edit and manage products without leaving the admin workspace.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex">
              <label className="relative min-w-0 sm:col-span-2 xl:w-64">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU or slug…" aria-label="Search products in this category" className="min-h-11 w-full rounded-xl border border-[#5A426E] bg-[#241333] pl-10 pr-3 text-sm text-[#241333] outline-none transition placeholder:text-[#9F8DB4] focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              </label>
              <select value={publicationFilter} onChange={(event) => setPublicationFilter(event.target.value as PublicationFilter)} aria-label="Filter by publication status" className="min-h-11 min-w-0 rounded-xl border border-[#5A426E] bg-[#241333] px-3 text-sm text-[#E1D5ED] outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                <option value="all">All publication states</option><option value="published">Published</option><option value="draft">Drafts</option>
              </select>
              <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)} aria-label="Filter by availability" className="min-h-11 min-w-0 rounded-xl border border-[#5A426E] bg-[#241333] px-3 text-sm text-[#E1D5ED] outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                <option value="all">All availability</option><option value="IN_STOCK">In stock</option><option value="ON_REQUEST">On request</option><option value="OUT_OF_STOCK">Out of stock</option>
              </select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)} aria-label="Sort products" className="min-h-11 min-w-0 rounded-xl border border-[#5A426E] bg-[#241333] px-3 text-sm text-[#E1D5ED] outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                <option value="display">Display order</option><option value="newest">Newest first</option><option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#493459] pt-3 text-xs text-[#B7A7C9]">
            <span>Showing <strong className="text-[#241333]">{filteredProducts.length}</strong> of {products.length} products</span>
            <span className="inline-flex items-center gap-1.5"><ArrowDownUp size={14} /> Sorted by {sortOrder === "display" ? "display order" : sortOrder === "newest" ? "date added" : "name"}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-[#493459]"><div className="aspect-[5/3] bg-[#3B2851]" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 rounded bg-[#3B2851]" /><div className="h-3 w-1/2 rounded bg-[#332047]" /><div className="h-9 rounded-lg bg-[#332047]" /></div></div>)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-5 py-14 text-center sm:py-20">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#3B2851] text-[#D9B6F2]"><Package size={25} /></span>
            <h3 className="mt-4 text-lg font-extrabold text-[#241333]">{products.length === 0 ? "No products assigned yet" : "No matching products"}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#B7A7C9]">{products.length === 0 ? "Add the first product to this category. It will be assigned to this category automatically." : "Try adjusting your search or filters."}</p>
            {products.length === 0 && category && <button type="button" onClick={openCreateForm} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2A1740] px-4 text-sm font-bold text-white transition hover:bg-[#40235D]"><PackagePlus size={17} /> Add first product</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const primaryImage = product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
              return (
                <article key={product.id} className="group min-w-0 overflow-hidden rounded-2xl border border-[#493459] bg-[#241333] transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-950/10" style={{ animation: "admin-category-product-in 420ms ease both", animationDelay: `${Math.min(index * 45, 270)}ms` }}>
                  <Link to={`/admin/products/${product.id}`} className="relative block aspect-[5/3] overflow-hidden bg-[#332047] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500" aria-label={`View ${product.name || "product"} details`}>
                    {primaryImage ? <img src={primaryImage.url} alt={primaryImage.altText || product.name || "Product"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full flex-col items-center justify-center text-violet-300"><ImageOff size={30} /><span className="mt-2 text-xs font-medium">No product image</span></div>}
                    <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm ${product.isPublished ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#493459] bg-[#241333]/95 text-[#C4B6D5]"}`}>{product.isPublished ? "Published" : "Draft"}</span>
                    {product.isFeatured && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800"><Star size={11} /> Featured</span>}
                  </Link>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-extrabold text-[#241333]">{product.name || "Untitled product"}</h3>
                        <p className="mt-1 break-all text-[11px] text-[#9F8DB4]">{product.sku || product.slug}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-[#332047] px-2 py-1 text-[10px] font-bold text-[#D9B6F2]">#{product.displayOrder}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${availabilityStyles[product.availability]}`}>{availabilityLabels[product.availability]}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#9F8DB4]"><ImageOff size={12} /> {product.images?.length ?? 0} images</span>
                    </div>
                    {product.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#B7A7C9]">{product.description}</p>}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#493459] pt-3">
                      <Link to={`/admin/products/${product.id}`} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 text-xs font-bold text-indigo-800 transition hover:-translate-y-0.5 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" title="View product"><Eye size={14} /><span>View</span></Link>
                      <button type="button" onClick={() => { setEditingProduct(product); setShowForm(true); }} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 text-xs font-bold text-amber-900 transition hover:-translate-y-0.5 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" title="Edit product"><Pencil size={14} /><span>Edit</span></button>
                      <button type="button" onClick={() => setDeleteTarget(product)} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 text-xs font-bold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" title="Delete product"><Trash2 size={14} /><span>Delete</span></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showForm && category && <ProductFormModal key={editingProduct?.id ?? `new-${category.id}`} product={editingProduct} categories={categories} defaultCategoryId={category.id} onClose={() => { setShowForm(false); setEditingProduct(null); }} onSaved={handleSaved} />}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-category-product-title" className="w-full rounded-t-3xl border border-[#493459] bg-[#241333] p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 size={21} /></span>
            <h2 id="delete-category-product-title" className="mt-4 text-lg font-extrabold text-[#241333]">Delete this product?</h2>
            <p className="mt-2 text-sm leading-6 text-[#C4B6D5]">You are about to delete <strong>{deleteTarget.name || "this product"}</strong>. This action cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-[#493459] px-4 text-sm font-semibold text-[#E1D5ED] hover:bg-[#1B1029] disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={() => void deleteProduct()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60">{deleting && <LoaderCircle size={16} className="animate-spin" />}{deleting ? "Deleting…" : "Delete product"}</button>
            </div>
          </section>
        </div>
      )}

      <style>{`
        @keyframes admin-category-product-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </section>
  );
}