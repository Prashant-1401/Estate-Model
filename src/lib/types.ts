export type Role = "admin" | "manager" | "agent";

export type ProjectStatus = "Planning" | "Under Construction" | "Completed" | "On Hold";

export interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  status: ProjectStatus;
  total_units: number;
  units_sold: number;
  launch_date: string;
  completion_date: string;
  price_range: string;
  description: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "Active" | "Inactive";
  created: string;
}

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
  property_id?: string;
  assigned_to?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  status: "Available" | "Reserved" | "Sold";
  images: string[];
  featured?: boolean;
  project_id?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  property_type: string;
  area: string;
  budget: string;
  message: string;
  source: string;
  status: "New" | "Contacted" | "Closed";
  date: string;
}

export interface DashboardStats {
  total_leads: number;
  today_leads: number;
  hot_leads: number;
  total_properties: number;
  total_projects: number;
  total_inquiries: number;
  total_users: number;
  revenue_mtd: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: string;
  initials: string;
}