"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Plus, Edit2, Trash2, FileText, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { NotificationTemplate, NotificationRule } from "@/lib/types";

interface NotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export function NotificationManager({ isOpen, onClose, embedded = false }: NotificationManagerProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"templates" | "rules">("templates");
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<NotificationTemplate | NotificationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    channel: "email",
    subject: "",
    body: "",
    variables: [] as string[],
  });

  const [ruleForm, setRuleForm] = useState({
    name: "",
    trigger_event: "lead_created",
    template_id: "",
    recipients: [] as string[],
    conditions: {} as Record<string, unknown>,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([
        api.get<{ items: NotificationTemplate[] }>("/api/notifications/templates?per_page=100"),
        api.get<{ items: NotificationRule[] }>("/api/notifications/rules?per_page=100"),
      ]);
      setTemplates(tRes.items || []);
      setRules(rRes.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) void Promise.resolve().then(() => loadData());
  }, [isOpen, loadData]);

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    try {
      if (editingItem) {
        await api.put(`/api/notifications/templates/${editingItem.id}`, templateForm);
        showToast("Template updated", "success");
      } else {
        await api.post("/api/notifications/templates", templateForm);
        showToast("Template created", "success");
      }
      setEditingItem(null);
      setIsCreating(false);
      setTemplateForm({ name: "", channel: "email", subject: "", body: "", variables: [] });
      loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save template", "error");
    }
  };

  const handleSaveRule = async () => {
    if (!ruleForm.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    try {
      if (editingItem) {
        await api.put(`/api/notifications/rules/${editingItem.id}`, ruleForm);
        showToast("Rule updated", "success");
      } else {
        await api.post("/api/notifications/rules", ruleForm);
        showToast("Rule created", "success");
      }
      setEditingItem(null);
      setIsCreating(false);
      setRuleForm({ name: "", trigger_event: "lead_created", template_id: "", recipients: [], conditions: {} });
      loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save rule", "error");
    }
  };

  const handleDelete = async (type: "templates" | "rules", id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/notifications/${type}/${id}`);
      showToast(`Deleted ${type.slice(0, -1)}`, "success");
      loadData();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete", "error");
    }
  };

  const startEditTemplate = (t: NotificationTemplate) => {
    setEditingItem(t);
    setTemplateForm({
      name: t.name,
      channel: t.channel,
      subject: t.subject,
      body: t.body,
      variables: t.variables || [],
    });
    setIsCreating(true);
  };

  const startEditRule = (r: NotificationRule) => {
    setEditingItem(r);
    setRuleForm({
      name: r.name,
      trigger_event: r.trigger_event,
      template_id: r.template_id,
      recipients: r.recipients || [],
      conditions: r.conditions || {},
    });
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
          className={embedded ? "bg-white w-full h-full flex flex-col" : "bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-[#F97316]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Notifications</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage templates and automation rules</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsCreating(true);
                  if (tab === "templates") {
                    setTemplateForm({ name: "", channel: "email", subject: "", body: "", variables: [] });
                  } else {
                    setRuleForm({ name: "", trigger_event: "lead_created", template_id: "", recipients: [], conditions: {} });
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add {tab === "templates" ? "Template" : "Rule"}</span>
              </button>
              {!embedded && (
                <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          <div className="flex border-b border-[#E2E8F0] shrink-0">
            <button
              onClick={() => { setTab("templates"); setIsCreating(false); setEditingItem(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "templates"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <FileText size={16} />
              Templates ({templates.length})
            </button>
            <button
              onClick={() => { setTab("rules"); setIsCreating(false); setEditingItem(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "rules"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Zap size={16} />
              Rules ({rules.length})
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Templates Tab */}
                {tab === "templates" && (
                  <>
                    {isCreating && (
                      <div className="mb-6 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                          {editingItem ? "Edit Template" : "Create Template"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Name *</label>
                            <input
                              type="text"
                              value={templateForm.name}
                              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                              placeholder="e.g. New Lead Notification"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Channel</label>
                            <select
                              value={templateForm.channel}
                              onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                            >
                              <option value="email">Email</option>
                              <option value="sms">SMS</option>
                              <option value="push">Push</option>
                              <option value="whatsapp">WhatsApp</option>
                            </select>
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-[#0F172A]">Subject</label>
                            <input
                              type="text"
                              value={templateForm.subject}
                              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                              placeholder="e.g. New lead: {{lead_name}}"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-[#0F172A]">Body</label>
                            <textarea
                              value={templateForm.body}
                              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                              rows={5}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono"
                              placeholder="Use {{variable_name}} for dynamic content"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-[#0F172A]">Variables (comma-separated)</label>
                            <input
                              type="text"
                              value={templateForm.variables.join(", ")}
                              onChange={(e) => setTemplateForm({
                                ...templateForm,
                                variables: e.target.value.split(",").map(v => v.trim()).filter(Boolean),
                              })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                              placeholder="e.g. lead_name, agent_name, property_name"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => { setIsCreating(false); setEditingItem(null); }} className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
                          <button onClick={handleSaveTemplate} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
                            {editingItem ? "Update" : "Create"}
                          </button>
                        </div>
                      </div>
                    )}

                    {templates.length === 0 ? (
                      <div className="text-center py-16">
                        <FileText size={48} className="mx-auto text-[#64748B] mb-4" />
                        <h3 className="text-lg font-medium text-[#0F172A]">No templates</h3>
                        <p className="text-[#64748B] mt-1 text-sm">Create notification templates with variables.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {templates.map((t) => (
                          <div key={t.id} className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors">
                            <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
                              <FileText size={18} className="text-[#64748B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#0F172A]">{t.name}</p>
                              <p className="text-xs text-[#64748B]">{t.channel} &middot; {t.variables?.length || 0} variables</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? "bg-green-50 text-[#22C55E]" : "bg-gray-100 text-[#64748B]"}`}>
                              {t.is_active ? "Active" : "Inactive"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditTemplate(t)} className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete("templates", t.id, t.name)} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Rules Tab */}
                {tab === "rules" && (
                  <>
                    {isCreating && (
                      <div className="mb-6 p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                          {editingItem ? "Edit Rule" : "Create Rule"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Name *</label>
                            <input
                              type="text"
                              value={ruleForm.name}
                              onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                              placeholder="e.g. Notify on new lead"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Trigger Event</label>
                            <select
                              value={ruleForm.trigger_event}
                              onChange={(e) => setRuleForm({ ...ruleForm, trigger_event: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                            >
                              <option value="lead_created">Lead Created</option>
                              <option value="lead_status_changed">Lead Status Changed</option>
                              <option value="follow_up_due">Follow-up Due</option>
                              <option value="follow_up_overdue">Follow-up Overdue</option>
                              <option value="property_added">Property Added</option>
                              <option value="lead_assigned">Lead Assigned</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Template</label>
                            <select
                              value={ruleForm.template_id}
                              onChange={(e) => setRuleForm({ ...ruleForm, template_id: e.target.value })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none"
                            >
                              <option value="">Select template...</option>
                              {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#0F172A]">Recipients (comma-separated)</label>
                            <input
                              type="text"
                              value={ruleForm.recipients.join(", ")}
                              onChange={(e) => setRuleForm({
                                ...ruleForm,
                                recipients: e.target.value.split(",").map(v => v.trim()).filter(Boolean),
                              })}
                              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                              placeholder="e.g. admin, manager, assigned_agent"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => { setIsCreating(false); setEditingItem(null); }} className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
                          <button onClick={handleSaveRule} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
                            {editingItem ? "Update" : "Create"}
                          </button>
                        </div>
                      </div>
                    )}

                    {rules.length === 0 ? (
                      <div className="text-center py-16">
                        <Zap size={48} className="mx-auto text-[#64748B] mb-4" />
                        <h3 className="text-lg font-medium text-[#0F172A]">No rules</h3>
                        <p className="text-[#64748B] mt-1 text-sm">Create rules to trigger notifications automatically.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rules.map((r) => (
                          <div key={r.id} className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors">
                            <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
                              <Zap size={18} className="text-[#F59E0B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#0F172A]">{r.name}</p>
                              <p className="text-xs text-[#64748B]">trigger: {r.trigger_event} &middot; {r.recipients?.length || 0} recipients</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_active ? "bg-green-50 text-[#22C55E]" : "bg-gray-100 text-[#64748B]"}`}>
                              {r.is_active ? "Active" : "Inactive"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditRule(r)} className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete("rules", r.id, r.name)} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
