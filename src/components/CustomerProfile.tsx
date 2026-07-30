"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Calendar, Star, ArrowLeft } from "lucide-react";
import type { Lead } from "@/lib/types";

interface CustomerProfileProps {
  lead?: Lead;
  onBack?: () => void;
}

export function CustomerProfile({ lead, onBack }: CustomerProfileProps) {
  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-[#64748B] text-lg">Select a lead to view their profile</p>
      </div>
    );
  }

  const initials = lead.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const statusOrder: Record<string, number> = { New: 0, Warm: 1, Hot: 2, Cold: 0 };
  const completed = statusOrder[lead.status] ?? 0;

  const steps = ["Initial Contact", "Site Visit", "Negotiation", "Closed"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Profile Info */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm text-center"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to Leads
            </button>
          )}

          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#2563EB] to-blue-400 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20">
            {initials}
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A]">{lead.name}</h2>
          <p className="text-[#64748B] text-sm mt-1">Lead &bull; {lead.type}</p>

          <div className="flex justify-center gap-2 mt-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
              <Phone size={18} /> Call
            </button>
          </div>

          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <Phone size={16} className="text-[#2563EB]" /> {lead.phone}
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <MapPin size={16} className="text-[#2563EB]" /> {lead.area}
            </div>
          </div>
        </motion.div>

        {/* Lead Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <h3 className="font-semibold text-[#0F172A] mb-4">Lead Status</h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < completed ? 'bg-[#22C55E] text-white' : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'}`}>
                  {i < completed ? "\u2713" : i + 1}
                </div>
                <span className={`text-sm ${i < completed ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'}`}>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: Timeline & Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Budget", value: lead.budget, icon: Star },
            { label: "Properties Viewed", value: "4", icon: MapPin },
            { label: "Next Follow-up", value: "Today, 2PM", icon: Calendar },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
              className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm"
            >
              <stat.icon size={20} className="text-[#2563EB] mb-2" />
              <p className="text-2xl font-semibold text-[#0F172A]">{stat.value}</p>
              <p className="text-xs text-[#64748B] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[#0F172A]">Activity Timeline</h3>
            <button className="text-sm text-[#2563EB] font-medium hover:underline">+ Add Note</button>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-[#2563EB]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#0F172A]">Lead Created</p>
                  <span className="text-xs text-[#64748B]">{lead.date}</span>
                </div>
                <p className="text-sm text-[#64748B] mt-2">Lead was created and assigned to {lead.assigned}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interested Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <h3 className="font-semibold text-[#0F172A] mb-4">Recommended Properties</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="group border border-[#E2E8F0] rounded-xl overflow-hidden hover:shadow-md transition-all">
                <div className="h-32 bg-slate-200 relative">
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-[#0F172A]">₹1.45Cr</div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-[#0F172A] text-sm">Luxury 5BR Villa, Palm Jumeirah</h4>
                  <p className="text-xs text-[#64748B] mt-1">4,500 sqft &bull; Private Beach Access</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors">View Details</button>
                    <button className="px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">Share</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
