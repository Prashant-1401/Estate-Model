"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ListChecks, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { DROPDOWN_CATEGORIES } from "@/lib/dropdowns";
import type { DropdownCategory, DropdownOption } from "@/lib/types";

interface DropdownBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const COLORS = [
  "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
  "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#6366F1",
];

export function DropdownBuilder({ isOpen, onClose, embedded = false }: DropdownBuilderProps) {
  const { showToast } = useToast();
  const [category, setCategory] = useState<DropdownCategory>("budget");
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    value: "",
    color: "",
  });

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: DropdownOption[] }>(
        `/api/dropdowns?per_page=100&category=${category}`
      );
      setOptions(res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load dropdown options", "error");
    } finally {
      setLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => {
    if (isOpen) void Promise.resolve().then(() => loadOptions());
  }, [isOpen, loadOptions]);

  const switchCategory = (next: DropdownCategory) => {
    setCategory(next);
    setEditingOption(null);
    setIsCreating(false);
    setFormData({ label: "", value: "", color: "" });
  };

  const handleSave = async () => {
    if (!formData.label.trim() || !formData.value.trim()) {
      showToast("Label and value are required", "error");
      return;
    }
    const payload = {
      category,
      label: formData.label.trim(),
      value: formData.value.trim(),
      color: formData.color,
      sort_order: editingOption ? editingOption.sort_order : options.length,
    };
    try {
      if (editingOption) {
        await api.put(`/api/dropdowns/${editingOption.id}`, payload);
        showToast("Option updated", "success");
      } else {
        await api.post("/api/dropdowns", payload);
        showToast("Option created", "success");
      }
      setEditingOption(null);
      setIsCreating(false);
      setFormData({ label: "", value: "", color: "" });
      loadOptions();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save option", "error");
    }
  };

  const handleDelete = async (option: DropdownOption) => {
    if (!confirm(`Delete "${option.label}"? Records using this value will keep it.`)) return;
    try {
      await api.delete(`/api/dropdowns/${option.id}`);
      showToast("Option deleted", "success");
      loadOptions();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete option", "error");
    }
  };

  const startEdit = (option: DropdownOption) => {
    setEditingOption(option);
    setFormData({ label: option.label, value: option.value, color: option.color });
    setIsCreating(true);
  };

  const startCreate = () => {
    setEditingOption(null);
    setFormData({ label: "", value: "", color: "" });
    setIsCreating(true);
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
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <ListChecks size={20} className="text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Dropdown Builder</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Edit the dropdown values used across the app</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startCreate}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Option</span>
              </button>
              {!embedded && (
                <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {DROPDOWN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.id
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {isCreating && (
              <div className="mb-6 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  {editingOption ? "Edit Option" : "Create Option"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Label *</label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. ₹1Cr - ₹1.5Cr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Value *</label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. ₹1Cr - ₹1.5Cr"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setFormData({ ...formData, color: "" })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          formData.color === "" ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-[#E2E8F0] text-[#64748B] bg-white"
                        }`}
                      >
                        None
                      </button>
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
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingOption(null);
                    }}
                    className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    {editingOption ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-16">
                <ListChecks size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No options configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">Add your first option to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option, i) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {/* move up */}
                        }
                        className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                        disabled={i === 0}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => {/* move down */}
                        }
                        className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                        disabled={i === options.length - 1}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    {option.color ? (
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#E2E8F0] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">{option.label}</p>
                      <p className="text-xs text-[#64748B]">{option.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(option)}
                        className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(option)}
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
