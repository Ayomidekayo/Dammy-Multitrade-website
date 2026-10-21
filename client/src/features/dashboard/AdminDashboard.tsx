import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Boxes, LayoutDashboard, Layers3, Package, Settings, LogOut, Menu, X, Search, Bell, ChevronRight, ShieldCheck, Image as ImageIcon, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthProvider";

const navItems = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Categories", to: "/admin/categories", icon: Layers3 },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Gallery", to: "/admin/gallery", icon: ImageIcon },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function PlaceholderPage({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Package }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Icon size={25} /></div><h2 className="mt-5 font-['Manrope'] text-xl font-extrabold text-slate-900">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p><span className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Next implementation step</span></div>;
}

function Overview() {
  const { admin } = useAuth();
  const stats = [
    { label: "Total categories", icon: Layers3, note: "Connect category API next" },
    { label: "Total products", icon: Package, note: "Connect product API next" },
    { label: "Gallery images", icon: ImageIcon, note: "Cloudinary integration next" },
  ];
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-2xl bg-[#0b1220] p-6 text-white sm:p-8"><div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Admin workspace</span><h2 className="mt-5 font-['Manrope'] text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back, {admin?.name?.split(" ")[0] || "Admin"}.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Your catalogue workspace is ready. Organise categories and add products for your customers to explore.</p></div><div className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#f5b942] text-[#0b1220] sm:grid"><Boxes size={31} /></div></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(({ label, icon: Icon, note }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><Icon size={21} /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Overview</span></div><p className="mt-5 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 font-['Manrope'] text-3xl font-extrabold text-slate-900">—</p><p className="mt-2 text-xs text-slate-400">{note}</p></article>)}</section>
    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h3 className="font-['Manrope'] text-base font-extrabold text-slate-900">Quick actions</h3><p className="mt-1 text-xs text-slate-500">Manage the essentials of your catalogue.</p></div><ArrowUpRight size={19} className="text-slate-400" /></div><div className="mt-5 grid gap-3 sm:grid-cols-2">
        <NavLink to="/admin/categories" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/40"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800"><Layers3 size={19} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">Manage categories</span><span className="mt-1 block text-xs text-slate-500">Organise your product range</span></span><ChevronRight size={16} className="text-slate-400" /></NavLink>
        <NavLink to="/admin/products" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/40"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Package size={19} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">Manage products</span><span className="mt-1 block text-xs text-slate-500">Update catalogue items</span></span><ChevronRight size={16} className="text-slate-400" /></NavLink>
      </div></div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={20} /></span><div><h3 className="font-['Manrope'] text-base font-extrabold text-slate-900">Account status</h3><p className="mt-1 text-xs text-slate-500">Your current session</p></div></div><div className="mt-5 space-y-3"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-sm text-slate-500">Signed in as</span><span className="max-w-[55%] truncate text-sm font-semibold text-slate-800">{admin?.email}</span></div><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Role</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{admin?.role?.replace("_", " ")}</span></div></div></div>
    </section>
  </div>;
}

export function AdminDashboard() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  function handleLogout() { signOut(); toast.success("You have been signed out."); navigate("/admin/login", { replace: true }); }

  return <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
    {mobileNavOpen && <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col bg-[#0b1220] text-white transition-transform duration-200 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b942] text-[#0b1220]"><Boxes size={22} /></span><span><span className="block text-xs font-extrabold tracking-wide">DAMMY MULTITRADE</span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.2em] text-slate-400">Admin workspace</span></span></div><button onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Close menu"><X size={19} /></button></div>
      <div className="px-4 pt-7"><p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</p><nav className="mt-3 space-y-1">{navItems.map(({ label, to, icon: Icon, end }) => <NavLink key={label} to={to} end={end} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-[#f5b942] text-[#111827]" : "text-slate-400 hover:bg-white/[.06] hover:text-white"}`}><Icon size={18} /><span className="flex-1">{label}</span>{label === "Overview" && <span className="h-1.5 w-1.5 rounded-full bg-current" />}</NavLink>)}</nav></div>
      <div className="mt-auto p-4"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sm font-bold">{admin?.name?.slice(0, 1).toUpperCase() || "A"}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{admin?.name}</span><span className="mt-1 block truncate text-[11px] text-slate-400">{admin?.email}</span></span></div><button onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-200"><LogOut size={15} /> Sign out</button></div><p className="mt-4 text-center text-[10px] text-slate-600">Secure admin access · v1.0</p></div>
    </aside>
    <div className="min-h-screen lg:pl-[268px]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileNavOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Dammy Multitrade</p><h1 className="mt-0.5 truncate font-['Manrope'] text-base font-extrabold text-slate-900 sm:text-lg">Admin dashboard</h1></div></div><div className="flex items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 md:flex"><Search size={15} /><span>Catalogue workspace</span></div><span className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"><Bell size={18} /></span><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1220] text-sm font-bold text-[#f5b942]">{admin?.name?.slice(0, 1).toUpperCase() || "A"}</span></div></header>
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9"><Routes>
        <Route index element={<Overview />} />
        <Route path="categories" element={<PlaceholderPage title="Category management" description="Next we'll connect the category API to create, edit, upload cover images, and delete categories." icon={Layers3} />} />
        <Route path="products" element={<PlaceholderPage title="Product management" description="Next we'll connect product creation, category assignment, image uploads, editing, and deletion to your backend." icon={Package} />} />
        <Route path="gallery" element={<PlaceholderPage title="Gallery" description="The gallery manager will connect to Cloudinary and your gallery-image records." icon={ImageIcon} />} />
        <Route path="settings" element={<PlaceholderPage title="Business settings" description="Business contact information and social links can be managed here later." icon={Settings} />} />
        <Route path="*" element={<Overview />} />
      </Routes></main>
    </div>
  </div>;
}
