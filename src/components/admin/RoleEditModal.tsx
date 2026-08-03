"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Save, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { RoleConfig, Permission, Module } from "@/lib/types";

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleConfig | null;
  onSave: () => void;
}

export function RoleEditModal({ isOpen, onClose, role, onSave }: RoleEditModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    hierarchy_level: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (role) {
        setFormData({
          name: role.name,
          slug: role.slug,
          description: role.description,
          hierarchy_level: role.hierarchy_level,
        });
        setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
      } else {
        setFormData({ name: "", slug: "", description: "", hierarchy_level: 0 });
        setSelectedPermissions(new Set());
      }
    }
  }, [isOpen, role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modulesRes, permsRes] = await Promise.all([
        api.get<{ items: Module[] }>("/api/modules"),
        api.get<Permission[]>("/api/permissions"),
      ]);
      setModules(modulesRes.items || []);
      setAllPermissions(permsRes || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    const next = new Set(selectedPermissions);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    setSelectedPermissions(next);
  };

  const toggleModulePermissions = (moduleId: string, checked: boolean) => {
    const modulePerms = allPermissions.filter((p) => p.module_id === moduleId);
    const next = new Set(selectedPermissions);
    modulePerms.forEach((p) => {
      if (checked) {
        next.add(p.id);
      } else {
        next.delete(p.id);
      }
    });
    setSelectedPermissions(next);
  };

  const isModuleFullySelected = (moduleId: string) => {
    const modulePerms = allPermissions.filter((p) => p.module_id === moduleId);
    return modulePerms.length > 0 && modulePerms.every((p) => selectedPermissions.has(p.id));
  };

  const isModulePartiallySelected = (moduleId: string) => {
    const modulePerms = allPermissions.filter((p) => p.module_id === moduleId);
    return modulePerms.some((p) => selectedPermissions.has(p.id)) && !isModuleFullySelected(moduleId);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Role name is required", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...formData,
        permission_ids: Array.from(selectedPermissions),
      };

      if (role) {
        await api.put(`/api/roles/${role.id}`, payload);
        showToast("Role updated", "success");
      } else {
        await api.post("/api/roles", payload);
        showToast("Role created", "success");
      }
      onSave();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save role", "error");
    } finally {
      setSaving(false);
    }
  };

  const actions = ["view", "create", "edit", "delete", "export"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-0 sm:p-4"
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
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-[#7C3AED]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">
                  {role ? "Edit Role" : "Create Role"}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  Configure role details and permissions
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#0F172A]">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0F172A]">Role Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        placeholder="e.g. Team Leader"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0F172A]">Slug *</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        placeholder="e.g. team_leader"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0F172A]">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        placeholder="Role description"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0F172A]">Hierarchy Level</label>
                      <input
                        type="number"
                        value={formData.hierarchy_level}
                        onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#0F172A]">Permissions</h3>
                    <span className="text-xs text-[#64748B]">
                      {selectedPermissions.size} selected
                    </span>
                  </div>

                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                          <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                            Module
                          </th>
                          {actions.map((action) => (
                            <th
                              key={action}
                              className="px-3 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center"
                            >
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {modules.map((module) => {
                          const modulePerms = allPermissions.filter(
                            (p) => p.module_id === module.id
                          );
                          const isFullySelected = isModuleFullySelected(module.id);
                          const isPartiallySelected = isModulePartiallySelected(module.id);

                          return (
                            <tr key={module.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="px-4 py-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={isFullySelected}
                                      ref={(el) => {
                                        if (el) el.indeterminate = isPartiallySelected;
                                      }}
                                      onChange={(e) =>
                                        toggleModulePermissions(module.id, e.target.checked)
                                      }
                                      className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-[#0F172A]">
                                    {module.name}
                                  </span>
                                </label>
                              </td>
                              {actions.map((action) => {
                                const perm = modulePerms.find((p) => p.action === action);
                                return (
                                  <td key={action} className="px-3 py-3 text-center">
                                    {perm ? (
                                      <button
                                        type="button"
                                        onClick={() => togglePermission(perm.id)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                          selectedPermissions.has(perm.id)
                                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                                            : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                                        }`}
                                      >
                                        {selectedPermissions.has(perm.id) ? (
                                          <Check size={14} />
                                        ) : (
                                          <span className="w-2 h-2 bg-current rounded-full" />
                                        )}
                                      </button>
                                    ) : (
                                      <span className="text-[#E2E8F0]">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-[#E2E8F0] shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Role"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
