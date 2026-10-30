import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertCircle, CheckCircle2, Globe2, ImagePlus, LoaderCircle,
  Save, Settings2, Upload, Building2, Phone, MapPin, Share2,
} from "lucide-react";
import { apiRequest } from "../../lib/api";

type SiteSettings = {
  id: string;
  businessName: string;
  slogan: string | null;
  description: string | null;
  phone: string | null;
  secondaryPhone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  openingHours: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

const emptySettings: SiteSettings = {
  id: "site", businessName: "Dammy Multitrade Ventures", slogan: "",
  description: "", phone: "", secondaryPhone: "", whatsapp: "", email: "",
  address: "", city: "", state: "", country: "Nigeria", openingHours: "",
  logoUrl: "", faviconUrl: "", instagramUrl: "", facebookUrl: "",
  tiktokUrl: "", linkedinUrl: "", youtubeUrl: "",
};

const inputClass = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
function normalizeResponse<T>(response: unknown): T {
  // apiRequest returns the parsed HTTP response in `.data`;
  // our API then wraps resources as `{ success, data }`.
  const outer = response as { data?: unknown };
  const body = outer?.data ?? response;
  const envelope = body as { data?: T; success?: boolean };
  return (envelope?.success === true && envelope.data !== undefined
    ? envelope.data
    : body) as T;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await apiRequest<SiteSettings | ApiResponse<SiteSettings>>("/site-settings");
        const data = normalizeResponse<SiteSettings>(response);
        if (alive && data) setSettings({ ...emptySettings, ...data });
      } catch (err) {
        if (alive) setError(messageOf(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function updateField<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = {
        businessName: settings.businessName.trim(),
        slogan: settings.slogan || "",
        description: settings.description || "",
        phone: settings.phone || "",
        secondaryPhone: settings.secondaryPhone || "",
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        country: settings.country || "",
        openingHours: settings.openingHours || "",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
      };
      const response = await apiRequest<SiteSettings>("/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = normalizeResponse<SiteSettings>(response);
      if (data) setSettings((current) => ({ ...current, ...data }));
      setNotice("Website settings saved successfully.");
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setSaving(false);
    }
  }

  async function uploadBrandAsset(kind: "logo" | "favicon", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(kind); setError(""); setNotice("");
    try {
      if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
      if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
      const body = new FormData();
      body.append("image", file);
      const response = await apiRequest<SiteSettings>(`/site-settings/${kind}`, {
        method: "POST",
        body,
      });
      const data = normalizeResponse<SiteSettings>(response);
      if (data) setSettings((current) => ({ ...current, ...data }));
      setNotice(`${kind === "logo" ? "Logo" : "Favicon"} uploaded successfully.`);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500"><LoaderCircle className="animate-spin text-amber-600" /> Loading website settings...</div>;
  }

  return (
    <section className="dm-admin-page mx-auto w-full max-w-6xl space-y-6 text-slate-800 sm:space-y-8">
      <header className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-orange-50/50 p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800"><Settings2 size={15} /> WEBSITE CONFIGURATION</span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Website settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage your business information, contact details, brand assets and social links from one place.</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"><Globe2 size={18} /> Storefront profile</span>
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{error}</p></div>}
      {notice && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><p>{notice}</p></div>}

      <form onSubmit={save} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-800"><ImagePlus size={20} /></span><div><h2 className="font-bold text-slate-900">Brand assets</h2><p className="mt-1 text-xs text-slate-500">Upload your logo and browser favicon. Maximum 5 MB per image.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["logo", "favicon"] as const).map((kind) => {
              const url = kind === "logo" ? settings.logoUrl : settings.faviconUrl;
              return <div key={kind} className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-4">
                <div className="flex min-h-24 items-center justify-center rounded-xl bg-white p-3">
                  {url ? <img src={url} alt={kind === "logo" ? "Business logo preview" : "Favicon preview"} className={kind === "logo" ? "max-h-20 max-w-full object-contain" : "size-12 object-contain"} /> : <div className="text-center text-slate-400"><ImagePlus className="mx-auto mb-2" /><span className="text-xs">No {kind} uploaded</span></div>}
                </div>
                <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 text-sm font-bold text-slate-950 transition hover:bg-amber-500">
                  {uploading === kind ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading === kind ? "Uploading..." : `Upload ${kind}`}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(event) => void uploadBrandAsset(kind, event)} />
                </label>
              </div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-800"><Building2 size={20} /></span><div><h2 className="font-bold text-slate-900">Business information</h2><p className="mt-1 text-xs text-slate-500">Set the name and message that represent your business.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="businessName">Business name *</label><input id="businessName" required minLength={2} maxLength={160} className={inputClass} value={settings.businessName} onChange={(e) => updateField("businessName", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="slogan">Slogan</label><input id="slogan" maxLength={200} className={inputClass} value={settings.slogan ?? ""} onChange={(e) => updateField("slogan", e.target.value)} placeholder="Your business slogan" /></div>
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="description">Business description</label><textarea id="description" rows={4} maxLength={2000} className={inputClass} value={settings.description ?? ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Briefly describe your business..." /></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-800"><Phone size={20} /></span><div><h2 className="font-bold text-slate-900">Contact details</h2><p className="mt-1 text-xs text-slate-500">Make it easy for customers to reach you.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["phone", "Primary phone", "tel"],
              ["secondaryPhone", "Secondary phone", "tel"],
              ["whatsapp", "WhatsApp number", "tel"],
              ["email", "Business email", "email"],
            ] as const).map(([key, label, type]) => <div key={key}><label htmlFor={key} className={labelClass}>{label}</label><input id={key} type={type} className={inputClass} value={settings[key] ?? ""} onChange={(e) => updateField(key, e.target.value)} placeholder={key === "whatsapp" ? "e.g. +2348012345678" : ""} /></div>)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-800"><MapPin size={20} /></span><div><h2 className="font-bold text-slate-900">Business address and hours</h2><p className="mt-1 text-xs text-slate-500">These details can appear on the public contact page.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="address">Street address</label><input id="address" className={inputClass} value={settings.address ?? ""} onChange={(e) => updateField("address", e.target.value)} /></div>
            {(["city", "state", "country"] as const).map((key) => <div key={key}><label className={labelClass} htmlFor={key}>{key[0].toUpperCase() + key.slice(1)}</label><input id={key} className={inputClass} value={settings[key] ?? ""} onChange={(e) => updateField(key, e.target.value)} /></div>)}
            <div className="sm:col-span-2"><label className={labelClass} htmlFor="openingHours">Opening hours</label><textarea id="openingHours" rows={3} className={inputClass} value={settings.openingHours ?? ""} onChange={(e) => updateField("openingHours", e.target.value)} placeholder={"Mon–Fri: 8:00 AM – 5:00 PM\nSaturday: 9:00 AM – 2:00 PM"} /></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-3 text-amber-800"><Share2 size={20} /></span><div><h2 className="font-bold text-slate-900">Social media links</h2><p className="mt-1 text-xs text-slate-500">Enter full profile URLs, including https://.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["instagramUrl", "Instagram"],
              ["facebookUrl", "Facebook"],
              ["tiktokUrl", "TikTok"],
              ["linkedinUrl", "LinkedIn"],
              ["youtubeUrl", "YouTube"],
            ] as const).map(([key, label]) => <div key={key}><label htmlFor={key} className={labelClass}>{label}</label><input id={key} type="url" className={inputClass} value={settings[key] ?? ""} onChange={(e) => updateField(key, e.target.value)} placeholder="https://" /></div>)}
          </div>
        </section>

        <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-amber-100 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <p className="text-xs text-slate-500">Changes are saved to your website settings.</p>
          <button type="submit" disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-extrabold text-slate-950 transition hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:opacity-60">
            {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving settings..." : "Save settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
