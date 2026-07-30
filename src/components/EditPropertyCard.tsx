"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Bed, Bath, Square, Building, IndianRupee, Save, ImagePlus, Trash2 } from "lucide-react";
import type { Property } from "@/lib/types";

interface EditPropertyCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, property: Property) => void;
  property: Property | null;
}

export function EditPropertyCard({ isOpen, onClose, onSubmit, property }: EditPropertyCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ title: property?.title || "", location: property?.location || "", price: property?.price || "", bedrooms: property?.bedrooms?.toString() || "", bathrooms: property?.bathrooms?.toString() || "", area: property?.area || "", type: property?.type || "", status: property?.status || "Available" });
  const [photos, setPhotos] = useState<string[]>(property?.images || []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target?.result as string]);
        reader.readAsDataURL(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    const updated: Property = {
      ...property,
      title: formData.title,
      location: formData.location,
      price: formData.price,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: formData.area,
      type: formData.type,
      status: formData.status,
      images: photos,
    };
    onSubmit(property.id, updated);
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
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Edit Property</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Update property details</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Property Title *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Luxury 5BR Villa, Palm Jumeirah" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Palm Jumeirah, Dubai" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Price *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="₹1,45,00,000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Bedrooms *</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="number" required min={1} value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" placeholder="5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Bathrooms *</label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="number" required min={1} value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" placeholder="6" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Area (sqft) *</label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <input type="text" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" placeholder="4,500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Property Type *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                  <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <label className="text-sm font-medium text-[#0F172A]">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Property["status"] })}
                  className="w-full pl-4 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none">
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Photos</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-1 text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  <ImagePlus size={24} />
                  <span className="text-xs">Add More</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={18} />
                Update Property
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
