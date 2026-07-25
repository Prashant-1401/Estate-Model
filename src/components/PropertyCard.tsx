"use client";

import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, Heart, Share2 } from "lucide-react";
import { useState } from "react";

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
  imageUrl?: string;
  featured?: boolean;
}

export function PropertyCard({
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  area,
  type,
  status,
  imageUrl,
  featured = false,
}: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const statusColors = {
    Available: "bg-[#22C55E] text-white",
    Reserved: "bg-[#F59E0B] text-white",
    Sold: "bg-[#EF4444] text-white",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
      className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className={`w-full h-full ${imageUrl ? 'bg-cover bg-center' : 'bg-gradient-to-br from-slate-200 to-slate-300'}`} 
             style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}>
          {!imageUrl && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-30">🏢</span>
            </div>
          )}
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2563EB] text-white">
              Featured
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isLiked ? "bg-[#EF4444] text-white" : "bg-white/90 text-[#64748B] hover:text-[#EF4444]"
            }`}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#64748B] hover:text-[#2563EB] transition-all"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Price Tag */}
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

        {/* Property Details */}
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

        {/* Property Type Tag */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium px-2.5 py-1.5 bg-[#F8FAFC] text-[#64748B] rounded-lg border border-[#E2E8F0]">
            {type}
          </span>
          <button className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            Details →
          </button>
        </div>
      </div>
    </motion.div>
  );
}