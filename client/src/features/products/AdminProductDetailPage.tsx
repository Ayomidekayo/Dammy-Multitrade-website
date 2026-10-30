import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  Image as ImageIcon,
  Layers3,
  LoaderCircle,
  Maximize2,
  Package,
  RefreshCw,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
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
  createdAt?: string;
}

interface Product {
  id: string;
  name: string | null;
  slug: string;
  sku?: string | null;
  description?: string | null;
  categoryId: string;
  category: Category;
  availability: Availability;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt?: string;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric", month: "long", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(date);
}

function availabilityLabel(value: Availability) {
  if (value === "IN_STOCK") return "In stock";
  if (value === "OUT_OF_STOCK") return "Out of stock";
  return "Available on request";
}

function DetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#493459] bg-[#2B1B3D] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#80609A] hover:bg-[#332047]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#412B55] text-[#F5CB79]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#B7A7C9]">{label}</p>
        <div className="mt-1 break-words text-sm font-bold text-[#FAF7FF]">{value}</div>
      </div>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError("A product ID was not provided in the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<Product>(`/products/admin/${id}`);
      if (!response?.data) throw new Error("The product API returned an unexpected response.");
      setProduct(response.data);
      setActiveImage(0);
    } catch (err) {
      setError(messageOf(err));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadProduct(); }, [loadProduct]);

  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images]
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder)
      .slice(0, 10);
  }, [product?.images]);
  const currentImage = images[activeImage];

  const previousImage = useCallback(() => {
    setActiveImage((current) => images.length ? (current - 1 + images.length) % images.length : 0);
  }, [images.length]);
  const nextImage = useCallback(() => {
    setActiveImage((current) => images.length ? (current + 1) % images.length : 0);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, nextImage, previousImage]);

  async function openEditor() {
    if (!product) return;
    setLoadingEdit(true);
    setEditError("");
    try {
      const response = await apiRequest<Category[]>("/categories");
      if (!Array.isArray(response?.data)) throw new Error("The categories API returned an unexpected response.");
      setCategories(response.data);
      setEditOpen(true);
    } catch (err) {
      setEditError(messageOf(err));
    } finally {
      setLoadingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="min-w-0 space-y-5 pb-8">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-[#493459]" />
        <div className="h-40 animate-pulse rounded-3xl bg-[#2B1B3D] sm:h-48" />
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div className="aspect-[4/3] animate-pulse rounded-3xl bg-[#2B1B3D]" />
          <div className="space-y-3"><div className="h-12 animate-pulse rounded-2xl bg-[#2B1B3D]" /><div className="h-24 animate-pulse rounded-2xl bg-[#2B1B3D]" /><div className="h-24 animate-pulse rounded-2xl bg-[#2B1B3D]" /></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-400/30 bg-[#241333] p-6 text-center shadow-xl sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300"><Package size={25} /></span>
        <h1 className="mt-4 text-xl font-extrabold text-[#FAF7FF]">Product could not be loaded</h1>
        <p className="mt-2 break-words text-sm leading-6 text-[#B7A7C9]">{error || "This product may have been removed."}</p>
        <button type="button" onClick={() => void loadProduct()} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F5B942] px-5 text-sm font-extrabold text-[#21152E] transition hover:-translate-y-0.5 hover:bg-[#F8CA69]"><RefreshCw size={16} /> Try again</button>
      </div>
    );
  }

  return (
    <main className="product-detail-page min-w-0 space-y-5 pb-10 sm:space-y-7">
      <style>{`
        @keyframes dm-detail-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .dm-detail-enter { animation: dm-detail-enter .48s cubic-bezier(.2,.75,.25,1) both; }
        .dm-detail-delay-1 { animation-delay: 70ms; }
        .dm-detail-delay-2 { animation-delay: 140ms; }
        .dm-detail-delay-3 { animation-delay: 210ms; }
        @media (prefers-reduced-motion: reduce) { .dm-detail-enter, .dm-detail-enter * { animation: none !important; transition: none !important; } }
      `}</style>

      <div className="dm-detail-enter flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/admin/categories" className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#B7A7C9] transition hover:text-[#F5CB79]"><ArrowLeft size={16} /> Back to categories</Link>
          <p className="mt-2 truncate text-xs text-[#9F8DB4]">Admin workspace / Catalogue / {product.name || "Product"}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link to={`/admin/categories/${product.categoryId}/products`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#493459] bg-[#2B1B3D] px-4 text-sm font-semibold text-[#E1D5ED] transition hover:border-[#80609A] hover:bg-[#332047]"><ArrowLeft size={15} /> Category products</Link>
          <button type="button" onClick={() => void openEditor()} disabled={loadingEdit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-5 text-sm font-extrabold text-[#21152E] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-[#F8CA69] disabled:opacity-60">{loadingEdit ? <LoaderCircle size={17} className="animate-spin" /> : <Edit3 size={16} />} Edit product</button>
        </div>
      </div>

      {editError && <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{editError}</div>}

      <header className="dm-detail-enter dm-detail-delay-1 relative isolate overflow-hidden rounded-3xl border border-[#6B512F]/70 bg-gradient-to-br from-[#1B1029] via-[#2B1B3D] to-[#422A57] p-5 shadow-[0_16px_45px_rgba(10,4,20,.28)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[22px] border-[#F5B942]/10" />
        <div className="pointer-events-none absolute -bottom-20 right-36 h-48 w-48 rounded-full bg-[#8A5BB0]/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#80623B] bg-[#241333]/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#F5CB79]"><Package size={13} /> Product record</span>
            <h1 className="mt-4 break-words text-2xl font-black tracking-tight text-[#FAF7FF] sm:text-3xl lg:text-4xl">{product.name || "Unnamed product"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#C4B6D5]">View the product images, catalogue information and publishing settings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-bold ring-1 ring-inset ${product.isPublished ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/30" : "bg-slate-400/10 text-slate-300 ring-slate-400/30"}`}><span className={`h-2 w-2 rounded-full ${product.isPublished ? "bg-emerald-400" : "bg-slate-400"}`} />{product.isPublished ? "Published" : "Draft"}</span>
            {product.isFeatured && <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-amber-400/10 px-3 text-xs font-bold text-[#F5CB79] ring-1 ring-inset ring-amber-300/30"><Star size={13} className="fill-current" /> Featured</span>}
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,.88fr)]">
        <section className="dm-detail-enter dm-detail-delay-2 min-w-0 rounded-3xl border border-[#493459] bg-[#241333] p-3 shadow-xl shadow-black/10 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 px-1 pb-4">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F5CB79]">Product media</p><h2 className="mt-1 text-lg font-extrabold text-[#FAF7FF]">Image gallery</h2><p className="mt-1 text-xs text-[#9F8DB4]">{images.length} of 10 image slots used</p></div>
            {images.length > 0 && <span className="rounded-full bg-[#332047] px-3 py-1.5 text-xs font-semibold text-[#D7C9E5]">{activeImage + 1} / {images.length}</span>}
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-[#493459] bg-[radial-gradient(circle_at_top_right,rgba(245,185,66,.09),transparent_48%),linear-gradient(145deg,#1B1029,#30203F)]">
            <div className="relative flex aspect-[4/3] min-h-64 items-center justify-center sm:min-h-[360px]">
              {currentImage ? <img key={currentImage.id} src={currentImage.url} alt={currentImage.altText || product.name || "Product image"} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.025] sm:p-7" /> : <div className="flex flex-col items-center gap-3 text-[#9F8DB4]"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#332047] text-[#F5CB79]"><ImageIcon size={28} /></span><p className="text-sm font-medium">No product images available</p></div>}
              {currentImage && <>
                <button type="button" onClick={() => setLightboxOpen(true)} aria-label="Open image fullscreen" className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#80609A] bg-[#241333]/90 text-[#F0E8F8] shadow-lg backdrop-blur transition hover:scale-105 hover:border-[#F5B942]"><Maximize2 size={17} /></button>
                {images.length > 1 && <>
                  <button type="button" onClick={previousImage} aria-label="Previous product image" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#80609A] bg-[#241333]/90 text-[#F0E8F8] shadow-lg transition hover:scale-110 hover:border-[#F5B942]"><ChevronLeft size={20} /></button>
                  <button type="button" onClick={nextImage} aria-label="Next product image" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#80609A] bg-[#241333]/90 text-[#F0E8F8] shadow-lg transition hover:scale-110 hover:border-[#F5B942]"><ChevronRight size={20} /></button>
                </>}
                {currentImage.isPrimary && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-[#172B25]/95 px-3 py-1.5 text-xs font-bold text-emerald-300"><CheckCircle2 size={13} /> Primary image</span>}
              </>}
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-bold text-[#E1D5ED]">All product images</p><p className="text-[11px] text-[#9F8DB4]">Tap an image to preview</p></div>
            {images.length ? <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {images.map((image, index) => <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} aria-pressed={activeImage === index} className={`group/thumb relative aspect-square min-w-0 overflow-hidden rounded-xl border-2 bg-[#1B1029] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${activeImage === index ? "border-[#F5B942] ring-2 ring-amber-400/20" : "border-[#493459] hover:border-[#80609A]"}`}>
                <img src={image.url} alt={image.altText || `${product.name || "Product"} thumbnail ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
                <span className={`absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold ${activeImage === index ? "bg-[#F5B942] text-[#21152E]" : "bg-[#241333]/90 text-[#E1D5ED]"}`}>{index + 1}</span>
                {image.isPrimary && <span className="absolute left-1 top-1 h-2 w-2 rounded-full border border-[#241333] bg-emerald-400" title="Primary image" />}
              </button>)}
            </div> : <div className="rounded-xl border border-dashed border-[#493459] px-4 py-6 text-center text-xs text-[#9F8DB4]">Use Edit product to upload images.</div>}
          </div>
        </section>

        <div className="dm-detail-enter dm-detail-delay-3 min-w-0 space-y-5">
          <section className="rounded-3xl border border-[#493459] bg-[#241333] p-5 shadow-xl shadow-black/10 sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F5CB79]">Catalogue record</p><h2 className="mt-1 text-lg font-extrabold text-[#FAF7FF]">Product information</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <DetailCard label="Category" value={product.category?.name || "Uncategorized"} icon={<Layers3 size={17} />} />
              <DetailCard label="Availability" value={<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.availability === "IN_STOCK" ? "bg-emerald-500/10 text-emerald-300" : product.availability === "OUT_OF_STOCK" ? "bg-rose-500/10 text-rose-300" : "bg-amber-500/10 text-[#F5CB79]"}`}>{availabilityLabel(product.availability)}</span>} icon={<Package size={17} />} />
              <DetailCard label="Website visibility" value={product.isPublished ? "Published on website" : "Draft — hidden"} icon={<Eye size={17} />} />
              <DetailCard label="Featured product" value={product.isFeatured ? "Yes, featured" : "Not featured"} icon={<Star size={17} />} />
              <DetailCard label="Date added" value={formatDate(product.createdAt)} icon={<CalendarDays size={17} />} />
              <DetailCard label="Display order" value={String(product.displayOrder ?? 0)} icon={<Layers3 size={17} />} />
              {product.sku && <DetailCard label="SKU" value={<span className="font-mono">{product.sku}</span>} icon={<ShieldCheck size={17} />} />}
              <DetailCard label="Product slug" value={<span className="font-mono text-xs">{product.slug}</span>} icon={<Clock3 size={17} />} />
              {product.updatedAt && <DetailCard label="Last updated" value={formatDate(product.updatedAt)} icon={<RefreshCw size={17} />} />}
            </div>
          </section>

          {product.description && <section className="rounded-3xl border border-[#493459] bg-[#241333] p-5 shadow-xl shadow-black/10 sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F5CB79]">Product copy</p><h2 className="mt-1 text-lg font-extrabold text-[#FAF7FF]">Description</h2>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#C4B6D5]">{product.description}</p>
          </section>}

          <section className="rounded-3xl border border-[#6B512F]/60 bg-gradient-to-br from-[#332047] to-[#241333] p-5 shadow-lg sm:p-6">
            <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5B942]/10 text-[#F5CB79]"><ImageIcon size={19} /></span><div className="min-w-0"><h2 className="text-sm font-extrabold text-[#FAF7FF]">Image presentation</h2><p className="mt-1 text-xs leading-5 text-[#B7A7C9]">The primary image appears first in the gallery. You can change it or manage product photos from Edit product.</p></div></div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#493459] bg-[#241333]/80 p-3"><span className="text-xs font-medium text-[#B7A7C9]">Images uploaded</span><span className="text-sm font-extrabold text-[#FAF7FF]">{images.length}<span className="font-medium text-[#9F8DB4]"> / 10</span></span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1B1029]"><div className="h-full rounded-full bg-gradient-to-r from-[#F5B942] to-emerald-400 transition-[width] duration-700" style={{ width: `${Math.min(images.length / 10 * 100, 100)}%` }} /></div>
          </section>
        </div>
      </div>

      {lightboxOpen && currentImage && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#100A18]/95 p-3 backdrop-blur-md sm:p-8" role="dialog" aria-modal="true" aria-label="Product image viewer" onClick={() => setLightboxOpen(false)}>
        <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"><X size={22} /></button>
        {images.length > 1 && <>
          <button type="button" onClick={(event) => { event.stopPropagation(); previousImage(); }} aria-label="Previous image" className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-white/20 sm:left-7"><ChevronLeft size={24} /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} aria-label="Next image" className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-white/20 sm:right-7"><ChevronRight size={24} /></button>
        </>}
        <div className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
          <img key={currentImage.id} src={currentImage.url} alt={currentImage.altText || product.name || "Product"} className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl" />
          <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{product.name} · Image {activeImage + 1} of {images.length}</p>
        </div>
      </div>}

      {editOpen && <ProductFormModal
        product={product}
        categories={categories}
        onClose={() => setEditOpen(false)}
        onSaved={(saved) => {
          setProduct((current) => current ? { ...current, ...saved, category: saved.category ?? current.category } : saved);
          setEditOpen(false);
          setActiveImage(0);
        }}
      />}
    </main>
  );
}
