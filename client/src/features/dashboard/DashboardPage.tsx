import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  Layers3,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../lib/api";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  coverImageUrl: string | null;
  createdAt: string;
  _count?: { products: number };
}

interface DashboardStats {
  categories: number;
  activeCategories: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  caption: string;
  icon: LucideIcon;
  accent: "gold" | "green" | "blue" | "purple";
  to: string;
  loading?: boolean;
}

const accentStyles = {
  gold: {
    icon: "bg-amber-50 text-amber-700",
    line: "bg-amber-400",
    hover: "group-hover:border-amber-200",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700",
    line: "bg-emerald-500",
    hover: "group-hover:border-emerald-200",
  },
  blue: {
    icon: "bg-sky-50 text-sky-700",
    line: "bg-sky-500",
    hover: "group-hover:border-sky-200",
  },
  purple: {
    icon: "bg-violet-50 text-violet-700",
    line: "bg-violet-500",
    hover: "group-hover:border-violet-200",
  },
};

function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  accent,
  to,
  loading = false,
}: StatCardProps) {
  const style = accentStyles[accent];

  return (
    <Link
      to={to}
      className={`dashboard-card group relative min-w-0 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-slate-50 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:shadow-[0_22px_48px_rgba(15,23,42,0.14)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:p-5 ${style.hover}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${style.line}`} />
      <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-slate-100/80 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <span className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-amber-100/50 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.11em] text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              value
            )}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 sm:h-11 sm:w-11 ${style.icon}`}>
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between gap-2 border-t border-slate-100/90 pt-3">
        <span className="min-w-0 text-xs leading-5 text-slate-500">{caption}</span>
        <ArrowUpRight size={16} className="shrink-0 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-900" aria-hidden="true" />
      </div>
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  to,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  to?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">{title}</h2>
        {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
      </div>
      {to && actionLabel && (
        <Link
          to={to}
          className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-slate-700 transition-colors hover:text-amber-700 sm:self-auto"
        >
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

const quickActions: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  accent: "gold" | "blue" | "purple" | "green";
}> = [
  {
    title: "Categories",
    description: "Organize your product catalogue.",
    icon: Layers3,
    to: "/admin/categories",
    accent: "gold",
  },
  {
    title: "Products",
    description: "Manage products and details.",
    icon: Package,
    to: "/admin/products",
    accent: "blue",
  },
  {
    title: "Website settings",
    description: "Keep business information up to date.",
    icon: Settings2,
    to: "/admin/settings",
    accent: "green",
  },
];

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    activeCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<Category[]>("/categories");
      const data = Array.isArray(response.data) ? response.data : [];

      setCategories(data);
      setStats({
        categories: data.length,
        activeCategories: data.filter((category) => category.isActive).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const inactiveCategories = Math.max(stats.categories - stats.activeCategories, 0);
  const activePercent = useMemo(
    () => (stats.categories > 0 ? Math.round((stats.activeCategories / stats.categories) * 100) : 0),
    [stats.activeCategories, stats.categories],
  );
  const activeDegrees = stats.categories > 0 ? (stats.activeCategories / stats.categories) * 360 : 0;
  const chartCategories = categories.slice(0, 6);
  const maxProducts = Math.max(
    1,
    ...chartCategories.map((category) => category._count?.products ?? 0),
  );
  const productChartPoints = chartCategories.map((category, index) => ({
    label: category.name,
    value: category._count?.products ?? 0,
    x: chartCategories.length <= 1 ? 280 : 48 + (index * 488) / (chartCategories.length - 1),
    y: 190 - ((category._count?.products ?? 0) / maxProducts) * 145,
  }));
  const productChartLine = productChartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const productChartArea = productChartPoints.length
    ? `48,190 ${productChartLine} ${productChartPoints[productChartPoints.length - 1].x},190`
    : "";

  return (
    <div className="dm-admin-page min-w-0 space-y-6 pb-4 sm:space-y-8">
      <style>{`
        @keyframes dashboard-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dashboard-enter { animation: dashboard-rise 520ms cubic-bezier(.2,.75,.25,1) both; }
        .dashboard-delay-1 { animation-delay: 70ms; }
        .dashboard-delay-2 { animation-delay: 130ms; }
        .dashboard-delay-3 { animation-delay: 190ms; }
        .dashboard-delay-4 { animation-delay: 250ms; }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-enter { animation: none !important; }
          .dashboard-card, .dashboard-card * { transition: none !important; }
          .dashboard-card:hover { transform: none !important; }
        }
      `}</style>

      {/* Welcome banner */}
 <section className="dashboard-enter relative isolate overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/70 p-5 text-[#0B1220] shadow-[0_12px_35px_rgba(180,120,10,0.10)] transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(180,120,10,0.15)] sm:p-7 lg:p-9">
  {/* Decorative gold accents */}
  <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />

  <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border-[18px] border-white/70" />

  <div className="pointer-events-none absolute right-7 top-7 h-28 w-28 rounded-full border-[12px] border-amber-200/40" />

  <div className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-yellow-100/70 blur-3xl" />

  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    <div className="max-w-2xl">
      {/* Workspace badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#F5B942]" />
        Admin workspace
      </div>

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220] sm:mt-5 sm:text-3xl lg:text-4xl">
        Good to see you.
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        Manage your catalogue, products, gallery and business information from one simple workspace.
      </p>

      <div className="mt-5 flex flex-col gap-3 min-[380px]:flex-row sm:mt-6">
        <Link
          to="/admin/categories"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-4 py-3 text-sm font-bold text-[#0B1220] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          <Plus size={17} aria-hidden="true" />
          Manage catalogue
        </Link>

        <Link
          to="/admin/settings"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          Website settings
        </Link>
      </div>
    </div>

    {/* Decorative catalogue icon */}
    <div className="hidden shrink-0 sm:flex sm:items-center sm:justify-center">
      <div className="group flex h-28 w-28 items-center justify-center rounded-3xl border border-amber-200/80 bg-white/80 text-amber-600 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:rotate-3 hover:shadow-xl">
        <Boxes
          size={48}
          strokeWidth={1.35}
          className="transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</section>

      {error && (
        <div role="alert" className="dashboard-enter flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800">Dashboard data could not be loaded</p>
            <p className="mt-1 break-words text-sm text-red-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {/* KPI cards */}
      <section className="dashboard-enter dashboard-delay-1">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">Workspace metrics</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">Catalogue summary</h2>
            <p className="mt-1 text-sm text-slate-500">A quick snapshot of your content.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            aria-label="Refresh dashboard data"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <StatCard title="Categories" value={stats.categories} caption="In your catalogue" icon={Layers3} accent="gold" loading={loading} to="/admin/categories" />
          <StatCard title="Active" value={stats.activeCategories} caption="Currently visible" icon={CheckCircle2} accent="green" loading={loading} to="/admin/categories" />
          <StatCard title="Products" value="—" caption="Product overview" icon={Package} accent="blue" to="/admin/products" />
        </div>
      </section>

      {/* Analytics: responsive graph and status breakdown */}
      <section className="dashboard-enter dashboard-delay-2 grid min-w-0 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-sky-50/70 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Visual analytics"
              title="Catalogue performance"
              description="Compare product counts across your categories."
            />
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live category data
            </span>
          </div>

          {loading ? (
            <div className="mt-7 h-56 animate-pulse rounded-2xl bg-slate-100/80" />
          ) : stats.categories === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">Nothing to chart yet</p>
              <p className="mt-1 text-xs text-slate-500">Add categories to see the graph.</p>
              <Link to="/admin/categories" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0B1220] px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                Add category <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="relative mt-6 rounded-2xl border border-slate-100 bg-white/90 p-3 sm:p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Products by category</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {categories.reduce((total, category) => total + (category._count?.products ?? 0), 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Products across the categories returned by the API</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Catalogue data
                </span>
              </div>
              {chartCategories.length === 0 ? (
                <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-700">No category data to plot yet</p>
                  <p className="mt-1 text-xs text-slate-500">Create categories to see product distribution here.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl bg-gradient-to-b from-sky-50/70 via-white to-white px-1 pt-3">
                  <svg
                    viewBox="0 0 560 240"
                    role="img"
                    aria-label={`Line graph of product counts for ${chartCategories.length} categories`}
                    className="h-auto w-full"
                  >
                    <defs>
                      <linearGradient id="productAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.015" />
                      </linearGradient>
                    </defs>
                    {[45, 82, 119, 156, 193].map((y) => (
                      <line key={y} x1="48" y1={y} x2="536" y2={y} stroke="#dbe4ef" strokeDasharray="4 5" />
                    ))}
                    <text x="8" y="49" fontSize="10" fill="#64748b">{maxProducts}</text>
                    <text x="14" y="123" fontSize="10" fill="#64748b">{Math.round(maxProducts / 2)}</text>
                    <text x="26" y="197" fontSize="10" fill="#64748b">0</text>
                    <line x1="48" y1="193" x2="536" y2="193" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="48" y1="45" x2="48" y2="193" stroke="#cbd5e1" strokeWidth="1.5" />
                    <polygon points={productChartArea} fill="url(#productAreaGradient)" />
                    {productChartPoints.length > 1 && (
                      <polyline
                        points={productChartLine}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {productChartPoints.map((point) => (
                      <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="7" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                        <text x={point.x} y={Math.max(28, point.y - 14)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0369a1">
                          {point.value}
                        </text>
                        <text
                          x={point.x}
                          y="218"
                          textAnchor="middle"
                          fontSize="10"
                          fill="#64748b"
                        >
                          {point.label.length > 10 ? `${point.label.slice(0, 9)}…` : point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-slate-500">
                The graph uses product counts returned for each category. It shows the first six categories; it does not invent historical trend data.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{activePercent}% of categories are active.</p>
                <Link to="/admin/categories" className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-slate-800 transition-colors hover:text-amber-700">
                  Manage categories <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </article>

        <article className="relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-amber-50/70 p-5 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Catalogue health</p>
            <h2 className="mt-2 text-lg font-bold tracking-tight">Visibility overview</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">How much of your catalogue is currently visible.</p>

            <div className="mt-7 flex items-center gap-5">
              <div
                className="relative h-28 w-28 shrink-0 rounded-full p-2"
                style={{ background: `conic-gradient(#34d399 0deg ${activeDegrees}deg, rgba(245,185,66,.85) ${activeDegrees}deg 360deg)` }}
                role="img"
                aria-label={`${activePercent}% active categories`}
              >
                <div className="grid h-full w-full place-items-center rounded-full border border-white bg-gradient-to-br from-white via-amber-50 to-emerald-50 text-center shadow-inner">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{loading ? "—" : `${activePercent}%`}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Active</p>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                  <span className="text-sm text-slate-600">Active</span>
                  <strong className="ml-auto text-sm text-slate-900">{loading ? "—" : stats.activeCategories}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                  <span className="text-sm text-slate-600">Inactive</span>
                  <strong className="ml-auto text-sm text-slate-900">{loading ? "—" : inactiveCategories}</strong>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold">Keep your catalogue polished</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">Review category visibility and keep product information consistent.</p>
              <Link to="/admin/categories" className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-amber-700 transition-colors hover:text-amber-800">
                Review catalogue <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </section>

      {/* Shortcuts */}
      <section className="dashboard-enter dashboard-delay-3 space-y-4">
        <SectionHeading title="Quick actions" description="Go directly to the tools you use most." />
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const iconStyle = accentStyles[action.accent].icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="dashboard-card group relative flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-slate-50 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_22px_48px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:gap-4 sm:p-5"
              >
                <span className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full bg-slate-100/80 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:rotate-3 group-hover:scale-110 ${iconStyle}`}>
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="relative z-10 min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">{action.title}</span>
                  <span className="mt-1.5 block text-xs leading-5 text-slate-500">{action.description}</span>
                  <span className="mt-3 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-slate-700 transition-colors group-hover:text-amber-700">
                    Open section <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Category preview */}
      <section className="dashboard-enter dashboard-delay-4 space-y-4">
        <SectionHeading
          title="Your categories"
          description="A preview of the latest categories in your catalogue."
          to="/admin/categories"
          actionLabel="View all"
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="aspect-[4/3] rounded-xl bg-slate-100" />
                <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center sm:py-12">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Layers3 size={21} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-bold text-slate-900">Your catalogue is ready to grow</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">When categories are available through your API, they will appear here.</p>
            <Link to="/admin/categories" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus size={16} aria-hidden="true" /> Add a category
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                to="/admin/categories"
                className="dashboard-card group min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-lg"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {category.coverImageUrl ? (
                    <img
                      src={category.coverImageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageIcon size={26} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 min-w-0 text-sm font-bold text-slate-900">{category.name}</h3>
                    <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-slate-400 transition group-hover:text-slate-900" aria-hidden="true" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${category.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[11px] text-slate-500">{category._count?.products ?? 0} products</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Workspace status */}
      <section className="dashboard-enter rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeading title="Workspace status" description="A quick check of your admin workspace." />
        <div className="mt-4 divide-y divide-slate-100">
          <div className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Admin workspace</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Dashboard interface is available.</p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Ready</span>
          </div>
          <div className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Catalogue operations</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Manage category content from the protected admin area.</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Available</span>
          </div>
        </div>
      </section>
    </div>
  );
}
