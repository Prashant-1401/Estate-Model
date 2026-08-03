import { api } from "@/lib/api";
import type { Activity } from "@/lib/types";

export type ActivityType = "call" | "chat" | "note";

export async function logLeadActivity(leadId: string, type: ActivityType, note = ""): Promise<Activity | null> {
  try {
    return await api.post<Activity>(`/api/leads/${leadId}/activities`, { type, note });
  } catch {
    return null;
  }
}

export async function getLeadActivities(leadId: string): Promise<Activity[]> {
  try {
    const res = await api.get<Activity[]>(`/api/leads/${leadId}/activities`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}
