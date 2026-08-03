"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Plus, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { StatusConfig } from "@/lib/types";

interface StatusManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
  "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#6366F1",
];

export function StatusManager({ isOpen, onClose }: StatusManagerProps) {
  const { showToast } = useToast();
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    color: "#3B82F6",
    entity_type: "lead",
  });

  useEffect(() => {
    if (isOpen) loadStatuses();
  }, [isOpen]);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: StatusConfig[] }>("/api/config/statuses?per_page=100");
      setStatuses(res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load statuses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      showToast("Name and slug are required", "error");
      return;
    }
    try {
      if (editingStatus) {
        await api.put(`/api/config/statuses/${editingStatus.id}`, formData);
        showToast("Status updated", "success");
      } else {
        await api.post("/api/config/statuses", formData);
        showToast("Status created", "success");
      }
      setEditingStatus(null);
      setIsCreating(false);
      setFormData({ name: "", slug: "", color: "#3B82F6", entity_type: "lead" });
      loadStatuses();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save status", "error");
    }
  };

  const handleDelete = async (status: StatusConfig) => {
    if (!confirm(`Delete status "${status.name}"?`)) return;
    try {
      await api.delete(`/api/config/statuses/${status.id}`);
      showToast("Status deleted", "success");
      loadStatuses();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete status", "error");
    }
  };

  const startEdit = (status: StatusConfig) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      slug: status.slug,
      color: status.color,
      entity_type: status.entity_type,
    });
    setIsCreating(true);
  };

  const startCreate = () => {
    setEditingStatus(null);
    setFormData({ name: "", slug: "", color: "#3B82F6", entity_type: "lead" });
    setIsCreating(true);
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
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <GitBranch size={20} className="text-[#6366F1]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Status Management</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Configure lead pipeline stages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startCreate}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Status</span>
              </button>
              <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isCreating && (
              <div className="mb-6 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  {editingStatus ? "Edit Status" : "Create Status"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. Contacted"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. contacted"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-lg transition-all ${
                            formData.color === color ? "ring-2 ring-offset-2 ring-[#2563EB]" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Entity Type</label>
                    <select
                      value={formData.entity_type}
                      onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                    >
                      <option value="lead">Lead</option>
                      <option value="property">Property</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingStatus(null);
                    }}
                    className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    {editingStatus ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : statuses.length === 0 ? (
              <div className="text-center py-16">
                <GitBranch size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No statuses configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">Create your first status to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {statuses.map((status, i) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {/* move up */}}
                        className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                        disabled={i === 0}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => {/* move down */}}
                        className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                        disabled={i === statuses.length - 1}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">{status.name}</p>
                      <p className="text-xs text-[#64748B]">{status.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(status)}
                        className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(status)}
                        className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
