"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, IndianRupee, MapPin, Building, Tag, Save } from "lucide-react";
import type { Lead } from "@/lib/types";

interface EditLeadCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Record<string, string>) => void;
  lead: Lead | null;
}

export function EditLeadCard({ isOpen, onClose, onSubmit, lead }: EditLeadCardProps) {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", budget: "", area: "", propertyType: "", source: "", notes: "", status: "New" as string,
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        phone: lead.phone,
        email: "",
        budget: lead.budget,
        area: lead.area,
        propertyType: lead.type,
        source: lead.source,
        notes: "",
        status: lead.status,
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    onSubmit(lead.id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Edit Lead</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Update lead information</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="John Doe" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="+971 50 123 4567" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Status</label>
                <div className="relative">
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pl-4 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                    <option value="New">New</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Budget Range *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select required value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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
                <label className="text-sm font-medium text-[#0F172A]">Preferred Area *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Property Type *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select required value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
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
                <label className="text-sm font-medium text-[#0F172A]">Lead Source</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Property Portal">Property Portal</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} />
                Update Lead
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
