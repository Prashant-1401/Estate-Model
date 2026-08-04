"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FormInput, Plus, GripVertical, Trash2, ChevronDown, ChevronUp, Edit2,
  Save,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { FormConfig, FormSection, FormField } from "@/lib/types";
import { ENTITY_FIELDS } from "@/lib/form-keys";

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: string | null;
  entityType?: "lead" | "property" | "project";
  embedded?: boolean;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "dropdown", label: "Dropdown" },
  { value: "multi_select", label: "Multi Select" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "textarea", label: "Textarea" },
  { value: "file", label: "File Upload" },
  { value: "location", label: "Location" },
  { value: "agent", label: "Assign to Agent" },
  { value: "project", label: "Link to Project" },
] as const;

export function FormBuilder({ isOpen, onClose, formId, entityType = "lead", embedded = false }: FormBuilderProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sections, setSections] = useState<FormSection[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; field: FormField } | null>(null);
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false);
  const [fieldDraft, setFieldDraft] = useState<FormField | null>(null);

  const openFieldEditor = (sectionId: string, field: FormField) => {
    setEditingField({ sectionId, field });
    setFieldDraft({ ...field });
    setFieldEditorOpen(true);
  };

  const closeFieldEditor = () => {
    setFieldEditorOpen(false);
    setEditingField(null);
    setFieldDraft(null);
  };

  const saveFieldDraft = () => {
    if (!editingField || !fieldDraft) return;
    setSections(sections.map(s =>
      s.id === editingField.sectionId
        ? { ...s, fields: s.fields.map(f => (f.id === fieldDraft.id ? fieldDraft : f)) }
        : s
    ));
    closeFieldEditor();
  };

  const loadForm = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await api.get<FormConfig>(`/api/forms/${id}`);
      setForm(data);
      setFormName(data.name);
      setFormDescription(data.description);
      setSections(data.sections || []);
      if (data.sections?.length > 0) {
        setExpandedSection(data.sections[0].id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load form", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen && formId) {
      void Promise.resolve().then(() => loadForm(formId));
    }
  }, [isOpen, formId, loadForm]);

  const sessionToken = isOpen ? (formId ? `edit:${formId}` : "create") : null;
  const [lastSession, setLastSession] = useState<string | null>(null);
  if (sessionToken && lastSession !== sessionToken) {
    setLastSession(sessionToken);
    if (!formId) {
      setForm(null);
      setFormName(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Form`);
      setFormDescription("");
      setSections([{
        id: "sec-initial",
        form_id: "",
        name: "Basic Information",
        description: "",
        sort_order: 0,
        fields: [],
      }]);
    }
  }

  const addSection = () => {
    const newSection: FormSection = {
      id: `sec-${Date.now()}`,
      form_id: form?.id || "",
      name: `Section ${sections.length + 1}`,
      description: "",
      sort_order: sections.length,
      fields: [],
    };
    setSections([...sections, newSection]);
    setExpandedSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) {
      showToast("Form must have at least one section", "error");
      return;
    }
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addField = (sectionId: string) => {
    const newField: FormField = {
      id: `fld-${Date.now()}`,
      section_id: sectionId,
      field_type: "text",
      label: "New Field",
      placeholder: "",
      help_text: "",
      default_value: "",
      is_required: false,
      is_read_only: false,
      is_hidden: false,
      sort_order: 0,
      validation_rules: {},
      options: [],
    };
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
    ));
    openFieldEditor(sectionId, newField);
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s
    ));
    if (editingField?.field.id === fieldId) {
      setEditingField(null);
    }
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sections.length - 1) return;
    const newSections = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections.map((s, i) => ({ ...s, sort_order: i })));
  };

  const moveField = (sectionId: string, fieldId: string, direction: "up" | "down") => {
    setSections(sections.map(s => {
      if (s.id !== sectionId) return s;
      const idx = s.fields.findIndex(f => f.id === fieldId);
      if (idx === -1) return s;
      if (direction === "up" && idx === 0) return s;
      if (direction === "down" && idx === s.fields.length - 1) return s;
      const newFields = [...s.fields];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newFields[idx], newFields[swapIdx]] = [newFields[swapIdx], newFields[idx]];
      return { ...s, fields: newFields.map((f, i) => ({ ...f, sort_order: i })) };
    }));
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast("Form name is required", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: formName,
        entity_type: entityType,
        description: formDescription,
        sections: sections.map((s, i) => ({
          ...s,
          sort_order: i,
          fields: s.fields.map((f, fi) => ({
            ...f,
            sort_order: fi,
            options: f.options || [],
          })),
        })),
      };

      if (formId) {
        await api.put(`/api/forms/${formId}`, payload);
        showToast("Form updated", "success");
      } else {
        await api.post("/api/forms", payload);
        showToast("Form created", "success");
      }
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save form", "error");
    } finally {
      setSaving(false);
    }
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
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FormInput size={20} className="text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">
                  {formId ? "Edit Form" : "Create Form"}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  {entityType.charAt(0).toUpperCase() + entityType.slice(1)} form builder
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Form"}
              </button>
              {!embedded && (
                <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Form Details */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Form Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      placeholder="Lead Capture Form"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Description</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
                      placeholder="Form description..."
                    />
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0F172A]">Sections</h3>
                    <button
                      onClick={addSection}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      Add Section
                    </button>
                  </div>

                  {sections.map((section) => (
                    <div key={section.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      <div
                        className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] cursor-pointer"
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical size={16} className="text-[#64748B]" />
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateSection(section.id, { name: e.target.value });
                            }}
                            className="bg-transparent font-medium text-[#0F172A] text-sm border-none focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "up");
                            }}
                            className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors disabled:opacity-30"
                            title="Move up"
                            disabled={sections.indexOf(section) === 0}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "down");
                            }}
                            className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg transition-colors disabled:opacity-30"
                            title="Move down"
                            disabled={sections.indexOf(section) === sections.length - 1}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addField(section.id);
                            }}
                            className="p-1.5 text-[#2563EB] hover:bg-blue-100 rounded-lg transition-colors"
                            title="Add field"
                          >
                            <Plus size={14} />
                          </button>
                          {sections.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSection(section.id);
                              }}
                              className="p-1.5 text-[#EF4444] hover:bg-red-100 rounded-lg transition-colors"
                              title="Remove section"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {expandedSection === section.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {expandedSection === section.id && (
                        <div className="p-4 space-y-3">
                          {section.fields.length === 0 ? (
                            <p className="text-sm text-[#64748B] text-center py-4">
                              No fields yet. Click + to add one.
                            </p>
                          ) : (
                            section.fields.map((field, fieldIdx) => (
                              <div
                                key={field.id}
                                className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg"
                              >
                                <GripVertical size={14} className="text-[#64748B]" />
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveField(section.id, field.id, "up")}
                                    className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                                    title="Move up"
                                    disabled={fieldIdx === 0}
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => moveField(section.id, field.id, "down")}
                                    className="p-1 text-[#64748B] hover:bg-[#E2E8F0] rounded transition-colors disabled:opacity-30"
                                    title="Move down"
                                    disabled={fieldIdx === section.fields.length - 1}
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#0F172A] truncate">{field.label}</p>
                                  <p className="text-xs text-[#64748B]">{field.field_type}</p>
                                </div>
                                {field.is_required && (
                                  <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-xs">Required</span>
                                )}
                                <button
                                  onClick={() => openFieldEditor(section.id, field)}
                                  className="p-1.5 text-[#2563EB] hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeField(section.id, field.id)}
                                  className="p-1.5 text-[#EF4444] hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Field Editor Modal */}
      <AnimatePresence>
        {fieldEditorOpen && fieldDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={closeFieldEditor}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#E2E8F0] shrink-0">
                <h3 className="text-lg font-semibold text-[#0F172A]">Edit Field</h3>
                <button onClick={closeFieldEditor} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Label *</label>
                  <input
                    type="text"
                    value={fieldDraft.label}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, label: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Field label"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Field Type *</label>
                  <select
                    value={fieldDraft.field_type}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, field_type: e.target.value, options: ["dropdown", "multi_select", "radio"].includes(e.target.value) ? fieldDraft.options || [] : [] })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Placeholder</label>
                  <input
                    type="text"
                    value={fieldDraft.placeholder}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, placeholder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Placeholder text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Help Text</label>
                  <input
                    type="text"
                    value={fieldDraft.help_text}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, help_text: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Help text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Default Value</label>
                  <input
                    type="text"
                    value={fieldDraft.default_value}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, default_value: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="Default value"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="required"
                    checked={fieldDraft.is_required}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, is_required: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                  />
                  <label htmlFor="required" className="text-sm font-medium text-[#0F172A]">Required</label>
                  <input
                    type="checkbox"
                    id="hidden"
                    checked={fieldDraft.is_hidden}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, is_hidden: e.target.checked })}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                  />
                  <label htmlFor="hidden" className="text-sm font-medium text-[#0F172A]">Hidden</label>
                </div>
                {["dropdown", "multi_select", "radio"].includes(fieldDraft.field_type) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F172A]">Options</label>
                    {(fieldDraft.options || []).map((opt, idx) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(fieldDraft.options || [])];
                            newOpts[idx] = { ...opt, label: e.target.value };
                            setFieldDraft({ ...fieldDraft, options: newOpts });
                          }}
                          placeholder="Label"
                          className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                        <input
                          type="text"
                          value={opt.value}
                          onChange={(e) => {
                            const newOpts = [...(fieldDraft.options || [])];
                            newOpts[idx] = { ...opt, value: e.target.value };
                            setFieldDraft({ ...fieldDraft, options: newOpts });
                          }}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = (fieldDraft.options || []).filter((_, i) => i !== idx);
                            setFieldDraft({ ...fieldDraft, options: newOpts });
                          }}
                          className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOpt = { id: `opt-${Date.now()}`, field_id: fieldDraft.id, label: "", value: "", sort_order: (fieldDraft.options || []).length };
                        setFieldDraft({ ...fieldDraft, options: [...(fieldDraft.options || []), newOpt] });
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">Map to Data Field</label>
                  <select
                    value={(fieldDraft.metadata?.key as string) || ""}
                    onChange={(e) => setFieldDraft({ ...fieldDraft, metadata: { ...fieldDraft.metadata, key: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">-- Select a field to map --</option>
                    {ENTITY_FIELDS[entityType].map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-[#64748B]">Select which data field this form field maps to for submissions.</p>
                </div>
              </div>
              <div className="flex gap-3 px-4 py-4 border-t border-[#E2E8F0] shrink-0">
                <button
                  onClick={closeFieldEditor}
                  className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFieldDraft}
                  className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Field
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
