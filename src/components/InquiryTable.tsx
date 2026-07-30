"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Mail, Phone, MessageSquare, MoreHorizontal, MapPin, Building, IndianRupee, Pencil, Trash2 } from "lucide-react";
import type { Inquiry } from "@/lib/types";
import { Pagination } from "@/components/Pagination";

const statusColors: Record<string, string> = {
  "New": "bg-blue-50 text-[#2563EB] border border-blue-100",
  "Contacted": "bg-amber-50 text-[#F59E0B] border border-amber-100",
  "Closed": "bg-slate-50 text-[#64748B] border border-slate-100",
};

const statusOptions = ["New", "Contacted", "Closed"] as const;

interface InquiryTableProps {
  inquiries: Inquiry[];
  onEdit?: (inquiry: Inquiry) => void;
  onDelete?: (id: string) => void;
}

export function InquiryTable({ inquiries, onEdit, onDelete }: InquiryTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inq.id.toLowerCase().includes(q) ||
      inq.name.toLowerCase().includes(q) ||
      inq.phone.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterSelect = (val: string) => {
    setStatusFilter(val === statusFilter ? "" : val);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Inquiries</h1>
          <p className="text-[#64748B] mt-1 text-sm">Manage incoming property inquiries from your website.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder="Search by name, phone, email, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              <Filter size={14} /> Status{statusFilter ? `: ${statusFilter}` : ""}
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 min-w-[140px]">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleFilterSelect(opt)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        statusFilter === opt
                          ? "text-[#2563EB] bg-blue-50"
                          : "text-[#0F172A] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                  {statusFilter && (
                    <button
                      onClick={() => handleFilterSelect("")}
                      className="w-full text-left px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <X size={14} /> Clear
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          {["Property Type", "Area", "Budget"].map((filter) => (
            <button key={filter} className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
              <Filter size={14} /> {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                {["ID", "Name", "Contact", "Property Type", "Area", "Budget", "Status", "Date", "Actions"].map((head) => (
                  <th key={head} className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-[#64748B] text-sm">
                    No inquiries yet
                  </td>
                </tr>
              ) : (
                paginated.map((inq, i) => (
                  <motion.tr
                    key={inq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-[#2563EB] text-xs">{inq.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0F172A]">
                          {inq.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-[#0F172A]">{inq.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${inq.phone}`} className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                          <Phone size={12} /> {inq.phone}
                        </a>
                        {inq.email && (
                          <a href={`mailto:${inq.email}`} className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                            <Mail size={12} /> {inq.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[#0F172A]">
                        <Building size={14} className="text-[#64748B]" />
                        {inq.property_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[#64748B]">
                        <MapPin size={14} />
                        {inq.area}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                        <IndianRupee size={14} className="text-[#64748B]" />
                        {inq.budget}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inq.status]}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">{inq.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#22C55E] hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors" title="Call">
                          <Phone size={16} />
                        </button>
                        {onEdit && (
                          <button onClick={() => onEdit(inq)} className="p-2 text-[#F59E0B] hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(inq.id)} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        )}
      </div>

      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center">
            <p className="text-[#64748B] text-sm">No inquiries yet</p>
          </div>
        ) : (
          paginated.map((inq, i) => (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-[#0F172A]">
                    {inq.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{inq.name}</p>
                    <p className="text-xs text-[#64748B]">{inq.phone}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inq.status]}`}>
                  {inq.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                  <Building size={14} />
                  <span>{inq.property_type}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748B]">
                  <MapPin size={14} />
                  <span>{inq.area}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748B]">
                  <IndianRupee size={14} />
                  <span className="text-[#0F172A] font-medium">{inq.budget}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="text-xs">{inq.date}</span>
                </div>
              </div>

              {inq.message && (
                <div className="mb-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B] line-clamp-2">{inq.message}</p>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#22C55E] text-white rounded-xl text-sm font-medium">
                  <MessageSquare size={16} /> WhatsApp
                </button>
                <a href={`tel:${inq.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium">
                  <Phone size={16} /> Call
                </a>
                {onEdit && (
                  <button onClick={() => onEdit(inq)} className="p-2 border border-[#E2E8F0] rounded-xl text-[#F59E0B]">
                    <Pencil size={18} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(inq.id)} className="p-2 border border-[#E2E8F0] rounded-xl text-[#EF4444]">
                    <Trash2 size={18} />
                  </button>
                )}
                {!onEdit && !onDelete && (
                  <button className="p-2 border border-[#E2E8F0] rounded-xl text-[#64748B]">
                    <MoreHorizontal size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
