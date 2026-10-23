
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

import { apiRequest } from "../../lib/api";
import ProductFormModal from "../../components/admin/component/ProductFormModel";
import { Link } from "react-router-dom";

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

const availabilityStyles: Record<Availability, string> = {
  IN_STOCK: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OUT_OF_STOCK: "bg-rose-50 text-rose-700 ring-rose-200",
  ON_REQUEST: "bg-amber-50 text-amber-800 ring-amber-200",
};

function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        (product.name ?? "").toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published"
          ? product.isPublished
          : !product.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const publishedCount = products.filter((p) => p.isPublished).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;
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
        current.filter((p) => p.id !== deleteTarget.id),
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
      const exists = current.some((p) => p.id === product.id);

      return exists
        ? current.map((p) => (p.id === product.id ? product : p))
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

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-6 text-slate-800 sm:space-y-8">
      {/* Page introduction */}
      <header className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-amber-50 p-5 shadow-sm sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-amber-100/50" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white px-3 py-1.5 text-xs font-bold text-amber-800">
              <Package size={15} />
              CATALOGUE MANAGEMENT
            </span>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Products
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            <Plus size={19} />
            Add product
          </button>
        </div>
      </header>

      {/* Notifications */}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[
          {
            label: "Total products",
            value: products.length,
            icon: <Package size={20} />,
            tone: "bg-amber-50 text-amber-800",
          },
          {
            label: "Published",
            value: publishedCount,
            icon: <Eye size={20} />,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Featured",
            value: featuredCount,
            icon: <Star size={20} />,
            tone: "bg-amber-50 text-amber-700",
          },
          {
            label: "Drafts",
            value: unpublishedCount,
            icon: <ShieldCheck size={20} />,
            tone: "bg-violet-50 text-violet-700",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                {stat.label}
              </p>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}
              >
                {stat.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {loading ? "—" : stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 sm:min-w-48"
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
              className="min-h-12 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 sm:min-w-40"
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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:text-sm">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredProducts.length}
            </strong>{" "}
            of {products.length} products
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ArrowDownUp size={14} />
            Ordered by display position
          </span>
        </div>
      </section>

      {/* Product list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Product catalogue</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage product details and visibility.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            {filteredProducts.length} items
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <LoaderCircle size={30} className="animate-spin text-amber-600" />
            <p className="text-sm">Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Package size={30} />
            </span>
            <h3 className="mt-4 font-bold text-slate-900">
              {products.length === 0
                ? "Your catalogue is ready to grow"
                : "No products found"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
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
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 font-semibold text-slate-950 hover:bg-amber-500"
              >
                <Plus size={17} />
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredProducts.map((product) => {
                const primaryImage =
                  product.images.find((image) => image.isPrimary) ??
                  product.images[0];

                return (
                  <article key={product.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.altText || product.name || "Product"}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-slate-300">
                            <ImageOff size={24} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${
                              product.isPublished
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {product.isPublished ? "Published" : "Draft"}
                          </span>
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                              <Star size={11} /> Featured
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 break-words font-bold text-slate-900">
                          {product.name || "Untitled product"}
                        </h3>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {product.category.name}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${availabilityStyles[product.availability]}`}
                        >
                          {availabilityLabels[product.availability]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {product.images.length} image
                        {product.images.length === 1 ? "" : "s"}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          title="View product details"
                          aria-label={`View ${product.name || "product"} details`}
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                        >
                          <Eye size={15} /> <span>View</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          title="Edit product"
                          aria-label={`Edit ${product.name || "product"}`}
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                        >
                          <Pencil size={14} /> <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name || "product"}`}
                          title="Delete product"
                          onClick={() => setDeleteTarget(product)}
                          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                        >
                          <Trash2 size={15} /> <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Availability</th>
                    <th className="px-4 py-4">Visibility</th>
                    <th className="px-4 py-4">Added</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const image =
                      product.images.find((item) => item.isPrimary) ??
                      product.images[0];

                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-amber-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {image ? (
                                <img
                                  src={image.url}
                                  alt={image.altText || product.name || "Product"}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-slate-300">
                                  <ImageOff size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-bold text-slate-900">
                                {product.name || "Untitled product"}
                              </p>
                              <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                                /{product.slug}
                              </p>
                              {product.isFeatured && (
                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                  <Star size={12} /> Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {product.category.name}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${availabilityStyles[product.availability]}`}
                          >
                            {availabilityLabels[product.availability]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                              product.isPublished
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {product.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                              to={`/admin/products/${product.id}`}
                              title="View product details"
                              aria-label={`View ${product.name || "product"} details`}
                              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                            >
                              <Eye size={15} />
                              <span>View</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowForm(true);
                              }}
                              title="Edit product"
                              aria-label={`Edit ${product.name || "product"}`}
                              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                            >
                              <Pencil size={15} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              title="Delete product"
                              aria-label={`Delete ${product.name || "product"}`}
                              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                            >
                              <Trash2 size={15} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
            className="w-full rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={23} />
            </div>
            <h2
              id="delete-product-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Delete product?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to delete{" "}
              <strong>{deleteTarget.name || "this product"}</strong>.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteProduct()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {deleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Product form is connected in the next step. */}
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

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-800 shadow-sm">
            <Package size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Need to review your public catalogue?
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Published products will be available to customers through your
              public product pages.
            </p>
          </div>
        </div>
        <a
          href="/products"
          className="hidden shrink-0 items-center gap-1 text-sm font-bold text-amber-800 hover:text-amber-900 sm:inline-flex"
        >
          View catalogue <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
