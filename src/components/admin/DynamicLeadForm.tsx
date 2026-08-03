"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FormInput, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import type { FormConfig } from "@/lib/types";

interface DynamicLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function DynamicLeadForm({ isOpen, onClose, onSubmit }: DynamicLeadFormProps) {
  const { showToast } = useToast();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadForms();
    }
  }, [isOpen]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ items: FormConfig[] }>("/api/forms/all?entity_type=lead");
      setForms(res.items || []);
      if (res.items?.length === 1) {
        setSelectedFormId(res.items[0].id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (selectedFormId) {
    return (
      <DynamicFormRenderer
        isOpen={true}
        onClose={() => {
          setSelectedFormId(null);
          onClose();
        }}
        formId={selectedFormId}
        onSubmit={onSubmit}
        title="Add New Lead"
      />
    );
  }

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
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FormInput size={20} className="text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Add New Lead</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Select a form to use</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-16">
                <FileText size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No forms configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">
                  Create a lead form in Form Builder first.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {forms.map((form) => (
                  <button
                    key={form.id}
                    onClick={() => setSelectedFormId(form.id)}
                    className="w-full p-4 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/30 transition-colors text-left"
                  >
                    <h4 className="font-medium text-[#0F172A]">{form.name}</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      {form.sections?.length || 0} sections • {form.description || "No description"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
