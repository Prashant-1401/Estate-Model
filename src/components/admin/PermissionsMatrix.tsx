"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid, Check, Minus } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { PermissionMatrix, RoleConfig } from "@/lib/types";

interface PermissionsMatrixProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionsMatrix({ isOpen, onClose }: PermissionsMatrixProps) {
  const { showToast } = useToast();
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matrixRes, rolesRes] = await Promise.all([
        api.get<PermissionMatrix>("/api/permissions/matrix"),
        api.get<{ items: RoleConfig[] }>("/api/roles/all"),
      ]);
      setMatrix(matrixRes);
      setRoles(rolesRes.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load data", "error");
    } finally {
      setLoading(false);
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
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
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
            <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <X size={20} className="text-[#64748B]" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-auto flex-1">
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
                          const hasPermission = matrix.matrix[module.slug]?.[action] ?? false;
                          return (
                            <td key={action} className="px-4 py-3 text-center">
                              <button
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  hasPermission
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                                }`}
                                title={`${hasPermission ? "Remove" : "Add"} ${action} permission for ${module.name}`}
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
            )}

            {roles.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-sm font-medium text-[#0F172A] mb-3">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${
                        selectedRole === role.id
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]/30"
                      }`}
                    >
                      {role.name}
                      {role.is_system && " (System)"}
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
