import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Layers3, RefreshCw } from "lucide-react";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import { catalogApi } from "../features/catalog/catalog.api";
import type { Category, SiteSettings } from "../features/catalog/catalog.types";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      catalogApi.getCategories(),
      catalogApi.getSettings().catch(() => ({} as SiteSettings)),
    ])
      .then(([categoryData, settingResponse]) => {
        if (!active) return;
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setSettings(readSettingsResponse(settingResponse));
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(term) || (category.description || "").toLowerCase().includes(term),
    );
  }, [categories, search]);

  const businessName = settings.businessName || "Dammy Multitrade Ventures";

  return (
    <div className="dm-purple-storefront min-h-screen overflow-x-clip bg-white text-[#1A0E2D]">
      <PublicHeader settings={settings} />
      <main>
        <section className="relative isolate overflow-hidden bg-[#1A0E2D]">
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center opacity-25" style={{ backgroundImage: "url('/images/hero-store.png')" }} />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#12081F]/95 via-[#1A0E2D]/90 to-[#1A0E2D]/65" />
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5B942] sm:text-xs">Product catalogue</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Browse by category.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">Explore the range of supplies offered by {businessName}. Open a category to view products and enquire about details.</p>
            <div className="mt-7 max-w-xl">
              <label className="relative block">
                <span className="sr-only">Search categories</span>
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search product categories" className="min-h-12 w-full rounded-lg border border-white/20 bg-white px-4 pl-11 text-sm text-[#1A0E2D] outline-none transition placeholder:text-slate-400 focus:border-[#F5B942] focus:ring-4 focus:ring-[#F5B942]/25 sm:min-h-14 sm:text-base" />
              </label>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#91620B]">Find what you need</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">All categories</h2></div>
            {!loading && !error && <span className="rounded-full border border-slate-200 bg-[#1B102D] px-3 py-1.5 text-xs font-bold text-slate-600">{filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"}</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="overflow-hidden rounded-xl border border-slate-200"><div className="aspect-[5/3] animate-pulse bg-[#2A1B3B]" /><div className="space-y-3 p-4"><div className="h-5 w-3/4 animate-pulse rounded bg-[#2A1B3B]" /><div className="h-3 w-full animate-pulse rounded bg-[#2A1B3B]" /><div className="h-3 w-4/5 animate-pulse rounded bg-[#2A1B3B]" /></div></div>)}</div>
          ) : error ? (
            <div className="rounded-xl border border-slate-200 bg-[#1B102D] px-5 py-12 text-center">
              <RefreshCw className="mx-auto text-[#91620B]" size={30} /><h3 className="mt-4 text-lg font-bold">Categories couldn't be loaded.</h3><p className="mt-2 text-sm text-slate-600">Please check your connection and try again.</p>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A0E2D] px-4 text-sm font-bold text-white transition hover:bg-[#172943]">Try again <ArrowRight size={16} /></button>
            </div>
          ) : filteredCategories.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map((category, index) => (
                <article key={category.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-[#D9A52E]/80 hover:shadow-lg hover:shadow-slate-900/5">
                  <Link to={category.slug ? `/categories/${encodeURIComponent(category.slug)}` : "/categories"} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B942]">
                    <div className="relative aspect-[5/3] overflow-hidden bg-[#2A1B3B]">
                      <img src={category.coverImageUrl || "/images/hero-store.png"} alt={category.name} loading={index < 4 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E2D]/65 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-lg border border-white/25 bg-[#1A0E2D]/75 text-[#F5B942]"><Layers3 size={17} /></span>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg font-extrabold tracking-tight text-[#1A0E2D]">{category.name}</h3>
                      <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-slate-600">{category.description || "View products in this category and contact our team for specifications, availability and pricing."}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1A0E2D] group-hover:text-[#91620B]">View category <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-14 text-center">
              <Layers3 className="mx-auto text-slate-400" size={30} /><h3 className="mt-4 text-lg font-bold">No matching categories</h3><p className="mt-2 text-sm text-slate-600">Try a different search term.</p>
              {search && <button type="button" onClick={() => setSearch("")} className="mt-4 text-sm font-bold text-[#80580A] underline underline-offset-4">Clear search</button>}
            </div>
          )}
        </section>
      </main>
      <PublicFooter settings={settings} />
    </div>
  );
}
