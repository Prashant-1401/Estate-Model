"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FormInput, Plus, GripVertical, Trash2, ChevronDown, ChevronUp,
  Type, Hash, Mail, Phone, Calendar, Clock, List, CheckSquare, Upload, MapPin, Edit2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { FormConfig, FormSection, FormField, FieldOption } from "@/lib/types";

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  formId?: string | null;
  entityType?: "lead" | "property" | "project";
}

const FIELD_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "number", label: "Number", icon: Hash },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "dropdown", label: "Dropdown", icon: List },
  { value: "multi_select", label: "Multi Select", icon: List },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "radio", label: "Radio Button", icon: List },
  { value: "date", label: "Date", icon: Calendar },
  { value: "time", label: "Time", icon: Clock },
  { value: "currency", label: "Currency", icon: Hash },
  { value: "textarea", label: "Text Area", icon: Type },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "location", label: "GPS Location", icon: MapPin },
];

export function FormBuilder({ isOpen, onClose, formId, entityType = "lead" }: FormBuilderProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sections, setSections] = useState<FormSection[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; field: FormField } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (formId) {
        loadForm(formId);
      } else {
        setForm(null);
        setFormName(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Form`);
        setFormDescription("");
        setSections([{
          id: `sec-${Date.now()}`,
          form_id: "",
          name: "Basic Information",
          description: "",
          sort_order: 0,
          fields: [],
        }]);
      }
    }
  }, [isOpen, formId]);

  const loadForm = async (id: string) => {
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
  };

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
    setEditingField({ sectionId, field: newField });
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          }
        : s
    ));
    if (editingField?.field.id === fieldId) {
      setEditingField({
        sectionId,
        field: { ...editingField.field, ...updates },
      });
    }
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

  const addOption = (sectionId: string, fieldId: string) => {
    const newOption: FieldOption = {
      id: `opt-${Date.now()}`,
      field_id: fieldId,
      label: "New Option",
      value: "new_option",
      sort_order: 0,
    };
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === fieldId ? { ...f, options: [...(f.options || []), newOption] } : f
            ),
          }
        : s
    ));
  };

  const updateOption = (sectionId: string, fieldId: string, optionId: string, updates: Partial<FieldOption>) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === fieldId
                ? {
                    ...f,
                    options: (f.options || []).map(o =>
                      o.id === optionId ? { ...o, ...updates } : o
                    ),
                  }
                : f
            ),
          }
        : s
    ));
  };

  const removeOption = (sectionId: string, fieldId: string, optionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === fieldId
                ? { ...f, options: (f.options || []).filter(o => o.id !== optionId) }
                : f
            ),
          }
        : s
    ));
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
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
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
              <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                <X size={20} className="text-[#64748B]" />
              </button>
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
                                  onClick={() => setEditingField({ sectionId: section.id, field })}
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
    </AnimatePresence>
  );
}
