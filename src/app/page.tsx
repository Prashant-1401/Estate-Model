"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/Layout";
import { DashboardView } from "@/components/DashboardView";
import { LeadsTable } from "@/components/LeadsTable";
import { CustomerProfile } from "@/components/CustomerProfile";
import { AddLeadCard } from "@/components/AddLeadCard";
import { PropertyCard } from "@/components/PropertyCard";
import { Plus } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: string;
  area: string;
  type: string;
  source: string;
  status: "Hot" | "Warm" | "New" | "Cold";
  assigned: string;
  date: string;
}

const initialLeads: Lead[] = [
  { id: "LD-1024", name: "Ahmed Al-Mansoori", phone: "+971 50 123 4567", budget: "$1.2M - $1.5M", area: "Palm Jumeirah", type: "Villa", source: "Website", status: "Hot", assigned: "Sarah M.", date: "Jul 19, 2026" },
  { id: "LD-1025", name: "Elena Rostova", phone: "+971 55 987 6543", budget: "$800K - $1M", area: "Downtown", type: "Apartment", source: "Referral", status: "Warm", assigned: "John D.", date: "Jul 20, 2026" },
  { id: "LD-1026", name: "Chen Wei", phone: "+971 52 456 7890", budget: "$2M+", area: "Emirates Hills", type: "Mansion", source: "Portal", status: "New", assigned: "Unassigned", date: "Jul 21, 2026" },
];

const sampleProperties = [
  {
    id: "1",
    title: "Luxury 5BR Villa with Private Beach",
    location: "Palm Jumeirah, Dubai",
    price: "$1.45M",
    bedrooms: 5,
    bathrooms: 6,
    area: "4,500",
    type: "Villa",
    status: "Available" as const,
    featured: true,
  },
  {
    id: "2",
    title: "Modern 2BR Apartment with Burj View",
    location: "Downtown Dubai",
    price: "$850K",
    bedrooms: 2,
    bathrooms: 3,
    area: "1,200",
    type: "Apartment",
    status: "Available" as const,
  },
  {
    id: "3",
    title: "Exclusive 8BR Mansion",
    location: "Emirates Hills, Dubai",
    price: "$2.8M",
    bedrooms: 8,
    bathrooms: 10,
    area: "12,000",
    type: "Mansion",
    status: "Reserved" as const,
  },
];

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const handleAddLead = (leadData: Record<string, string>) => {
    const newLead: Lead = {
      id: `LD-${1027 + leads.length}`,
      name: leadData.name,
      phone: leadData.phone,
      budget: leadData.budget,
      area: leadData.area,
      type: leadData.propertyType,
      source: leadData.source || "Direct",
      status: "New",
      assigned: "Unassigned",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard": 
        return <DashboardView onAddLead={() => setIsAddLeadOpen(true)} />;
      case "leads": 
        return <LeadsTable leads={leads} onAddLead={() => setIsAddLeadOpen(true)} />;
      case "customers": 
        return <CustomerProfile />;
      case "properties":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F172A]">Properties</h1>
                <p className="text-[#64748B] mt-1 text-sm">Browse and manage property listings</p>
              </div>
              <button 
                onClick={() => setIsAddLeadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus size={18} />
                Add Property
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
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
    </>
  );
}
