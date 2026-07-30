"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, MoreHorizontal, Shield, UserCheck, UserX } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  created: string;
}

interface UsersTableProps {
  users: UserData[];
  onAddUser: () => void;
}

const roleColors: Record<string, string> = {
  Administrator: "bg-purple-50 text-purple-600 border border-purple-100",
  Agent: "bg-blue-50 text-[#2563EB] border border-blue-100",
  Manager: "bg-amber-50 text-[#F59E0B] border border-amber-100",
  Viewer: "bg-slate-50 text-[#64748B] border border-slate-100",
};

export function UsersTable({ users, onAddUser }: UsersTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Users Management</h1>
          <p className="text-[#64748B] mt-1 text-sm">Manage team members and their access.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            <Download size={16} className="hidden sm:block" /> <span className="sm:hidden">Export</span><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={onAddUser} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all">
            + Add User
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input type="text" placeholder="Search users..." 
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Active", "Inactive"].map((filter) => (
            <button key={filter}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === "All" ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
            <Shield size={28} className="text-[#64748B]" />
          </div>
          <h3 className="text-lg font-medium text-[#0F172A]">No users yet</h3>
          <p className="text-[#64748B] mt-1 text-sm">Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                  {["User", "Email", "Phone", "Role", "Status", "Created", ""].map((head) => (
                    <th key={head} className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {users.map((user) => (
                  <motion.tr key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-xs font-bold text-[#2563EB]">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <p className="text-sm font-medium text-[#0F172A]">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{user.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.Viewer}`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === "Active" ? "bg-green-50 text-[#22C55E] border border-green-100" : "bg-red-50 text-[#EF4444] border border-red-100"
                      }`}>
                        {user.status === "Active" ? <UserCheck size={12} /> : <UserX size={12} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{user.created}</td>
                    <td className="px-6 py-4 relative">
                      <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors">
                        <MoreHorizontal size={16} className="text-[#64748B]" />
                      </button>
                      {openMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-20">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                              <Shield size={14} />
                              Edit Role
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors">
                              <UserX size={14} />
                              Deactivate
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
