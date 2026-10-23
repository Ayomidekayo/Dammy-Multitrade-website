import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Clock3,
  Eye, Image as ImageIcon, Layers3, Maximize2, Package, ShieldCheck,
  Star, X,
} from "lucide-react";
import { apiRequest } from "../../lib/api";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt?: string;
}
interface ProductCategory { id: string; name: string; isActive?: boolean }
interface Product {
  id: string;
  name: string;
  slug: string;
  availability: string;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
  category: ProductCategory;
  images: ProductImage[];
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
function availabilityLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function availabilityStyle(value: string) {
  if (value === "IN_STOCK") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (value === "OUT_OF_STOCK") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}
function DetailItem({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">{icon}</span>
      <div className="min-w-0"><p className="text-xs font-medium text-slate-500">{label}</p><div className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</div></div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

const loadProduct = useCallback(async () => {
  if (!id) {
    setError("A product ID was not provided in the URL.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await apiRequest<Product>(
      `/products/admin/${id}`,
    );

    setProduct(response.data);
    setActiveImage(0);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to load this product.",
    );
  } finally {
    setLoading(false);
  }
}, [id]);

  useEffect(() => { void loadProduct(); }, [loadProduct]);

  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    }).slice(0, 10);
  }, [product?.images]);
  const currentImage = images[activeImage];

  const showPrevious = useCallback(() => {
    setActiveImage((current) => images.length ? (current - 1 + images.length) % images.length : 0);
  }, [images.length]);
  const showNext = useCallback(() => {
    setActiveImage((current) => images.length ? (current + 1) % images.length : 0);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [lightboxOpen, showNext, showPrevious]);

  if (loading) return (
    <div className="min-w-0 space-y-6 pb-8">
      <div className="h-7 w-36 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-44 animate-pulse rounded-3xl bg-gradient-to-r from-amber-50 via-slate-100 to-amber-50 sm:h-52" />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-100" /><div className="space-y-3"><div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" /><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /></div></div>
    </div>
  );

  if (error || !product) return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Package size={22} /></span>
      <h1 className="mt-4 text-xl font-bold text-slate-950">Product could not be loaded</h1>
      <p className="mt-2 break-words text-sm leading-6 text-slate-600">{error || "This product may have been removed."}</p>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => void loadProduct()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F5B942] px-4 text-sm font-bold text-[#0B1220] transition hover:bg-amber-400"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-w-0 space-y-5 pb-8 sm:space-y-7">
      <style>{`
        @keyframes product-detail-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .product-detail-enter { animation: product-detail-enter 480ms cubic-bezier(.2,.75,.25,1) both; }
        .product-detail-delay-1 { animation-delay: 70ms; }
        .product-detail-delay-2 { animation-delay: 130ms; }
        .product-detail-delay-3 { animation-delay: 190ms; }
        @media (prefers-reduced-motion: reduce) { .product-detail-enter, .product-detail-enter * { animation: none !important; transition: none !important; } }
      `}</style>

      <div className="product-detail-enter flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/products" className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-amber-700"><ArrowLeft size={16} /> Products</Link>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400"><span>Workspace</span><span>/</span><span>Products</span><span>/</span><span className="max-w-48 truncate text-slate-600">{product.name}</span></div>
        </div>
        <Link to="/admin/products" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"><ArrowLeft size={15} /> Back to catalogue</Link>
      </div>

      <header className="product-detail-enter product-detail-delay-1 relative isolate overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/70 p-5 shadow-[0_12px_35px_rgba(180,120,10,0.09)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-5 -top-10 h-40 w-40 rounded-full border-[18px] border-white/60" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800"><Package size={14} /> Product details</span>
            <h1 className="mt-4 break-words text-2xl font-extrabold tracking-tight text-[#0B1220] sm:text-3xl lg:text-4xl">{product.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Review product imagery, category, availability and publication status in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-bold ring-1 ring-inset ${product.isPublished ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}><span className={`h-2 w-2 rounded-full ${product.isPublished ? "bg-emerald-500" : "bg-slate-400"}`} />{product.isPublished ? "Published" : "Draft"}</span>
            {product.isFeatured && <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-amber-100 px-3 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-200"><Star size={13} /> Featured</span>}
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="product-detail-enter product-detail-delay-2 min-w-0 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 px-1 pb-4">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Visual showcase</p><h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">Product gallery</h2><p className="mt-1 text-xs text-slate-500">{images.length} of 10 image slots used</p></div>
            {images.length > 0 && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Image {activeImage + 1} / {images.length}</span>}
          </div>

          <div className="group relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-amber-50/50 to-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,185,66,0.16),transparent_45%)]" />
            <div className="relative flex aspect-[4/3] min-h-64 items-center justify-center sm:min-h-80">
              {currentImage ? <img key={currentImage.id} src={currentImage.url} alt={`${product.name} image ${activeImage + 1}`} className="h-full w-full object-contain p-3 transition duration-500 ease-out group-hover:scale-[1.025] sm:p-6" /> : <div className="flex flex-col items-center gap-3 text-slate-400"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm"><ImageIcon size={28} /></span><p className="text-sm font-medium">No product images available</p></div>}
              {currentImage && <>
                <button type="button" onClick={() => setLightboxOpen(true)} aria-label="Open image fullscreen" className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white"><Maximize2 size={17} /></button>
                {images.length > 1 && <>
                  <button type="button" onClick={showPrevious} aria-label="Previous product image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md transition hover:scale-110 hover:bg-white"><ChevronLeft size={20} /></button>
                  <button type="button" onClick={showNext} aria-label="Next product image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-md transition hover:scale-110 hover:bg-white"><ChevronRight size={20} /></button>
                </>}
                {currentImage.isPrimary && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm"><Check size={13} /> Primary image</span>}
              </>}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-700">All product images</p><p className="text-[11px] text-slate-400">Select to preview</p></div>
            {images.length ? <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} aria-pressed={activeImage === index} className={`group/thumb relative aspect-square min-w-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${activeImage === index ? "border-amber-400 ring-2 ring-amber-100" : "border-transparent hover:border-slate-300"}`}>
                <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
                <span className={`absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold ${activeImage === index ? "bg-amber-400 text-slate-950" : "bg-white/90 text-slate-600"}`}>{index + 1}</span>
                {image.isPrimary && <span className="absolute left-1 top-1 h-2 w-2 rounded-full border border-white bg-emerald-500" title="Primary image" />}
              </button>)}
            </div> : <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-500">Add product images from the edit product form.</div>}
          </div>
        </section>

        <div className="product-detail-enter product-detail-delay-3 min-w-0 space-y-5">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Product information</p><h2 className="mt-1 text-lg font-bold text-slate-950">Overview</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <DetailItem label="Category" value={product.category?.name ?? "Uncategorized"} icon={<Layers3 size={17} />} />
              <DetailItem label="Availability" value={<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${availabilityStyle(product.availability)}`}>{availabilityLabel(product.availability)}</span>} icon={<Package size={17} />} />
              <DetailItem label="Website visibility" value={product.isPublished ? "Published on website" : "Draft — hidden"} icon={<Eye size={17} />} />
              <DetailItem label="Featured product" value={product.isFeatured ? "Yes, featured" : "Not featured"} icon={<Star size={17} />} />
              <DetailItem label="Date added" value={formatDate(product.createdAt)} icon={<Clock3 size={17} />} />
              <DetailItem label="Product slug" value={<span className="font-mono text-xs">{product.slug}</span>} icon={<ShieldCheck size={17} />} />
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/60 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm"><ImageIcon size={19} /></span><div className="min-w-0"><h2 className="text-sm font-bold text-slate-950">Image presentation</h2><p className="mt-1 text-xs leading-5 text-slate-600">Your primary image appears first. Use clear, well-lit images with consistent framing.</p></div></div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/80 bg-white/75 p-3"><span className="text-xs font-medium text-slate-600">Images uploaded</span><span className="text-sm font-extrabold text-slate-950">{images.length}<span className="font-medium text-slate-400"> / 10</span></span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-[width] duration-700" style={{ width: `${Math.min((images.length / 10) * 100, 100)}%` }} /></div>
          </section>

          <Link to="/admin/products" className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"><span className="flex items-center gap-2"><ArrowLeft size={16} /> Return to product catalogue</span><ArrowUpRight size={17} className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-700" /></Link>
        </div>
      </div>

      {lightboxOpen && currentImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Product image viewer" onClick={() => setLightboxOpen(false)}>
        <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"><X size={22} /></button>
        {images.length > 1 && <>
          <button type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} aria-label="Previous image" className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-110 hover:bg-white/25 sm:left-7"><ChevronLeft size={24} /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} aria-label="Next image" className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-110 hover:bg-white/25 sm:right-7"><ChevronRight size={24} /></button>
        </>}
        <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <img key={currentImage.id} src={currentImage.url} alt={`${product.name} enlarged image ${activeImage + 1}`} className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl" />
          <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{product.name} · Image {activeImage + 1} of {images.length}</p>
        </div>
      </div>}
    </div>
  );
}
