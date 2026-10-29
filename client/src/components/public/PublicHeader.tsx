import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { catalogApi } from "../../features/catalog/catalog.api";
import type { SiteSettings } from "../../features/catalog/catalog.types";
import "./storefront-theme.css";

const enquiryMessage =
  "Hello Dammy Multitrade Ventures. I would like to enquire about your products.";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

const navigation = [
  { label: "Home", to: "/", end: true },
  { label: "Products", to: "/categories" },
  { label: "About", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

export default function PublicHeader({ settings: suppliedSettings }: { settings?: SiteSettings } = {}) {
  const [settings, setSettings] = useState<SiteSettings>(suppliedSettings ?? {});
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (suppliedSettings) {
      setSettings(suppliedSettings);
      return;
    }
    let active = true;
    catalogApi
      .getSettings()
      .then((response) => {
        if (active) setSettings(readSettingsResponse(response));
      })
      .catch(() => {
        // The storefront should still render when optional settings cannot load.
      });
    return () => {
      active = false;
    };
  }, [suppliedSettings]);

  useEffect(() => {
    setMenuOpen(false);
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    setLogoUnavailable(false);
  }, [settings.logoUrl]);

  const whatsappNumber = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(enquiryMessage)}`
    : null;
  const phone = settings.phone;
  const businessName = settings.businessName || "Dammy Multitrade Ventures";
  const logoSrc = settings.logoUrl || "/images/dammy-emblem.png";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 ${
      isActive
        ? "bg-[#3B2852] text-[#F9F4FF]"
        : "text-[#D7CCE6] hover:bg-[#2B1B40] hover:text-white"
    }`;

  return (
    <header className="dm-public-header sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="hidden bg-[#10071D] text-slate-200 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2 text-[11px] lg:px-8">
          <p className="truncate">Industrial, agricultural and workplace supplies</p>
          <div className="flex shrink-0 items-center gap-4">
            {settings.address && <span className="max-w-[340px] truncate">{settings.address}</span>}
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold text-white transition hover:text-[#F5B942]">
                <Phone size={12} /> {phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[82px] lg:px-8">
        <Link to="/" aria-label={`${businessName} home`} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-4">
          {!logoUnavailable ? (
            <img
              src={logoSrc}
              alt=""
              onError={() => setLogoUnavailable(true)}
              className="size-11 shrink-0 object-contain sm:size-12"
            />
          ) : (
            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2A1940] text-base font-black tracking-tight text-[#F5B942] sm:size-12">DM</span>
          )}
          <span className="min-w-0">
            <span className="block max-w-[190px] truncate text-sm font-extrabold leading-tight tracking-tight text-[#FAF7FF] sm:max-w-[260px] sm:text-base lg:text-lg">
              {businessName}
            </span>
            <span className="mt-1 block max-w-[210px] truncate text-[9px] font-bold uppercase tracking-[0.15em] text-[#D2B05C] sm:max-w-[270px] sm:text-[10px]">
              {settings.slogan || "Industrial & agricultural supplies"}
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <NavLink key={item.label} to={item.to} end={"end" in item ? item.end : false} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center lg:flex">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#0B1220] transition hover:bg-[#E9AA2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2">
              <MessageCircle size={17} /> Enquire on WhatsApp <ArrowUpRight size={15} />
            </a>
          ) : (
            <Link to="/#contact" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#0B1220] transition hover:bg-[#E9AA2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2">
              Contact our team <ArrowUpRight size={15} />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="dm-mobile-navigation"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#493459] bg-[#241537] text-[#F7F1FF] transition hover:border-[#F5B942] hover:bg-[#302044] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] lg:hidden"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div id="dm-mobile-navigation" className={`overflow-hidden transition-[grid-template-rows] duration-200 lg:hidden ${menuOpen ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"}`} aria-hidden={!menuOpen}>
        <div className="min-h-0 overflow-hidden">
          {menuOpen && <nav aria-label="Mobile navigation" className="border-t border-[#493459] bg-[#1A0E2D] px-4 pb-4 pt-3 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => (
                <NavLink key={item.label} to={item.to} end={"end" in item ? item.end : false} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#3B2852] text-white" : "text-[#D7CCE6] hover:bg-[#2A1A3B]"}`}>
                  {item.label}<ArrowUpRight size={15} className="text-slate-400" />
                </NavLink>
              ))}
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#0B1220] transition hover:bg-[#E9AA2D]">
                  <MessageCircle size={18} /> Enquire on WhatsApp <ArrowUpRight size={15} />
                </a>
              ) : (
                <Link to="/#contact" onClick={() => setMenuOpen(false)} className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#F5B942] px-4 text-sm font-bold text-[#0B1220] transition hover:bg-[#E9AA2D]">
                  Contact our team <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </nav>}
        </div>
      </div>

      <div className="dm-service-ticker" role="region" aria-label="Our product range">
        <span className="sr-only">Industrial hoses · Water pumps · Power tools · Irrigation supplies · Workplace equipment · Product enquiries welcome</span>
        <div className="dm-service-ticker__track" aria-hidden="true">
          <div className="dm-service-ticker__group">
            <span>Industrial hoses</span><i /> <span>Water pumps</span><i /> <span>Power tools</span><i /> <span>Irrigation supplies</span><i /> <span>Workplace equipment</span><i /> <span>Product enquiries welcome</span><i />
          </div>
          <div className="dm-service-ticker__group">
            <span>Industrial hoses</span><i /> <span>Water pumps</span><i /> <span>Power tools</span><i /> <span>Irrigation supplies</span><i /> <span>Workplace equipment</span><i /> <span>Product enquiries welcome</span><i />
          </div>
        </div>
      </div>
    </header>
  );
}
