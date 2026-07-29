export type ProjectStatus = "Planning" | "Under Construction" | "Completed" | "On Hold";

export interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  status: ProjectStatus;
  totalUnits: number;
  unitsSold: number;
  launchDate: string;
  completionDate: string;
  priceRange: string;
  description: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
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
  propertyId?: string;
  assignedTo?: string;
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
  projectId?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  area: string;
  budget: string;
  message: string;
  source: string;
  status: "New" | "Contacted" | "Closed";
  date: string;
}