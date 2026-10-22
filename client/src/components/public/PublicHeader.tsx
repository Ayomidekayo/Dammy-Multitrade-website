import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Menu,
  MessageCircle,
  PackageSearch,
  PhoneCall,
  Wrench,
  X,
} from "lucide-react";
import { catalogApi } from "../../features/catalog/catalog.api";
import type { SiteSettings } from "../../features/catalog/catalog.types";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Categories", to: "/categories" },
  // This project currently has category pages rather than a /products index route.
  { label: "Products", to: "/products" },
  { label: "About Us", to: "/#about" },

];

const enquiryMessage =
  "Hello Dammy Multitrade Ventures! I would like to enquire about your products and solutions.";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

export default function PublicHeader() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    catalogApi
      .getSettings()
      .then((response) => {
        if (active) setSettings(readSettingsResponse(response));
      })
      .catch((error) => console.error("Unable to load public site settings:", error));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else if (location.pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  const phone = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(enquiryMessage)}`
    : null;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 text-sm font-bold transition-all duration-200 ${
      isActive
        ? "bg-amber-100/80 text-[#805500] shadow-sm"
        : "text-slate-600 hover:bg-amber-50 hover:text-[#805500]"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Colourful brand strip */}
      <div className="hidden bg-[#0B1220] text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[11px] font-semibold tracking-wide lg:px-8">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <CheckCircle2 size={13} />
            </span>
            Reliable industrial supplies. Practical solutions. Trusted service.
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5"><PackageSearch size={13} className="text-[#F5B942]" /> Product enquiries welcome</span>
            {settings.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 transition hover:text-[#F5B942]"><PhoneCall size={13} className="text-[#F5B942]" /> {settings.phone}</a>}
          </div>
        </div>
      </div>

      <div className="border-b border-white/50 bg-gradient-to-r from-white via-[#FFFCF4] to-[#FFF4D8] shadow-[0_10px_35px_rgba(11,18,32,0.10)] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-[#0B1220] via-[#F5B942] to-[#25D366]" />
        <div className="mx-auto flex min-h-[78px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-4"
            aria-label="Dammy Multitrade Ventures home"
          >
            {settings.logoUrl ? (
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white p-1 shadow-[0_5px_15px_rgba(245,185,66,0.18)] transition duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-[52px] sm:w-[52px]">
                <img src={settings.logoUrl} alt="" className="h-full w-full rounded-xl object-contain" />
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </span>
            ) : (
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#172944] via-[#0B1220] to-[#05080F] text-[#F5B942] shadow-lg shadow-slate-900/20 transition duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-[52px] sm:w-[52px]">
                <Wrench size={23} strokeWidth={2.2} />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#F5B942]"><span className="h-1.5 w-1.5 rounded-full bg-[#0B1220]" /></span>
              </span>
            )}
            <span className="min-w-0">
              <span className="block max-w-[190px] truncate text-sm font-black tracking-tight text-[#0B1220] sm:max-w-[250px] sm:text-base lg:text-[17px]">
                {settings.businessName || "DAMMY MULTITRADE"}
              </span>
              <span className="mt-1 flex items-center gap-1.5 truncate text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#946300] sm:text-[10px] sm:tracking-[0.17em]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5B942]" />
                {settings.slogan || "VENTURES · INDUSTRIAL SUPPLIES"}
              </span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-2xl border border-amber-100/80 bg-white/75 p-1.5 shadow-sm lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={"end" in item ? item.end : false}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#16B957] px-4 text-sm font-extrabold text-white shadow-[0_7px_18px_rgba(37,211,102,0.25)] transition duration-200 hover:-translate-y-0.5 hover:from-[#20C45E] hover:to-[#109E49] hover:shadow-[0_10px_22px_rgba(37,211,102,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              >
                <MessageCircle size={17} fill="currentColor" className="text-white" />
                Speak with me
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <Link
                to="/#contact"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5B942] to-[#FFD978] px-4 text-sm font-extrabold text-[#0B1220] shadow-[0_7px_18px_rgba(245,185,66,0.24)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Contact Us <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-navigation"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-[#0B1220] shadow-sm transition hover:border-[#F5B942] hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <div
          id="public-mobile-navigation"
          className={`grid overflow-hidden border-t border-amber-100 bg-white transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden ${menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          aria-hidden={!menuOpen}
        >
          <nav aria-label="Mobile navigation" className="min-h-0 overflow-hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              <div className="mb-2 rounded-2xl bg-gradient-to-r from-[#0B1220] to-[#20395C] p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F5B942]">Explore Dammy Multitrade</p>
                <p className="mt-1 text-sm text-slate-200">Industrial supplies and practical solutions for your work.</p>
              </div>
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={"end" in item ? item.end : false}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-bold transition ${isActive ? "bg-amber-100 text-[#805500]" : "text-slate-700 hover:bg-amber-50 hover:text-[#805500]"}`}
                >
                  {item.label}
                  <ArrowUpRight size={15} className="opacity-50" />
                </NavLink>
              ))}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#16B957] px-4 text-sm font-extrabold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-105"
                >
                  <MessageCircle size={18} /> Request a Quote <ArrowUpRight size={15} />
                </a>
              ) : (
                <Link to="/#contact" onClick={() => setMenuOpen(false)} className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5B942] to-[#FFD978] px-4 text-sm font-extrabold text-[#0B1220] shadow-md">
                  Contact Us <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
