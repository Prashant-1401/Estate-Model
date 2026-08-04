"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, Flame, Building2, FolderTree, DollarSign,
  TrendingUp, Clock, Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { DashboardStats, Lead, FollowUp, DashboardWidget } from "@/lib/types";
import { useLeadStatuses, statusBadgeStyle } from "@/lib/statuses";

const WIDGET_ICONS: Record<string, LucideIcon> = {
  Users, Calendar, Flame, Building2, FolderTree, DollarSign,
  TrendingUp, Clock,
};

interface StatWidgetProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
}

function StatWidget({ title, value, icon, color, trend }: StatWidgetProps) {
  const Icon = WIDGET_ICONS[icon] || Users;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-[#22C55E] mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

interface TableWidgetProps {
  title: string;
  columns: string[];
  data: Lead[];
  renderRow: (item: Lead, index: number) => React.ReactNode;
}

function TableWidget({ title, columns, data, renderRow }: TableWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-[#64748B]">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, i) => renderRow(item, i))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

interface ListWidgetProps {
  title: string;
  items: { id: string; title: string; subtitle: string; status?: string; leadId?: string }[];
  onItemClick?: (item: { id: string; title: string; subtitle: string; status?: string; leadId?: string }) => void;
}

function ListWidget({ title, items, onItemClick }: ListWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {items.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[#64748B]">
            No items available
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={`px-6 py-3 hover:bg-[#F8FAFC] transition-colors ${onItemClick ? "cursor-pointer" : ""}`}
            >
              <p className="text-sm font-medium text-[#0F172A]">{item.title}</p>
              <p className="text-xs text-[#64748B]">{item.subtitle}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

interface ConfigurableDashboardProps {
  stats: DashboardStats;
  onAddLead: () => void;
  onOpenLead?: (leadOrId: Lead | string) => void;
  onExport?: (stats: DashboardStats) => void;
}

export function ConfigurableDashboard({ stats, onAddLead, onOpenLead, onExport }: ConfigurableDashboardProps) {
  const { showToast } = useToast();
  const { statuses } = useLeadStatuses();
  const statusColorMap = useMemo(
    () => Object.fromEntries(statuses.map((s) => [s.name, s.color])),
    [statuses]
  );
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [widgetsRes, leadsRes, followUpsRes] = await Promise.allSettled([
        api.get<DashboardWidget[] | { items: DashboardWidget[] }>("/api/dashboard-config/widgets/all"),
        api.get<{ items: Lead[] }>("/api/leads?per_page=10"),
        api.get<{ items: FollowUp[] }>("/api/follow-ups?per_page=10"),
      ]);

      if (widgetsRes.status === "fulfilled") {
        const value = widgetsRes.value;
        setWidgets(Array.isArray(value) ? value : value.items || []);
      }
      if (leadsRes.status === "fulfilled") setLeads(leadsRes.value.items || []);
      if (followUpsRes.status === "fulfilled") setFollowUps(followUpsRes.value.items || []);
    } catch {
      showToast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  const DEFAULT_STAT_WIDGETS = [
    { title: "Total Leads", value: stats.total_leads, icon: "Users", color: "#3B82F6" },
    { title: "Today's Leads", value: stats.today_leads, icon: "Calendar", color: "#10B981" },
    { title: "Hot Leads", value: stats.hot_leads, icon: "Flame", color: "#EF4444" },
    { title: "Total Properties", value: stats.total_properties, icon: "Building2", color: "#8B5CF6" },
    { title: "Total Projects", value: stats.total_projects, icon: "FolderTree", color: "#F59E0B" },
    { title: "Total Users", value: stats.total_users, icon: "Users", color: "#06B6D4" },
  ];

  const STAT_VALUES: Record<string, string | number> = {
    "Total Leads": stats.total_leads,
    "Today's Leads": stats.today_leads,
    "Hot Leads": stats.hot_leads,
    "Total Properties": stats.total_properties,
    "Total Projects": stats.total_projects,
    "Total Users": stats.total_users,
    "Revenue MTD": stats.revenue_mtd,
  };

  const statWidgets = widgets
    .filter((w) => w.is_active && w.widget_type === "stat")
    .map((w) => ({
      title: w.name,
      value: STAT_VALUES[w.name] ?? 0,
      icon: String(w.config?.icon || "Users"),
      color: String(w.config?.color || "#3B82F6"),
    }));
  const tableEnabled = widgets.find((w) => w.widget_type === "table")?.is_active ?? true;
  const listEnabled = widgets.find((w) => w.widget_type === "list")?.is_active ?? true;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Dashboard</h1>
          <p className="text-[#64748B] mt-1 text-sm">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <button onClick={() => onExport(stats)} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
              <Download size={16} className="hidden sm:block" /> <span className="sm:hidden">Export</span><span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button
            onClick={onAddLead}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
          >
            Add New Lead
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(statWidgets.length > 0 ? statWidgets : DEFAULT_STAT_WIDGETS).map((widget, i) => (
          <StatWidget key={i} {...widget} />
        ))}
      </div>

      {/* Revenue Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Revenue This Month</p>
            <p className="text-3xl font-bold mt-1">{stats.revenue_mtd}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>
      </motion.div>

      {/* Recent Leads & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tableEnabled && (
          <TableWidget
            title="Recent Leads"
            columns={["Name", "Phone", "Status", "Source"]}
            data={leads}
            renderRow={(lead: Lead, i: number) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onOpenLead?.(lead)}
                className={`hover:bg-[#F8FAFC] transition-colors ${onOpenLead ? "cursor-pointer" : ""}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-[#0F172A]">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-[#64748B]">{lead.phone}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border" style={statusBadgeStyle(statusColorMap[lead.status])}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#64748B]">{lead.source}</td>
              </motion.tr>
            )}
          />
        )}

        {listEnabled && (
          <ListWidget
            title="Upcoming Follow-ups"
            items={followUps.map((fu) => ({
              id: fu.id,
              title: fu.lead_name,
              subtitle: `${fu.time} - ${fu.property_title || "No property"}`,
              status: fu.status,
              leadId: fu.lead_id,
            }))}
            onItemClick={(item) => item.leadId && onOpenLead?.(item.leadId)}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm text-[#64748B]">Conversion Rate</p>
              <p className="text-lg font-bold text-[#0F172A]">12.5%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm text-[#64748B]">Avg Response Time</p>
              <p className="text-lg font-bold text-[#0F172A]">2.4 hrs</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-sm text-[#64748B]">Active Agents</p>
              <p className="text-lg font-bold text-[#0F172A]">{stats.total_users}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
