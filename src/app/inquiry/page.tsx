"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  Home,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const PROPERTY_TYPES = ["Apartment", "Villa", "Plot", "Commercial", "Studio", "Penthouse"];
const BUDGET_RANGES = [
  "Under ₹30L",
  "₹30L – ₹60L",
  "₹60L – ₹1Cr",
  "₹1Cr – ₹2Cr",
  "₹2Cr – ₹5Cr",
  "Above ₹5Cr",
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  budget: string;
  area: string;
  type: string;
  requirement: string;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  budget: "",
  area: "",
  type: "",
  requirement: "",
};

export default function InquiryPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* ── Ambient glow bg ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">EstateCRM</span>
        </div>
        <a
          href="/login"
          className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-4 py-1.5 rounded-full"
        >
          Agent Login →
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center pt-16 pb-12 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-3 py-1 mb-5">
            <Sparkles size={12} />
            Free Consultation · No Hidden Charges
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Find Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Dream Property
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
            Share your requirements and our real estate experts will reach out within 24 hours with
            curated listings.
          </p>
        </motion.div>
      </section>

      {/* ── Form Card ── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Inquiry Received!</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                Thank you, <span className="text-white font-medium">{form.name}</span>. Our team will
                review your requirements and contact you at{" "}
                <span className="text-white font-medium">{form.phone}</span> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setForm(INITIAL);
                  setSubmitted(false);
                }}
                className="text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 px-5 py-2 rounded-full transition-all"
              >
                Submit another inquiry
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                  01
                </span>
                Your Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" icon={<User size={16} />} required>
                    <input
                      id="inq-name"
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Prashant Kumar"
                      required
                      className="input-style"
                    />
                  </Field>
                  <Field label="Phone Number" icon={<Phone size={16} />} required>
                    <input
                      id="inq-phone"
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+91 98765 43210"
                      required
                      className="input-style"
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email Address" icon={<Mail size={16} />}>
                  <input
                    id="inq-email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className="input-style"
                  />
                </Field>

                <div className="border-t border-white/5 pt-5">
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-xs font-bold">
                      02
                    </span>
                    Property Requirements
                  </h2>
                </div>

                {/* Row 2 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Budget Range" icon={<DollarSign size={16} />}>
                    <select id="inq-budget" value={form.budget} onChange={set("budget")} className="input-style">
                      <option value="">Select budget</option>
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred Area / City" icon={<MapPin size={16} />}>
                    <input
                      id="inq-area"
                      type="text"
                      value={form.area}
                      onChange={set("area")}
                      placeholder="e.g. Baner, Pune"
                      className="input-style"
                    />
                  </Field>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                    <Home size={14} />
                    Property Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: p.type === t ? "" : t }))}
                        className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                          form.type === t
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-slate-500 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Requirement */}
                <Field label="Additional Requirements" icon={<MessageSquare size={16} />}>
                  <textarea
                    id="inq-requirement"
                    value={form.requirement}
                    onChange={set("requirement")}
                    placeholder="e.g. 3BHK, north-facing, ready possession, near metro..."
                    rows={3}
                    className="input-style resize-none"
                  />
                </Field>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

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
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Inquiry
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-slate-500 text-center">
                  Your information is safe with us. We never share your data with third parties.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: `
        .input-style {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-style::placeholder { color: rgb(100 116 139); }
        .input-style:focus { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
        .input-style option { background: #0f172a; color: white; }
      ` }} />
    </div>
  );
}

// ── Helper component ──────────────────────────────────────────────
function Field({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
