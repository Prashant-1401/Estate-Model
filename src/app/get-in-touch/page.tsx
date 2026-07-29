"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Phone, Mail, MapPin, IndianRupee, Send, CheckCircle, User } from "lucide-react";
import type { Lead } from "@/lib/types";

export default function GetInTouchPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", budget: "", area: "", propertyType: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `LD-${Date.now().toString(36).toUpperCase()}`,
      name: formData.name,
      phone: formData.phone,
      budget: formData.budget,
      area: formData.area,
      type: formData.propertyType,
      source: "Website",
      status: "New",
      assigned: "Unassigned",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    const existing = JSON.parse(localStorage.getItem("estatecrm_leads") || "[]");
    localStorage.setItem("estatecrm_leads", JSON.stringify([newLead, ...existing]));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 sm:p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-[#22C55E]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Thank You!</h1>
          <p className="text-[#64748B] mt-2">Your inquiry has been received. Our team will contact you shortly.</p>
          <button onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", email: "", budget: "", area: "", propertyType: "", message: "" }); }}
            className="mt-6 px-6 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
            Submit Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden max-w-lg w-full">
        <div className="bg-[#0F172A] px-6 py-8 text-center">
          <div className="w-14 h-14 bg-[#2563EB]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 size={28} className="text-[#2563EB]" />
          </div>
          <h1 className="text-xl font-semibold text-white">Get in Touch</h1>
          <p className="text-slate-400 text-sm mt-1">Find your dream property with EstateCRM</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Full Name *</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                placeholder="John Doe" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Phone *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="john@example.com" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Budget Range</label>
              <div className="relative">
                <IndianRupee size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <select value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                  <option value="">Select Budget</option>
                  <option value="₹50L - ₹80L">₹50L - ₹80L</option>
                  <option value="₹80L - ₹1Cr">₹80L - ₹1Cr</option>
                  <option value="₹1Cr - ₹1.5Cr">₹1Cr - ₹1.5Cr</option>
                  <option value="₹1.5Cr - ₹2Cr">₹1.5Cr - ₹2Cr</option>
                  <option value="₹2Cr+">₹2Cr+</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Preferred Area</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <select value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                  <option value="">Select Area</option>
                  <option value="Palm Jumeirah">Palm Jumeirah</option>
                  <option value="Downtown Dubai">Downtown Dubai</option>
                  <option value="Emirates Hills">Emirates Hills</option>
                  <option value="Dubai Marina">Dubai Marina</option>
                  <option value="Business Bay">Business Bay</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Property Type</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                <option value="">Select Type</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Message</label>
            <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3} className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
              placeholder="Tell us about your requirements..." />
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all">
            <Send size={18} />
            Submit Inquiry
          </button>
        </form>
      </motion.div>
    </div>
  );
}
