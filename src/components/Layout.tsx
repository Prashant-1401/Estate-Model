"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Building2, Settings, 
  HelpCircle, Search, Bell, ChevronDown, Menu, Plus,
  FileText, X, LogOut, FolderTree, Shield, CheckSquare, FormInput,
  GitBranch, Share2, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";

interface SidebarItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  id: string;
  roles?: Role[];
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: FileText, label: "Leads", id: "leads" },
  { icon: Users, label: "Customers", id: "customers" },
  { icon: Building2, label: "Properties", id: "properties" },
  { icon: FolderTree, label: "Projects", id: "projects" },
  { icon: CheckSquare, label: "Follow Ups", id: "follow-ups" },
  { icon: Shield, label: "Users", id: "users", roles: ["admin", "manager"] },
  { icon: Settings, label: "Settings", id: "settings", roles: ["admin", "manager"] },
  { icon: Shield, label: "Roles & Permissions", id: "roles", roles: ["admin"] },
  { icon: FormInput, label: "Form Builder", id: "forms", roles: ["admin"] },
  { icon: GitBranch, label: "Statuses", id: "statuses", roles: ["admin"] },
  { icon: Share2, label: "Lead Sources", id: "lead-sources", roles: ["admin"] },
  { icon: Zap, label: "Notifications", id: "notifications", roles: ["admin"] },
  { icon: GitBranch, label: "Workflows", id: "workflows", roles: ["admin"] },
  { icon: Building2, label: "Company Settings", id: "company", roles: ["admin"] },
  { icon: HelpCircle, label: "Help", id: "help" },
];

export function DashboardLayout({ children, activeView, setActiveView, onFabClick }: { children: React.ReactNode, activeView: string, setActiveView: (v: string) => void, onFabClick: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();

  const visibleItems = sidebarItems.filter(
    (item) => !item.roles || hasRole(...item.roles)
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-[#0F172A]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static left-0 top-0 z-50 h-full w-[280px] bg-[#0F172A] text-white flex flex-col border-r border-[#E2E8F0]/10 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <motion.span className="text-xl font-semibold tracking-tight text-white">
            Estate<span className="text-[#2563EB]">CRM</span>
          </motion.span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeView === item.id 
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", activeView === item.id ? "text-white" : "text-slate-400 group-hover:text-white")} />
              <span className="text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold">
              {user?.initials || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role || "Administrator"}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-red-500/10 transition-all">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors lg:hidden"
            >
              <Menu size={20} className="text-[#64748B]" />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="relative p-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2 lg:px-3 py-2 hover:bg-[#F8FAFC] rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-semibold">
                  {user?.initials || "AD"}
                </div>
                <ChevronDown size={16} className="text-[#64748B] hidden lg:block" />
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-[#E2E8F0]">
                        <p className="text-sm font-medium text-[#0F172A]">{user?.name || "Admin"}</p>
                        <p className="text-xs text-[#64748B]">{user?.email || "admin@estatecrm.com"}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>

        {/* Floating Action Button */}
        <motion.button 
          onClick={onFabClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 h-14 w-14 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center z-30 transition-colors lg:bottom-8 lg:right-8"
        >
          <Plus size={24} />
        </motion.button>
      </main>
    </div>
  );
}
