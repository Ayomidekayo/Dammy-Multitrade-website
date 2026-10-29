import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  PackageSearch,
  Phone,
  Wrench,
} from "lucide-react";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import { catalogApi } from "../features/catalog/catalog.api";
import type { Category, SiteSettings } from "../features/catalog/catalog.types";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}



export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    Promise.all([
      catalogApi.getCategories(),
      catalogApi.getSettings().catch(() => ({} as SiteSettings)),
    ])
      .then(([categoryData, settingsResponse]) => {
        if (!active) return;
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setSettings(readSettingsResponse(settingsResponse));
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [retryKey]);

  const businessName = settings.businessName || "Dammy Multitrade Ventures";
  const whatsappNumber = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Dammy Multitrade Ventures. I would like to enquire about your products.")}`
    : null;
  const contactAddress = useMemo(
    () => [settings.address, settings.city, settings.state, settings.country].filter(Boolean).join(", "),
    [settings.address, settings.city, settings.state, settings.country],
  );

  return (
    <div className="dm-purple-storefront min-h-screen overflow-x-clip bg-white text-[#1A0E2D]">
      <PublicHeader settings={settings} />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-[#1A0E2D]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-30 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-store.png')" }}
          />
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-r from-[#12081F]/95 via-[#1A0E2D]/85 to-[#1A0E2D]/45" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1A0E2D]/70 via-transparent to-[#1A0E2D]/15" />

          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5B942] sm:text-xs">
                <span className="h-px w-7 bg-[#F5B942]" /> Industrial, agricultural & workplace supplies
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.07] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.15rem]">
                Hoses, pumps, tools and supplies for the work you do.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                Find equipment for industrial, agricultural and workplace needs. Browse the catalogue or contact {businessName} to ask about specifications and availability.
              </p>

              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                <Link to="/categories" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-5 py-3 text-sm font-extrabold text-[#1A0E2D] transition hover:bg-[#E8AA2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A0E2D] sm:min-h-14 sm:px-6 sm:text-base">
                  Browse products <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-[#F5B942] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:min-h-14 sm:px-6 sm:text-base">
                    <MessageCircle size={18} /> Enquire on WhatsApp
                  </a>
                ) : (
                  <Link to="/#contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-[#F5B942] hover:bg-white/10 sm:min-h-14 sm:px-6 sm:text-base">
                    Contact our team <ArrowRight size={18} />
                  </Link>
                )}
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3 sm:gap-5">
                {[
                  ["01", "Product categories"],
                  ["02", "Availability enquiries"],
                  ["03", "Direct contact"],
                ].map(([number, label]) => (
                  <div key={number} className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums text-[#F5B942]">{number}</span>
                    <span className="text-sm font-medium text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={reduceMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.12 }}
              className="hidden rounded-xl border border-white/15 bg-[#1A0E2D]/80 p-5 text-white shadow-xl backdrop-blur-sm lg:block"
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5B942]">Catalogue</p>
                  <h2 className="mt-2 text-xl font-bold">What are you looking for?</h2>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F5B942] text-[#1A0E2D]"><PackageSearch size={21} /></span>
              </div>
              <div className="mt-2 divide-y divide-white/10">
                {categories.slice(0, 4).map((category) => (
                  <Link key={category.id} to={category.slug ? `/categories/${encodeURIComponent(category.slug)}` : "/categories"} className="group flex min-h-12 items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-200 transition hover:text-[#F5B942]">
                    <span className="min-w-0 truncate">{category.name}</span>
                    <ChevronRight size={17} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#F5B942]" />
                  </Link>
                ))}
                {categories.length === 0 && !loading && <p className="py-4 text-sm leading-6 text-slate-300">Browse the full catalogue to explore available product categories.</p>}
              </div>
              <Link to="/categories" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#F5B942]/60 px-4 text-sm font-bold text-[#F5B942] transition hover:bg-[#F5B942] hover:text-[#1A0E2D]">
                View all categories <ArrowRight size={16} />
              </Link>
            </motion.aside>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="scroll-mt-24 bg-[#1B102D] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#91620B]">Browse the catalogue</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1A0E2D] sm:text-4xl">Shop by category</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">Explore the range, then ask us to confirm the product details that matter to your job.</p>
              </div>
              <Link to="/categories" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-[#1A0E2D] transition hover:border-[#D9A52E] hover:bg-[#2B1C3F] sm:self-auto">
                All categories <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="aspect-[5/3] animate-pulse bg-[#39274C]" />
                  <div className="space-y-3 p-4"><div className="h-5 w-2/3 animate-pulse rounded bg-[#39274C]" /><div className="h-3 w-full animate-pulse rounded bg-[#2A1B3B]" /><div className="h-3 w-4/5 animate-pulse rounded bg-[#2A1B3B]" /></div>
                </div>)}
              </div>
            ) : loadError ? (
              <div className="mt-8 rounded-xl border border-amber-200 bg-white px-5 py-10 text-center">
                <PackageSearch className="mx-auto text-[#91620B]" size={30} />
                <h3 className="mt-3 text-lg font-bold text-[#1A0E2D]">We couldn't load the categories.</h3>
                <p className="mt-2 text-sm text-slate-600">Check your connection and try again.</p>
                <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A0E2D] px-4 text-sm font-bold text-white transition hover:bg-[#172943]"><ArrowRight size={16} /> Try again</button>
              </div>
            ) : categories.length > 0 ? (
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
                {categories.slice(0, 4).map((category, index) => (
                  <motion.article key={category.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.04 }} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-[#D9A52E]/70 hover:shadow-lg hover:shadow-slate-900/5">
                    <Link to={category.slug ? `/categories/${encodeURIComponent(category.slug)}` : "/categories"} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B942]">
                      <div className="relative aspect-[5/3] overflow-hidden bg-[#39274C]">
                        <img src={category.coverImageUrl || "/images/hero-store.png"} alt={category.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E2D]/65 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-md border border-white/25 bg-[#1A0E2D]/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white">Category {String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="text-lg font-extrabold tracking-tight text-[#1A0E2D]">{category.name}</h3>
                        <p className="mt-2 line-clamp-3 min-h-[4.25rem] text-sm leading-6 text-slate-600">{category.description || "Browse this category and contact our team for product specifications, pricing and current availability."}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1A0E2D] group-hover:text-[#8B5E0B]">Explore category <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <PackageSearch className="mx-auto text-slate-400" size={30} />
                <h3 className="mt-3 text-lg font-bold text-[#1A0E2D]">Products are being organised.</h3>
                <p className="mt-2 text-sm text-slate-600">Please check back soon or contact the team for assistance.</p>
              </div>
            )}
          </div>
        </section>

        {/* About / working approach */}
        <section id="about" className="scroll-mt-24 bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#91620B]">About {businessName}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#1A0E2D] sm:text-4xl">Equipment enquiries made straightforward.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">Use the catalogue to identify the type of supply you need. When a product looks suitable, contact our team to confirm specifications, availability and pricing before making a decision.</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Browse products grouped into categories.",
                  "Ask about product specifications and intended use.",
                  "Confirm availability and pricing directly with the team.",
                ].map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#F8E8BD] text-[#62460D]"><Check size={13} strokeWidth={3} /></span><span>{item}</span></li>)}
              </ul>
              <Link to="/categories" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#1A0E2D] px-5 text-sm font-bold text-white transition hover:bg-[#172943] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2">Explore the catalogue <ArrowRight size={17} /></Link>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-[#1A0E2D]">
              <img src="/images/hero-store.png" alt={`${businessName} product and equipment range`} loading="lazy" className="aspect-[4/3] w-full object-cover sm:aspect-[5/3] lg:aspect-[4/3]" />
              <div className="flex flex-col gap-3 bg-[#1A0E2D] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div><p className="text-sm font-bold">Need help selecting a product?</p><p className="mt-1 text-sm leading-6 text-slate-300">Share what you're looking for and any specifications you have.</p></div>
                {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#1A0E2D] transition hover:bg-[#E8AA2E]"><MessageCircle size={16} /> Ask us</a> : <Link to="/#contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#1A0E2D] transition hover:bg-[#E8AA2E]">Contact us <ArrowRight size={16} /></Link>}
              </div>
            </div>
          </div>
        </section>

        {/* Enquiries / contact */}
        <section id="contact" className="scroll-mt-24 bg-[#1B102D] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] lg:gap-12 lg:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#91620B]">Contact</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[#1A0E2D] sm:text-4xl">Tell us what you need.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Ask about an item, its specifications, availability or pricing. Include the product name or a photo to help our team understand your enquiry.</p>
              <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-5 text-sm font-extrabold text-[#1A0E2D] transition hover:bg-[#E8AA2E]"><MessageCircle size={17} /> Enquire on WhatsApp <ArrowRight size={16} /></a>}
                {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-[#1A0E2D] transition hover:border-[#D9A52E] hover:bg-[#2B1C3F]"><Phone size={17} /> Call our team</a>}
              </div>
            </div>
            <div className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <h3 className="text-sm font-bold text-[#1A0E2D]">Business information</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                {contactAddress && <p className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-[#91620B]" /><span>{contactAddress}</span></p>}
                {settings.phone && <p className="flex items-start gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-[#91620B]" /><a className="hover:text-[#1A0E2D]" href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a></p>}
                {settings.email && <p className="flex items-start gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-[#91620B]" /><a className="break-all hover:text-[#1A0E2D]" href={`mailto:${settings.email}`}>{settings.email}</a></p>}
                {settings.openingHours && <p className="flex items-start gap-3"><Wrench size={17} className="mt-0.5 shrink-0 text-[#91620B]" /><span><span className="font-semibold text-[#1A0E2D]">Opening hours</span><br />{settings.openingHours}</span></p>}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter settings={settings} />
    </div>
  );
}
