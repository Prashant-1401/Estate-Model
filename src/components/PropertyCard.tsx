"use client";

import { motion } from "framer-motion";
  import { MapPin, Bed, Bath, Square, Edit2, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon, Building2, UserRound } from "lucide-react";
import { useState } from "react";
import { useDropdownOptions } from "@/lib/dropdowns";
import { statusBadgeStyle } from "@/lib/statuses";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  status: "Available" | "Reserved" | "Sold";
  images: string[];
  featured?: boolean;
  projectId?: string;
  projects?: { id: string; name: string }[];
  agentId?: string;
  agentName?: string;
  agents?: { id: string; name: string }[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLinkProject?: (id: string, projectId: string) => void;
  onAssignAgent?: (id: string, agentId: string) => void;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  type,
  status,
  images,
  featured = false,
  projectId,
  projects = [],
  agentId,
  agentName,
  agents = [],
  onViewDetails,
  onEdit,
  onDelete,
  onLinkProject,
  onAssignAgent,
}: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const { options: propertyStatusOptions } = useDropdownOptions("property_status");
  const statusColorMap = Object.fromEntries(
    propertyStatusOptions.map((o) => [o.value, o.color])
  );

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
      onClick={() => onViewDetails?.(id)}
      className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- base64 uploads, next/image does not apply */}
            <img
              src={images[currentImage]}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 backdrop-blur rounded-full text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 backdrop-blur rounded-full text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentImage ? "bg-white w-3" : "bg-white/60"
                      }`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <ImageIcon size={40} className="text-slate-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border" style={statusBadgeStyle(statusColorMap[status])}>
            {status}
          </span>
        </div>

        {featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2563EB] text-white">
              Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(id); }}
              className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="text-white font-bold text-lg drop-shadow-lg">{price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#0F172A] text-base mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center gap-1.5 text-[#64748B] text-sm mb-3">
          <MapPin size={14} className="shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-3 py-3 border-t border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-1 text-[#64748B]">
            <Bed size={16} className="text-[#2563EB]" />
            <span className="font-medium text-[#0F172A]">{bedrooms}</span>
            <span className="hidden sm:inline">Beds</span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B]">
            <Bath size={16} className="text-[#2563EB]" />
            <span className="font-medium text-[#0F172A]">{bathrooms}</span>
            <span className="hidden sm:inline">Baths</span>
          </div>
          <div className="flex items-center gap-1 text-[#64748B]">
            <Square size={16} className="text-[#2563EB]" />
            <span className="font-medium text-[#0F172A]">{area}</span>
            <span className="hidden sm:inline">sqft</span>
          </div>
        </div>

        {onLinkProject && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#64748B] shrink-0" />
              <select
                value={projectId || ""}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { e.stopPropagation(); onLinkProject(id, e.target.value); }}
                className="w-full px-2 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
              >
                <option value="">{projectId && !projects.some((p) => p.id === projectId) ? `Linked: ${projectId}` : "Link to project…"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {onAssignAgent && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <UserRound size={14} className="text-[#2563EB] shrink-0" />
              <select
                value={agentId || ""}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { e.stopPropagation(); onAssignAgent(id, e.target.value); }}
                className="w-full px-2 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
              >
                <option value="">{agentId && !agents.some((a) => a.id === agentId) ? `Agent: ${agentName || agentId}` : "Assign an agent…"}</option>
                <option value="">No agent</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {agentName && !onAssignAgent && (
          <div className="mt-3 flex items-center gap-2">
            <UserRound size={14} className="text-[#2563EB] shrink-0" />
            <span className="text-xs text-[#64748B] truncate">Assigned agent: <span className="font-medium text-[#0F172A]">{agentName}</span></span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium px-2.5 py-1.5 bg-[#F8FAFC] text-[#64748B] rounded-lg border border-[#E2E8F0]">
            {type}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onViewDetails?.(id); }} className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            Details →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
