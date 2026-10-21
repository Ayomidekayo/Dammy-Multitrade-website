
import { ArrowUpRight, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Category } from "./catalog.types";

interface Props {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      whileHover={{ y: -5 }}
      className="group h-full"
    >
      <Link
        to={`/categories/${encodeURIComponent(category.slug)}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-stone-100">
          {category.coverImageUrl ? (
            <img
              src={category.coverImageUrl}
              alt={category.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-14 w-14 text-stone-300" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800">
            Explore category
          </span>
        </div>

        <div className="flex flex-1 items-start justify-between gap-3 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-amber-700 sm:text-xl">
              {category.name}
            </h2>

            {category.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                {category.description}
              </p>
            )}

            {typeof category.productCount === "number" && (
              <p className="mt-4 text-xs font-medium text-stone-500">
                {category.productCount}{" "}
                {category.productCount === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 text-slate-700 transition-all group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950">
            <ArrowUpRight size={19} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
