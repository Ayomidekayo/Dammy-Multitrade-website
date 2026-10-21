import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Boxes } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, getApiErrorMessage } from "./AuthProvider";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) { toast.error("Enter your email and password to continue."); return; }
    setSubmitting(true);
    try { await signIn(email.trim(), password); toast.success("Welcome back."); navigate("/admin", { replace: true }); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
    finally { setSubmitting(false); }
  }

  return <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.02fr_.98fr]">
    <section className="relative flex min-h-[240px] flex-col justify-between overflow-hidden bg-[#0b1220] px-6 py-7 text-white sm:px-10 sm:py-9 lg:min-h-screen lg:px-14 lg:py-12">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#f5b942]/10 blur-3xl" />
      <Link to="/admin/login" className="relative z-10 flex w-fit items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5b942] text-[#0b1220] shadow-lg"><Boxes size={23} strokeWidth={2.4} /></span>
        <span><span className="block font-['Manrope'] text-sm font-extrabold tracking-wide sm:text-base">DAMMY MULTITRADE</span><span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.22em] text-slate-400">Ventures · Admin Portal</span></span>
      </Link>
      <div className="relative z-10 hidden max-w-xl lg:block">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Your business, one workspace</div>
        <h1 className="font-['Manrope'] text-5xl font-extrabold leading-[1.12] tracking-tight xl:text-6xl">Manage your catalogue.<span className="mt-2 block text-[#f5b942]">Move business forward.</span></h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-400">Organise product categories, keep your catalogue up to date, and manage your business content from one simple workspace.</p>
        <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><ShieldCheck className="mb-3 text-[#f5b942]" size={21} /><p className="text-sm font-semibold">Secure access</p><p className="mt-1 text-xs leading-5 text-slate-400">For authorised administrators.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><Boxes className="mb-3 text-[#f5b942]" size={21} /><p className="text-sm font-semibold">Catalogue control</p><p className="mt-1 text-xs leading-5 text-slate-400">Categories and products in one place.</p></div>
        </div>
      </div>
      <p className="relative z-10 hidden text-xs text-slate-500 lg:block">© {new Date().getFullYear()} Dammy Multitrade Ventures. All rights reserved.</p>
      <div className="relative z-10 mt-7 max-w-sm lg:hidden"><p className="font-['Manrope'] text-2xl font-extrabold leading-tight sm:text-3xl">Welcome to your <span className="text-[#f5b942]">business workspace.</span></p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Sign in to manage your catalogue and business content.</p></div>
    </section>
    <section className="flex min-h-[calc(100vh-240px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a77713]">Admin sign in</p><h2 className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Good to see you.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Enter your administrator credentials to continue to your dashboard.</p></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="email" type="email" autoComplete="username" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourbusiness.com" className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#dca52f] focus:bg-white focus:ring-4 focus:ring-[#f5b942]/15" /></div></div>
          <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label><span className="text-xs text-slate-400">Admin account</span></div><div className="relative"><LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#dca52f] focus:bg-white focus:ring-4 focus:ring-[#f5b942]/15" /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <button disabled={submitting} type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#f5b942] px-5 text-sm font-extrabold text-[#151b25] shadow-lg shadow-[#f5b942]/20 transition hover:bg-[#edb033] focus:outline-none focus:ring-4 focus:ring-[#f5b942]/25 disabled:cursor-not-allowed disabled:opacity-65">{submitting ? <><span className="spinner !border-[#4b5563] !border-t-[#0b1220]" /> Signing you in…</> : <>Sign in to dashboard <ArrowRight size={17} /></>}</button>
        </form>
        <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" /><p className="text-xs leading-5 text-slate-500">This area is reserved for authorised administrators. Your credentials are sent to the business API for verification.</p></div>
        <p className="mt-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} Dammy Multitrade Ventures</p>
      </div>
    </section>
  </main>;
}
