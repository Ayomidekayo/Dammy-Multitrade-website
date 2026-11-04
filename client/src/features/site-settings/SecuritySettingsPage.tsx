import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound,
  LoaderCircle, LockKeyhole, ShieldCheck,
} from "lucide-react";
import { apiRequest, setAuthToken } from "../../lib/api";

type Fields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyFields: Fields = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const inputClass =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

function PasswordField({
  id, label, value, onChange, visible, toggle, autoComplete,
}: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  visible: boolean; toggle: () => void; autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-slate-900"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

 const validPassword =
  fields.newPassword.length >= 8 &&
  /[A-Za-z]/.test(fields.newPassword) &&
  /\d/.test(fields.newPassword);
  const passwordsMatch =
    fields.confirmPassword.length > 0 &&
    fields.newPassword === fields.confirmPassword;

  function update(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!validPassword) {
      setError("Use at least 8 characters, including at least one letter and one number.");
      return;
    }
    if (!passwordsMatch) {
      setError("Your new password and confirmation do not match.");
      return;
    }
    if (fields.currentPassword === fields.newPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest<null>("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      setNotice(response.message || "Password changed. Please sign in again.");
      setFields(emptyFields);
      setAuthToken(null);
      window.setTimeout(() => navigate("/admin/login", { replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dm-admin-page mx-auto w-full max-w-5xl space-y-6 text-slate-800">
      <header className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-orange-50/40 p-5 shadow-sm sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800">
          <ShieldCheck size={15} /> ACCOUNT SECURITY
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Security &amp; account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage your administrator password and protect your account.</p>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{error}</p></div>}
      {notice && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><p>{notice}</p></div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-xl bg-amber-50 p-3 text-amber-800"><KeyRound size={20} /></span>
            <div><h2 className="font-bold text-slate-900">Change password</h2><p className="mt-1 text-xs text-slate-500">Confirm your current password to authorize this change.</p></div>
          </div>

          <div className="space-y-5">
            <PasswordField id="currentPassword" label="Current password" value={fields.currentPassword} onChange={(v) => update("currentPassword", v)} visible={visible.current} toggle={() => setVisible((s) => ({ ...s, current: !s.current }))} autoComplete="current-password" />
            <PasswordField id="newPassword" label="New password" value={fields.newPassword} onChange={(v) => update("newPassword", v)} visible={visible.next} toggle={() => setVisible((s) => ({ ...s, next: !s.next }))} autoComplete="new-password" />
            <PasswordField id="confirmPassword" label="Confirm new password" value={fields.confirmPassword} onChange={(v) => update("confirmPassword", v)} visible={visible.confirm} toggle={() => setVisible((s) => ({ ...s, confirm: !s.confirm }))} autoComplete="new-password" />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Password requirements</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li className={fields.newPassword.length >= 8 ? "text-emerald-700" : "text-slate-500"}>{fields.newPassword.length >= 8 ? "✓" : "•"} At least 8 characters</li>
              <li className={/[A-Za-z]/.test(fields.newPassword) ? "text-emerald-700" : "text-slate-500"}>{/[A-Za-z]/.test(fields.newPassword) ? "✓" : "•"} At least one letter</li>
              <li className={/\\d/.test(fields.newPassword) ? "text-emerald-700" : "text-slate-500"}>{/\\d/.test(fields.newPassword) ? "✓" : "•"} At least one number</li>
              <li className={passwordsMatch ? "text-emerald-700" : "text-slate-500"}>{passwordsMatch ? "✓" : "•"} Password confirmation matches</li>
            </ul>
          </div>

          <button type="submit" disabled={saving} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {saving ? <LoaderCircle size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
            {saving ? "Updating password..." : "Update password"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <span className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={21} /></span>
          <h2 className="mt-4 font-bold text-slate-900">Security notice</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">After a successful password change, previously issued sessions will be invalidated. You will need to sign in again using your new password.</p>
          <p className="mt-4 text-xs leading-5 text-slate-500">Never share your administrator password. Use a unique password that you do not use on other websites.</p>
        </aside>
      </div>
    </section>
  );
}
