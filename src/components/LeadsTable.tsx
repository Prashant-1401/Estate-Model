"use client";

import { motion } from "framer-motion";
import { Search, Filter, Download, MoreHorizontal, MessageCircle, Phone, Edit2, Trash2 } from "lucide-react";
import type { Lead } from "@/lib/types";

const statusColors: Record<string, string> = {
  "Hot": "bg-red-50 text-[#EF4444] border border-red-100",
  "Warm": "bg-amber-50 text-[#F59E0B] border border-amber-100",
  "New": "bg-blue-50 text-[#2563EB] border border-blue-100",
  "Cold": "bg-slate-50 text-[#64748B] border border-slate-100",
};

interface LeadsTableProps {
  leads: Lead[];
  onAddLead: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
}

export function LeadsTable({ leads, onAddLead, onEdit, onDelete }: LeadsTableProps) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Leads Management</h1>
          <p className="text-[#64748B] mt-1 text-sm">Track, manage, and convert your real estate leads.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            <Download size={16} className="hidden sm:block" /> <span className="sm:hidden">Export</span><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={onAddLead} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all">
            + Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input type="text" placeholder="Search by name, phone, or ID..." className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Status", "Area", "Budget", "Assigned To"].map((filter) => (
            <button key={filter} className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
              <Filter size={14} /> {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                {["Lead ID", "Customer Name", "Phone", "Budget", "Preferred Area", "Status", "Assigned To", "Actions"].map((head) => (
                  <th key={head} className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {leads.map((lead, i) => (
                <motion.tr 
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#2563EB]">{lead.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0F172A]">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-[#0F172A]">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{lead.phone}</td>
                  <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{lead.budget}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{lead.area}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{lead.assigned}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp"><MessageCircle size={16} /></button>
                      <button className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors" title="Call"><Phone size={16} /></button>
                      {onEdit && <button onClick={() => onEdit(lead)} className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>}
                      {onDelete && <button onClick={() => onDelete(lead.id)} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <p className="text-sm text-[#64748B]">Showing <span className="font-medium text-[#0F172A]">1-3</span> of <span className="font-medium text-[#0F172A]">1,284</span> leads</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC]">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-[#0F172A]">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{lead.name}</p>
                  <p className="text-xs text-[#64748B]">{lead.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                {lead.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Phone size={14} />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <span className="font-medium">Budget:</span>
                <span className="text-[#0F172A]">{lead.budget}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <span className="font-medium">Area:</span>
                <span>{lead.area}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#22C55E] text-white rounded-xl text-sm font-medium">
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium">
                <Phone size={16} /> Call
              </button>
              <button className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B]">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}