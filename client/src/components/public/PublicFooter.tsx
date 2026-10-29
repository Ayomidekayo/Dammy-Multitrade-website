import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { catalogApi } from "../../features/catalog/catalog.api";
import type { SiteSettings } from "../../features/catalog/catalog.types";

function readSettingsResponse(response: unknown): SiteSettings {
  const value = response as any;
  return (value?.data?.data ?? value?.data ?? value?.settings ?? value ?? {}) as SiteSettings;
}

export default function PublicFooter({ settings: suppliedSettings }: { settings?: SiteSettings } = {}) {
  const [settings, setSettings] = useState<SiteSettings>(suppliedSettings ?? {});

  useEffect(() => {
    if (suppliedSettings) {
      setSettings(suppliedSettings);
      return;
    }
    let active = true;
    catalogApi.getSettings().then((response) => {
      if (active) setSettings(readSettingsResponse(response));
    }).catch(() => {
      // Keep the footer usable if optional business settings are unavailable.
    });
    return () => { active = false; };
  }, [suppliedSettings]);

  const businessName = settings.businessName || "Dammy Multitrade Ventures";
  const whatsapp = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Dammy Multitrade Ventures. I have a product enquiry.")}`
    : null;
  const address = [settings.address, settings.city, settings.state, settings.country].filter(Boolean).join(", ");

  return (
    <footer className="dm-public-footer bg-[#13091F] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:gap-16 lg:px-8 lg:py-14">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-4 focus-visible:ring-offset-[#13091F]">
            <img src={settings.logoUrl || "/images/dammy-emblem.png"} alt="" className="size-10 shrink-0 object-contain" />
            <span>
              <span className="block text-base font-extrabold tracking-tight text-white">{businessName}</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E7B84E]">Industrial supply & equipment</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
            Browse our product categories or contact the team to discuss availability, specifications and pricing.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Explore</h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-400">
            <Link to="/" className="transition hover:text-[#F5B942]">Home</Link>
            <Link to="/categories" className="transition hover:text-[#F5B942]">Product categories</Link>
            <Link to="/#about" className="transition hover:text-[#F5B942]">About us</Link>
            <Link to="/#contact" className="transition hover:text-[#F5B942]">Contact</Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            {address && <p className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-[#E7B84E]" /><span>{address}</span></p>}
            {settings.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 transition hover:text-white"><Phone size={16} className="shrink-0 text-[#E7B84E]" />{settings.phone}</a>}
            {settings.secondaryPhone && <a href={`tel:${settings.secondaryPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 transition hover:text-white"><Phone size={16} className="shrink-0 text-[#E7B84E]" />{settings.secondaryPhone}</a>}
            {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 break-all transition hover:text-white"><Mail size={16} className="shrink-0 text-[#E7B84E]" />{settings.email}</a>}
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#F5B942] px-3.5 text-sm font-bold text-[#0B1220] transition hover:bg-[#E8AA2E]"><MessageCircle size={16} /> WhatsApp enquiries <ArrowUpRight size={14} /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p>Product details and availability are confirmed on enquiry.</p>
        </div>
      </div>
    </footer>
  );
}
