const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("estatecrm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const json = JSON.parse(text);
      detail = json.detail || text;
    } catch {}
    throw new Error(detail || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, { headers: authHeaders() }).then(
      (r) => handleResponse<T>(r)
    ),

  post: <T>(path: string, body?: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r)),

  put: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r)),

  delete: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then((r) => handleResponse<T>(r)),
};
