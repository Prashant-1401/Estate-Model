"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { RoleEditModal } from "./RoleEditModal";
import type { RoleConfig } from "@/lib/types";

interface RolesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolesManager({ isOpen, onClose }: RolesManagerProps) {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<RoleConfig[] | { items: RoleConfig[] }>("/api/roles/all");
      setRoles(Array.isArray(res) ? res : res.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      void Promise.resolve().then(() => loadRoles());
    }
  }, [isOpen, loadRoles]);

  const handleDelete = async (role: RoleConfig) => {
    if (role.is_system) {
      showToast("Cannot delete system role", "error");
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await api.delete(`/api/roles/${role.id}`);
      showToast("Role deleted", "success");
      loadRoles();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete role", "error");
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (role: RoleConfig) => {
    setEditingRole(role);
    setIsEditModalOpen(true);
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
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-[#7C3AED]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Roles & Permissions</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage roles and access control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Role</span>
              </button>
              <button onClick={onClose} className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors">
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-16">
                <Shield size={48} className="mx-auto text-[#64748B] mb-4" />
                <h3 className="text-lg font-medium text-[#0F172A]">No roles configured</h3>
                <p className="text-[#64748B] mt-1 text-sm">Create your first role to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#2563EB]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          role.is_system ? "bg-[#0F172A]" : "bg-[#2563EB]"
                        }`}>
                          <Shield size={18} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#0F172A]">{role.name}</h4>
                          <p className="text-xs text-[#64748B]">
                            Level {role.hierarchy_level} • {role.permissions.length} permissions
                            {role.is_system && " • System"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!role.is_system && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {role.permissions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {role.permissions.slice(0, 8).map((perm) => (
                          <span
                            key={perm.id}
                            className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#64748B]"
                          >
                            {perm.name}
                          </span>
                        ))}
                        {role.permissions.length > 8 && (
                          <span className="px-2 py-0.5 text-xs text-[#64748B]">
                            +{role.permissions.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <RoleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        role={editingRole}
        onSave={loadRoles}
      />
    </AnimatePresence>
  );
}
