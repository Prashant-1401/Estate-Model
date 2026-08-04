"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FormInput, FileText, Building2, FolderOpen } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { DynamicFormRenderer } from "./DynamicFormRenderer";
import { getEntityForms } from "@/lib/forms";
import type { FormConfig, FormData } from "@/lib/types";
import type { EntityType as FormEntityType } from "@/lib/form-keys";

interface DynamicEntityFormProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: FormEntityType;
  onSubmit: (data: FormData, entityType: FormEntityType) => Promise<void>;
}

const ENTITY_TITLES: Record<FormEntityType, string> = {
  lead: "Add New Lead",
  property: "Add New Property",
  project: "Add New Project",
};

const ENTITY_ICONS: Record<FormEntityType, React.ReactNode> = {
  lead: <FormInput size={20} className="text-[#2563EB]" />,
  property: <Building2 size={20} className="text-[#2563EB]" />,
  project: <FolderOpen size={20} className="text-[#2563EB]" />,
};

const ENTITY_BG: Record<FormEntityType, string> = {
  lead: "bg-blue-50",
  property: "bg-green-50",
  project: "bg-purple-50",
};

export function DynamicEntityForm({ isOpen, onClose, entityType, onSubmit }: DynamicEntityFormProps) {
  const { showToast } = useToast();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEntityForms(entityType);
      setForms(res);
      if (res.length === 1) {
        setSelectedFormId(res[0].id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  }, [entityType, showToast]);

  useEffect(() => {
    if (isOpen) {
      void Promise.resolve().then(() => loadForms());
    }
  }, [isOpen, entityType, loadForms]);

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
        onSubmit={(data) => onSubmit(data, entityType)}
        title={ENTITY_TITLES[entityType]}
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
              <div className={`w-10 h-10 ${ENTITY_BG[entityType]} rounded-xl flex items-center justify-center`}>
                {ENTITY_ICONS[entityType]}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">{ENTITY_TITLES[entityType]}</h2>
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
                  Create a {entityType} form in Form Builder first.
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