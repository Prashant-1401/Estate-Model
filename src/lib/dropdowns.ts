"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Dropdown, DropdownOption } from "@/lib/types";

export async function fetchDropdowns(): Promise<Dropdown[]> {
  try {
    const res = await api.get<Dropdown[]>("/api/dropdowns/list");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export function useDropdowns() {
  const [dropdowns, setDropdowns] = useState<Dropdown[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setDropdowns(await fetchDropdowns());
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  return { dropdowns, loading, reload: load };
}

export async function fetchDropdownOptions(
  category: string
): Promise<DropdownOption[]> {
  try {
    const res = await api.get<DropdownOption[]>(`/api/dropdowns/all?category=${category}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export function useDropdownOptions(category: string) {
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
