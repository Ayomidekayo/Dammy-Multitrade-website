import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  PackageSearch,
  RefreshCw,
} from "lucide-react";

import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";
import CategoryCard from "../features/catalog/CategoryCard";
import { catalogApi } from "../features/catalog/catalog.api";
import type { Category, SiteSettings } from "../features/catalog/catalog.types";

const defaultBenefits = [
  "Quality products for different applications",
  "Helpful product guidance",
  "Convenient WhatsApp enquiries",
  "A wide range of industrial and agricultural supplies",
];

const heroContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, x: 34, y: 8 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const sectionFromRightVariants: Variants = {
  hidden: { opacity: 0, x: 42 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};

const cardPopVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;

    Promise.all([
      catalogApi.getCategories(),
      catalogApi.getSettings().catch(() => ({} as SiteSettings)),
    ])
      .then(([categoryData, settingsData]) => {
        if (!active) return;
        setCategories(categoryData);
        setSettings(settingsData);
      })
      .catch(() => {
        if (active) setCategoriesError(true);
      })
      .finally(() => {
        if (active) setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const whatsappNumber = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello Dammy Multitrade Ventures. I would like to make a product enquiry."
      )}`
    : null;

  const businessName = settings.businessName || "Dammy Multitrade Ventures";
    const heroDescription =
    "Discover dependable industrial hoses, irrigation systems, water pumps, power tools, and safety equipment for your business, agricultural, and industrial needs.";

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#111827]">
      <PublicHeader />

      <main>
        {/* Hero: full-bleed background image with navy overlays and gold accents. */}
        <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-[#0B1220] sm:min-h-[680px] lg:min-h-[760px]">
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.06, 1] }}
            transition={{ duration: 22, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-store.png')" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-gradient-to-r from-[#070B12]/95 via-[#0B1220]/80 to-[#0B1220]/35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B1220]/75 via-transparent to-[#0B1220]/25"
          />

          <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-24">
            <motion.div
              variants={heroContainerVariants}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              className="max-w-3xl"
            >
              <motion.div variants={heroItemVariants} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#F5B942]/45 bg-[#0B1220]/55 px-4 py-2 text-xs font-bold tracking-wide text-[#F5B942] shadow-lg backdrop-blur-sm sm:text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#F5B942]" />
                Industrial, Agricultural & Workplace Supplies
              </motion.div>

              <motion.h1 variants={heroItemVariants} className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Quality Hoses,
                <span className="block text-[#F5B942]">Tools & Farm</span>
                Solutions You Can Trust.
              </motion.h1>

              <motion.p variants={heroItemVariants} className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                {heroDescription}
              </motion.p>

              <motion.div variants={heroItemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to="/categories"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-6 py-4 text-sm font-extrabold text-[#0B1220] shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8AA2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] sm:px-7 sm:text-base"
                >
                  Explore Our Products <ArrowRight size={18} />
                </Link>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#F5B942] hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-7 sm:text-base"
                  >
                    <ArrowRight size={18} /> Contact Our Team
                  </a>
                ) : (
                  <Link
                    to="/#contact"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:border-[#F5B942] hover:bg-white/15 sm:px-7 sm:text-base"
                  >
                    Contact Our Team <ArrowRight size={18} />
                  </Link>
                )}
              </motion.div>

              <motion.div variants={heroContainerVariants} initial={reduceMotion ? false : "hidden"} animate="visible" className="mt-12 grid max-w-2xl grid-cols-1 gap-4 border-t border-white/20 pt-6 sm:grid-cols-3 sm:gap-5">
                {[
                  ["Industrial Quality", "Dependable products"],
                  ["Multiple Categories", "Solutions for different needs"],
                  ["Customer Support", "Help with product enquiries"],
                ].map(([title, description]) => (
                  <motion.div
                    key={title}
                    variants={heroItemVariants}
                    className="rounded-xl border border-white/10 bg-[#0B1220]/25 p-3 backdrop-blur-sm sm:border-0 sm:bg-transparent sm:p-0"
                  >
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-300">
                      {description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.aside
              initial={reduceMotion ? false : { opacity: 0, x: 42, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] as const }}
              className="hidden w-full max-w-sm shrink-0 lg:block"
              aria-label="Product supply highlights"
            >
              <div className="rounded-3xl border border-white/20 bg-[#0B1220]/65 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl xl:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F5B942]">Supply solutions</p>
                    <h2 className="mt-2 text-xl font-extrabold">Made for the work ahead.</h2>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5B942] text-[#0B1220]">
                    <ShieldCheck size={25} />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { title: "Industrial hoses", detail: "Options for industrial and commercial applications" },
                    { title: "Farm & irrigation", detail: "Equipment to support water management needs" },
                    { title: "Pumps, tools & safety", detail: "Supplies for projects and workplace tasks" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.38 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5B942]/15 text-[#F5B942]">
                        <CheckCircle2 size={15} />
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-300">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link
                  to="/categories"
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#F5B942]/50 bg-[#F5B942]/10 px-4 py-3 text-sm font-extrabold text-[#F5B942] transition hover:bg-[#F5B942] hover:text-[#0B1220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
                >
                  Find the right category <ArrowRight size={17} />
                </Link>
              </div>
            </motion.aside>
          </div>
        </section>

        {/* Categories are loaded from the admin-managed categories API. */}
        <section
          id="categories"
          className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={sectionFromRightVariants}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: true, amount: 0.2 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A6900] sm:text-sm">
                Explore Our Range
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B1220] sm:text-4xl">
                Products for Your Needs
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Browse our categories to find suitable products, then contact
                {" "}{businessName} for availability, specifications and pricing.
              </p>
            </motion.div>

            {categoriesLoading ? (
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="aspect-[5/4] bg-stone-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-3/4 rounded bg-stone-100" />
                      <div className="h-3 w-full rounded bg-stone-100" />
                      <div className="h-3 w-2/3 rounded bg-stone-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categoriesError ? (
              <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-7 text-center">
                <RefreshCw className="mx-auto h-8 w-8 text-[#9A6900]" />
                <h3 className="mt-3 font-bold text-[#0B1220]">
                  Categories are temporarily unavailable
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Please visit the full catalogue or try again shortly.
                </p>
                <Link
                  to="/categories"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-[#E8AA2E]"
                >
                  Browse categories
                </Link>
              </div>
            ) : categories.length > 0 ? (
              <motion.div
                variants={cardContainerVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.12 }}
                className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:grid-cols-4"
              >
                {categories.slice(0, 4).map((category, index) => (
                  <motion.div
                    key={category.id}
                    variants={cardPopVariants}
                    whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
                    transition={{ duration: 0.22 }}
                  >
                    <CategoryCard category={category} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center">
                <PackageSearch className="mx-auto h-9 w-9 text-stone-400" />
                <h3 className="mt-4 text-lg font-bold text-[#0B1220]">
                  Catalogue coming soon
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Our team is preparing the product categories. Please check back soon.
                </p>
              </div>
            )}

            <motion.div variants={sectionFromRightVariants} initial={reduceMotion ? false : "hidden"} whileInView={reduceMotion ? undefined : "visible"} viewport={{ once: true }} className="mt-9 text-center">
              <Link
                to="/categories"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#0B1220]/15 bg-white px-6 py-3 text-sm font-extrabold text-[#0B1220] transition hover:border-[#F5B942] hover:bg-[#FFF8E8]"
              >
                View All Categories <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="scroll-mt-24 bg-[#F8F7F3] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -34 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A6900] sm:text-sm">
                Why {businessName}?
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#0B1220] sm:text-4xl">
                Quality supplies. Helpful service. Reliable solutions.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                We provide industrial, agricultural and workplace supplies to
                support businesses and individuals with their equipment needs.
                Our team can help you enquire about the right product for your
                application.
              </p>

              <ul className="mt-7 space-y-4">
                {defaultBenefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: reduceMotion ? 0 : 0.38, delay: reduceMotion ? 0 : index * 0.07 }}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-700 sm:text-base"
                  >
                    <CheckCircle2
                      size={21}
                      className="mt-0.5 shrink-0 text-[#B98213]"
                    />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17253B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2"
                >
                  Speak to Our Team <ArrowRight size={18} />
                </a>
              ) : (
                <Link
                  to="/#contact"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17253B]"
                >
                  Contact Our Team <ArrowRight size={18} />
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 36, scale: 0.98 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] as const }}
              className="group relative isolate min-h-[360px] overflow-hidden rounded-3xl bg-[#0B1220] shadow-xl sm:min-h-[460px]"
            >
              <img
                src="/images/hero-store.png"
                alt={`${businessName} industrial and agricultural supplies`}
                loading="lazy"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/45 to-[#0B1220]/10" />

              <div className="flex min-h-[360px] flex-col justify-end p-6 text-white sm:min-h-[460px] sm:p-8 lg:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5B942] text-[#0B1220] shadow-lg">
                  <ShieldCheck size={29} />
                </div>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#F5B942]">
                  Dependable products. Helpful service.
                </p>
                <h3 className="mt-3 max-w-md text-2xl font-black leading-tight sm:text-3xl">
                  Need help finding the right product?
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-200 sm:text-base">
                  Tell us what you need and any specifications you have. Our
                  team can help you make an informed enquiry.
                </p>
                {settings.openingHours && (
                  <p className="mt-6 border-t border-white/20 pt-5 text-sm text-slate-200">
                    <span className="font-bold text-white">Opening hours: </span>
                    {settings.openingHours}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact details are read from the admin-managed site settings. */}
        <section
          id="contact"
          className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] as const }}
            className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#F5B942]/35 bg-gradient-to-br from-[#FFF9EB] to-[#F8F7F3] p-6 sm:p-10 lg:p-14"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9A6900] sm:text-sm">
                  Let's Talk Business
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-[#0B1220] sm:text-4xl">
                  Looking for equipment or supplies?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  Contact {businessName} about product availability,
                  specifications and quotations.
                </p>

                {(settings.address || settings.city || settings.state) && (
                  <p className="mt-5 max-w-2xl break-words text-sm leading-6 text-slate-700">
                    {[settings.address, settings.city, settings.state, settings.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-2 inline-block break-all text-sm font-semibold text-[#7A570C] underline-offset-4 hover:underline"
                  >
                    {settings.email}
                  </a>
                )}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-700">
                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                      className="hover:text-[#9A6900]"
                    >
                      {settings.phone}
                    </a>
                  )}
                  {settings.secondaryPhone && (
                    <a
                      href={`tel:${settings.secondaryPhone.replace(/[^\d+]/g, "")}`}
                      className="hover:text-[#9A6900]"
                    >
                      {settings.secondaryPhone}
                    </a>
                  )}
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-6 py-4 text-sm font-extrabold text-[#0B1220] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E8AA2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <ArrowRight size={19} /> Enquire on WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
