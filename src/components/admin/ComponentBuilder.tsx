"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { FormInput, GitBranch, Share2, Bell, Zap, Shield, Building2, FileText, Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { FormConfig } from "@/lib/types";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { StatusManager } from "@/components/admin/StatusManager";
import { LeadSourceManager } from "@/components/admin/LeadSourceManager";
import { NotificationManager } from "@/components/admin/NotificationManager";
import { WorkflowBuilder } from "@/components/admin/WorkflowBuilder";
import { RolesManager } from "@/components/admin/RolesManager";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";
import { CompanySettings } from "@/components/admin/CompanySettings";

type BuilderTab = "forms" | "statuses" | "lead-sources" | "notifications" | "workflows" | "roles" | "company";
type FormEntity = FormConfig["entity_type"];

const TABS: { id: BuilderTab; label: string; icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "forms", label: "Forms", icon: FormInput },
  { id: "statuses", label: "Statuses", icon: GitBranch },
  { id: "lead-sources", label: "Lead Sources", icon: Share2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "workflows", label: "Workflows", icon: Zap },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "company", label: "Company", icon: Building2 },
];

const ENTITIES: FormEntity[] = ["lead", "property", "project"];

export function ComponentBuilder() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<BuilderTab>("forms");
  const [formEntity, setFormEntity] = useState<FormEntity>("lead");
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const showFormBuilder = selectedFormId !== null || isCreatingForm;

  const loadForms = useCallback(async () => {
    try {
      setFormsLoading(true);
      const res = await api.get<{ items: FormConfig[] }>(`/api/forms?entity_type=${formEntity}&per_page=100`);
      setForms(res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load forms", "error");
    } finally {
      setFormsLoading(false);
    }
  }, [formEntity, showToast]);

  useEffect(() => {
    if (activeTab === "forms" && !showFormBuilder) {
      void Promise.resolve().then(() => loadForms());
    }
  }, [activeTab, showFormBuilder, loadForms]);

  const startCreateForm = () => {
    setIsCreatingForm(true);
    setSelectedFormId(null);
  };

  const startEditForm = (id: string) => {
    setIsCreatingForm(false);
    setSelectedFormId(id);
  };

  const exitFormBuilder = () => {
    setIsCreatingForm(false);
    setSelectedFormId(null);
  };

  const handleDeleteForm = async (id: string) => {
    if (!window.confirm("Delete this form? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/forms/${id}`);
      showToast("Form deleted", "success");
      await loadForms();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete form", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Component Builder</h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Configure forms, statuses, lead sources, notifications, workflows, roles &amp; permissions, and company settings
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "forms" &&
            (showFormBuilder ? (
              <div className="h-[calc(100vh-18rem)] min-h-[440px]">
                <FormBuilder
                  key={selectedFormId ?? "create"}
                  isOpen
                  embedded
                  entityType={formEntity}
                  formId={selectedFormId}
                  onClose={exitFormBuilder}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {ENTITIES.map((entity) => (
                      <button
                        key={entity}
                        onClick={() => setFormEntity(entity)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                          formEntity === entity
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
                        }`}
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={startCreateForm}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    <Plus size={16} />
                    Create Form
                  </button>
                </div>

                {formsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-16">
                    <FormInput size={48} className="mx-auto text-[#64748B] mb-4" />
                    <h3 className="text-lg font-medium text-[#0F172A]">No {formEntity} forms yet</h3>
                    <p className="text-[#64748B] mt-1 text-sm">Create your first {formEntity} form to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forms.map((form) => (
                      <div
                        key={form.id}
                        className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={18} className="text-[#2563EB]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#0F172A] truncate">{form.name}</p>
                            <p className="text-xs text-[#64748B] truncate">
                              {form.sections?.length || 0} sections{form.description ? ` — ${form.description}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEditForm(form.id)}
                            className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {activeTab === "statuses" && (
            <div className="h-[calc(100vh-18rem)] min-h-[440px]">
              <StatusManager isOpen embedded onClose={() => {}} />
            </div>
          )}

          {activeTab === "lead-sources" && (
            <div className="h-[calc(100vh-18rem)] min-h-[440px]">
              <LeadSourceManager isOpen embedded onClose={() => {}} />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="h-[calc(100vh-18rem)] min-h-[440px]">
              <NotificationManager isOpen embedded onClose={() => {}} />
            </div>
          )}

          {activeTab === "workflows" && (
            <div className="h-[calc(100vh-18rem)] min-h-[440px]">
              <WorkflowBuilder isOpen embedded onClose={() => {}} />
            </div>
          )}

          {activeTab === "roles" && (
            <div className="h-[calc(100vh-12rem)] min-h-[520px] overflow-y-auto space-y-6">
              <RolesManager isOpen embedded onClose={() => {}} />
              <div className="border-t border-[#E2E8F0]" />
              <PermissionsMatrix isOpen embedded onClose={() => {}} />
            </div>
          )}

          {activeTab === "company" && (
            <div className="h-[calc(100vh-12rem)] min-h-[440px]">
              <CompanySettings isOpen embedded onClose={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
