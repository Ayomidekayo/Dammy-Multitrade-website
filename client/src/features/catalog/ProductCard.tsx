
import { ImageOff, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "./catalog.types";

interface Props {
  product: Product;
  whatsapp?: string | null;
  index?: number;
}

export default function ProductCard({
  product,
  whatsapp,
  index = 0,
}: Props) {
  const primaryImage =
    product.images?.find((image) => image.isPrimary)?.url ??
    product.images?.[0]?.url ??
    product.imageUrl ??
    null;

  const number = (whatsapp ?? "").replace(/\D/g, "");
  const message = `Hello, Dammy Multitrade Ventures. I would like to enquire about ${product.name}. Please share the price and availability.`;

  const whatsappUrl = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="h-10 w-10 text-stone-300" />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
          Available on enquiry
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h2 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
          {product.name}
        </h2>

        {product.sku && (
          <p className="mt-1 text-xs text-stone-500">
            Product code: {product.sku}
          </p>
        )}

        {product.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <MessageCircle size={17} />
              Enquire on WhatsApp
            </a>
          ) : (
            <p className="rounded-xl bg-stone-100 px-3 py-3 text-center text-xs text-stone-500">
              Contact details currently unavailable
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
