"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Search, ChevronDown, Check, Phone, IndianRupee, MapPin } from "lucide-react";
import type { Lead, UserData } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useLeadStatuses, statusBadgeStyle } from "@/lib/statuses";

interface ManagerPanelProps {
  leads: Lead[];
  onRefreshLeads: () => void;
}

export function ManagerPanel({ leads, onRefreshLeads }: ManagerPanelProps) {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const { statuses } = useLeadStatuses();
  const statusColorMap = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.name, s.color])),
    [statuses]
  );

  const loadAgents = useCallback(async () => {
    try {
      const data = await api.get<UserData[]>("/api/users/agents");
      setAgents(data);
    } catch {
      showToast("Failed to load agents", "error");
    }
  }, [showToast]);

  useEffect(() => {
    void Promise.resolve().then(() => loadAgents());
  }, [loadAgents]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = !search || 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.id.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unassignedLeads = filteredLeads.filter((lead) => lead.assigned === "Unassigned");
  const assignedLeads = filteredLeads.filter((lead) => lead.assigned !== "Unassigned");

  const handleAssign = async (leadId: string, agentName: string) => {
    setAssigningLoading(true);
    try {
      await api.put(`/api/leads/${leadId}`, { assigned: agentName });
      showToast(`Lead assigned to ${agentName}`, "success");
      onRefreshLeads();
      setAssigningLead(null);
    } catch {
      showToast("Failed to assign lead", "error");
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleBulkAssign = async (leadIds: string[], agentName: string) => {
    setAssigningLoading(true);
    try {
      await Promise.all(
        leadIds.map((id) => api.put(`/api/leads/${id}`, { assigned: agentName }))
      );
      showToast(`${leadIds.length} leads assigned to ${agentName}`, "success");
      onRefreshLeads();
    } catch {
      showToast("Failed to assign leads", "error");
    } finally {
      setAssigningLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Manager Panel</h1>
          <p className="text-[#64748B] mt-1 text-sm">Assign and manage leads for your sales team</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl">
            <Users size={16} className="text-[#64748B]" />
            <span className="text-sm font-medium text-[#0F172A]">{agents.length} Agents</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <UserPlus size={16} className="text-[#F59E0B]" />
            <span className="text-sm font-medium text-[#F59E0B]">{unassignedLeads.length} Unassigned</span>
          </div>
        </div>
      </div>

      {/* Agents Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const agentLeads = leads.filter((l) => l.assigned === agent.name);
          const hotLeads = agentLeads.filter((l) => l.status === "Hot").length;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-sm font-bold text-white">
                  {agent.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{agent.name}</p>
                  <p className="text-xs text-[#64748B]">{agent.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">Total Leads</span>
                <span className="font-semibold text-[#0F172A]">{agentLeads.length}</span>
              </div>
              {hotLeads > 0 && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-[#64748B]">Hot Leads</span>
                  <span className="font-semibold text-[#EF4444]">{hotLeads}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", ...statuses.map((s) => s.name)].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {status || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Unassigned Leads */}
      {unassignedLeads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">Unassigned Leads</h2>
            {unassignedLeads.length > 1 && (
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors">
                  <UserPlus size={16} /> Bulk Assign
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-10 py-1 hidden group-hover:block">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleBulkAssign(unassignedLeads.map((l) => l.id), agent.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white">
                        {agent.name[0]}
                      </div>
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                statusColorMap={statusColorMap}
                onAssign={() => setAssigningLead(lead)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Assigned Leads */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0F172A]">Assigned Leads</h2>
        {assignedLeads.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center">
            <p className="text-[#64748B] text-sm">No assigned leads found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                    {["Lead ID", "Customer", "Phone", "Budget", "Area", "Status", "Assigned To", "Action"].map((head) => (
                      <th key={head} className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {assignedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#2563EB]">{lead.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0F172A]">
                            {lead.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-sm font-medium text-[#0F172A]">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{lead.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">{lead.budget}</td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">{lead.area}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border" style={statusBadgeStyle(statusColorMap[lead.status])}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{lead.assigned}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setAssigningLead(lead)}
                          className="px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:bg-blue-50 border border-[#2563EB] rounded-lg transition-colors"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assigningLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-[#E2E8F0]">
              <h3 className="text-lg font-semibold text-[#0F172A]">Assign Lead</h3>
              <p className="text-sm text-[#64748B] mt-1">
                Assign <span className="font-medium text-[#0F172A]">{assigningLead.name}</span> to an agent
              </p>
            </div>
            <div className="p-6 space-y-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAssign(assigningLead.id, agent.name)}
                  disabled={assigningLoading}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-sm font-bold text-white">
                    {agent.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[#0F172A]">{agent.name}</p>
                    <p className="text-xs text-[#64748B]">{agent.email}</p>
                  </div>
                  {assigningLead.assigned === agent.name && (
                    <Check size={18} className="text-[#22C55E]" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-[#E2E8F0]">
              <button
                onClick={() => setAssigningLead(null)}
                className="w-full py-2.5 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, statusColorMap, onAssign }: { lead: Lead; statusColorMap: Record<string, string>; onAssign: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-[#0F172A]">
            {lead.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">{lead.name}</p>
            <p className="text-xs text-[#64748B]">{lead.id}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border" style={statusBadgeStyle(statusColorMap[lead.status])}>
          {lead.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Phone size={14} />
          <span>{lead.phone}</span>
        </div>
        {lead.budget && (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <IndianRupee size={14} />
            <span>{lead.budget}</span>
          </div>
        )}
        {lead.area && (
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <MapPin size={14} />
            <span>{lead.area}</span>
          </div>
        )}
      </div>

      <button
        onClick={onAssign}
        className="w-full flex items-center justify-center gap-2 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
      >
        <UserPlus size={16} /> Assign Agent
      </button>
    </motion.div>
  );
}
