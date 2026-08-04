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

export async function fetchDropdownOptions(
  category: DropdownCategory
): Promise<DropdownOption[]> {
  try {
    const res = await api.get<DropdownOption[]>(`/api/dropdowns/all?category=${category}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
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
