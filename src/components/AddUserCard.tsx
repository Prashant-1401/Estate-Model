"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Shield, Key, Save } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  created: string;
}

interface AddUserCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: UserData) => void;
}

const roles = ["Administrator", "Agent", "Manager", "Viewer"];

export function AddUserCard({ isOpen, onClose, onSubmit }: AddUserCardProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Agent",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserData = {
      id: `UR-${Date.now().toString(36).toUpperCase()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: "Active",
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    onSubmit(user);
    onClose();
    setFormData({ name: "", email: "", phone: "", password: "", role: "Agent" });
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
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Add New User</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Create a new team member account</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                <label className="text-sm font-medium text-[#0F172A]">Email *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Password *</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Min 6 characters" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Role *</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all">
                <Save size={18} />
                Create User
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
