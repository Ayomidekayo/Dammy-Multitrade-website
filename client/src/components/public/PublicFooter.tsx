
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {


  MessageCircle,
  Music2,
} from "lucide-react";

import { catalogApi } from "../../features/catalog/catalog.api";
import type { SiteSettings } from "../../features/catalog/catalog.types";

export default function PublicFooter() {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    let active = true;

    catalogApi
      .getSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const phone = (settings.whatsapp || "").replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        "Hello Dammy Multitrade Ventures. I would like to make an enquiry."
      )}`
    : null;

  const socials = [
    // { label: "Instagram", url: settings.instagramUrl, Icon: Instagram },
    // { label: "Facebook", url: settings.facebookUrl, Icon: Facebook },
    { label: "TikTok", url: settings.tiktokUrl, Icon: Music2 },
    // { label: "LinkedIn", url: settings.linkedinUrl, Icon: Linkedin },
    // { label: "YouTube", url: settings.youtubeUrl, Icon: Youtube },
  ].filter(
    (item): item is typeof item & { url: string } =>
      Boolean(item.url?.trim())
  );

  return (
    <footer className="bg-[#0B1220] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl bg-white object-contain p-1"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5B942] font-black text-[#0B1220]">
                  DM
                </span>
              )}

              <span>
                <span className="block font-extrabold tracking-wide">
                  {settings.businessName || "DAMMY MULTITRADE VENTURES"}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {settings.slogan ||
                    "Quality Hoses, Tools & Farm Solutions You Can Trust."}
                </span>
              </span>
            </Link>

            {settings.description && (
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                {settings.description}
              </p>
            )}

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socials.map(({ label, url, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-slate-300 transition hover:border-[#F5B942] hover:bg-[#F5B942] hover:text-[#0B1220]"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#F5B942]">
              Explore
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/" className="transition hover:text-[#F5B942]">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="transition hover:text-[#F5B942]"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="transition hover:text-[#F5B942]"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/#about"
                  className="transition hover:text-[#F5B942]"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact"
                  className="transition hover:text-[#F5B942]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#F5B942]">
              Contact
            </h2>

            <div className="mt-5 space-y-3 break-words text-sm leading-6 text-slate-300">
              {settings.address && <p>{settings.address}</p>}

              {settings.city && (
                <p>
                  {[settings.city, settings.state, settings.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="block transition hover:text-[#F5B942]"
                >
                  {settings.email}
                </a>
              )}

              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="block transition hover:text-[#F5B942]"
                >
                  {settings.phone}
                </a>
              )}

              {settings.openingHours && <p>{settings.openingHours}</p>}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#F5B942] px-4 py-3 font-bold text-[#0B1220] transition hover:bg-[#E8AA2E]"
                >
                  <MessageCircle size={17} />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            {settings.businessName || "Dammy Multitrade Ventures"}. All rights
            reserved.
          </p>
          <Link to="/" className="transition hover:text-[#F5B942]">
            Built for better business connections.
          </Link>
        </div>
      </div>
    </footer>
  );
}
