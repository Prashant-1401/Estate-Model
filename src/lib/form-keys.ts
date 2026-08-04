import type { FormConfig } from "@/lib/types";

export type EntityType = FormConfig["entity_type"];

export interface EntityFieldOption {
  key: string;
  label: string;
  fieldType?: string;
}

export const ENTITY_FIELDS: Record<EntityType, EntityFieldOption[]> = {
  lead: [
    { key: "name", label: "Full Name", fieldType: "text" },
    { key: "phone", label: "Phone Number", fieldType: "phone" },
    { key: "email", label: "Email Address", fieldType: "email" },
    { key: "budget", label: "Budget", fieldType: "dropdown" },
    { key: "area", label: "Preferred Area", fieldType: "text" },
    { key: "type", label: "Property Type", fieldType: "dropdown" },
    { key: "source", label: "Lead Source", fieldType: "dropdown" },
    { key: "requirement", label: "Requirement / Notes", fieldType: "textarea" },
    { key: "assignedTo", label: "Assign To Agent", fieldType: "agent" },
  ],
  property: [
    { key: "title", label: "Property Title", fieldType: "text" },
    { key: "location", label: "Location", fieldType: "text" },
    { key: "price", label: "Price", fieldType: "currency" },
    { key: "bedrooms", label: "Bedrooms", fieldType: "number" },
    { key: "bathrooms", label: "Bathrooms", fieldType: "number" },
    { key: "area", label: "Area", fieldType: "text" },
    { key: "type", label: "Property Type", fieldType: "dropdown" },
    { key: "status", label: "Status", fieldType: "dropdown" },
    { key: "project_id", label: "Link to Project", fieldType: "project" },
  ],
  project: [
    { key: "name", label: "Project Name", fieldType: "text" },
    { key: "developer", label: "Developer", fieldType: "text" },
    { key: "location", label: "Location", fieldType: "text" },
    { key: "status", label: "Status", fieldType: "dropdown" },
    { key: "total_units", label: "Total Units", fieldType: "number" },
    { key: "units_sold", label: "Units Sold", fieldType: "number" },
    { key: "launch_date", label: "Launch Date", fieldType: "text" },
    { key: "completion_date", label: "Completion Date", fieldType: "text" },
    { key: "price_range", label: "Price Range", fieldType: "text" },
    { key: "description", label: "Description", fieldType: "textarea" },
  ],
};

export function fieldKeyOf(field: { metadata?: Record<string, unknown>; label: string }): string {
  const key = field.metadata?.key;
  return typeof key === "string" && key ? key : field.label;
}
