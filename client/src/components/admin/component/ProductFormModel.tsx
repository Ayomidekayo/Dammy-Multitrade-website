
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Check,
  ImagePlus,
  LoaderCircle,
  Package,
  Star,
  Upload,
  X,
} from "lucide-react";
import { apiRequest } from "../../../lib/api";


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

interface Props {
  product: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const inputClass =
  "min-h-12 w-full rounded-xl border border-[#493459] bg-[#241333] px-3.5 text-sm text-[#F0E8F8] outline-none transition placeholder:text-[#9F8DB4] focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-[#E1D5ED]";

function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function ProductFormModal({
  product,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? defaultCategoryId ?? "",
  );
  const [availability, setAvailability] = useState<Availability>(
    product?.availability ?? "ON_REQUEST",
  );
  const [displayOrder, setDisplayOrder] = useState(
    String(product?.displayOrder ?? 0),
  );
  const [isPublished, setIsPublished] = useState(
    product?.isPublished ?? true,
  );
  const [isFeatured, setIsFeatured] = useState(
    product?.isFeatured ?? false,
  );

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [primaryNewIndex, setPrimaryNewIndex] = useState(product ? -1 : 0);
  const [primaryExistingId, setPrimaryExistingId] = useState(
    product?.images.find((image) => image.isPrimary)?.id ??
      product?.images[0]?.id ??
      "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategories = categories.filter(
    (category) => category.isActive || category.id === categoryId,
  );

  const existingImages = product?.images ?? [];

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  function selectImages(fileList: FileList | null) {
    if (!fileList) return;

    setError("");

    const selected = Array.from(fileList);
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    for (const file of selected) {
      if (!acceptedTypes.includes(file.type)) {
        setError("Use JPG, PNG, WebP or AVIF images.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 5 MB image limit.`);
        return;
      }
    }

    if (existingImages.length + images.length + selected.length > MAX_IMAGES) {
      setError(`You can attach a maximum of ${MAX_IMAGES} images per product.`);
      return;
    }

    setImages((current) => [...current, ...selected]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeNewImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));

    setPrimaryNewIndex((current) => {
      if (current === index) return product ? -1 : 0;
      if (current > index) return current - 1;
      return current;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const order = Number(displayOrder);

    if (cleanName.length < 2 || cleanName.length > 150) {
      setError("Product name must contain between 2 and 150 characters.");
      return;
    }

    if (!categoryId) {
      setError("Please select a product category.");
      return;
    }

    if (!Number.isInteger(order) || order < 0) {
      setError("Display order must be a non-negative whole number.");
      return;
    }

    if (!product && images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();

      body.append("name", cleanName);
      body.append("categoryId", categoryId);
      body.append("availability", availability);
      body.append("displayOrder", String(order));
      body.append("isPublished", String(isPublished));
      body.append("isFeatured", String(isFeatured));

      // The server route uses upload.array("images", 10).
      images.forEach((file) => {
        body.append("images", file);
      });

      const response = product
        ? await apiRequest<Product>(`/products/${product.id}`, {
            method: "PATCH",
            body,
          })
        : await apiRequest<Product>("/products", {
            method: "POST",
            body,
          });

      if (!response?.data) {
        throw new Error("The server returned an unexpected response.");
      }

      const saved = response.data as Product;

      // The API chooses the first uploaded image by default. If the user
      // selected another newly uploaded image, set it primary via the
      // dedicated endpoint after the upload has completed.
      let productToSave = saved;

      if (images.length > 0 && primaryNewIndex >= 0) {
        const targetDisplayOrder = (product?.images.length ?? 0) + primaryNewIndex;
        const selectedNewImage = saved.images?.find(
          (image) => image.displayOrder === targetDisplayOrder,
        );

        if (!selectedNewImage) {
          throw new Error(
            "Images were uploaded, but the selected primary image could not be found. Please reopen the product and try again.",
          );
        }

        if (!selectedNewImage.isPrimary) {
          const primaryResponse = await apiRequest<Product>(
            `/products/${saved.id}/images/${selectedNewImage.id}/primary`,
            { method: "PATCH" },
          );
          if (!primaryResponse?.data) {
            throw new Error("Images uploaded, but the primary image could not be updated.");
          }
          productToSave = primaryResponse.data as Product;
        }
      } else if (primaryExistingId && saved.images?.length) {
        const currentPrimary = saved.images.find((image) => image.isPrimary);
        if (currentPrimary?.id !== primaryExistingId) {
          const primaryResponse = await apiRequest<Product>(
            `/products/${saved.id}/images/${primaryExistingId}/primary`,
            { method: "PATCH" },
          );
          if (!primaryResponse?.data) {
            throw new Error("Product saved, but the primary image could not be updated.");
          }
          productToSave = primaryResponse.data as Product;
        }
      }

      onSaved(productToSave);
      onClose();
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  async function makeExistingImagePrimary(imageId: string) {
    if (!product || loading) return;

    setPrimaryNewIndex(-1);
    setPrimaryExistingId(imageId);
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<Product>(
        `/products/${product.id}/images/${imageId}/primary`,
        { method: "PATCH" },
      );

      if (!response?.data) {
        throw new Error("Unable to update the primary image.");
      }

      onSaved(response.data as Product);
      setPrimaryExistingId(imageId);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteExistingImage(imageId: string) {
    if (!product || loading) return;

    const confirmed = window.confirm(
      "Remove this image from the product?",
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<Product>(
        `/products/${product.id}/images/${imageId}`,
        { method: "DELETE" },
      );

      // The delete endpoint may return a message rather than the product.
      // Refreshing the page data is handled by the parent after a successful
      // update if the response includes the updated product.
      if (response && "data" in response && response.data) {
        const data = response.data as Product;
        if (Array.isArray(data.images)) {
          onSaved(data);
          setPrimaryExistingId(
            data.images.find((image) => image.isPrimary)?.id ??
              data.images[0]?.id ??
              "",
          );
        } else {
          setPrimaryExistingId("");
        }
      } else {
        setPrimaryExistingId("");
      }
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#10071D]/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="dm-product-modal flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-[#493459] bg-[#241333] shadow-2xl sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-3xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#493459] bg-gradient-to-r from-[#241333] to-[#332047] px-4 py-4 sm:px-7 sm:py-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-[#241333] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F5CB79] sm:text-xs">
              <Package size={13} />
              Product catalogue
            </span>

            <h2
              id="product-modal-title"
              className="mt-3 text-xl font-extrabold tracking-tight text-[#FAF7FF] sm:text-2xl"
            >
              {product ? "Edit product" : "Add a product"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#B7A7C9] sm:text-sm">
              Add product details and images for your customers.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close product form"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#493459] bg-[#241333] text-[#B7A7C9] transition hover:border-amber-300 hover:bg-[#382A25] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        {/* Scrollable form */}
        <form
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="space-y-7 p-4 sm:p-7">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1 leading-5">{error}</p>
                <button
                  type="button"
                  aria-label="Dismiss error"
                  onClick={() => setError("")}
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Basic information */}
            <section>
              <div className="mb-4">
                <h3 className="font-bold text-[#FAF7FF]">
                  Product information
                </h3>
                <p className="mt-1 text-xs text-[#B7A7C9] sm:text-sm">
                  Give the product a clear name and assign its category.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="product-name" className={labelClass}>
                    Product name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="product-name"
                    required
                    minLength={2}
                    maxLength={150}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Heavy-Duty Industrial Hose"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="product-category" className={labelClass}>
                    Category <span className="text-amber-600">*</span>
                  </label>
                  <select
                    id="product-category"
                    required
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Choose a category</option>
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {activeCategories.length === 0 && (
                    <p className="mt-2 text-xs text-[#F5CB79]">
                      Create or activate a category before adding products.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="product-availability" className={labelClass}>
                    Availability
                  </label>
                  <select
                    id="product-availability"
                    value={availability}
                    onChange={(event) =>
                      setAvailability(event.target.value as Availability)
                    }
                    className={inputClass}
                  >
                    <option value="IN_STOCK">In stock</option>
                    <option value="OUT_OF_STOCK">Out of stock</option>
                    <option value="ON_REQUEST">Available on request</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="product-order" className={labelClass}>
                    Display order
                  </label>
                  <input
                    id="product-order"
                    type="number"
                    min={0}
                    step={1}
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-[#B7A7C9]">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="border-t border-[#493459] pt-6">
              <div className="mb-4">
                <h3 className="font-bold text-[#FAF7FF]">Product images</h3>
                <p className="mt-1 text-xs leading-5 text-[#B7A7C9] sm:text-sm">
                  Upload clear product photos. JPG, PNG, WebP and AVIF are
                  supported, up to 5 MB per image.
                </p>
              </div>

              {existingImages.length > 0 && (
                <div className="mb-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B7A7C9]">
                    Current images
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((image) => (
                      <div
                        key={image.id}
                        className={`overflow-hidden rounded-xl border bg-[#241333] ${
                          primaryExistingId === image.id
                            ? "border-amber-400 ring-2 ring-amber-100"
                            : "border-[#493459]"
                        }`}
                      >
                        <div className="relative aspect-square bg-[#1B1029]">
                          <img
                            src={image.url}
                            alt={image.altText || "Product"}
                            className="size-full object-cover"
                          />
                          {image.isPrimary && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#F5B942] px-2 py-1 text-[10px] font-extrabold text-[#FAF7FF]">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void deleteExistingImage(image.id)}
                            aria-label="Remove existing image"
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-[#241333]/95 text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-50"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={loading || image.isPrimary}
                          onClick={() =>
                            void makeExistingImagePrimary(image.id)
                          }
                          className="flex min-h-10 w-full items-center justify-center gap-1.5 px-2 text-xs font-semibold text-[#E1D5ED] hover:bg-[#382A25] disabled:cursor-default"
                        >
                          <Star
                            size={13}
                            className={
                              image.isPrimary
                                ? "fill-amber-400 text-amber-500"
                                : "text-[#9F8DB4]"
                            }
                          />
                          {image.isPrimary ? "Primary image" : "Make primary"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previews.length > 0 && (
                <div className="mb-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B7A7C9]">
                    New images
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {previews.map((preview, index) => (
                      <div
                        key={`${images[index]?.name}-${index}`}
                        className={`overflow-hidden rounded-xl border bg-[#241333] ${
                          primaryNewIndex === index
                            ? "border-amber-400 ring-2 ring-amber-100"
                            : "border-[#493459]"
                        }`}
                      >
                        <div className="relative aspect-square bg-[#1B1029]">
                          <img
                            src={preview}
                            alt={images[index]?.name || "New product image"}
                            className="size-full object-cover"
                          />
                          {primaryNewIndex === index && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#F5B942] px-2 py-1 text-[10px] font-extrabold text-[#FAF7FF]">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            aria-label="Remove selected image"
                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-lg bg-[#241333]/95 text-rose-600 shadow-sm hover:bg-rose-50"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPrimaryNewIndex(index);
                            setPrimaryExistingId("");
                          }}
                          className="flex min-h-10 w-full items-center justify-center gap-1.5 px-2 text-xs font-semibold text-[#E1D5ED] hover:bg-[#382A25]"
                        >
                          <Star
                            size={13}
                            className={
                              primaryNewIndex === index
                                ? "fill-amber-400 text-amber-500"
                                : "text-[#9F8DB4]"
                            }
                          />
                          {primaryNewIndex === index
                            ? "Primary image"
                            : "Make primary"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length + images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-[#332047] px-4 py-6 text-center transition hover:border-amber-400 hover:bg-[#382A25]"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#241333] text-[#F5CB79] shadow-sm">
                    {images.length ? (
                      <ImagePlus size={23} />
                    ) : (
                      <Upload size={22} />
                    )}
                  </span>
                  <span className="mt-3 text-sm font-bold text-[#F0E8F8]">
                    Add product photos
                  </span>
                  <span className="mt-1 text-xs text-[#B7A7C9]">
                    Tap to browse your device
                  </span>
                  <span className="mt-2 text-[11px] font-medium text-[#F5CB79]">
                    {existingImages.length + images.length} of {MAX_IMAGES}{" "}
                    images selected
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={(event) => selectImages(event.target.files)}
                className="hidden"
              />

              {!product && images.length === 0 && (
                <p className="mt-2 text-xs text-[#B7A7C9]">
                  Upload at least one image to create the product.
                </p>
              )}
            </section>

            {/* Publication settings */}
            <section className="border-t border-[#493459] pt-6">
              <div className="mb-4">
                <h3 className="font-bold text-[#FAF7FF]">
                  Publishing settings
                </h3>
                <p className="mt-1 text-xs text-[#B7A7C9] sm:text-sm">
                  Choose how this product appears in your public catalogue.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#493459] p-4 transition hover:border-amber-300 hover:bg-[#332047]">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(event) => setIsPublished(event.target.checked)}
                    className="mt-1 size-4 accent-amber-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#F0E8F8]">
                      Publish product
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#B7A7C9]">
                      Make the product visible in the public catalogue.
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-[#C4B6D5]"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#493459] p-4 transition hover:border-amber-300 hover:bg-[#332047]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="mt-1 size-4 accent-amber-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#F0E8F8]">
                      Feature this product
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#B7A7C9]">
                      Mark this product for featured sections where supported.
                    </span>
                  </span>
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      isFeatured
                        ? "bg-amber-100 text-[#F5CB79]"
                        : "bg-slate-100 text-[#9F8DB4]"
                    }`}
                  >
                    <Star
                      size={17}
                      className={isFeatured ? "fill-current" : ""}
                    />
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* Sticky footer */}
          <footer className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-[#493459] bg-[#241333]/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="min-h-12 rounded-xl border border-[#493459] px-5 text-sm font-semibold text-[#E1D5ED] transition hover:bg-[#1B1029] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                activeCategories.length === 0 ||
                (!product && images.length === 0)
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-6 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-[#382A25]0 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {loading
                ? "Saving product..."
                : product
                  ? "Save changes"
                  : "Create product"}
            </button>
          </footer>
        </form>
      </section>
      <style>{`
        @keyframes dm-product-modal-in {
          from { opacity: 0; transform: translateY(16px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dm-product-modal { animation: dm-product-modal-in 240ms cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .dm-product-modal { animation: none; }
        }
      `}</style>
    </div>
  );
}
