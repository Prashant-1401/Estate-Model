import { api } from "@/lib/api";
import type { FormConfig } from "@/lib/types";
import type { EntityType } from "@/lib/form-keys";

export async function getEntityForms(entityType: EntityType): Promise<FormConfig[]> {
  try {
    const res = await api.get<FormConfig[]>(`/api/forms/all?entity_type=${entityType}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}
