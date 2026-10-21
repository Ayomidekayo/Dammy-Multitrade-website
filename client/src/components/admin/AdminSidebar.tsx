import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers3,
  Package,
  Images,
  Settings,
  ExternalLink,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: Layers3,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Gallery",
    path: "/admin/gallery",
    icon: Images,
  },
  {
    label: "Website settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0B1220] text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5B942] text-lg font-black text-[#0B1220]">
              DM
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide">
                DAMMY MULTITRADE
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#F5B942] text-[#0B1220] shadow-sm"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[#F5B942]">
              <ShieldCheck size={18} />
              <span className="text-sm font-semibold">
                Admin workspace
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Manage your product catalogue and business information.
            </p>

            <NavLink
              to="/"
              className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F5B942]"
            >
              View website
              <ExternalLink size={14} />
            </NavLink>
          </div>

          <p className="mt-4 px-2 text-center text-[11px] text-slate-500">
            Dammy Multitrade Ventures
          </p>
        </div>
      </aside>
    </>
  );
}