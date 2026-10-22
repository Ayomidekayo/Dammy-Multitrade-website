import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers3,
  Package,
  Settings,
  ExternalLink,
  X,
  ShieldCheck,
  ChevronRight,
  Store,
} from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Categories", path: "/admin/categories", icon: Layers3 },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Website settings", path: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(84vw,290px)] flex-col overflow-y-auto border-r border-white/[0.07] bg-[#0B1220] text-white shadow-2xl shadow-slate-950/25 transition-transform duration-300 ease-out motion-reduce:transition-none lg:w-[270px] lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between border-b border-white/[0.08] bg-[#0B1220]/95 px-4 backdrop-blur-xl sm:px-5">
          <NavLink
            to="/admin"
            end
            onClick={onClose}
            className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]"
            aria-label="Dammy Multitrade admin overview"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFD978] via-[#F5B942] to-[#D99419] text-sm font-black tracking-tight text-[#0B1220] shadow-lg shadow-amber-500/10 transition-transform duration-300 group-hover:scale-[1.03]">
              DM
              <span className="absolute -bottom-3 -right-2 h-7 w-7 rounded-full border border-white/30 bg-white/25" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-extrabold tracking-[0.12em] text-white sm:text-xs">
                DAMMY MULTITRADE
              </span>
              <span className="mt-1 block text-[11px] font-medium text-slate-400">
                Admin workspace
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 pt-6 sm:px-4 sm:pt-7">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[9px] font-semibold text-slate-500">
              MENU
            </span>
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3.5 text-[13px] font-semibold outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#F5B942] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] sm:min-h-[50px] sm:text-sm ${
                      isActive
                        ? "bg-gradient-to-r from-[#F5B942] to-[#FFD36E] text-[#0B1220] shadow-md shadow-amber-500/10"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#0B1220]/70" />
                      )}
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition duration-200 ${
                          isActive
                            ? "bg-white/30 text-[#0B1220]"
                            : "bg-white/[0.045] text-slate-400 group-hover:bg-white/[0.09] group-hover:text-[#F5B942]"
                        }`}
                      >
                        <Icon size={18} strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <ChevronRight
                        size={15}
                        className={`shrink-0 transition duration-200 ${
                          isActive
                            ? "translate-x-0 opacity-70"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom support / website link */}
        <div className="mt-auto p-3 pt-8 sm:p-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-4 sm:p-4">
            <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#F5B942]/10 blur-2xl" />
            <div className="relative flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5B942]/15 text-[#F5B942] ring-1 ring-[#F5B942]/15">
                <ShieldCheck size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white sm:text-sm">Admin workspace</p>
                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
                  Secure catalogue management
                </p>
              </div>
            </div>
            <p className="relative mt-3 text-xs leading-5 text-slate-400">
              Manage products, categories, and your storefront from one place.
            </p>
            <NavLink
              to="/"
              onClick={onClose}
              className="group relative mt-4 flex min-h-11 items-center justify-between gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition hover:border-[#F5B942]/40 hover:bg-[#F5B942]/10 hover:text-[#F5B942] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
            >
              <span className="flex items-center gap-2">
                <Store size={15} />
                View live website
              </span>
              <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </NavLink>
          </div>

          <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-4">
            <p className="text-[10px] font-medium text-slate-500">
              © {new Date().getFullYear()} Dammy Multitrade
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
