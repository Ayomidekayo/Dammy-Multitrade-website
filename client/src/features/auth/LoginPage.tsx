import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Boxes, Package, Layers3 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, getApiErrorMessage } from "./AuthProvider";
import "../../styles/admin-theme.css";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
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

  return (
    <main className="dm-admin-login grid min-h-screen lg:grid-cols-[1.02fr_.98fr]">
      <motion.section initial={reduceMotion ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : .42 }} className="dm-admin-login__brand-panel relative flex min-h-[260px] flex-col justify-between overflow-hidden px-5 py-6 sm:px-9 sm:py-9 lg:min-h-screen lg:px-14 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.12]" style={{ backgroundImage: "linear-gradient(rgb(255 255 255 / .12) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .12) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border-[34px] border-violet-300/10" />
        <Link to="/admin/login" aria-label="Dammy Multitrade Ventures admin login" className="relative z-10 flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]">
          <span className="dm-admin-brand-mark grid h-12 w-12 place-items-center rounded-2xl shadow-lg"><Boxes size={25} /></span>
          <span><span className="block text-sm font-extrabold tracking-[.09em] sm:text-base">DAMMY MULTITRADE</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.22em] text-violet-100/65">Ventures · Admin Portal</span></span>
        </Link>
        <div className="relative z-10 mt-9 max-w-xl lg:mt-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-semibold text-violet-100/80"><span className="size-2 rounded-full bg-emerald-400" /> Private administrator access</div>
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">Your business.<span className="mt-2 block text-[#F5B942]">Under control.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-violet-100/70 sm:text-base">Manage products, organise categories and keep your storefront information current from one focused workspace.</p>
          <div className="mt-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4"><Package className="mb-3 text-[#F5B942]" size={21} /><p className="text-sm font-bold">Catalogue</p><p className="mt-1 text-xs leading-5 text-violet-100/55">Products in order.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4"><Layers3 className="mb-3 text-[#F5B942]" size={21} /><p className="text-sm font-bold">Categories</p><p className="mt-1 text-xs leading-5 text-violet-100/55">Clear product discovery.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4"><ShieldCheck className="mb-3 text-[#F5B942]" size={21} /><p className="text-sm font-bold">Access control</p><p className="mt-1 text-xs leading-5 text-violet-100/55">Admin-only workspace.</p></div>
          </div>
        </div>
        <p className="relative z-10 mt-8 hidden text-xs text-violet-100/40 lg:block">© {new Date().getFullYear()} Dammy Multitrade Ventures. All rights reserved.</p>
      </motion.section>

      <section className="dm-admin-login__form-panel flex min-h-[calc(100vh-260px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .42, delay: reduceMotion ? 0 : .08 }} className="dm-admin-enter w-full max-w-[420px]">
          <div className="mb-8"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#F5B942]">Administrator sign in</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Welcome back.</h2><p className="mt-3 text-sm leading-6 text-violet-100/60">Sign in with your authorised administrator credentials.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-violet-100/85">Email address</label><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-200/45" /><input className="dm-admin-login__input" id="email" type="email" autoComplete="username" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourbusiness.com" /></div></div>
            <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-sm font-semibold text-violet-100/85">Password</label><span className="text-xs text-violet-100/40">Admin account</span></div><div className="relative"><LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-200/45" /><input className="dm-admin-login__input pr-12" id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-violet-200/55 transition hover:bg-white/10 hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <button disabled={submitting} type="submit" className="dm-admin-login__button">{submitting ? <><span className="spinner !border-[#4b5563] !border-t-[#0b1220]" /> Signing you in…</> : <>Sign in to dashboard <ArrowRight size={17} /></>}</button>
          </form>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-violet-300/15 bg-violet-400/[.07] p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" /><p className="text-xs leading-5 text-violet-100/60">This area is reserved for authorised administrators. Your credentials are verified by the business API.</p></div>
          <p className="mt-8 text-center text-xs text-violet-100/35">© {new Date().getFullYear()} Dammy Multitrade Ventures</p>
        </motion.div>
      </section>
    </main>
  );
}
