import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PackageSearch,
  RefreshCw,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import ProductCard from "../features/catalog/ProductCard";
import { catalogApi } from "../features/catalog/catalog.api";
import type {
  Category,
  Product,
  SiteSettings,
} from "../features/catalog/catalog.types";

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const reduceMotion = useReducedMotion();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);
      setError("");
      setCategory(null);
      setProducts([]);

      try {
        const [categories, allProducts, siteSettings] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts(),
          catalogApi.getSettings().catch(() => ({} as SiteSettings)),
        ]);

        if (!active) return;

        const selectedCategory = categories.find((item) => item.slug === slug);

        setCategory(selectedCategory ?? null);
        setSettings(siteSettings);

        if (selectedCategory) {
          setProducts(
            allProducts.filter(
              (product) => product.categoryId === selectedCategory.id
            )
          );
        }
      } catch {
        if (active) {
          setError(
            "We couldn't load this category. Please check your connection and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [slug]);

  const categoryDescription = useMemo(
    () =>
      category?.description ||
      "Explore the products in this category and contact our team for availability, specifications and pricing.",
    [category]
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <main>
        {loading ? (
          <section className="relative isolate overflow-hidden bg-[#0B1220]">
            <div
              className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/images/hero-store.png')" }}
            />
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
              <div className="mt-6 h-12 max-w-xl animate-pulse rounded bg-white/20" />
              <div className="mt-4 h-5 max-w-lg animate-pulse rounded bg-white/10" />
            </div>
          </section>
        ) : error ? (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B1220] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw size={16} /> Reload page
              </button>
            </div>
          </section>
        ) : !category ? (
          <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
            <h1 className="mt-5 text-2xl font-black text-[#0B1220]">
              Category not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This category may have been removed or is no longer available.
            </p>
            <Link
              to="/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-[#E8AA2E]"
            >
              Browse all categories <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            {/* Premium category banner: image first, with text on a dark panel */}
            <motion.section
              key={category.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative isolate overflow-hidden bg-[#0B1220]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${category.coverImageUrl || "/images/hero-store.png"}')`,
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07101E]/95 via-[#0B1220]/82 to-[#0B1220]/48"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B1220]/75 via-transparent to-[#0B1220]/15"
              />

              <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#F5B942]/60 hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                  All categories
                </Link>

                <div className="grid items-end gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_300px] lg:gap-14 lg:pt-20">
                  <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 sm:text-sm">
                      <span className="h-px w-8 bg-[#F5B942]" />
                      Product category
                    </p>

                    <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                      {category.name}
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                      {categoryDescription}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <a
                        href="#products"
                        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-5 py-3.5 text-sm font-extrabold text-[#0B1220] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#E8AA2E]"
                      >
                        Explore products
                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </a>
                      <Link
                        to="/categories"
                        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/15"
                      >
                        Browse other categories
                      </Link>
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="rounded-2xl border border-white/20 bg-[#0B1220]/55 p-5 shadow-xl backdrop-blur-xl">
                      <p className="text-xs font-bold uppercase tracking-[0.17em] text-amber-200">
                        Category overview
                      </p>
                      <p className="mt-3 text-3xl font-black text-white">
                        {products.length.toString().padStart(2, "0")}
                        <span className="ml-2 text-sm font-semibold text-slate-300">
                          {products.length === 1 ? "product" : "products"}
                        </span>
                      </p>
                      <div className="my-4 h-px bg-white/15" />
                      <p className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-[#F5B942]"
                        />
                        Ask our team about product specifications, pricing and
                        current availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5B942]/70 to-transparent" />
            </motion.section>

            {/* Small image strip on mobile/tablet, using category cover where available */}
            {category.coverImageUrl && (
              <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:hidden lg:px-8">
                <div className="relative h-48 overflow-hidden rounded-2xl sm:h-64">
                  <img
                    src={category.coverImageUrl}
                    alt={`${category.name} category`}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/45 to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-[#0B1220]/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    {category.name}
                  </span>
                </div>
              </div>
            )}

            <section
              id="products"
              className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
            >
              <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A6900]">
                    The collection
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0B1220] sm:text-3xl">
                    Products in this category
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                    Explore the available options and contact us for pricing
                    and product details.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsapp={settings.whatsapp}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-16 text-center sm:py-20">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-[#9A6900]">
                    <PackageSearch size={27} />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-[#0B1220]">
                    Products coming soon
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                    We haven't added products to this category yet. Contact our
                    team if you need help finding a specific item.
                  </p>
                  <Link
                    to="/categories"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-[#E8AA2E]"
                  >
                    Explore other categories <ArrowRight size={17} />
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
