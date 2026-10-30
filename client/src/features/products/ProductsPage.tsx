import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  Eye,
  ImageOff,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../lib/api";
import ProductFormModal from "../../components/admin/component/ProductFormModel";

type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "ON_REQUEST";

interface Category {
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
  categoryId: string;
  category: Category;
  availability: Availability;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  images: ProductImage[];
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const availabilityLabels: Record<Availability, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  ON_REQUEST: "On request",
};

function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getProductImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0]
  );
}

function getAvailabilityStyle(availability: Availability) {
  switch (availability) {
    case "IN_STOCK":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "OUT_OF_STOCK":
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    default:
      return "border-amber-300/20 bg-amber-300/10 text-[#F5CB79]";
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        apiRequest<Product[] | ApiResponse<Product[]>>(
          "/products/admin/all?limit=100",
        ),
        apiRequest<Category[] | ApiResponse<Category[]>>(
          "/categories/admin/all",
        ),
      ]);

      const productData = Array.isArray(productResponse.data)
        ? productResponse.data
        : (productResponse.data as ApiResponse<Product[]>).data;

      const categoryData = Array.isArray(categoryResponse.data)
        ? categoryResponse.data
        : (categoryResponse.data as ApiResponse<Category[]>).data;

      if (!Array.isArray(productData) || !Array.isArray(categoryData)) {
        throw new Error("The API returned an unexpected response.");
      }

      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          (product.name ?? "").toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === "all" || product.categoryId === categoryFilter;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "published"
            ? product.isPublished
            : !product.isPublished);

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [products, search, categoryFilter, statusFilter]);

  const publishedCount = products.filter((product) => product.isPublished).length;
  const featuredCount = products.filter((product) => product.isFeatured).length;
  const unpublishedCount = products.length - publishedCount;

  async function deleteProduct() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/products/${deleteTarget.id}`, {
        method: "DELETE",
      });

      setProducts((current) =>
        current.filter((product) => product.id !== deleteTarget.id),
      );
      setNotice("Product deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(product: Product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current];
    });

    setNotice(
      editingProduct
        ? "Product updated successfully."
        : "Product created successfully.",
    );
    setShowForm(false);
    setEditingProduct(null);
  }

  const stats = [
    {
      label: "Total products",
      value: products.length,
      icon: <Package size={19} />,
      iconStyle: "bg-[#F5B942]/10 text-[#F5CB79]",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: <Eye size={19} />,
      iconStyle: "bg-emerald-400/10 text-emerald-300",
    },
    {
      label: "Featured",
      value: featuredCount,
      icon: <Star size={19} />,
      iconStyle: "bg-amber-300/10 text-amber-200",
    },
    {
      label: "Drafts",
      value: unpublishedCount,
      icon: <ShieldCheck size={19} />,
      iconStyle: "bg-violet-400/10 text-violet-200",
    },
  ];

  return (
    <section className="dm-admin-page mx-auto w-full max-w-[1600px] min-w-0 space-y-5 text-[#E1D5ED] sm:space-y-7">
      {/* Page heading */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-[#493459] bg-gradient-to-br from-[#1B1029] via-[#2A1A3D] to-[#3A2450] p-5 shadow-[0_18px_55px_rgba(10,4,18,0.2)] sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full border-[34px] border-[#B99BD1]/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 -z-10 size-48 rounded-full bg-[#F5B942]/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#80609A]/50 bg-[#332047]/80 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[#F5CB79] sm:text-xs">
              <Package size={14} /> CATALOGUE MANAGEMENT
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#FAF7FF] sm:text-3xl lg:text-4xl">
              Products
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#B7A7C9] sm:text-base">
              Manage your product catalogue, organise categories, control
              visibility and showcase your inventory to customers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-extrabold text-[#1B1029] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#F7C85F] focus:outline-none focus:ring-4 focus:ring-[#F5B942]/25 sm:w-auto"
          >
            <Plus size={19} /> Add product
          </button>
        </div>
      </header>

      {/* Success and error messages */}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="rounded-lg p-1 transition hover:bg-emerald-400/10"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="min-w-0 flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-rose-400/10"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="min-w-0 rounded-2xl border border-[#493459] bg-[#241333] p-4 shadow-[0_8px_24px_rgba(8,3,15,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-[#80609A] sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#B7A7C9] sm:text-sm">
                {stat.label}
              </p>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10 ${stat.iconStyle}`}
              >
                {stat.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#FAF7FF] sm:text-3xl">
              {loading ? "—" : stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Search and filters */}
      <section className="rounded-2xl border border-[#493459] bg-[#241333] p-4 shadow-[0_8px_24px_rgba(8,3,15,0.12)] sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F8DB4]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or slug..."
              className="min-h-12 w-full rounded-xl border border-[#493459] bg-[#1B1029] pl-11 pr-4 text-sm text-[#FAF7FF] outline-none transition placeholder:text-[#806B96] focus:border-[#B99BD1] focus:ring-4 focus:ring-[#B99BD1]/10"
            />
          </label>

          <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-12 min-w-0 w-full rounded-xl border border-[#493459] bg-[#1B1029] px-3 text-xs text-[#E1D5ED] outline-none focus:border-[#B99BD1] focus:ring-4 focus:ring-[#B99BD1]/10 sm:text-sm lg:min-w-44"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="min-h-12 min-w-0 w-full rounded-xl border border-[#493459] bg-[#1B1029] px-3 text-xs text-[#E1D5ED] outline-none focus:border-[#B99BD1] focus:ring-4 focus:ring-[#B99BD1]/10 sm:text-sm lg:min-w-36"
              aria-label="Filter by publication status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#60466F] bg-[#332047] px-4 text-sm font-bold text-[#E1D5ED] transition hover:border-[#8C6BA5] hover:bg-[#3A2850] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#493459] pt-4 text-xs text-[#9F8DB4] sm:text-sm">
          <span>
            Showing <strong className="font-bold text-[#FAF7FF]">{filteredProducts.length}</strong> of {products.length} products
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDownUp size={14} /> Ordered by display position
          </span>
        </div>
      </section>

      {/* Product cards: one responsive grid for mobile, tablet and desktop */}
      <section className="overflow-hidden rounded-3xl border border-[#493459] bg-[#241333] shadow-[0_18px_45px_rgba(8,3,15,0.16)]">
        <div className="flex flex-col gap-2 border-b border-[#493459] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F5CB79]">
              Your inventory
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-[#FAF7FF] sm:text-xl">
              Product catalogue
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#9F8DB4] sm:text-sm">
              View product information and manage your catalogue.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#60466F] bg-[#332047] px-3 py-1.5 text-xs font-bold text-[#E1D5ED]">
            <Package size={14} className="text-[#F5CB79]" />
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 p-4 min-[520px]:grid-cols-2 sm:gap-5 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#493459] bg-[#2B1B3D]"
              >
                <div className="aspect-[16/10] animate-pulse bg-[#3A2850]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#493459]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#493459]" />
                  <div className="h-10 animate-pulse rounded-xl bg-[#493459]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl border border-[#60466F] bg-[#332047] text-[#F5CB79]">
              <Package size={30} />
            </span>
            <h3 className="mt-4 font-bold text-[#FAF7FF]">
              {products.length === 0
                ? "Your catalogue is ready to grow"
                : "No products found"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#9F8DB4]">
              {products.length === 0
                ? "Add your first product and start building your online catalogue."
                : "Try changing your search or filters to find a product."}
            </p>
            {products.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F5B942] px-4 text-sm font-extrabold text-[#1B1029] transition hover:bg-[#F7C85F]"
              >
                <Plus size={17} /> Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 p-4 min-[520px]:grid-cols-2 sm:gap-5 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const image = getProductImage(product);
              const productName = product.name || "Untitled product";

              return (
                <article
                  key={product.id}
                  style={{ animationDelay: `${Math.min(index % 10, 9) * 40}ms` }}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#493459] bg-[#2B1B3D] shadow-[0_8px_24px_rgba(8,3,15,0.14)] transition duration-300 hover:-translate-y-1 hover:border-[#80609A] hover:shadow-[0_18px_38px_rgba(8,3,15,0.28)] motion-safe:animate-[dm-product-card-in_380ms_ease_both]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1B1029]">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || productName}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-[1.045]"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-[#9F8DB4]">
                        <ImageOff size={30} />
                        <span className="text-xs font-medium">No product image</span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#130B1D]/75 via-transparent to-[#130B1D]/15" />

                    <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ring-inset backdrop-blur-md ${
                          product.isPublished
                            ? "bg-emerald-950/80 text-emerald-200 ring-emerald-400/30"
                            : "bg-[#241333]/90 text-[#D5C8E2] ring-[#80609A]/60"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            product.isPublished ? "bg-emerald-400" : "bg-[#9F8DB4]"
                          }`}
                        />
                        {product.isPublished ? "Published" : "Draft"}
                      </span>
                      {product.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-[#4A3518]/90 px-2.5 py-1 text-[10px] font-extrabold text-[#F9D98E] backdrop-blur-md">
                          <Star size={11} className="fill-current" /> Featured
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-[#1B1029]/80 px-2.5 py-1 text-[10px] font-semibold text-[#F0E8F8] backdrop-blur-md">
                      {product.images?.length ?? 0} {(product.images?.length ?? 0) === 1 ? "image" : "images"}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-extrabold leading-5 text-[#FAF7FF] transition-colors group-hover:text-[#F5CB79] sm:text-base">
                          {productName}
                        </h3>
                        <p className="mt-1 truncate text-xs text-[#9F8DB4]">
                          {product.category?.name || "Uncategorized"}
                        </p>
                      </div>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#493459] bg-[#332047] text-[#F5CB79]">
                        <Package size={16} />
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#493459] pt-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${getAvailabilityStyle(
                          product.availability,
                        )}`}
                      >
                        {availabilityLabels[product.availability]}
                      </span>
                      <span className="text-[10px] font-medium text-[#9F8DB4]">
                        Added {formatDate(product.createdAt)}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-[1fr_1fr_42px] gap-2 pt-4">
                      <Link
                        to={`/admin/products/${product.id}`}
                        title="View product details"
                        aria-label={`View ${productName} details`}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#60466F] bg-[#332047] px-2 text-xs font-bold text-[#E1D5ED] transition hover:border-[#8C6BA5] hover:bg-[#3A2850] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99BD1]"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        title="Edit product"
                        aria-label={`Edit ${productName}`}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#F5B942] px-2 text-xs font-extrabold text-[#1B1029] transition hover:bg-[#F7C85F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5CB79] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2B1B3D]"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        title="Delete product"
                        aria-label={`Delete ${productName}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-400/10 text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Public catalogue reminder */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#493459] bg-gradient-to-r from-[#241333] to-[#332047] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#60466F] bg-[#3A2850] text-[#F5CB79]">
            <Package size={19} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#FAF7FF]">
              Need to review your public catalogue?
            </p>
            <p className="mt-1 text-xs leading-5 text-[#B7A7C9]">
              Published products will be available to customers through your
              public product pages.
            </p>
          </div>
        </div>
        <a
          href="/products"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 self-start text-sm font-bold text-[#F5CB79] transition hover:text-[#FFE3A1] sm:self-center"
        >
          View catalogue <ArrowRight size={16} />
        </a>
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#090510]/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full rounded-t-3xl border border-[#60466F] bg-[#241333] p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
              <Trash2 size={23} />
            </div>
            <h2
              id="delete-product-title"
              className="mt-4 text-xl font-extrabold text-[#FAF7FF]"
            >
              Delete product?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#B7A7C9]">
              You are about to delete{" "}
              <strong className="text-[#FAF7FF]">
                {deleteTarget.name || "this product"}
              </strong>
              . This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="min-h-11 rounded-xl border border-[#60466F] px-4 text-sm font-semibold text-[#E1D5ED] transition hover:bg-[#332047] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteProduct()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <LoaderCircle size={16} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}

      <style>{`
        @keyframes dm-product-card-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dm-admin-page *,
          .dm-admin-page *::before,
          .dm-admin-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
