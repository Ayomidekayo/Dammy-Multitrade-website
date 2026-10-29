import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, PackageSearch, RefreshCw } from "lucide-react";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import ProductCard from "../features/catalog/ProductCard";
import { catalogApi } from "../features/catalog/catalog.api";
import type { Category, Product, SiteSettings } from "../features/catalog/catalog.types";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

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
        const selectedCategory = categories.find((item) => item.slug === slug) ?? null;
        setCategory(selectedCategory);
        setSettings(readSettingsResponse(siteSettings));
        if (selectedCategory) {
          setProducts(allProducts.filter((product) => product.categoryId === selectedCategory.id));
        }
      } catch {
        if (active) setError("We couldn't load this category. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPage();
    return () => { active = false; };
  }, [slug, retryKey]);

  const categoryDescription = useMemo(
    () => category?.description || "Browse products in this category and contact our team to confirm specifications, availability and pricing.",
    [category],
  );

  const whatsappNumber = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${settings.businessName || "Dammy Multitrade Ventures"}. I would like to enquire about ${category?.name || "a product"}.`)}`
    : null;

  return (
    <div className="dm-purple-storefront min-h-screen overflow-x-clip bg-white text-[#1A0E2D]">
      <PublicHeader settings={settings} />
      <main>
        {loading ? (
          <>
            <section className="bg-[#1A0E2D] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="h-4 w-32 animate-pulse rounded bg-white/20" /><div className="mt-5 h-10 max-w-xl animate-pulse rounded bg-white/20" /><div className="mt-4 h-4 max-w-lg animate-pulse rounded bg-white/10" /></div></section>
            <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="overflow-hidden rounded-xl border border-slate-200"><div className="aspect-[4/3] animate-pulse bg-[#2A1B3B]" /><div className="space-y-3 p-4"><div className="h-5 w-3/4 animate-pulse rounded bg-[#2A1B3B]" /><div className="h-3 w-full animate-pulse rounded bg-[#2A1B3B]" /><div className="h-10 animate-pulse rounded-lg bg-[#2A1B3B]" /></div></div>)}</section>
          </>
        ) : error ? (
          <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-[#1B102D] p-7 sm:p-10">
              <RefreshCw className="mx-auto text-[#91620B]" size={30} />
              <h1 className="mt-4 text-xl font-extrabold">We couldn't load this category.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A0E2D] px-4 text-sm font-bold text-white transition hover:bg-[#172943]"><RefreshCw size={16} /> Try again</button>
            </div>
          </section>
        ) : !category ? (
          <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <PackageSearch className="mx-auto text-slate-300" size={36} />
            <h1 className="mt-5 text-2xl font-extrabold">Category not found</h1>
            <p className="mt-2 text-sm text-slate-600">This category may have been removed or is not available right now.</p>
            <Link to="/categories" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-5 text-sm font-bold text-[#1A0E2D] transition hover:bg-[#E8AA2E]">Browse all categories <ArrowRight size={16} /></Link>
          </section>
        ) : (
          <>
            <section className="relative isolate overflow-hidden bg-[#1A0E2D]">
              <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center opacity-35" style={{ backgroundImage: `url('${category.coverImageUrl || "/images/hero-store.png"}')` }} />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#12081F]/95 via-[#1A0E2D]/86 to-[#1A0E2D]/55" />
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                <Link to="/categories" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 text-sm font-semibold text-white transition hover:border-[#F5B942]/70 hover:bg-white/10"><ArrowLeft size={16} /> All categories</Link>
                <div className="mt-9 grid gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B942] sm:text-xs">Product category</p>
                    <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">{category.name}</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">{categoryDescription}</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-[#081321]/70 p-4 text-white sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5B942]">In this category</p>
                    <p className="mt-2 text-3xl font-extrabold tabular-nums">{products.length.toString().padStart(2, "0")}<span className="ml-2 text-sm font-semibold text-slate-300">{products.length === 1 ? "product" : "products"}</span></p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">Ask our team to confirm product details before ordering.</p>
                    {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#F5B942] px-3 text-sm font-bold text-[#1A0E2D] transition hover:bg-[#E8AA2E]">Enquire about this category</a>}
                  </div>
                </div>
              </div>
            </section>

            <section id="products" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
              <div className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#91620B]">The catalogue</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Products in {category.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Select a product to see its images and information.</p></div>
                <span className="inline-flex min-h-9 w-fit items-center rounded-full border border-slate-200 bg-[#1B102D] px-3 text-xs font-bold text-slate-600">{products.length} {products.length === 1 ? "product" : "products"}</span>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, index) => (
                    <article key={product.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#D9A52E]/70 hover:shadow-lg hover:shadow-slate-900/5 sm:p-3">
                      <div className="min-w-0 flex-1"><ProductCard product={product} whatsapp={settings.whatsapp} index={index} /></div>
                      {product.slug ? <Link to={`/products/${encodeURIComponent(product.slug)}`} aria-label={`View details for ${product.name}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#D9A52E]/70 bg-[#2B1C3F] px-4 text-sm font-bold text-[#1A0E2D] transition hover:border-[#C28A16] hover:bg-[#F8E8BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2">View product details <ArrowRight size={16} /></Link> : <span aria-disabled="true" title="Product slug is not available" className="mt-3 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-[#211432] px-4 text-sm font-semibold text-slate-400">Details unavailable</span>}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-[#1B102D] px-5 py-14 text-center sm:py-16">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#FFF2CC] text-[#76520D]"><PackageSearch size={25} /></span>
                  <h3 className="mt-4 text-xl font-extrabold">No products in this category yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Contact our team if you are looking for a particular item. We can help you check availability.</p>
                  <Link to="/#contact" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-5 text-sm font-bold text-[#1A0E2D] transition hover:bg-[#E8AA2E]">Contact our team <ArrowRight size={16} /></Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <PublicFooter settings={settings} />
    </div>
  );
}
