"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Type, Hash, Mail, Phone, Calendar, Clock,
  List, CheckSquare, Upload, MapPin, DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { FormConfig, FormField, FieldOption } from "@/lib/types";

interface DynamicFormRendererProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  title?: string;
}

const FIELD_ICONS: Record<string, any> = {
  text: Type,
  number: Hash,
  email: Mail,
  phone: Phone,
  date: Calendar,
  time: Clock,
  dropdown: List,
  multi_select: List,
  checkbox: CheckSquare,
  radio: List,
  currency: DollarSign,
  textarea: Type,
  file: Upload,
  location: MapPin,
};

export function DynamicFormRenderer({
  isOpen,
  onClose,
  formId,
  initialData = {},
  onSubmit,
  title,
}: DynamicFormRendererProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && formId) {
      loadForm();
    }
  }, [isOpen, formId]);

  useEffect(() => {
    if (form) {
      const defaults: Record<string, any> = {};
      form.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (initialData[field.label] !== undefined) {
            defaults[field.id] = initialData[field.label];
          } else if (field.default_value) {
            defaults[field.id] = field.default_value;
          } else if (field.field_type === "checkbox") {
            defaults[field.id] = false;
          } else {
            defaults[field.id] = "";
          }
        });
      });
      setFormData(defaults);
    }
  }, [form, initialData]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await api.get<FormConfig>(`/api/forms/${formId}/render`);
      setForm(data);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load form", "error");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form) return false;

    form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.is_required) {
          const value = formData[field.id];
          if (value === undefined || value === null || value === "") {
            newErrors[field.id] = `${field.label} is required`;
          }
        }
        if (formData[field.id] && field.validation_rules) {
          const rules = field.validation_rules;
          const value = String(formData[field.id]);
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            newErrors[field.id] = rules.message || `Invalid ${field.label}`;
          }
          if (rules.min_length && value.length < rules.min_length) {
            newErrors[field.id] = `Minimum ${rules.min_length} characters`;
          }
          if (rules.max_length && value.length > rules.max_length) {
            newErrors[field.id] = `Maximum ${rules.max_length} characters`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the errors", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, any> = {};
      if (form) {
        form.sections.forEach((section) => {
          section.fields.forEach((field) => {
            payload[field.label] = formData[field.id];
          });
        });
      }
      await onSubmit(payload);
      showToast("Form submitted successfully", "success");
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const Icon = FIELD_ICONS[field.field_type] || Type;
    const value = formData[field.id] ?? "";
    const error = errors[field.id];

    const baseInputClass = `w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border ${
      error ? "border-red-500" : "border-[#E2E8F0]"
    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all`;

    const handleChange = (newValue: any) => {
      setFormData({ ...formData, [field.id]: newValue });
      if (errors[field.id]) {
        setErrors({ ...errors, [field.id]: "" });
      }
    };

    switch (field.field_type) {
      case "text":
      case "email":
      case "phone":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type={field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : "text"}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.is_read_only}
                className={baseInputClass}
              />
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "number":
      case "currency":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.is_read_only}
                className={baseInputClass}
              />
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <select
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={field.is_read_only}
                className={`${baseInputClass} appearance-none`}
              >
                <option value="">{field.placeholder || "Select..."}</option>
                {(field.options || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="flex flex-wrap gap-3">
              {(field.options || []).map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={field.is_read_only}
                    className="text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#0F172A]">{opt.label}</span>
                </label>
              ))}
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={field.is_read_only}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <span className="text-sm font-medium text-[#0F172A]">
                {field.label} {field.is_required && "*"}
              </span>
            </label>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "date":
      case "time":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type={field.field_type}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                readOnly={field.is_read_only}
                className={baseInputClass}
              />
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              readOnly={field.is_read_only}
              rows={3}
              className={`w-full px-4 py-2.5 bg-[#F8FAFC] border ${
                error ? "border-red-500" : "border-[#E2E8F0]"
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none`}
            />
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      handleChange(ev.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={field.is_read_only}
                className={`${baseInputClass} file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#2563EB] file:text-white hover:file:bg-[#1D4ED8]`}
              />
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "location":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={field.placeholder || "Enter location"}
                readOnly={field.is_read_only}
                className={baseInputClass}
              />
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case "multi_select":
        return (
          <div key={field.id} className="space-y-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              {field.label} {field.is_required && "*"}
            </label>
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map((opt) => {
                const selected = Array.isArray(value) && value.includes(opt.value);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(value) ? value : [];
                      if (selected) {
                        handleChange(current.filter((v: string) => v !== opt.value));
                      } else {
                        handleChange([...current, opt.value]);
                      }
                    }}
                    disabled={field.is_read_only}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      selected
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {field.help_text && <p className="text-xs text-[#64748B]">{field.help_text}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
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
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">
                {title || form?.name || "Form"}
              </h2>
              {form?.description && (
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{form.description}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !form ? (
              <div className="text-center py-16">
                <p className="text-[#64748B]">Form not found or inactive.</p>
              </div>
            ) : (
              form.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  {section.name && (
                    <h3 className="text-sm font-semibold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                      {section.name}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.fields
                      .filter((f) => !f.is_hidden)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((field) => renderField(field))}
                  </div>
                </div>
              ))
            )}

            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Save size={18} />
                )}
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
