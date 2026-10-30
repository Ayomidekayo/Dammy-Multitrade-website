import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Layers3, Package, Settings2, ExternalLink, X,
  ShieldCheck, ChevronRight, Store, LogOut, Boxes,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage, useAuth } from "../../../features/auth/AuthProvider";


type AdminSidebarProps = { open: boolean; onClose: () => void; };
const navigation = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Categories", path: "/admin/categories", icon: Layers3 },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Website settings", path: "/admin/settings", icon: Settings2 },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      toast.success("You have been signed out.");
      onClose();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <>
      <button type="button" aria-label="Close navigation menu" onClick={onClose} tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-[#080410]/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside id="admin-sidebar" aria-label="Admin navigation"
        className={`dm-admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(86vw,292px)] flex-col overflow-y-auto border-r text-white shadow-2xl shadow-black/30 transition-transform duration-300 ease-out motion-reduce:transition-none lg:w-[270px] lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="sticky top-0 z-10 flex min-h-[78px] items-center justify-between border-b border-white/10 bg-[#160b28]/95 px-4 backdrop-blur-xl sm:px-5">
          <NavLink to="/admin" end onClick={onClose} className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]" aria-label="Dammy Multitrade Ventures dashboard">
            <span className="dm-admin-brand-mark grid h-11 w-11 shrink-0 place-items-center rounded-2xl shadow-lg shadow-violet-950/30 transition-transform duration-300 group-hover:scale-[1.04]"><Boxes size={24} strokeWidth={1.9} /></span>
            <span className="min-w-0"><span className="block truncate text-[11px] font-extrabold tracking-[.11em] text-white sm:text-xs">DAMMY MULTITRADE</span><span className="mt-1 block text-[10px] font-medium tracking-wide text-violet-200/70">VENTURES · ADMIN</span></span>
          </NavLink>
          <button type="button" onClick={onClose} aria-label="Close sidebar" className="ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-violet-200/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] lg:hidden"><X size={19} /></button>
        </div>
        <div className="px-3 pt-6 sm:px-4 sm:pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-violet-200/55">Workspace</p>
          <nav aria-label="Workspace pages" className="space-y-1.5">
            {navigation.map(({ label, path, icon: Icon, end }) => (
              <NavLink key={path} to={path} end={end} onClick={onClose} className={({ isActive }) => `dm-admin-nav-link group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3.5 text-[13px] font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#F5B942] sm:min-h-[50px] sm:text-sm ${isActive ? "" : ""}`}>
                {({ isActive }) => <>
                  {isActive && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#F5B942]" />}
                  <span className={`dm-admin-nav-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${isActive ? "" : "bg-white/[.045] text-violet-200/70 group-hover:bg-white/10 group-hover:text-[#F5B942]"}`}><Icon size={18} strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <ChevronRight size={15} className={`shrink-0 transition duration-200 ${isActive ? "translate-x-0 opacity-90" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-80"}`} />
                </>}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto space-y-3 p-3 pt-8 sm:p-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.025] p-4">
            <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-violet-400/15 blur-2xl" />
            <div className="relative flex items-center gap-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F5B942]/15 text-[#F5B942] ring-1 ring-[#F5B942]/20"><ShieldCheck size={18} /></span><div className="min-w-0"><p className="text-xs font-bold text-white sm:text-sm">Administrator access</p><p className="mt-0.5 text-[10px] text-violet-200/65 sm:text-[11px]">Manage your storefront securely</p></div></div>
            <NavLink to="/" onClick={onClose} className="group relative mt-4 flex min-h-11 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 text-xs font-semibold text-violet-100 transition hover:border-[#F5B942]/40 hover:bg-[#F5B942]/10 hover:text-[#F5B942] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"><span className="flex items-center gap-2"><Store size={15} /> View live website</span><ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></NavLink>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#211432] p-3.5">
            <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-sm font-extrabold text-violet-100">{admin?.name?.trim()?.slice(0, 1)?.toUpperCase() || "A"}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{admin?.name || "Administrator"}</p><p className="mt-0.5 truncate text-[10px] text-violet-200/65">{admin?.email || "Authenticated session"}</p></div></div>
            <button type="button" onClick={() => void handleLogout()} className="dm-admin-logout mt-3 w-full px-3.5"><LogOut size={16} /> Sign out</button>
          </div>
          <div className="flex items-center justify-between gap-2 px-2 pb-1"><p className="text-[10px] font-medium text-violet-200/40">© {new Date().getFullYear()} Dammy Multitrade</p><span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-violet-200/55"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span></div>
        </div>
      </aside>
    </>
  );
}
