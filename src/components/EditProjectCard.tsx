"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, MapPin, Users, IndianRupee, Calendar, FileText, Save } from "lucide-react";
import type { Project } from "@/lib/types";

interface EditProjectCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, project: Project) => void;
  project: Project | null;
}

export function EditProjectCard({ isOpen, onClose, onSubmit, project }: EditProjectCardProps) {
  const [formData, setFormData] = useState({
    name: "", developer: "", location: "", totalUnits: "", unitsSold: "",
    launchDate: "", completionDate: "", priceRange: "", description: "",
    status: "Planning" as Project["status"],
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        developer: project.developer,
        location: project.location,
        totalUnits: project.totalUnits.toString(),
        unitsSold: project.unitsSold.toString(),
        launchDate: project.launchDate,
        completionDate: project.completionDate,
        priceRange: project.priceRange,
        description: project.description,
        status: project.status,
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const updated: Project = {
      ...project,
      name: formData.name,
      developer: formData.developer,
      location: formData.location,
      status: formData.status,
      totalUnits: parseInt(formData.totalUnits) || 0,
      unitsSold: parseInt(formData.unitsSold) || 0,
      launchDate: formData.launchDate,
      completionDate: formData.completionDate,
      priceRange: formData.priceRange,
      description: formData.description,
    };
    onSubmit(project.id, updated);
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
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Edit Project</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Update project details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Project Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Palm Crescent Residences" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Developer *</label>
                <input type="text" required value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  placeholder="Emaar Properties" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Dubai Creek Harbour" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                  <option value="Planning">Planning</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Total Units</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="number" min={1} value={formData.totalUnits} onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" placeholder="250" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Sold Units</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="number" min={0} value={formData.unitsSold} onChange={(e) => setFormData({ ...formData, unitsSold: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" placeholder="120" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Launch Date</label>
                <input type="date" value={formData.launchDate} onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Completion Date</label>
                <input type="date" value={formData.completionDate} onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Price Range *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.priceRange} onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="₹50L - ₹2.5Cr" />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                  placeholder="Project description, amenities, and highlights..." />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} />
                Update Project
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
