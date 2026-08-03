"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Calendar, Star, ArrowLeft, Share2, StickyNote, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { getLeadActivities, logLeadActivity, type ActivityType } from "@/lib/activities";
import type { Activity, Lead } from "@/lib/types";

interface CustomerProfileProps {
  lead?: Lead;
  onBack?: () => void;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTIVITY_PLACEHOLDERS: Record<ActivityType, string> = {
  call: "What was discussed on the call?",
  chat: "What was discussed on WhatsApp?",
  note: "Write a note about this customer...",
};

export function CustomerProfile({ lead, onBack }: CustomerProfileProps) {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [logType, setLogType] = useState<ActivityType | null>(null);
  const [logNote, setLogNote] = useState("");
  const [logSaving, setLogSaving] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!lead) return;
    setActivitiesLoading(true);
    try {
      const items = await getLeadActivities(lead.id);
      setActivities(items);
    } finally {
      setActivitiesLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    if (lead) {
      void Promise.resolve().then(() => loadActivities());
    }
  }, [lead, loadActivities]);

  const openLogForm = (type: ActivityType) => {
    setLogType(type);
    setLogNote("");
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !logType || !logNote.trim()) return;
    setLogSaving(true);
    const created = await logLeadActivity(lead.id, logType, logNote.trim());
    if (created) {
      setActivities((prev) => [created, ...prev]);
      showToast("Activity logged", "success");
    }
    setLogSaving(false);
    setLogType(null);
    setLogNote("");
  };

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-[#64748B] text-lg">Select a lead to view their profile</p>
      </div>
    );
  }

  const initials = lead.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const waNumber = lead.phone.replace(/\D/g, "");

  const statusOrder: Record<string, number> = { New: 0, Warm: 1, Hot: 2, Cold: 0 };
  const completed = statusOrder[lead.status] ?? 0;

  const steps = ["Initial Contact", "Site Visit", "Negotiation", "Closed"];

  const handleShare = async () => {
    const shareText = `${lead.name} | ${lead.phone} | ${lead.type} | ${lead.area} | ${lead.budget}`;
    const shareData = { title: `${lead.name} - Lead`, text: shareText };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed the share sheet
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Lead details copied to clipboard", "success");
      } catch {
        showToast("Failed to copy lead details", "error");
      }
    }
  };

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
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${lead.name}!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void logLeadActivity(lead.id, "chat")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a
              href={`tel:${lead.phone.replace(/\s+/g, "")}`}
              onClick={() => void logLeadActivity(lead.id, "call")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              <Phone size={18} /> Call
            </a>
            <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-[#E2E8F0] transition-colors">
              <Share2 size={18} /> Share
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[#0F172A]">Activity Timeline</h3>
            <div className="flex gap-2">
              {[
                { type: "call" as const, label: "+ Log Call" },
                { type: "chat" as const, label: "+ Log Chat" },
                { type: "note" as const, label: "+ Add Note" },
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => openLogForm(btn.type)}
                  className={`text-sm font-medium rounded-lg px-3 py-1.5 transition-colors ${
                    logType === btn.type
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {logType && (
            <form
              onSubmit={handleLogSubmit}
              className="mb-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
            >
              <textarea
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder={ACTIVITY_PLACEHOLDERS[logType]}
                rows={3}
                autoFocus
                className="w-full px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none"
              />
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => { setLogType(null); setLogNote(""); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSaving || !logNote.trim()}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                >
                  {logSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}

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

            {activitiesLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-[#64748B] py-2">
                No activities yet. Log a call, chat, or note to start tracking interactions with this customer.
              </p>
            ) : (
              activities.map((activity) => {
                const isCall = activity.type === "call";
                const isChat = activity.type === "chat";
                const iconBg = isCall
                  ? "bg-blue-100 text-[#2563EB]"
                  : isChat
                    ? "bg-green-100 text-[#22C55E]"
                    : "bg-amber-100 text-[#F59E0B]";
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                      {isCall ? <Phone size={16} /> : isChat ? <MessageCircle size={16} /> : <StickyNote size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#0F172A]">{activity.description}</p>
                        <span className="text-xs text-[#64748B] shrink-0">{formatTime(activity.created_at)}</span>
                      </div>
                      {activity.note && <p className="text-sm text-[#64748B] mt-2">{activity.note}</p>}
                      {activity.performed_by && (
                        <p className="text-xs text-[#94A3B8] mt-1">by {activity.performed_by}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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
