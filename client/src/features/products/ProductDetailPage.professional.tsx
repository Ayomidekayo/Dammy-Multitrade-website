import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers3,
  Maximize2,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import { catalogApi } from "../catalog/catalog.api";
import type { SiteSettings } from "../catalog/catalog.types";
import PublicHeader from "../../components/public/PublicHeader";
import PublicFooter from "../../components/public/PublicFooter";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  availability: string;
  isFeatured: boolean;
  category: ProductCategory;
  images: ProductImage[];
}

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

function titleCase(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function availabilityStyles(value: string) {
  if (value === "IN_STOCK") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "OUT_OF_STOCK") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-[#E9CF8D] bg-[#FFF7E2] text-[#78520D]";
}

function InfoTile({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#342346] text-[#76520D]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-1 break-words text-sm font-semibold text-[#1A0E2D]">{value}</div>
      </div>
    </div>
  );
}

export default function PublicProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setError("This product link is incomplete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Keep the existing public API contract: published product fetched by slug.
      void catalogApi
        .getSettings()
        .then((settingsResponse) => setSettings(readSettingsResponse(settingsResponse)))
        .catch(() => {
          // Product content can still load if optional site settings are unavailable.
        });
      const response = await apiRequest<PublicProduct>(`/products/slug/${encodeURIComponent(slug)}`);
      setProduct(response.data);
      setActiveImage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load this product.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void loadProduct(); }, [loadProduct]);

  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images]
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return a.displayOrder - b.displayOrder;
      })
      .slice(0, 10);
  }, [product?.images]);

  const currentImage = images[activeImage];
  const previousImage = useCallback(() => {
    setActiveImage((index) => images.length ? (index - 1 + images.length) % images.length : 0);
  }, [images.length]);
  const nextImage = useCallback(() => {
    setActiveImage((index) => images.length ? (index + 1) % images.length : 0);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, nextImage, previousImage]);

  return (
    <div className="dm-purple-storefront min-h-screen overflow-x-clip bg-[#1B102D] text-[#1A0E2D]">
      <PublicHeader settings={settings} />
      {loading ? (
        <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-5">
            <div className="h-36 animate-pulse rounded-xl bg-[#39274C] sm:h-44" />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="aspect-[4/3] animate-pulse rounded-xl bg-[#39274C]" />
              <div className="space-y-3"><div className="h-8 w-3/4 animate-pulse rounded bg-[#39274C]" /><div className="h-28 animate-pulse rounded-xl bg-[#2A1B3B]" /><div className="h-24 animate-pulse rounded-xl bg-[#2A1B3B]" /></div>
            </div>
          </div>
        </main>
      ) : error || !product ? (
        <main className="grid min-h-[55vh] place-items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-10">
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#342346] text-[#76520D]"><Package size={25} /></span>
            <h1 className="mt-5 text-2xl font-extrabold text-[#1A0E2D]">Product unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{error || "This product may have been removed or is no longer available."}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 min-[420px]:flex-row">
              <button type="button" onClick={() => void loadProduct()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A0E2D] px-4 text-sm font-bold text-white transition hover:bg-[#172943]"><RefreshCw size={16} /> Try again</button>
              <Link to="/categories" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-[#1A0E2D] transition hover:border-[#D9A52E] hover:bg-[#2B1C3F]">Browse products <ArrowRight size={16} /></Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/categories" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#1A0E2D]"><ArrowLeft size={16} /> All products</Link>
              <span className="text-xs font-medium text-slate-500">Product reference: <span className="font-mono text-slate-700">{product.slug}</span></span>
            </div>

            <header className="relative mt-4 overflow-hidden rounded-2xl border border-[#E8D49E] bg-[#2B1C3F] p-5 sm:p-7 lg:p-9">
              <div aria-hidden="true" className="absolute -right-12 -top-16 size-52 rounded-full border-[22px] border-white/70" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 max-w-3xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8D5A00]">Product details</p>
                  <h1 className="mt-3 break-words text-3xl font-extrabold tracking-tight text-[#1A0E2D] sm:text-4xl lg:text-5xl">{product.name}</h1>
                  {(product.shortDescription || product.description) && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{product.shortDescription || product.description}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold ${availabilityStyles(product.availability)}`}><span className={`size-2 rounded-full ${product.availability === "IN_STOCK" ? "bg-emerald-500" : product.availability === "OUT_OF_STOCK" ? "bg-rose-500" : "bg-[#C28A16]"}`} />{titleCase(product.availability)}</span>
                  {product.isFeatured && <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#E8D49E] bg-white px-3 text-xs font-bold text-[#76520D]"><Star size={13} /> Featured</span>}
                </div>
              </div>
            </header>

            <div className="mt-5 grid min-w-0 gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-6">
              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 px-1 pb-4">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#91620B]">Product imagery</p><h2 className="mt-1 text-lg font-bold text-[#1A0E2D]">Gallery</h2></div>
                  {images.length > 0 && <span className="rounded-md bg-[#2A1B3B] px-2.5 py-1.5 text-xs font-semibold text-slate-600">{activeImage + 1} of {images.length}</span>}
                </div>
                <div className="group relative overflow-hidden rounded-xl bg-[#241638]">
                  <div className="relative flex aspect-[4/3] min-h-64 items-center justify-center sm:min-h-[380px]">
                    {currentImage ? <button type="button" onClick={() => setLightboxOpen(true)} className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F5B942]" aria-label="Open product image in full screen"><img key={currentImage.id} src={currentImage.url} alt={`${product.name}, image ${activeImage + 1}`} className="h-full w-full object-contain p-3 sm:p-6" /></button> : <div className="flex flex-col items-center gap-3 text-slate-400"><span className="flex size-14 items-center justify-center rounded-xl bg-white"><ImageIcon size={26} /></span><p className="text-sm font-medium">No images available</p></div>}
                    {currentImage && <button type="button" onClick={() => setLightboxOpen(true)} aria-label="View image full screen" className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-[#1A0E2D] shadow-sm transition hover:border-[#D9A52E]"><Maximize2 size={17} /></button>}
                    {currentImage && images.length > 1 && <>
                      <button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-[#1A0E2D] shadow-sm transition hover:border-[#D9A52E]"><ChevronLeft size={20} /></button>
                      <button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-[#1A0E2D] shadow-sm transition hover:border-[#D9A52E]"><ChevronRight size={20} /></button>
                    </>}
                    {currentImage?.isPrimary && <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-bold text-emerald-700 shadow-sm"><Check size={13} /> Main image</span>}
                  </div>
                </div>

                {images.length > 0 && <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-700">All images</p><p className="text-[11px] text-slate-400">Select to preview</p></div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-pressed={activeImage === index} className={`relative aspect-square min-w-0 overflow-hidden rounded-lg border-2 bg-[#2A1B3B] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] ${activeImage === index ? "border-[#D6A12B]" : "border-transparent hover:border-slate-300"}`}>
                      <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                      {image.isPrimary && <span className="absolute left-1.5 top-1.5 size-2 rounded-full border border-white bg-emerald-500" title="Main image" />}
                    </button>)}
                  </div>
                </div>}
              </section>

              <aside className="min-w-0 space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#91620B]">Summary</p>
                  <h2 className="mt-1 text-lg font-bold text-[#1A0E2D]">Product information</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                    <InfoTile label="Category" value={product.category?.name ?? "General catalogue"} icon={<Layers3 size={17} />} />
                    <InfoTile label="Availability" value={titleCase(product.availability)} icon={<Package size={17} />} />
                    <InfoTile label="Product reference" value={<span className="font-mono text-xs">{product.slug}</span>} icon={<ShieldCheck size={17} />} />
                    <InfoTile label="Gallery" value={`${images.length} image${images.length === 1 ? "" : "s"}`} icon={<ImageIcon size={17} />} />
                  </div>
                </section>

                <section className="rounded-2xl border border-[#E8D49E] bg-[#2B1C3F] p-5 sm:p-6">
                  <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#76520D]"><ShieldCheck size={19} /></span><div><h2 className="text-base font-bold text-[#1A0E2D]">Enquire about this product</h2><p className="mt-1 text-sm leading-6 text-slate-600">Ask our team about specifications, current availability, pricing or delivery options.</p></div></div>
                  <Link to="/#contact" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-extrabold text-[#1A0E2D] transition hover:bg-[#E8AA2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A0E2D] focus-visible:ring-offset-2"><MessageCircle size={17} /> Contact our team <ArrowRight size={16} /></Link>
                </section>

                <Link to="/categories" className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#D9A52E] hover:text-[#1A0E2D]"><span className="flex items-center gap-2"><ArrowLeft size={16} /> Continue browsing</span><ArrowRight size={17} className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#91620B]" /></Link>
              </aside>
            </div>
          </div>

          {lightboxOpen && currentImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050B14]/95 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Product image viewer" onClick={() => setLightboxOpen(false)}>
            <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"><X size={22} /></button>
            {images.length > 1 && <>
              <button type="button" onClick={(event) => { event.stopPropagation(); previousImage(); }} aria-label="Previous image" className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-7"><ChevronLeft size={24} /></button>
              <button type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} aria-label="Next image" className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-7"><ChevronRight size={24} /></button>
            </>}
            <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
              <img key={currentImage.id} src={currentImage.url} alt={`${product.name} enlarged image ${activeImage + 1}`} className="max-h-[78vh] max-w-full rounded-lg object-contain" />
              <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{product.name} · Image {activeImage + 1} of {images.length}</p>
            </div>
          </div>}
        </main>
      )}
      <PublicFooter settings={settings} />
    </div>
  );
}

