import { useEffect, useState } from "react";
import {
  ArrowRight,
  Image as ImageIcon,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Upload,
  type LucideIcon,
  Layers3,
} from "lucide-react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../lib/api";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  coverImageUrl: string | null;
  createdAt: string;
  _count?: {
    products: number;
  };
}

interface DashboardStats {
  categories: number;
  activeCategories: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  loading: boolean;
  to: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
  to,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {loading ? (
              <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-slate-100" />
            ) : (
              value
            )}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {description}
        </span>

        <ArrowUpRight
          size={16}
          className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-900"
        />
      </div>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
  to,
  actionLabel,
}: {
  title: string;
  description: string;
  to?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-base font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {to && actionLabel && (
        <Link
          to={to}
          className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-slate-700 transition hover:text-amber-700 sm:self-auto"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    activeCategories: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const categoryResponse =
        await apiRequest<Category[]>("/categories");

      const categoryData = categoryResponse.data ?? [];

      setCategories(categoryData);

      setStats((previous) => ({
        ...previous,
        categories: categoryData.length,
        activeCategories: categoryData.filter(
          (category) => category.isActive,
        ).length,
      }));

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const quickActions = [
    {
      title: "Manage categories",
      description: "Organise your product catalogue.",
      icon: Layers3,
      to: "/admin/categories",
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      title: "Manage products",
      description: "Review products and their images.",
      icon: Package,
      to: "/admin/products",
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Manage gallery",
      description: "Maintain your business image gallery.",
      icon: Upload,
      to: "/admin/gallery",
      iconClass: "bg-violet-50 text-violet-700",
    },
    {
      title: "Website settings",
      description: "Update business information and contacts.",
      icon: Settings2,
      to: "/admin/settings",
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page introduction */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0B1220] p-5 text-white sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border border-white/[0.08]" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-[#F5B942]" />
              Administration overview
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Welcome to your workspace.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage your categories, products, images and
              business information from one central dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/categories"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-4 py-3 text-sm font-bold text-[#0B1220] transition hover:bg-amber-300"
              >
                <Plus size={18} />
                Manage catalogue
              </Link>

              <Link
                to="/admin/settings"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <Settings2 size={17} />
                Settings
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center sm:flex">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
              <Boxes
                size={54}
                strokeWidth={1.2}
                className="text-[#F5B942]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-red-800">
              Dashboard data could not be loaded
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-950">
              Catalogue summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              An overview of your current catalogue.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            aria-label="Refresh dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Categories"
            value={stats.categories}
            description="In the public catalogue"
            icon={Layers3}
            iconClass="bg-amber-50 text-amber-700"
            loading={loading}
            to="/admin/categories"
          />

          <StatCard
            title="Active categories"
            value={stats.activeCategories}
            description="Currently visible"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-700"
            loading={loading}
            to="/admin/categories"
          />

          <StatCard
            title="Products"
            value="—"
            description="Awaiting product API"
            icon={Package}
            iconClass="bg-blue-50 text-blue-700"
            loading={false}
            to="/admin/products"
          />

          <StatCard
            title="Gallery images"
            value="—"
            description="Awaiting gallery API"
            icon={ImageIcon}
            iconClass="bg-violet-50 text-violet-700"
            loading={false}
            to="/admin/gallery"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <SectionHeading
          title="Quick actions"
          description="Jump straight to the area you want to manage."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="group flex min-h-32 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconClass}`}
                >
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {action.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-amber-700">
                    Open section
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <SectionHeading
          title="Your categories"
          description="A quick look at the categories returned by your API."
          to="/admin/categories"
          actionLabel="View all categories"
        />

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="h-28 rounded-xl bg-slate-100" />
                <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Layers3 size={22} />
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Your catalogue is ready to grow
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When categories are available through the API,
              they will appear here.
            </p>

            <Link
              to="/admin/categories"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Layers3 size={16} />
              Open categories
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to="/admin/categories"
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="h-36 overflow-hidden bg-slate-100">
                  {category.coverImageUrl ? (
                    <img
                      src={category.coverImageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImageIcon size={30} strokeWidth={1.4} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {category.name}
                    </h3>

                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-slate-400 transition group-hover:text-slate-900"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {category._count?.products ?? 0} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* System status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <SectionHeading
          title="Workspace status"
          description="Current information about the admin workspace."
        />

        <div className="mt-5 divide-y divide-slate-100">
          <div className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Admin workspace
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Dashboard interface is available.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Ready
            </span>
          </div>

          <div className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Catalogue operations
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create, edit and delete operations require the protected admin API.
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              In progress
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}






