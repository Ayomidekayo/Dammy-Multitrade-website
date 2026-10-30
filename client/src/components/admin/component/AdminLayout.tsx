import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, ArrowUpRight, ShieldCheck } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

import "../../../styles/admin-theme.css"
import { useAuth } from "../../../features/auth/AuthProvider";


const pageNames: Array<[string, string]> = [
  ["/admin/categories", "Categories"],
  ["/admin/products", "Products"],
  ["/admin/gallery", "Gallery"],
  ["/admin/settings", "Website settings"],
  ["/admin", "Dashboard"],
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { admin } = useAuth();
  const pageTitle = pageNames.find(([path]) => path === "/admin" ? location.pathname === path : location.pathname.startsWith(path))?.[1] ?? "Dashboard";

  return (
    <div className="dm-admin-shell min-h-screen overflow-x-clip">
      <AdminSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-h-screen min-w-0 lg:pl-[270px]">
        <header className="dm-admin-topbar sticky top-0 z-30 border-b">
          <div className="mx-auto flex min-h-[72px] max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" aria-label="Open admin navigation" aria-controls="admin-sidebar" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/10 text-violet-100 transition hover:bg-violet-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] lg:hidden"><Menu size={20} /></button>
              <div className="min-w-0"><p className="hidden text-[10px] font-bold uppercase tracking-[.19em] text-violet-200/55 sm:block">Dammy Multitrade · Workspace</p><h1 className="truncate text-lg font-extrabold tracking-tight text-white sm:mt-1 sm:text-xl">{pageTitle}</h1></div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <a href="/" target="_blank" rel="noreferrer" className="hidden min-h-10 items-center gap-2 rounded-xl border border-violet-300/15 bg-white/[.04] px-3 text-xs font-semibold text-violet-100 transition hover:border-[#F5B942]/40 hover:bg-violet-400/10 hover:text-white sm:inline-flex"><ArrowUpRight size={15} /> Live website</a>
              <div className="hidden items-center gap-2 rounded-xl border border-violet-300/15 bg-white/[.04] px-3 py-2 md:flex"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/20 text-violet-100"><ShieldCheck size={16} /></span><span className="max-w-44"><span className="block truncate text-xs font-bold text-white">{admin?.name || "Administrator"}</span><span className="mt-0.5 block truncate text-[10px] text-violet-200/65">{admin?.role?.replaceAll("_", " ") || "Admin access"}</span></span></div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
        </header>
        <main className="mx-auto w-full max-w-[1800px] min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
