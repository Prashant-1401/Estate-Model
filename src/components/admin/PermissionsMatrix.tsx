"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid, Check, Minus, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Permission, PermissionMatrix, RoleConfig } from "@/lib/types";

interface PermissionsMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

function permKey(moduleId: string, action: string) {
  return `${moduleId}|${action}`;
}

export function PermissionsMatrix({ isOpen, onClose, embedded = false }: PermissionsMatrixProps) {
  const { showToast } = useToast();
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [catalog, setCatalog] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [matrixRes, rolesRes, permsRes] = await Promise.all([
        api.get<PermissionMatrix>("/api/permissions/matrix"),
        api.get<RoleConfig[] | { items: RoleConfig[] }>("/api/roles/all"),
        api.get<Permission[]>("/api/permissions"),
      ]);
      setMatrix(matrixRes);
      setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.items || []);
      const cat: Record<string, string> = {};
      for (const p of permsRes) {
        cat[permKey(p.module_id, p.action)] = p.id;
      }
      setCatalog(cat);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen || embedded) {
      void Promise.resolve().then(() => loadData());
    }
  }, [isOpen, embedded, loadData]);

  const handleSelectRole = (role: RoleConfig) => {
    setSelectedRoleId(role.id);
    setGranted(new Set(role.permissions.map((p) => permKey(p.module_id, p.action))));
    setDirty(false);
  };

  const togglePermission = (moduleId: string, action: string) => {
    if (!selectedRole || !catalog[permKey(moduleId, action)]) return;
    const key = permKey(moduleId, action);
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!selectedRole || !dirty) return;
    try {
      setSaving(true);
      const permission_ids: string[] = [];
      for (const key of granted) {
        const id = catalog[key];
        if (id) permission_ids.push(id);
      }
      const updated = await api.put<RoleConfig>(`/api/roles/${selectedRole.id}`, { permission_ids });
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setGranted(new Set(updated.permissions.map((p) => permKey(p.module_id, p.action))));
      setDirty(false);
      showToast("Permissions saved", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save permissions", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen && !embedded) return null;

  const isGranted = (moduleId: string, action: string) => granted.has(permKey(moduleId, action));
  const canEdit = (moduleId: string, action: string) => !!selectedRole && !!catalog[permKey(moduleId, action)];

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
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className={embedded ? "bg-white w-full h-full flex flex-col" : "bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Grid size={20} className="text-[#4F46E5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Permission Matrix</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Configure module access by role</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedRole && dirty && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
              {!embedded && (
                <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                  <X size={20} className="text-[#64748B]" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !matrix ? (
              <div className="text-center py-16">
                <Grid size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No modules configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">Modules are auto-created on first setup.</p>
              </div>
            ) : (
              <>
                {!selectedRole && (
                  <div className="mb-4 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B]">
                    Select a role below to view and edit its permissions.
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0]">
                        <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider sticky left-0 bg-white">
                          Module
                        </th>
                        {matrix.actions.map((action) => (
                          <th
                            key={action}
                            className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center"
                          >
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {matrix.modules.map((module) => (
                        <tr key={module.slug} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#0F172A] sticky left-0 bg-white">
                            {module.name}
                          </td>
                          {matrix.actions.map((action) => {
                            const hasPermission = isGranted(module.id, action);
                            const editable = canEdit(module.id, action);
                            const title = !selectedRole
                              ? "Select a role to edit"
                              : !editable
                                ? "Permission record not created for this module yet"
                                : `${hasPermission ? "Remove" : "Add"} ${action} permission`;
                            return (
                              <td key={action} className="px-4 py-3 text-center">
                                <button
                                  onClick={() => togglePermission(module.id, action)}
                                  disabled={!editable}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    !editable
                                      ? "opacity-40 cursor-not-allowed"
                                      : hasPermission
                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                        : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                                  }`}
                                  title={title}
                                >
                                  {hasPermission ? <Check size={16} /> : <Minus size={16} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {roles.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-sm font-medium text-[#0F172A] mb-3">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                        selectedRoleId === role.id
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]/30"
                      }`}
                    >
                      {role.name}
                      {role.is_system && " (System)"}
                    </button>
                  ))}
                </div>
                {selectedRole && dirty && (
                  <p className="text-xs text-[#F59E0B] mt-3">
                    Unsaved changes for {selectedRole.name}. Click &quot;Save Changes&quot; to apply.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
