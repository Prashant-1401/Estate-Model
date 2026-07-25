"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, MapPin, Calendar, PlayCircle, FileText, Star } from "lucide-react";

export function CustomerProfile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Profile Info */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm text-center"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#2563EB] to-blue-400 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/20">
            AA
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A]">Ahmed Al-Mansoori</h2>
          <p className="text-[#64748B] text-sm mt-1">VIP Customer • Since Jan 2026</p>
          
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
              <Phone size={16} className="text-[#2563EB]" /> +971 50 123 4567
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <Mail size={16} className="text-[#2563EB]" /> ahmed.m@email.com
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <MapPin size={16} className="text-[#2563EB]" /> Palm Jumeirah, Dubai
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
            {["Initial Contact", "Site Visit", "Negotiation", "Closed"].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-[#22C55E] text-white' : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'}`}>
                  {i <= 1 ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${i <= 1 ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'}`}>{step}</span>
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
            { label: "Total Budget", value: "$1.5M", icon: Star },
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
            {/* Voice Note Item */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-[#2563EB]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#0F172A]">Voice Note from Sarah M.</p>
                  <span className="text-xs text-[#64748B]">Today, 10:30 AM</span>
                </div>
                <div className="mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3">
                  <button className="w-8 h-8 bg-[#2563EB] text-white rounded-full flex items-center justify-center hover:bg-[#1D4ED8] transition-colors">
                    <PlayCircle size={18} />
                  </button>
                  <div className="flex-1 h-8 flex items-center gap-0.5">
                    {[16, 24, 12, 28, 20, 32, 14, 22, 18, 30, 10, 26, 15, 20, 28, 12, 24, 18, 30, 14].map((h, i) => (
                      <div key={i} className="w-1 bg-[#2563EB]/30 rounded-full" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">0:42</span>
                </div>
                <p className="text-sm text-[#64748B] mt-2">&quot;Client is very interested in the Palm Jumeirah villa. Requested a second viewing this weekend with his wife.&quot;</p>
              </div>
            </div>

            {/* Document Item */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#0F172A]">Document Uploaded</p>
                  <span className="text-xs text-[#64748B]">Yesterday, 4:15 PM</span>
                </div>
                <div className="mt-2 flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl w-fit">
                  <FileText size={20} className="text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">Passport_Copy_Ahmed.pdf</p>
                    <p className="text-xs text-[#64748B]">2.4 MB</p>
                  </div>
                </div>
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
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-[#0F172A]">$1.45M</div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-[#0F172A] text-sm">Luxury 5BR Villa, Palm Jumeirah</h4>
                  <p className="text-xs text-[#64748B] mt-1">4,500 sqft • Private Beach Access</p>
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