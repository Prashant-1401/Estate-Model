"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, IndianRupee, MapPin, Building, Tag, Save } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface AddLeadCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: Record<string, string>) => void;
}

export function AddLeadCard({ isOpen, onClose, onSubmit }: AddLeadCardProps) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    area: "",
    propertyType: "",
    source: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ name?: string; phone?: string; budget?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; phone?: string; budget?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const digitsOnly = formData.phone.replace(/[\s\-\+]/g, "");
      if (!/^\d{7,}$/.test(digitsOnly)) {
        newErrors.phone = "Phone must have at least 7 digits";
      }
    }

    if (!formData.budget) {
      newErrors.budget = "Budget is required";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors) as (keyof typeof validationErrors)[];
    if (errorKeys.length > 0) {
      const firstError = validationErrors[errorKeys[0]];
      if (firstError) showToast(firstError, "error");
      return;
    }

    onSubmit(formData);
    onClose();
    setFormData({
      name: "",
      phone: "",
      email: "",
      budget: "",
      area: "",
      propertyType: "",
      source: "",
      notes: "",
    });
    setErrors({});
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
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Add New Lead</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Enter customer information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors"
            >
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="+971 50 123 4567"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Budget Range *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select
                    required
                    value={formData.budget}
                    onChange={(e) => {
                      setFormData({ ...formData, budget: e.target.value });
                      if (errors.budget) setErrors({ ...errors, budget: undefined });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                  >
                    <option value="">Select Budget</option>
                    <option value="50l-80l">₹50L - ₹80L</option>
                    <option value="80l-1cr">₹80L - ₹1Cr</option>
                    <option value="1cr-1.5cr">₹1Cr - ₹1.5Cr</option>
                    <option value="1.5cr-2cr">₹1.5Cr - ₹2Cr</option>
                    <option value="2cr+">₹2Cr+</option>
                  </select>
                </div>
                {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
              </div>

              {/* Preferred Area */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Preferred Area *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                  >
                    <option value="">Select Area</option>
                    <option value="palm-jumeirah">Palm Jumeirah</option>
                    <option value="downtown">Downtown Dubai</option>
                    <option value="emirates-hills">Emirates Hills</option>
                    <option value="dubai-marina">Dubai Marina</option>
                    <option value="business-bay">Business Bay</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Property Type *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                  >
                    <option value="">Select Type</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lead Source */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Lead Source</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                >
                  <option value="">Select Source</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="portal">Property Portal</option>
                  <option value="social-media">Social Media</option>
                  <option value="walk-in">Walk-in</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                placeholder="Any specific requirements..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Lead
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
