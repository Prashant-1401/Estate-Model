"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, CalendarCheck, IndianRupee } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export function DashboardView({ stats, onAddLead }: { stats: DashboardStats; onAddLead: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Dashboard</h1>
          <p className="text-[#64748B] mt-1 text-sm">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            Export
          </button>
          <button onClick={onAddLead} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all">
            + Add Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: String(stats.total_leads), change: `${stats.total_leads > 0 ? "+" : ""}${stats.total_leads}`, trend: "up" as const, icon: Users, color: "text-[#2563EB]", bg: "bg-blue-50" },
          { label: "Today's Leads", value: String(stats.today_leads), change: `${stats.today_leads > 0 ? "+" : ""}${stats.today_leads}`, trend: "up" as const, icon: Users, color: "text-[#22C55E]", bg: "bg-green-50" },
          { label: "Hot Leads", value: String(stats.hot_leads), change: `${stats.hot_leads > 0 ? "+" : ""}${stats.hot_leads}`, trend: stats.hot_leads > 0 ? "up" as const : "down" as const, icon: TrendingUp, color: "text-[#F59E0B]", bg: "bg-amber-50" },
          { label: "Revenue (MTD)", value: stats.revenue_mtd, change: `${stats.revenue_mtd !== "₹0" ? "+" : ""}${stats.revenue_mtd}`, trend: "up" as const, icon: IndianRupee, color: "text-[#2563EB]", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-[#22C55E] bg-green-50' : 'text-[#EF4444] bg-red-50'}`}>
                {stat.trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl lg:text-3xl font-semibold text-[#0F172A]">{stat.value}</p>
              <p className="text-sm text-[#64748B] mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F172A]">Sales Performance</h3>
            <select className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-[#F8FAFC] focus:outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-48 lg:h-64 flex items-center justify-center">
            <p className="text-[#64748B] text-sm">No sales data available</p>
          </div>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 lg:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm"
        >
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3 border border-[#E2E8F0]">
              <CalendarCheck size={20} className="text-[#64748B]" />
            </div>
            <p className="text-[#64748B] text-sm">No recent activity</p>
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}
