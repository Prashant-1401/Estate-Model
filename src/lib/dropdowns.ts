"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { DropdownCategory, DropdownOption } from "@/lib/types";

export const DROPDOWN_CATEGORIES: { id: DropdownCategory; label: string }[] = [
  { id: "budget", label: "Budget Range" },
  { id: "area", label: "Preferred Area" },
  { id: "property_type", label: "Property Type" },
  { id: "property_status", label: "Property Status" },
  { id: "project_status", label: "Project Status" },
  { id: "followup_status", label: "Follow-up Status" },
];

export const DEFAULT_DROPDOWN_OPTIONS: Record<DropdownCategory, DropdownOption[]> = {
  budget: ["₹50L - ₹80L", "₹80L - ₹1Cr", "₹1Cr - ₹1.5Cr", "₹1.5Cr - ₹2Cr", "₹2Cr+"].map((value, i) => ({
    id: `dd-budget-${i}`,
    category: "budget",
    label: value,
    value,
    color: "",
    sort_order: i,
    is_active: true,
  })),
  area: ["Palm Jumeirah", "Downtown Dubai", "Emirates Hills", "Dubai Marina", "Business Bay"].map((value, i) => ({
    id: `dd-area-${i}`,
    category: "area",
    label: value,
    value,
    color: "",
    sort_order: i,
    is_active: true,
  })),
  property_type: ["Villa", "Apartment", "Penthouse", "Townhouse"].map((value, i) => ({
    id: `dd-property_type-${i}`,
    category: "property_type",
    label: value,
    value,
    color: "",
    sort_order: i,
    is_active: true,
  })),
  property_status: [
    { label: "Available", color: "#10B981" },
    { label: "Reserved", color: "#F59E0B" },
    { label: "Sold", color: "#EF4444" },
  ].map(({ label, color }, i) => ({
    id: `dd-property_status-${i}`,
    category: "property_status",
    label,
    value: label,
    color,
    sort_order: i,
    is_active: true,
  })),
  project_status: ["Planning", "Under Construction", "Completed", "On Hold"].map((value, i) => ({
    id: `dd-project_status-${i}`,
    category: "project_status",
    label: value,
    value,
    color: "",
    sort_order: i,
    is_active: true,
  })),
  followup_status: ["Today", "Tomorrow", "This Week", "Decision Pending"].map((value, i) => ({
    id: `dd-followup_status-${i}`,
    category: "followup_status",
    label: value,
    value,
    color: "",
    sort_order: i,
    is_active: true,
  })),
};

export async function fetchDropdownOptions(
  category: DropdownCategory
): Promise<DropdownOption[]> {
  try {
    const res = await api.get<DropdownOption[]>(`/api/dropdowns/all?category=${category}`);
    const options = Array.isArray(res) ? res : [];
    return options.length > 0 ? options : DEFAULT_DROPDOWN_OPTIONS[category];
  } catch {
    return DEFAULT_DROPDOWN_OPTIONS[category];
  }
}

export function useDropdownOptions(category: DropdownCategory) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setOptions(await fetchDropdownOptions(category));
    setLoading(false);
  }, [category]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  return { options, loading, reload: load };
}
