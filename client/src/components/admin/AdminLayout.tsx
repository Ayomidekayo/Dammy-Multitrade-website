import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronRight,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/categories": "Categories",
  "/admin/products": "Products",
  "/admin/gallery": "Gallery",
  "/admin/settings": "Website settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] ?? "Administration";

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span className="font-medium text-slate-700">
                  {pageTitle}
                </span>
              </div>

              <h1 className="mt-1 text-sm font-bold sm:text-base">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                Administrator
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Management workspace
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-sm font-bold text-[#F5B942]">
              A
            </div>

            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 sm:block"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}