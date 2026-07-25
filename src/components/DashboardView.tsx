"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, CalendarCheck, DollarSign } from "lucide-react";

const stats = [
  { label: "Total Leads", value: "1,284", change: "+12.5%", trend: "up", icon: Users, color: "text-[#2563EB]", bg: "bg-blue-50" },
  { label: "Today's Leads", value: "42", change: "+8.2%", trend: "up", icon: Users, color: "text-[#22C55E]", bg: "bg-green-50" },
  { label: "Hot Leads", value: "89", change: "-2.4%", trend: "down", icon: TrendingUp, color: "text-[#F59E0B]", bg: "bg-amber-50" },
  { label: "Revenue (MTD)", value: "$482K", change: "+18.2%", trend: "up", icon: DollarSign, color: "text-[#2563EB]", bg: "bg-blue-50" },
];

const activities = [
  { id: 1, user: "Sarah M.", action: "scheduled a site visit", target: "Villa #402, Palm Jumeirah", time: "10 mins ago", type: "visit" },
  { id: 2, user: "System", action: "assigned new lead", target: "Ahmed K. (Budget: $1.2M)", time: "25 mins ago", type: "lead" },
  { id: 3, user: "John D.", action: "closed deal", target: "Penthouse #12, Downtown", time: "1 hour ago", type: "sale" },
];

export function DashboardView({ onAddLead }: { onAddLead: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Dashboard</h1>
          <p className="text-[#64748B] mt-1 text-sm">Welcome back, John. Here&apos;s what&apos;s happening today.</p>
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
        {stats.map((stat, i) => (
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
          <div className="h-48 lg:h-64 flex items-end justify-between gap-1 lg:gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, delay: 0.3 + (i * 0.05) }}
                className="w-full bg-[#2563EB]/10 rounded-t-lg relative group cursor-pointer"
              >
                <motion.div 
                  className="absolute bottom-0 w-full bg-[#2563EB] rounded-t-lg transition-all group-hover:bg-[#1D4ED8]"
                  style={{ height: `${h * 0.7}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ${h}k
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-[#64748B] px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m} className="hidden sm:block">{m}</span>)}
            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => <span key={i} className="sm:hidden">{m}</span>)}
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
          <div className="space-y-5">
            {activities.map((activity, i) => (
              <div key={activity.id} className="flex gap-3 lg:gap-4 relative">
                {i !== activities.length - 1 && (
                  <div className="absolute left-[11px] lg:left-[15px] top-8 bottom-[-20px] w-px bg-[#E2E8F0]" />
                )}
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'visit' ? 'bg-blue-100 text-[#2563EB]' : 
                  activity.type === 'sale' ? 'bg-green-100 text-[#22C55E]' : 'bg-amber-100 text-[#F59E0B]'
                }`}>
                  {activity.type === 'visit' ? <CalendarCheck size={14} /> : 
                   activity.type === 'sale' ? <DollarSign size={14} /> : <Users size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0F172A]">
                    <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-[#2563EB] truncate">{activity.target}</span>
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}