"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/Layout";
import { DashboardView } from "@/components/DashboardView";
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
import { Plus, Building2 as ProjectIcon, Edit2, Trash2 } from "lucide-react";
import type { Property, Project, Lead, UserData } from "@/lib/types";
import { InquiryTable } from "@/components/InquiryTable";
import type { Inquiry } from "@/lib/types";

function DashboardContent() {
  const { hasRole } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  async function reload() {
    const [l, p, pr, u, i] = await Promise.all([
      api.get<Lead[]>("/api/leads").catch(() => [] as Lead[]),
      api.get<Property[]>("/api/properties").catch(() => [] as Property[]),
      api.get<Project[]>("/api/projects").catch(() => [] as Project[]),
      api.get<UserData[]>("/api/users").catch(() => [] as UserData[]),
      api.get<Inquiry[]>("/api/inquiries").catch(() => [] as Inquiry[]),
    ]);
    setLeads(l);
    setProperties(p);
    setProjects(pr);
    setUsers(u);
    setInquiries(i);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await reload();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAddLead = async (leadData: Record<string, string>) => {
    try {
      await api.post("/api/leads", {
        name: leadData.name,
        phone: leadData.phone,
        budget: leadData.budget,
        area: leadData.area,
        type: leadData.propertyType,
        source: leadData.source || "Direct",
        status: "New",
        assigned: "Unassigned",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
      await reload();
    } catch {}
  };

  const handleAddProperty = async (property: Property) => {
    try {
      await api.post("/api/properties", property);
      await reload();
    } catch {}
  };

  const handleAddProject = async (project: Project) => {
    try {
      await api.post("/api/projects", project);
      await reload();
    } catch {}
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
      await reload();
    } catch {}
  };

  const handleEditLead = async (id: string, data: Record<string, string>) => {
    try {
      await api.put(`/api/leads/${id}`, {
        name: data.name,
        phone: data.phone,
        budget: data.budget,
        area: data.area,
        type: data.propertyType,
        source: data.source,
        status: data.status,
      });
      await reload();
    } catch {}
  };

  const handleEditProperty = async (id: string, property: Property) => {
    try {
      await api.put(`/api/properties/${id}`, property);
      await reload();
    } catch {}
  };

  const handleEditProject = async (id: string, project: Project) => {
    try {
      await api.put(`/api/projects/${id}`, project);
      await reload();
    } catch {}
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const endpoint = type === "lead" ? "leads" : type === "property" ? "properties" : type === "project" ? "projects" : null;
      if (endpoint) {
        await api.delete(`/api/${endpoint}/${id}`);
        await reload();
      }
    } catch {}
    setDeleteConfirm(null);
  };

  const canManage = hasRole("admin", "manager");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView onAddLead={() => setIsAddLeadOpen(true)} />;
      case "leads":
        return (
          <LeadsTable
            leads={leads}
            onAddLead={() => setIsAddLeadOpen(true)}
            onEdit={canManage ? (lead) => setEditingLead(lead) : undefined}
            onDelete={canManage ? (id) => setDeleteConfirm({ type: "lead", id }) : undefined}
          />
        );
      case "inquiries":
        return <InquiryTable inquiries={inquiries} />;
      case "customers":
        return <CustomerProfile />;
      case "users":
        if (!hasRole("admin")) {
          return (
            <div className="flex items-center justify-center h-[60vh] text-[#64748B]">
              You do not have permission to view this page.
            </div>
          );
        }
        return <UsersTable users={users} onAddUser={() => setIsAddUserOpen(true)} />;
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
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#E2E8F0]">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-medium text-[#0F172A]">No properties yet</h3>
                <p className="text-[#64748B] mt-1 text-sm">Add your first property to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
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
                    onViewDetails={(id) => {
                      const p = properties.find((pr) => pr.id === id);
                      if (p) setSelectedProperty(p);
                    }}
                    onEdit={canManage ? (id) => {
                      const p = properties.find((pr) => pr.id === id);
                      if (p) setEditingProperty(p);
                    } : undefined}
                    onDelete={canManage ? (id) => setDeleteConfirm({ type: "property", id }) : undefined}
                  />
                ))}
              </div>
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
            {projects.length === 0 ? (
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
                      {projects.map((project) => (
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
              </div>
            )}
          </div>
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
        return <DashboardView onAddLead={() => setIsAddLeadOpen(true)} />;
    }
  };

  return (
    <>
      <DashboardLayout activeView={activeView} setActiveView={setActiveView} onFabClick={() => setIsAddLeadOpen(true)}>
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
