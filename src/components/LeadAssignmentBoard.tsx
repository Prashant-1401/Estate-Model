"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, RefreshCw, Inbox, UserRound, Search, GripVertical } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useLeadStatuses, statusBadgeStyle } from "@/lib/statuses";
import type { Lead, UserData } from "@/lib/types";

const UNASSIGNED_ACCENT = "#EF4444";

const AGENT_COLORS = [
  "#2563EB",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#22C55E",
  "#EC4899",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#84CC16",
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

interface AgentLane {
  id: string | null;
  name: string;
  leads: Lead[];
  accent: string;
}

export function LeadAssignmentBoard() {
  const { showToast } = useToast();
  const { statuses } = useLeadStatuses();
  const statusColorMap = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.name, s.color])),
    [statuses]
  );

  const [agents, setAgents] = useState<UserData[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dragLead, setDragLead] = useState<Lead | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOverLane, setDragOverLane] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agentsRes, leadsRes] = await Promise.all([
        api.get<UserData[] | { items: UserData[] }>("/api/users/agents"),
        api.get<{ items: Lead[] }>("/api/leads?per_page=100"),
      ]);
      setAgents(Array.isArray(agentsRes) ? agentsRes : agentsRes?.items ?? []);
      setLeads(leadsRes.items || []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load assignment data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const assignLead = useCallback(
    async (leadId: string, targetId: string | null) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;
      const agent = agents.find((a) => a.id === targetId);
      const targetName = agent ? agent.name : "Unassigned";
      const previous = { assigned_to: lead.assigned_to, assigned: lead.assigned };
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, assigned_to: targetId ?? undefined, assigned: targetName }
            : l
        )
      );
      try {
        await api.put(`/api/leads/${leadId}`, {
          assigned_to: targetId ?? null,
          assigned: targetName,
        });
        showToast(agent ? `Lead assigned to ${agent.name}` : "Lead unassigned", "success");
      } catch (e) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, ...previous } : l
          )
        );
        showToast(e instanceof Error ? e.message : "Failed to assign lead", "error");
      }
    },
    [leads, agents, showToast]
  );

  const lanes = useMemo<AgentLane[]>(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? leads.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            l.id.toLowerCase().includes(q)
        )
      : leads;

    const result: AgentLane[] = [
      { id: null, name: "Unassigned", leads: filtered.filter((l) => !l.assigned_to), accent: UNASSIGNED_ACCENT },
    ];
    const sorted = [...agents].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach((agent, i) => {
      result.push({
        id: agent.id,
        name: agent.name,
        leads: filtered.filter((l) => l.assigned_to === agent.id),
        accent: AGENT_COLORS[(i + 1) % AGENT_COLORS.length],
      });
    });
    return result;
  }, [leads, agents, search]);

  const totalLeads = useMemo(() => leads.length, [leads]);

  const endDrag = useCallback(() => {
    setDragLead(null);
    setDragPos(null);
    setDragOverLane(null);
  }, []);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>, lead: Lead) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const target = e.target as HTMLElement;
    if (target.closest("select, button, a, input")) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragLead(lead);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!dragLead) return;
    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
      let over: string | null = null;
      document.querySelectorAll<HTMLElement>("[data-lane-id]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          over = el.dataset.laneId ?? null;
        }
      });
      setDragOverLane((cur) => (cur === over ? cur : over));
    };
    const onUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) >= 5;
      const targetId = dragOverLane === "__unassigned__" ? null : dragOverLane;
      const currentId = dragLead.assigned_to ?? null;
      if (moved && dragOverLane !== null && targetId !== currentId) {
        void assignLead(dragLead.id, targetId);
      }
      endDrag();
    };
    const onCancel = () => endDrag();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [dragLead, dragStart, dragOverLane, assignLead, endDrag]);

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Lead Assignment</h1>
          <p className="text-[#64748B] mt-1 text-sm">
            {totalLeads} leads across {lanes.length} lanes. Drag a lead card to reassign it.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {lanes.map((lane) => (
            <motion.section
              key={lane.id ?? "unassigned"}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              data-lane-id={lane.id ?? "__unassigned__"}
              className={`bg-white rounded-2xl border shadow-sm transition-all ${
                dragOverLane === (lane.id ?? "__unassigned__")
                  ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
                  : dragLead
                    ? "border-[#2563EB]/30"
                    : "border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: lane.accent }}
                  >
                    {lane.id ? initials(lane.name) : <Inbox size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0F172A] truncate">{lane.name}</h3>
                    {lane.id && (
                      <p className="text-xs text-[#64748B]">Agent</p>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${lane.accent}15`, color: lane.accent }}
                >
                  {lane.leads.length} lead{lane.leads.length === 1 ? "" : "s"}
                </span>
              </div>

              {lane.leads.length === 0 ? (
                <div
                  className="m-4 py-10 border-2 border-dashed border-[#E2E8F0] rounded-xl text-center text-sm text-[#64748B]"
                >
                  {dragOverLane === (lane.id ?? "__unassigned__") ? "Release to assign here" : "No leads assigned"}
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {lane.leads.map((lead) => (
                    <div
                      key={lead.id}
                      onPointerDown={(e) => startDrag(e, lead)}
                      style={{ touchAction: "none" }}
                      className={`bg-white border border-[#E2E8F0] rounded-xl p-4 select-none cursor-grab active:cursor-grabbing transition-all ${
                        dragLead?.id === lead.id ? "opacity-40 ring-2 ring-[#2563EB]/40" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical size={14} className="text-[#CBD5E1] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate">{lead.name}</p>
                            <p className="text-xs text-[#2563EB] font-medium">{lead.id}</p>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0"
                          style={statusBadgeStyle(statusColorMap[lead.status])}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                        <Phone size={12} />
                        <span>{lead.phone}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] mb-3">
                        {lead.budget ? <span className="font-medium text-[#0F172A]">{lead.budget}</span> : <span />}
                        {lead.area ? <span className="truncate">{lead.area}</span> : <span />}
                      </div>

                      <div className="relative">
                        <select
                          value={lane.id ?? "__unassigned__"}
                          onChange={(e) => {
                            const target = e.target.value === "__unassigned__" ? null : e.target.value;
                            void assignLead(lead.id, target);
                          }}
                          className="w-full appearance-none px-3 py-2 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
                        >
                          <option value={lane.id ?? "__unassigned__"}>
                            {lane.id ? `Assigned to ${lane.name}` : "Unassigned"}
                          </option>
                          <option value="__unassigned__">Unassigned</option>
                          {agents
                            .filter((a) => a.id !== lane.id)
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                Assign to {a.name}
                              </option>
                            ))}
                        </select>
                        <UserRound size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {dragLead && dragPos && (
        <div
          className="fixed z-[60] pointer-events-none w-72 select-none"
          style={{ left: dragPos.x - dragOffset.x, top: dragPos.y - dragOffset.y }}
        >
          <div className="bg-white border-2 border-[#2563EB] rounded-xl shadow-2xl p-4 rotate-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">{dragLead.name}</p>
                <p className="text-xs text-[#2563EB] font-medium">{dragLead.id}</p>
              </div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0"
                style={statusBadgeStyle(statusColorMap[dragLead.status])}
              >
                {dragLead.status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Phone size={12} />
              <span>{dragLead.phone}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] mt-2">
              {dragLead.budget ? <span className="font-medium text-[#0F172A]">{dragLead.budget}</span> : <span />}
              {dragLead.area ? <span className="truncate">{dragLead.area}</span> : <span />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
