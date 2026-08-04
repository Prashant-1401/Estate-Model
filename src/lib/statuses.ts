"use client";

import { useEffect, useState, useCallback, type CSSProperties } from "react";
import { api } from "@/lib/api";
import type { StatusConfig } from "@/lib/types";

export async function fetchLeadStatuses(): Promise<StatusConfig[]> {
  try {
    const res = await api.get<StatusConfig[]>("/api/config/statuses/all?entity_type=lead");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export function useLeadStatuses() {
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setStatuses(await fetchLeadStatuses());
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  return { statuses, loading, reload: load };
}

export function statusBadgeStyle(color?: string): CSSProperties {
  if (!color) {
    return { backgroundColor: "#F1F5F9", color: "#64748B", borderColor: "#E2E8F0" };
  }
  return { backgroundColor: `${color}1A`, color, borderColor: `${color}40` };
}
