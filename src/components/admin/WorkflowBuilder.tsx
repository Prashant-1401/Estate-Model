"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Plus, Edit2, Trash2, ChevronUp, ChevronDown, ArrowRight, Mail, MessageSquare, Bell, Clock, UserCheck, Filter, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Workflow } from "@/lib/types";

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const STEP_TYPES = [
  { value: "notification", label: "Notification", icon: Bell },
  { value: "email", label: "Send Email", icon: Mail },
  { value: "sms", label: "Send SMS", icon: MessageSquare },
  { value: "wait", label: "Wait / Delay", icon: Clock },
  { value: "assign", label: "Auto Assign", icon: UserCheck },
  { value: "condition", label: "Condition", icon: Filter },
];

const TRIGGER_EVENTS = [
  { value: "lead_created", label: "Lead Created" },
  { value: "lead_status_changed", label: "Status Changed" },
  { value: "follow_up_due", label: "Follow-up Due" },
  { value: "follow_up_overdue", label: "Follow-up Overdue" },
  { value: "property_added", label: "Property Added" },
  { value: "lead_assigned", label: "Lead Assigned" },
];

export function WorkflowBuilder({ isOpen, onClose, embedded = false }: WorkflowBuilderProps) {
  const { showToast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    entity_type: "lead",
    description: "",
    trigger_event: "lead_created",
    steps: [] as Workflow["steps"],
  });

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: Workflow[] }>("/api/workflows?per_page=100");
      setWorkflows(res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load workflows", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) void Promise.resolve().then(() => loadWorkflows());
  }, [isOpen, loadWorkflows]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Workflow name is required", "error");
      return;
    }
    try {
      const payload = {
        ...formData,
        steps: formData.steps.map((s, i) => ({
          ...s,
          sort_order: i,
        })),
      };
      if (editingWorkflow) {
        await api.put(`/api/workflows/${editingWorkflow.id}`, payload);
        showToast("Workflow updated", "success");
      } else {
        await api.post("/api/workflows", payload);
        showToast("Workflow created", "success");
      }
      setEditingWorkflow(null);
      setIsCreating(false);
      resetForm();
      loadWorkflows();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save workflow", "error");
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    if (!confirm(`Delete workflow "${workflow.name}"?`)) return;
    try {
      await api.delete(`/api/workflows/${workflow.id}`);
      showToast("Workflow deleted", "success");
      loadWorkflows();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete", "error");
    }
  };

  const toggleActive = async (workflow: Workflow) => {
    try {
      await api.put(`/api/workflows/${workflow.id}`, { is_active: !workflow.is_active });
      showToast(`Workflow ${workflow.is_active ? "deactivated" : "activated"}`, "success");
      loadWorkflows();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to toggle workflow", "error");
    }
  };

  const startEdit = async (workflow: Workflow) => {
    try {
      const full = await api.get<Workflow>(`/api/workflows/${workflow.id}`);
      setEditingWorkflow(full);
      setFormData({
        name: full.name,
        entity_type: full.entity_type,
        description: full.description,
        trigger_event: full.trigger_event,
        steps: full.steps || [],
      });
      setIsCreating(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load workflow", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      entity_type: "lead",
      description: "",
      trigger_event: "lead_created",
      steps: [],
    });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          id: "",
          workflow_id: "",
          name: "",
          step_type: "notification",
          action: "",
          config: {},
          sort_order: formData.steps.length,
          is_active: true,
        },
      ],
    });
  };

  const updateStep = (index: number, updates: Partial<typeof formData.steps[0]>) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index: number) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) });
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.steps.length) return;
    const newSteps = [...formData.steps];
    const [moved] = newSteps.splice(index, 1);
    newSteps.splice(newIndex, 0, moved);
    setFormData({ ...formData, steps: newSteps });
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
          className={embedded ? "bg-white w-full h-full flex flex-col" : "bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <GitBranch size={20} className="text-[#8B5CF6]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Workflow Builder</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Automate lead pipeline actions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingWorkflow(null);
                  resetForm();
                  setIsCreating(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Workflow</span>
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
                  {editingWorkflow ? "Edit Workflow" : "Create Workflow"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="e.g. New Lead Welcome"
                    />
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
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[#0F172A]">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[#0F172A]">Trigger Event</label>
                    <select
                      value={formData.trigger_event}
                      onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                    >
                      {TRIGGER_EVENTS.map((ev) => (
                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Steps */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#0F172A]">Workflow Steps ({formData.steps.length})</h4>
                    <button
                      onClick={addStep}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
                    >
                      <Plus size={12} />
                      Add Step
                    </button>
                  </div>

                  {formData.steps.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-[#E2E8F0] rounded-xl">
                      <GitBranch size={24} className="mx-auto text-[#64748B] mb-2" />
                      <p className="text-sm text-[#64748B]">No steps yet. Add your first workflow step.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.steps.map((step, index) => {
                        return (
                          <div key={index} className="flex items-start gap-2 p-3 bg-white border border-[#E2E8F0] rounded-xl">
                            <div className="flex flex-col items-center gap-1 pt-1">
                              <button
                                onClick={() => moveStep(index, -1)}
                                className="p-1 text-[#64748B] hover:bg-[#F8FAFC] rounded transition-colors disabled:opacity-30"
                                disabled={index === 0}
                              >
                                <ChevronUp size={12} />
                              </button>
                              <span className="w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              <button
                                onClick={() => moveStep(index, 1)}
                                className="p-1 text-[#64748B] hover:bg-[#F8FAFC] rounded transition-colors disabled:opacity-30"
                                disabled={index === formData.steps.length - 1}
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#64748B]">Step Name</label>
                                <input
                                  type="text"
                                  value={step.name}
                                  onChange={(e) => updateStep(index, { name: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                                  placeholder="e.g. Send welcome email"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#64748B]">Type</label>
                                <select
                                  value={step.step_type}
                                  onChange={(e) => updateStep(index, { step_type: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                                >
                                  {STEP_TYPES.map((st) => (
                                    <option key={st.value} value={st.value}>{st.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-[#64748B]">Action</label>
                                <input
                                  type="text"
                                  value={step.action}
                                  onChange={(e) => updateStep(index, { action: e.target.value })}
                                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                                  placeholder="e.g. send_welcome_template"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeStep(index)}
                              className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                            >
                              <Trash2 size={14} />
                            </button>
                            {index < formData.steps.length - 1 && (
                              <div className="absolute left-9 -bottom-2 text-[#64748B]">
                                <ArrowRight size={14} className="rotate-90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                  <button onClick={() => { setIsCreating(false); setEditingWorkflow(null); }} className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
                    {editingWorkflow ? "Update Workflow" : "Create Workflow"}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-16">
                <GitBranch size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No workflows</h3>
                <p className="text-[#64748B] mt-1 text-sm">Create your first automation workflow.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div key={wf.id} className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors">
                    <button
                      onClick={() => toggleActive(wf)}
                      className="flex items-center"
                      title={wf.is_active ? "Active - click to deactivate" : "Inactive - click to activate"}
                    >
                      {wf.is_active ? (
                        <ToggleRight size={24} className="text-[#22C55E]" />
                      ) : (
                        <ToggleLeft size={24} className="text-[#64748B]" />
                      )}
                    </button>
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <GitBranch size={18} className="text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">{wf.name}</p>
                      <p className="text-xs text-[#64748B]">{wf.entity_type} &middot; trigger: {wf.trigger_event} &middot; {wf.steps?.length || 0} steps</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${wf.is_active ? "bg-green-50 text-[#22C55E]" : "bg-gray-100 text-[#64748B]"}`}>
                      {wf.is_active ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(wf)} className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(wf)} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
