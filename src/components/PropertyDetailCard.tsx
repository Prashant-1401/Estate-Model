"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
  import { X, MapPin, Bed, Bath, Square, Heart, Share2, ChevronLeft, ChevronRight, Image as ImageIcon, Phone, MessageCircle } from "lucide-react";
import type { Property, Company } from "@/lib/types";
import { api } from "@/lib/api";
import { useDropdownOptions } from "@/lib/dropdowns";
import { statusBadgeStyle } from "@/lib/statuses";

interface PropertyDetailCardProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDetailCard({ property, isOpen, onClose }: PropertyDetailCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [companyPhone, setCompanyPhone] = useState("");
  const { options: propertyStatusOptions } = useDropdownOptions("property_status");
  const statusColorMap = Object.fromEntries(
    propertyStatusOptions.map((o) => [o.value, o.color])
  );

  const loadCompany = useCallback(async () => {
    try {
      const res = await api.get<Company>("/api/company");
      setCompanyPhone(res.phone || "");
    } catch {
      // No company configured — leave phone empty
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadCompany());
  }, [loadCompany]);

  if (!property) return null;

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColorMap[property.status] || "#94A3B8" }} />
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] line-clamp-1">{property.title}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-6 p-0 lg:p-6">
                <div className="lg:col-span-3">
                  <div className="relative h-64 sm:h-80 lg:h-[400px] bg-[#F8FAFC]">
                    {property.images.length > 0 ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- base64 uploads, next/image does not apply */}
                        <img
                          src={property.images[currentImage]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        {property.images.length > 1 && (
                          <>
                            <button onClick={prevImage}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-full text-[#0F172A] hover:bg-white shadow-md transition-all">
                              <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextImage}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-full text-[#0F172A] hover:bg-white shadow-md transition-all">
                              <ChevronRight size={20} />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                              {property.images.map((_, i) => (
                                <button key={i} onClick={() => setCurrentImage(i)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i === currentImage ? "bg-white w-6" : "bg-white/60"
                                  }`} />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={64} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {property.images.map((img, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)}
                          className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            i === currentImage ? "border-[#2563EB] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                          }`}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- base64 uploads, next/image does not apply */}
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 p-4 lg:p-0 space-y-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold text-[#0F172A]">{property.price}</p>
                        <p className="text-sm text-[#64748B] mt-0.5">{property.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setIsLiked(!isLiked)}
                          className={`p-2 rounded-xl transition-all ${
                            isLiked ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F8FAFC] text-[#64748B] hover:text-[#EF4444]"
                          }`}>
                          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button className="p-2 bg-[#F8FAFC] rounded-xl text-[#64748B] hover:text-[#2563EB] transition-colors">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                    <MapPin size={16} className="shrink-0" />
                    <span>{property.location}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                      <Bed size={20} className="text-[#2563EB] mx-auto mb-1" />
                      <p className="text-lg font-semibold text-[#0F172A]">{property.bedrooms}</p>
                      <p className="text-xs text-[#64748B]">Bedrooms</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                      <Bath size={20} className="text-[#2563EB] mx-auto mb-1" />
                      <p className="text-lg font-semibold text-[#0F172A]">{property.bathrooms}</p>
                      <p className="text-xs text-[#64748B]">Bathrooms</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                      <Square size={20} className="text-[#2563EB] mx-auto mb-1" />
                      <p className="text-lg font-semibold text-[#0F172A]">{property.area}</p>
                      <p className="text-xs text-[#64748B]">Sq. Ft.</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#64748B]">Property Type</span>
                      <span className="font-medium text-[#0F172A]">{property.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#64748B]">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" style={statusBadgeStyle(statusColorMap[property.status])}>
                        {property.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#64748B]">Property ID</span>
                      <span className="font-mono text-xs text-[#64748B]">{property.id}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={companyPhone ? `https://wa.me/${companyPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello! I'm interested in ${property.title} (${property.id}).`)}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={companyPhone ? "Chat on WhatsApp" : "No company phone configured"}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors ${companyPhone ? "" : "opacity-50 pointer-events-none cursor-not-allowed"}`}
                    >
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                    <a
                      href={companyPhone ? `tel:${companyPhone.replace(/\s+/g, "")}` : undefined}
                      title={companyPhone ? "Call company" : "No company phone configured"}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all ${companyPhone ? "" : "opacity-50 pointer-events-none cursor-not-allowed"}`}
                    >
                      <Phone size={18} />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
