const API_BASE = "";

const REQUEST_TIMEOUT_MS = 20000;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const json = await res.json();
      if (json && typeof json === "object") {
        const d = (json as { detail?: unknown }).detail;
        if (typeof d === "string") {
          detail = d;
        } else if (Array.isArray(d)) {
          const msgs = d.map((e) => (e && typeof e === "object" && "msg" in e ? String(e.msg) : "")).filter(Boolean);
          if (msgs.length) detail = msgs.join("; ");
        }
      }
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error("Network error: could not reach the server.");
  } finally {
    clearTimeout(timeout);
  }
  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
