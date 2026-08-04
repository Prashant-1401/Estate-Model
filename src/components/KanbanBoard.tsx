"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreHorizontal, Clock, User, Trash2, Edit2, X, ChevronDown } from "lucide-react";
import type { FollowUp, FollowUpStatus } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useDropdownOptions } from "@/lib/dropdowns";

const COLUMN_STYLES: Record<string, { color: string; dot: string }> = {
  Today: { color: "text-[#EF4444]", dot: "bg-[#EF4444]" },
  Tomorrow: { color: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  "This Week": { color: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  "Decision Pending": { color: "text-[#22C55E]", dot: "bg-[#22C55E]" },
};

const DEFAULT_COLUMN_STYLE = { color: "text-[#64748B]", dot: "bg-[#64748B]" };

interface FollowUpColumn {
  id: FollowUpStatus;
  label: string;
  color: string;
  dot: string;
}

function buildColumns(options: { label: string; value: string }[]): FollowUpColumn[] {
  return options.map((o) => {
    const style = COLUMN_STYLES[o.label] || DEFAULT_COLUMN_STYLE;
    return {
      id: o.value as FollowUpStatus,
      label: o.label,
      color: style.color,
      dot: style.dot,
    };
  });
}

interface KanbanBoardProps {
  items: FollowUp[];
  onRefresh: () => void;
}

export function KanbanBoard({ items, onRefresh }: KanbanBoardProps) {
  const { showToast } = useToast();
  const [showAddCard, setShowAddCard] = useState<FollowUpStatus | null>(null);
  const [editingItem, setEditingItem] = useState<FollowUp | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { options: followupStatusOptions } = useDropdownOptions("followup_status");

  const columns = useMemo(
    () => buildColumns(followupStatusOptions),
    [followupStatusOptions]
  );

  const getColumnItems = (status: FollowUpStatus) =>
    items.filter((item) => item.status === status);

  const handleStatusChange = async (id: string, newStatus: FollowUpStatus) => {
    try {
      await api.put(`/api/follow-ups/${id}`, { status: newStatus });
      showToast("Status updated", "success");
      onRefresh();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/follow-ups/${id}`);
      showToast("Follow-up deleted", "success");
      onRefresh();
    } catch {
      showToast("Failed to delete", "error");
    }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Follow Ups</h1>
          <p className="text-[#64748B] mt-1 text-sm">Manage your follow-up tasks and deadlines</p>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {columns.map((col) => {
          const colItems = getColumnItems(col.id);
          return (
            <div key={col.id} className="min-w-[280px] lg:min-w-0 lg:flex-1">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className="text-sm font-semibold text-[#0F172A]">{col.label}</h3>
                  <span className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                    {colItems.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddCard(col.id)}
                  className="p-1.5 hover:bg-[#F1F5F9] rounded-lg transition-colors text-[#64748B] hover:text-[#2563EB]"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {colItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-[#2563EB]">{item.lead_id}</span>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                            className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                          >
                            <MoreHorizontal size={14} className="text-[#64748B]" />
                          </button>
                          {menuOpen === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1">
                                <button
                                  onClick={() => { setEditingItem(item); setMenuOpen(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-medium text-[#0F172A] mb-1">{item.lead_name}</h4>
                      {item.property_title && (
                        <p className="text-xs text-[#64748B] mb-2">{item.property_title}</p>
                      )}

                      {item.time && (
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2">
                          <Clock size={12} />
                          <span>{item.time}</span>
                        </div>
                      )}

                      {item.assigned_to && (
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <User size={12} />
                          <span>{item.assigned_to}</span>
                        </div>
                      )}

                      {item.note && (
                        <p className="text-xs text-[#64748B] mt-2 line-clamp-2">{item.note}</p>
                      )}

                      {/* Status Change Buttons */}
                      <div className="flex gap-1 mt-3 pt-3 border-t border-[#F1F5F9]">
                        {columns
                          .filter((c) => c.id !== item.status)
                          .slice(0, 2)
                          .map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleStatusChange(item.id, c.id)}
                              className="flex-1 px-2 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition-colors"
                            >
                              → {c.label}
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colItems.length === 0 && (
                  <button
                    onClick={() => setShowAddCard(col.id)}
                    className="w-full py-8 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                  >
                    + Add Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(showAddCard || editingItem) && (
        <FollowUpModal
          initialData={editingItem}
          defaultStatus={showAddCard}
          onClose={() => { setShowAddCard(null); setEditingItem(null); }}
          onSaved={() => { setShowAddCard(null); setEditingItem(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

interface FollowUpModalProps {
  initialData?: FollowUp | null;
  defaultStatus?: FollowUpStatus | null;
  onClose: () => void;
  onSaved: () => void;
}

function FollowUpModal({ initialData, defaultStatus, onClose, onSaved }: FollowUpModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { options: followupStatusOptions } = useDropdownOptions("followup_status");
  const columns = useMemo(() => buildColumns(followupStatusOptions), [followupStatusOptions]);
  const [formData, setFormData] = useState({
    lead_id: initialData?.lead_id || "",
    lead_name: initialData?.lead_name || "",
    property_title: initialData?.property_title || "",
    assigned_to: initialData?.assigned_to || "",
    status: initialData?.status || defaultStatus || "Today",
    time: initialData?.time || "",
    note: initialData?.note || "",
  });

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_name.trim()) {
      showToast("Lead name is required", "error");
      return;
    }
    if (!formData.lead_id.trim()) {
      showToast("Lead ID is required", "error");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/api/follow-ups/${initialData.id}`, formData);
        showToast("Follow-up updated", "success");
      } else {
        await api.post("/api/follow-ups", formData);
        showToast("Follow-up created", "success");
      }
      onSaved();
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            {isEditing ? "Edit Follow-up" : "Add Follow-up"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Lead ID *</label>
              <input
                type="text"
                required
                value={formData.lead_id}
                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                placeholder="LD-1024"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Lead Name *</label>
              <input
                type="text"
                required
                value={formData.lead_name}
                onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                placeholder="Ahmed Al-Mansoori"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Property</label>
            <input
              type="text"
              value={formData.property_title}
              onChange={(e) => setFormData({ ...formData, property_title: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="Villa #402, Palm Jumeirah"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Assigned To</label>
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                placeholder="John D."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Time</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                placeholder="2:00 PM"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Status</label>
            <div className="relative">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FollowUpStatus })}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
              placeholder="Discuss financing options"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
