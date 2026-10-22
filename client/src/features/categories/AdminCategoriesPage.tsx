import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { apiRequest } from '../../lib/api'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  isActive: boolean
  displayOrder: number
  createdAt?: string
  _count?: { products: number }
}

type CategoryForm = {
  name: string
  description: string
  displayOrder: string
  isActive: boolean
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  description: '',
  displayOrder: '0',
  isActive: true,
}

function messageOf(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string | number
  icon: ReactNode
  tone: 'amber' | 'green' | 'blue'
}) {
  const colors = {
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        {value}
      </p>
    </div>
  )
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null
  onClose: () => void
  onSaved: (saved: Category) => void
}) {
  const [form, setForm] = useState<CategoryForm>(() =>
    category
      ? {
          name: category.name,
          description: category.description ?? '',
          displayOrder: String(category.displayOrder ?? 0),
          isActive: category.isActive,
        }
      : EMPTY_FORM,
  )
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState(category?.coverImageUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!image) return
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  function chooseImage(file?: File) {
    if (!file) return
    const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!accepted.includes(file.type)) {
      setError('Choose a JPG, PNG, WebP or AVIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be 5 MB or smaller.')
      return
    }
    setError('')
    setImage(file)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const name = form.name.trim()
    const order = Number(form.displayOrder)
    if (name.length < 2 || name.length > 100) {
      setError('Category name must contain between 2 and 100 characters.')
      return
    }
    if (!Number.isInteger(order) || order < 0) {
      setError('Display order must be a non-negative whole number.')
      return
    }

    const body = new FormData()
    body.append('name', name)
    body.append('description', form.description.trim())
    body.append('displayOrder', String(order))
    body.append('isActive', String(form.isActive))
    if (image) body.append('image', image)

    setSaving(true)
    try {
      const response = category
        ? await apiRequest<Category>(`/categories/${category.id}`, {
            method: 'PATCH',
            body,
          })
        : await apiRequest<Category>('/categories', { method: 'POST', body })
      if (!response || !response.data)
        throw new Error('The API returned an unexpected response.')
      onSaved(response.data)
      onClose()
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
              Catalogue management
            </p>
            <h2
              id="category-modal-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              {category ? 'Edit category' : 'Create a category'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Organise your products and help customers browse easily.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={saving}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Category name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name"
              autoFocus
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(e) =>
                setForm((old) => ({ ...old, name: e.target.value }))
              }
              placeholder="e.g. Industrial Hoses"
              className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15"
            />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Description{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="category-description"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) =>
                setForm((old) => ({ ...old, description: e.target.value }))
              }
              placeholder="Briefly describe this category..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {form.description.length}/500
            </p>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              Cover image{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => chooseImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-amber-400 hover:bg-amber-50/40"
            >
              {preview ? (
                <div className="relative h-44 w-full">
                  <img
                    src={preview}
                    alt="Category cover preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white">
                    <ImagePlus size={15} /> Change image
                  </span>
                </div>
              ) : (
                <div className="px-4 py-8">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <UploadCloud size={22} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Upload a cover image
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WebP or AVIF · Maximum 5 MB
                  </p>
                </div>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category-order"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Display order
              </label>
              <input
                id="category-order"
                type="number"
                min={0}
                step={1}
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((old) => ({ ...old, displayOrder: e.target.value }))
                }
                className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15"
              />
              <p className="mt-1 text-xs text-slate-400">
                Lower numbers appear first.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Category active
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Visible in catalogue
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() =>
                  setForm((old) => ({ ...old, isActive: !old.isActive }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:-mx-7 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              {saving
                ? 'Saving...'
                : category
                  ? 'Save changes'
                  : 'Create category'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadCategories() {
    setLoading(true)
    setError('')
    try {
      const response = await apiRequest<Category[]>('/categories')
      if (!response || !Array.isArray(response.data))
        throw new Error('The categories API returned an unexpected response.')
      setCategories(response.data)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return categories.filter((item) => {
      const matchesText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? item.isActive : !item.isActive)
      return matchesText && matchesStatus
    })
  }, [categories, search, statusFilter])

  async function deleteCategory() {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await apiRequest<unknown>(`/categories/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setCategories((items) =>
        items.filter((item) => item.id !== deleteTarget.id),
      )
      setNotice(`“${deleteTarget.name}” was deleted successfully.`)
      setDeleteTarget(null)
    } catch (err) {
      setError(messageOf(err))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  function saveCategory(saved: Category) {
    setCategories((items) => {
      const exists = items.some((item) => item.id === saved.id)
      return (
        exists
          ? items.map((item) =>
              item.id === saved.id ? { ...item, ...saved } : item,
            )
          : [...items, saved]
      ).sort((a, b) => a.displayOrder - b.displayOrder)
    })
    setNotice(
      `“${saved.name}” was ${editingCategory ? 'updated' : 'created'} successfully.`,
    )
    setEditingCategory(null)
    setModalOpen(false)
  }

  const activeCount = categories.filter((item) => item.isActive).length
  const productCount = categories.reduce(
    (sum, item) => sum + (item._count?.products ?? 0),
    0,
  )

  return (
    <section className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50 to-amber-100/80 px-5 py-6 shadow-[0_10px_35px_rgba(180,120,10,0.10)] sm:px-7 sm:py-8 lg:px-9">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[24px] border-white/40" />
        <div className="pointer-events-none absolute -right-2 -top-12 h-48 w-48 rounded-full border-[18px] border-amber-200/30" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800 shadow-sm">
              <Layers3 size={14} className="text-amber-700" /> Catalogue
              management
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220] sm:text-3xl lg:text-4xl">
              Categories
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Organise products into clear categories so customers can browse
              your catalogue with ease.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null)
              setModalOpen(true)
            }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-bold text-[#0B1220] shadow-sm transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-300/30 sm:w-auto"
          >
            <Plus size={18} /> Add category
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setNotice('')}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">We couldn't complete that request</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadCategories()}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold hover:bg-red-50"
          >
            Retry
          </button>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError('')}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total categories"
          value={loading ? '—' : categories.length}
          icon={<Layers3 size={19} />}
          tone="amber"
        />
        <SummaryCard
          label="Active categories"
          value={loading ? '—' : activeCount}
          icon={<Activity size={19} />}
          tone="green"
        />
        <SummaryCard
          label="Products assigned"
          value={loading ? '—' : productCount}
          icon={<ShieldCheck size={19} />}
          tone="blue"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              All categories
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, review and organise your catalogue.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 sm:w-64">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <label className="relative flex min-h-11 items-center rounded-xl border border-slate-200 pl-3 pr-9">
              <ArrowUpDown size={15} className="mr-2 text-slate-400" />
              <select
                aria-label="Filter categories by status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="w-full appearance-none bg-transparent text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 text-slate-400"
              />
            </label>
            <button
              type="button"
              onClick={() => void loadCategories()}
              disabled={loading}
              aria-label="Refresh categories"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-100"
              >
                <div className="h-40 bg-slate-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center sm:py-20">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Layers3 size={25} />
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {error
                ? 'Categories are unavailable'
                : search || statusFilter !== 'all'
                  ? 'No matching categories'
                  : 'Start with your first category'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error
                ? 'Check your connection and try loading the catalogue again.'
                : search || statusFilter !== 'all'
                  ? 'Try a different search or status filter.'
                  : 'Create a category such as Industrial Hoses or Irrigation & Farm Solutions to organise your products.'}
            </p>
            {!error && !search && statusFilter === 'all' && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null)
                  setModalOpen(true)
                }}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1220] px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Plus size={17} /> Create first category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((category) => (
              <article
                key={category.id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-44">
                  {category.coverImageUrl ? (
                    <img
                      src={category.coverImageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                      <ImagePlus size={28} strokeWidth={1.4} />
                      <span className="mt-2 text-xs">No cover image</span>
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold shadow-sm ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-white/90 text-slate-600'}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    />
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => {
                      setEditingCategory(category)
                      setModalOpen(true)
                    }}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-slate-950">
                        {category.name}
                      </h3>
                      <p className="mt-1 break-all text-xs text-slate-400">
                        /{category.slug}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                      {category._count?.products ?? 0} products
                    </span>
                  </div>
                  {category.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">
                      Display order: {category.displayOrder}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(category)
                          setModalOpen(true)
                        }}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        aria-label={`Delete ${category.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>
            Showing {loading ? '—' : filtered.length} of{' '}
            {loading ? '—' : categories.length} categories
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> Admin catalogue
          </span>
        </div>
      </div>

      {modalOpen && (
        <CategoryModal
          key={editingCategory?.id ?? 'new-category'}
          category={editingCategory}
          onClose={() => {
            setModalOpen(false)
            setEditingCategory(null)
          }}
          onSaved={saveCategory}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2
              id="delete-category-title"
              className="mt-4 text-lg font-bold text-slate-950"
            >
              Delete this category?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to delete <strong>{deleteTarget.name}</strong>.
              Categories containing products cannot be deleted. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteCategory()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? 'Deleting...' : 'Delete category'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
