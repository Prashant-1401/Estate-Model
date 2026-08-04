"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCog,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
};

type FieldError = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldError {
  const errors: FieldError = {};
  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 8)
    errors.password = "Minimum 8 characters";
  if (!form.confirm_password) errors.confirm_password = "Please confirm your password";
  else if (form.password !== form.confirm_password)
    errors.confirm_password = "Passwords do not match";
  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldError>({});
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Registration failed. Try again.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"][strength];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="font-semibold tracking-tight">EstateCRM</span>
        </a>
        <a
          href="/login"
          className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-full"
        >
          Sign in →
        </a>
      </nav>

      {/* Content */}
      <section className="relative z-10 max-w-lg mx-auto px-4 pt-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <UserCog size={26} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Agent Account</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Register as an EstateCRM agent. Your account will be reviewed by an admin before activation.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success State ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Registration Submitted!</h2>
              <p className="text-slate-400 mb-3 max-w-sm mx-auto">
                Welcome,{" "}
                <span className="text-white font-medium">{form.name}</span>! Your agent account
                has been created and is pending admin approval.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-8 text-sm text-amber-300 flex items-center gap-2 justify-center">
                <ShieldCheck size={16} />
                You'll receive access once an admin approves your account.
              </div>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Go to Login <ArrowRight size={16} />
              </a>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Name */}
                <Field label="Full Name" icon={<User size={15} />} error={errors.name}>
                  <input
                    id="reg-name"
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Prashant Kumar"
                    className={`reg-input ${errors.name ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                </Field>

                {/* Email */}
                <Field label="Email Address" icon={<Mail size={15} />} error={errors.email}>
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className={`reg-input ${errors.email ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" icon={<Phone size={15} />} error={errors.phone}>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+91 98765 43210"
                    className={`reg-input ${errors.phone ? "border-red-500/60 focus:border-red-500" : ""}`}
                  />
                </Field>

                {/* Password */}
                <Field label="Password" icon={<Lock size={15} />} error={errors.password}>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="Min. 8 characters"
                      className={`reg-input pr-10 ${errors.password ? "border-red-500/60 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: i <= strength ? strengthColor : "rgba(255,255,255,0.08)",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </Field>

                {/* Confirm Password */}
                <Field
                  label="Confirm Password"
                  icon={<Lock size={15} />}
                  error={errors.confirm_password}
                >
                  <div className="relative">
                    <input
                      id="reg-confirm-password"
                      type={showCpw ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={set("confirm_password")}
                      placeholder="Re-enter password"
                      className={`reg-input pr-10 ${errors.confirm_password ? "border-red-500/60 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                {/* API Error */}
                <AnimatePresence>
                  {apiError && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                    >
                      {apiError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Notice */}
                <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl p-3.5">
                  <ShieldCheck size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400">
                    Your account will be in <span className="text-amber-400 font-medium">Pending</span> status
                    until an administrator approves it. You will not be able to log in until approved.
                  </p>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Agent Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-slate-500 text-center">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign in
                  </a>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .reg-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .reg-input::placeholder { color: rgb(100 116 139); }
        .reg-input:focus { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
      `}} />
    </div>
  );
}

// ── Field helper ─────────────────────────────────────────────────
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
