
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import CategoryCard from "../features/catalog/CategoryCard";
import { catalogApi } from "../features/catalog/catalog.api";
import type { Category } from "../features/catalog/catalog.types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await catalogApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load the categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <main>
    
{/* Image-led catalogue hero */}
<section className="relative isolate overflow-hidden bg-[#0B1220]">
  <motion.div
    aria-hidden="true"
    initial={false}
    animate={{ scale: [1, 1.05, 1] }}
    transition={{
      duration: 24,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/hero-store.png')",
    }}
  />

  {/* Dark overlays keep the text readable */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07101E]/95 via-[#0B1220]/80 to-[#0B1220]/50" />
  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B1220]/70 via-transparent to-[#0B1220]/20" />

  <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-3xl"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-[#F5B942]" />
        Explore our catalogue
      </span>

      <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
        The right supplies
        <span className="mt-2 block text-[#F5B942]">
          for the work ahead.
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
        Explore our range of industrial, agricultural and commercial
        supplies. Discover the products you need and contact our team
        for availability and pricing.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="#categories"
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-6 py-4 text-sm font-extrabold text-[#0B1220] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#E8AA2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          Browse Categories
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </a>

        <Link
          to="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-amber-400 hover:bg-white/15"
        >
          Back to Home
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
        <span>Industrial Supplies</span>
        <span className="text-[#F5B942]">•</span>
        <span>Agricultural Solutions</span>
        <span className="text-[#F5B942]">•</span>
        <span>Product Enquiries</span>
      </div>
    </motion.div>

    {/* Professional feature panel on larger screens */}
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="hidden lg:block"
    >
      <div className="ml-auto max-w-md rounded-3xl border border-white/20 bg-[#0B1220]/60 p-7 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
          Your sourcing journey
        </p>

        <h2 className="mt-3 text-2xl font-extrabold text-white">
          Find supplies with confidence.
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Browse our catalogue, explore available options, and speak
          with our team about your requirements.
        </p>

        <div className="mt-6 space-y-3">
          {[
            ["01", "Explore categories"],
            ["02", "Discover products"],
            ["03", "Request product details"],
          ].map(([number, label]) => (
            <div
              key={number}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/40 hover:bg-white/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5B942] text-sm font-black text-[#0B1220]">
                {number}
              </span>
              <span className="text-sm font-bold text-white">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>

  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5B942]/70 to-transparent" />
</section>

        <section
          id="categories"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Browse by category
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Find what you need
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                Choose a category to explore its products and available options.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-stone-200"
                >
                  <div className="aspect-[5/4] bg-stone-100" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-stone-100" />
                    <div className="h-3 w-full rounded bg-stone-100" />
                    <div className="h-3 w-2/3 rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-9 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-800">
                We couldn't load the categories.
              </p>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={() => void loadCategories()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-2xl border border-dashed border-stone-300 px-5 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-stone-400" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {search ? "No matching categories" : "Categories coming soon"}
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                {search
                  ? "Try a different search term."
                  : "Our team is preparing the product catalogue. Please check back soon."}
              </p>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
