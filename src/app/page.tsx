"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { usePaginatedData } from "@/lib/use-paginated-data";
import { DashboardLayout } from "@/components/Layout";
import { ConfigurableDashboard } from "@/components/dashboard/ConfigurableDashboard";
import { LeadsTable } from "@/components/LeadsTable";
import { CustomerProfile } from "@/components/CustomerProfile";
import { AddLeadCard } from "@/components/AddLeadCard";
import { AddPropertyCard } from "@/components/AddPropertyCard";
import { AddProjectCard } from "@/components/AddProjectCard";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyDetailCard } from "@/components/PropertyDetailCard";
import { UsersTable } from "@/components/UsersTable";
import { AddUserCard } from "@/components/AddUserCard";
import { EditLeadCard } from "@/components/EditLeadCard";
import { EditPropertyCard } from "@/components/EditPropertyCard";
import { EditProjectCard } from "@/components/EditProjectCard";
import { KanbanBoard } from "@/components/KanbanBoard";
import { RolesManager } from "@/components/admin/RolesManager";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";
import { ComponentBuilder } from "@/components/admin/ComponentBuilder";
import { CompanySettings } from "@/components/admin/CompanySettings";
import { Plus, Building2 as ProjectIcon, Edit2, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import type { Property, Project, Lead, UserData, DashboardStats, FollowUp } from "@/lib/types";
import { Pagination } from "@/components/Pagination";

const EMPTY_STATS: DashboardStats = {
  total_leads: 0, today_leads: 0, hot_leads: 0, total_properties: 0,
  total_projects: 0, total_users: 0, revenue_mtd: "₹0",
};

function DashboardContent() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [statsError, setStatsError] = useState("");
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const leads = usePaginatedData<Lead>("/api/leads");
  const properties = usePaginatedData<Property>("/api/properties", { initialPerPage: 9 });
  const projects = usePaginatedData<Project>("/api/projects", { initialPerPage: 10 });
  const users = usePaginatedData<UserData>("/api/users");
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  async function loadFollowUps() {
    try {
      const res = await api.get<{ items: FollowUp[] }>("/api/follow-ups?per_page=100");
      setFollowUps(res.items);
    } catch {
      // ignore
    }
  }

  async function loadAllProjects() {
    try {
      const res = await api.get<{ items: Project[] }>("/api/projects?per_page=100");
      setAllProjects(res.items);
    } catch {
      // ignore
    }
  }

  async function reloadStats() {
    try {
      const s = await api.get<DashboardStats>("/api/dashboard/stats");
      setStats(s);
      setStatsError("");
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : "Failed to load dashboard data");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([reloadStats(), loadFollowUps(), loadAllProjects()]);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAddLead = async (leadData: Record<string, string>) => {
    try {
      await api.post("/api/leads", {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        budget: leadData.budget,
        area: leadData.area,
        type: leadData.propertyType,
        source: leadData.source || "Direct",
        status: "New",
        assigned: leadData.assigned || "Unassigned",
        assigned_to: leadData.assignedTo || null,
        requirement: leadData.notes || "",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
      await Promise.all([leads.reload(), reloadStats()]);
      showToast("Lead created successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to create lead", "error");
      throw e;
    }
  };

  const handleAddProperty = async (property: Property) => {
    try {
      await api.post("/api/properties", property);
      await Promise.all([properties.reload(), reloadStats()]);
      showToast("Property added successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to add property", "error");
    }
  };

  const handleAddProject = async (project: Project) => {
    try {
      await api.post("/api/projects", project);
      await Promise.all([projects.reload(), loadAllProjects(), reloadStats()]);
      showToast("Project created successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to create project", "error");
    }
  };

  const handleAddUser = async (data: Record<string, string>) => {
    try {
      await api.post("/api/users", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        password: data.password,
      });
      await Promise.all([users.reload(), reloadStats()]);
      showToast("User added successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to add user", "error");
    }
  };

  const handleEditLead = async (id: string, data: Record<string, string>) => {
    try {
      await api.put(`/api/leads/${id}`, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        budget: data.budget,
        area: data.area,
        type: data.propertyType,
        source: data.source,
        status: data.status,
        requirement: data.notes,
      });
      await leads.reload();
      showToast("Lead updated successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update lead", "error");
      throw e;
    }
  };

  const handleEditProperty = async (id: string, property: Property) => {
    try {
      await api.put(`/api/properties/${id}`, property);
      await Promise.all([properties.reload(), reloadStats()]);
      showToast("Property updated successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update property", "error");
    }
  };

  const handleEditProject = async (id: string, project: Project) => {
    try {
      await api.put(`/api/projects/${id}`, project);
      await projects.reload();
      showToast("Project updated successfully", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update project", "error");
    }
  };

  const handleLinkProject = async (id: string, projectId: string) => {
    try {
      await api.put(`/api/properties/${id}`, { project_id: projectId || null });
      await Promise.all([properties.reload(), loadAllProjects()]);
      showToast(projectId ? "Property linked to project" : "Project link removed", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update project link", "error");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const endpoint = type === "lead" ? "leads" : type === "property" ? "properties" : type === "project" ? "projects" : null;
      if (endpoint) {
        await api.delete(`/api/${endpoint}/${id}`);
        if (type === "lead") await Promise.all([leads.reload(), reloadStats()]);
        else if (type === "property") await Promise.all([properties.reload(), reloadStats()]);
        else if (type === "project") await projects.reload();
        showToast(`${type} deleted successfully`, "success");
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : `Failed to delete ${type}`, "error");
    }
    setDeleteConfirm(null);
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    try {
      await api.put(`/api/users/${id}`, { role });
      await users.reload();
      showToast("User role updated", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update role", "error");
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await api.put(`/api/users/${id}`, { status: newStatus });
      await users.reload();
      showToast(`User ${newStatus.toLowerCase()}`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update user", "error");
    }
  };

  const canManage = hasRole("admin", "manager");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <ConfigurableDashboard onAddLead={() => setIsAddLeadOpen(true)} stats={stats} />;
      case "leads":
        return (
          <LeadsTable
            items={leads.items}
            total={leads.total}
            currentPage={leads.page}
            itemsPerPage={leads.perPage}
            loading={leads.loading}
            error={leads.error}
            onRetry={leads.reload}
            onPageChange={leads.setPage}
            onPageSizeChange={leads.setPerPage}
            search={leads.search}
            onSearchChange={leads.setSearch}
            statusFilter={leads.status}
            onStatusFilterChange={leads.setStatus}
            onAddLead={() => setIsAddLeadOpen(true)}
            onEdit={canManage ? (lead) => setEditingLead(lead) : undefined}
            onDelete={canManage ? (id) => setDeleteConfirm({ type: "lead", id }) : undefined}
            onViewCustomer={(lead) => { setSelectedCustomer(lead); setActiveView("customers"); }}
          />
        );
      case "customers":
        return selectedCustomer ? (
          <CustomerProfile lead={selectedCustomer} onBack={() => setActiveView("leads")} />
        ) : (
          <CustomerProfile />
        );
      case "users":
        if (!hasRole("admin")) {
          return (
            <div className="flex items-center justify-center h-[60vh] text-[#64748B]">
              You do not have permission to view this page.
            </div>
          );
        }
        return (
          <UsersTable
            items={users.items}
            total={users.total}
            currentPage={users.page}
            itemsPerPage={users.perPage}
            loading={users.loading}
            error={users.error}
            onRetry={users.reload}
            onPageChange={users.setPage}
            onPageSizeChange={users.setPerPage}
            search={users.search}
            onSearchChange={users.setSearch}
            statusFilter={users.status}
            onStatusFilterChange={users.setStatus}
            onAddUser={() => setIsAddUserOpen(true)}
            onUpdateRole={handleUpdateUserRole}
            onToggleStatus={handleToggleUserStatus}
          />
        );
      case "properties":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">Properties</h1>
                <p className="text-[#64748B] mt-1 text-sm">Browse and manage property listings</p>
              </div>
              {canManage && (
                <button
                  onClick={() => setIsAddPropertyOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Plus size={18} />
                  Add Property
                </button>
              )}
            </div>
            {properties.error && (
              <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-[#EF4444]">
                  <AlertTriangle size={16} />
                  <span>{properties.error}</span>
                </div>
                <button onClick={properties.reload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-100 transition-colors">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}
            {properties.loading && properties.items.length === 0 ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : properties.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-medium text-[#0F172A]">No properties yet</h3>
                <p className="text-[#64748B] mt-1 text-sm">Add your first property to get started.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.items.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      title={property.title}
                      location={property.location}
                      price={property.price}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      type={property.type}
                      status={property.status}
                      images={property.images}
                      featured={property.featured}
                      projectId={property.project_id}
                      projects={allProjects}
                      onLinkProject={canManage ? handleLinkProject : undefined}
                      onViewDetails={(id) => {
                        const p = properties.items.find((pr) => pr.id === id);
                        if (p) setSelectedProperty(p);
                      }}
                      onEdit={canManage ? (id) => {
                        const p = properties.items.find((pr) => pr.id === id);
                        if (p) setEditingProperty(p);
                      } : undefined}
                      onDelete={canManage ? (id) => setDeleteConfirm({ type: "property", id }) : undefined}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={Math.min(properties.page, properties.pages)}
                  totalPages={properties.pages}
                  totalItems={properties.total}
                  itemsPerPage={properties.perPage}
                  onPageChange={properties.setPage}
                  onPageSizeChange={properties.setPerPage}
                  pageSizeOptions={[9, 18, 36]}
                  showPageSizeSelector
                  noun="properties"
                />
              </>
            )}
          </div>
        );
      case "projects":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">Projects</h1>
                <p className="text-[#64748B] mt-1 text-sm">Track and manage development projects</p>
              </div>
              {canManage && (
                <button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Plus size={18} />
                  Add Project
                </button>
              )}
            </div>
            {projects.error && (
              <div className="flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-[#EF4444]">
                  <AlertTriangle size={16} />
                  <span>{projects.error}</span>
                </div>
                <button onClick={projects.reload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-100 transition-colors">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}
            {projects.loading && projects.items.length === 0 ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projects.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
                  <ProjectIcon size={32} className="text-[#64748B]" />
                </div>
                <h3 className="text-lg font-medium text-[#0F172A]">No projects yet</h3>
                <p className="text-[#64748B] mt-1 text-sm">Add your first development project to get started.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/50">
                        {["Project Name", "Developer", "Location", "Status", "Units", "Sold", "Price Range", "Completion", ""].map((head) => (
                          <th key={head} className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {projects.items.map((project) => (
                        <tr key={project.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#0F172A]">{project.name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{project.developer}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{project.location}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              project.status === "Completed" ? "bg-green-50 text-[#22C55E] border border-green-100" :
                              project.status === "Under Construction" ? "bg-blue-50 text-[#2563EB] border border-blue-100" :
                              project.status === "On Hold" ? "bg-amber-50 text-[#F59E0B] border border-amber-100" :
                              "bg-slate-50 text-[#64748B] border border-slate-100"
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{project.total_units}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{project.units_sold}</td>
                          <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{project.price_range}</td>
                          <td className="px-6 py-4 text-sm text-[#64748B]">{project.completion_date}</td>
                          <td className="px-6 py-4">
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setEditingProject(project)} className="p-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm({ type: "project", id: project.id })} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={Math.min(projects.page, projects.pages)}
                  totalPages={projects.pages}
                  totalItems={projects.total}
                  itemsPerPage={projects.perPage}
                  onPageChange={projects.setPage}
                  onPageSizeChange={projects.setPerPage}
                  showPageSizeSelector
                  noun="projects"
                />
              </div>
            )}
          </div>
        );
      case "follow-ups":
        return (
          <KanbanBoard
            items={followUps}
            onRefresh={loadFollowUps}
          />
        );
      case "settings":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
              <span className="text-2xl">⚙️</span>
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A]">Settings</h2>
            <p className="text-[#64748B] mt-2 max-w-md">Configure your CRM preferences.</p>
          </div>
        );
      case "roles":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">Roles & Permissions</h1>
                <p className="text-[#64748B] mt-1 text-sm">Manage user roles and access control</p>
              </div>
              <button
                onClick={() => setIsRolesOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
              >
                Manage Roles
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <h3 className="text-lg font-medium text-[#0F172A] mb-4">Permission Matrix</h3>
              <p className="text-sm text-[#64748B] mb-4">Configure what each role can do across modules.</p>
              <button
                onClick={() => setIsPermissionsOpen(true)}
                className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#E2E8F0] transition-colors"
              >
                View Permission Matrix
              </button>
            </div>
          </div>
        );
      case "components":
        return <ComponentBuilder />;
      case "company":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">Company Settings</h1>
                <p className="text-[#64748B] mt-1 text-sm">Configure your agency settings</p>
              </div>
              <button
                onClick={() => setIsCompanyOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
              >
                Edit Settings
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <h3 className="text-lg font-medium text-[#0F172A] mb-4">Company Information</h3>
              <p className="text-sm text-[#64748B] mb-4">
                Set up your company details, branding, and preferences.
              </p>
            </div>
          </div>
        );
      case "help":
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
              <span className="text-2xl">❓</span>
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A]">Help & Support</h2>
            <p className="text-[#64748B] mt-2 max-w-md">Get help with using the CRM.</p>
          </div>
        );
      default:
        return <ConfigurableDashboard onAddLead={() => setIsAddLeadOpen(true)} stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#64748B] mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardLayout activeView={activeView} setActiveView={setActiveView} onFabClick={() => setIsAddLeadOpen(true)}>
        {statsError && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-[#EF4444]">
              <AlertTriangle size={16} />
              <span>{statsError}</span>
            </div>
            <button onClick={() => reloadStats()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-100 transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
        {renderView()}
      </DashboardLayout>

      <AddLeadCard
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onSubmit={handleAddLead}
      />

      <AddPropertyCard
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onSubmit={handleAddProperty}
        projects={allProjects}
      />

      <AddProjectCard
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onSubmit={handleAddProject}
      />

      <PropertyDetailCard
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />

      <AddUserCard
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddUser}
      />

      <EditLeadCard
        key={editingLead?.id ?? 'closed'}
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleEditLead}
        lead={editingLead}
      />

      <EditPropertyCard
        key={editingProperty?.id ?? 'closed'}
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        onSubmit={handleEditProperty}
        onViewProject={() => {
          setEditingProperty(null);
          setActiveView("projects");
        }}
        property={editingProperty}
      />

      <EditProjectCard
        key={editingProject?.id ?? 'closed'}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleEditProject}
        project={editingProject}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
          >
            <h3 className="text-lg font-semibold text-[#0F172A]">Confirm Delete</h3>
            <p className="text-sm text-[#64748B] mt-2">Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                className="flex-1 py-2.5 px-4 bg-[#EF4444] text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <RolesManager
        isOpen={isRolesOpen}
        onClose={() => setIsRolesOpen(false)}
      />

      <PermissionsMatrix
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      <CompanySettings
        isOpen={isCompanyOpen}
        onClose={() => setIsCompanyOpen(false)}
      />
    </>
  );
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardContent />;
}
