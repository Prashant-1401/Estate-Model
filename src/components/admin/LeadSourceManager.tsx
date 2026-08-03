"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Plus, Edit2, Trash2, Globe, Mail, MessageSquare, Building, Users, UserPlus, Footprints } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { LeadSource } from "@/lib/types";

interface LeadSourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const ICON_OPTIONS = [
  { value: "Globe", label: "Globe", icon: Globe },
  { value: "Mail", label: "Email", icon: Mail },
  { value: "MessageSquare", label: "SMS", icon: MessageSquare },
  { value: "Building", label: "Building", icon: Building },
  { value: "Users", label: "Users", icon: Users },
  { value: "UserPlus", label: "User Plus", icon: UserPlus },
  { value: "Footprints", label: "Walk-in", icon: Footprints },
];

export function LeadSourceManager({ isOpen, onClose, embedded = false }: LeadSourceManagerProps) {
  const { showToast } = useToast();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Globe",
  });

  const loadSources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: LeadSource[] }>("/api/config/lead-sources?per_page=100");
      setSources(res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load sources", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) void Promise.resolve().then(() => loadSources());
  }, [isOpen, loadSources]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      showToast("Name and slug are required", "error");
      return;
    }
    try {
      if (editingSource) {
        await api.put(`/api/config/lead-sources/${editingSource.id}`, formData);
        showToast("Source updated", "success");
      } else {
        await api.post("/api/config/lead-sources", formData);
        showToast("Source created", "success");
      }
      setEditingSource(null);
      setIsCreating(false);
      setFormData({ name: "", slug: "", description: "", icon: "Globe" });
      loadSources();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save source", "error");
    }
  };

  const handleDelete = async (source: LeadSource) => {
    if (!confirm(`Delete source "${source.name}"?`)) return;
    try {
      await api.delete(`/api/config/lead-sources/${source.id}`);
      showToast("Source deleted", "success");
      loadSources();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete source", "error");
    }
  };

  const startEdit = (source: LeadSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      slug: source.slug,
      description: source.description,
      icon: source.icon,
    });
    setIsCreating(true);
  };

  const startCreate = () => {
    setEditingSource(null);
    setFormData({ name: "", slug: "", description: "", icon: "Globe" });
    setIsCreating(true);
  };

  const getIcon = (iconName: string) => {
    const found = ICON_OPTIONS.find((o) => o.value === iconName);
    return found ? found.icon : Globe;
  };

  if (!isOpen && !embedded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={embedded ? "flex flex-col h-full" : "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4"}
        onClick={embedded ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={embedded ? "bg-white w-full h-full flex flex-col" : "bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Share2 size={20} className="text-[#22C55E]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Lead Sources</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Configure where your leads come from</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startCreate}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Source</span>
              </button>
              {!embedded && (
                <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isCreating && (
              <div className="mb-6 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  {editingSource ? "Edit Source" : "Create Source"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. Google Ads"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. google-ads"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Icon</label>
                    <div className="flex gap-2">
                      {ICON_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setFormData({ ...formData, icon: opt.value })}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                              formData.icon === opt.value
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB]/30"
                            }`}
                            title={opt.label}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingSource(null);
                    }}
                    className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    {editingSource ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sources.length === 0 ? (
              <div className="text-center py-16">
                <Share2 size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No sources configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">Create your first lead source to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sources.map((source) => {
                  const Icon = getIcon(source.icon);
                  return (
                    <div
                      key={source.id}
                      className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
                        <Icon size={18} className="text-[#64748B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0F172A]">{source.name}</p>
                        <p className="text-xs text-[#64748B]">{source.slug}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(source)}
                          className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(source)}
                          className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
