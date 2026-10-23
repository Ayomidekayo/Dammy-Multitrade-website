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
  Package,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";


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

function titleCase(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function availabilityStyles(value: string) {
  if (value === "IN_STOCK") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (value === "OUT_OF_STOCK") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function InfoTile({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

export default function PublicProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<PublicProduct | null>(null);
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
      // Public endpoint returns published products by slug; no admin route/token is required.
      const response = await apiRequest<PublicProduct>(
        `/products/slug/${encodeURIComponent(slug)}`,
      );
      setProduct(response.data);
      setActiveImage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't load this product.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

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
    setActiveImage((index) => (images.length ? (index - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setActiveImage((index) => (images.length ? (index + 1) % images.length : 0));
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-100 sm:h-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-200" />
            <div className="space-y-4"><div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="h-24 animate-pulse rounded-2xl bg-slate-200" /></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="grid min-h-[65vh] place-items-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Package size={26} /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">Product unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error || "This product may have been removed or is no longer available."}</p>
          <Link to="/categories" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-5 text-sm font-bold text-white transition hover:bg-slate-800">
            Browse categories <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <style>{`
        @keyframes public-product-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .public-product-enter { animation: public-product-enter 520ms cubic-bezier(.2,.75,.25,1) both; }
        .public-product-delay-1 { animation-delay: 80ms; }
        .public-product-delay-2 { animation-delay: 150ms; }
        .public-product-delay-3 { animation-delay: 220ms; }
        @media (prefers-reduced-motion: reduce) {
          .public-product-enter, .public-product-enter * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <header className="public-product-enter public-product-delay-1 relative isolate overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/70 p-5 shadow-[0_12px_35px_rgba(180,120,10,0.08)] sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border-[18px] border-white/60" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800"><Package size={13} /> Product spotlight</span>
              <h1 className="mt-4 max-w-4xl break-words text-2xl font-extrabold tracking-tight text-[#0B1220] sm:text-3xl lg:text-4xl">{product.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Explore product details and images from Dammy Multitrade Ventures.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold ${availabilityStyles(product.availability)}`}>
                <span className={`h-2 w-2 rounded-full ${product.availability === "IN_STOCK" ? "bg-emerald-500" : product.availability === "OUT_OF_STOCK" ? "bg-rose-500" : "bg-amber-500"}`} />
                {titleCase(product.availability)}
              </span>
              {product.isFeatured && <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 text-xs font-bold text-amber-800"><Star size={13} /> Featured</span>}
            </div>
          </div>
        </header>

        <div className="mt-5 grid min-w-0 gap-5 lg:mt-7 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] lg:gap-7">
          <section className="public-product-enter public-product-delay-2 min-w-0 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 px-1 pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Product imagery</p><h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Gallery</h2></div>
              {images.length > 0 && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{activeImage + 1} / {images.length} images</span>}
            </div>

            <div className="group relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-amber-50/50 to-slate-100">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,185,66,0.17),transparent_45%)]" />
              <div className="relative flex aspect-[4/3] min-h-64 items-center justify-center sm:min-h-96">
                {currentImage ? <img key={currentImage.id} src={currentImage.url} alt={`${product.name} image ${activeImage + 1}`} className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.025] sm:p-7" /> : <div className="flex flex-col items-center gap-3 text-slate-400"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm"><ImageIcon size={28} /></span><p className="text-sm font-medium">No images available for this product</p></div>}
                {currentImage && <>
                  <button type="button" onClick={() => setLightboxOpen(true)} aria-label="View image fullscreen" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white"><Maximize2 size={17} /></button>
                  {images.length > 1 && <>
                    <button type="button" onClick={previousImage} aria-label="Previous product image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:scale-110 hover:bg-white"><ChevronLeft size={20} /></button>
                    <button type="button" onClick={nextImage} aria-label="Next product image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md transition hover:scale-110 hover:bg-white"><ChevronRight size={20} /></button>
                  </>}
                  {currentImage.isPrimary && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm"><Check size={13} /> Main image</span>}
                </>}
              </div>
            </div>

            {images.length > 0 && <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-700">All images</p><p className="text-[11px] text-slate-400">Tap an image to preview</p></div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-pressed={activeImage === index} className={`group/thumb relative aspect-square min-w-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${activeImage === index ? "border-amber-400 ring-2 ring-amber-100" : "border-transparent hover:border-slate-300"}`}>
                  <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
                  <span className={`absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold ${activeImage === index ? "bg-amber-400 text-slate-950" : "bg-white/90 text-slate-600"}`}>{index + 1}</span>
                  {image.isPrimary && <span className="absolute left-1 top-1 h-2 w-2 rounded-full border border-white bg-emerald-500" title="Main image" />}
                </button>)}
              </div>
            </div>}
          </section>

          <aside className="public-product-enter public-product-delay-3 min-w-0 space-y-5">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">At a glance</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">Product information</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                <InfoTile label="Category" value={product.category?.name ?? "General catalogue"} icon={<Layers3 size={17} />} />
                <InfoTile label="Availability" value={titleCase(product.availability)} icon={<Package size={17} />} />
                <InfoTile label="Product reference" value={<span className="font-mono text-xs">{product.slug}</span>} icon={<ShieldCheck size={17} />} />
                <InfoTile label="Image gallery" value={`${images.length} image${images.length === 1 ? "" : "s"}`} icon={<ImageIcon size={17} />} />
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/60 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm"><ShieldCheck size={20} /></span>
                <div><h2 className="text-base font-bold text-slate-950">Need more information?</h2><p className="mt-1 text-sm leading-6 text-slate-600">Contact our team to ask about availability, specifications, pricing, or shipping for this product.</p></div>
              </div>
              <Link to="/#contact" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-4 text-sm font-extrabold text-[#0B1220] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-md">
                Contact us about this product <ArrowRight size={16} />
              </Link>
            </section>

            <Link to="/categories" className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
              <span className="flex items-center gap-2"><ArrowLeft size={16} /> Continue browsing</span>
              <ArrowRight size={17} className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-700" />
            </Link>
          </aside>
        </div>
      </div>

      {lightboxOpen && currentImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Product image viewer" onClick={() => setLightboxOpen(false)}>
        <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"><X size={22} /></button>
        {images.length > 1 && <>
          <button type="button" onClick={(event) => { event.stopPropagation(); previousImage(); }} aria-label="Previous image" className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-110 hover:bg-white/25 sm:left-7"><ChevronLeft size={24} /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} aria-label="Next image" className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-110 hover:bg-white/25 sm:right-7"><ChevronRight size={24} /></button>
        </>}
        <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <img key={currentImage.id} src={currentImage.url} alt={`${product.name} enlarged image ${activeImage + 1}`} className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl" />
          <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{product.name} · Image {activeImage + 1} of {images.length}</p>
        </div>
      </div>}
    </main>
  );
}
