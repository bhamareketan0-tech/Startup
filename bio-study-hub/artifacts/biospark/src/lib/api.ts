const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(BASE + path, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "Request failed");
  return json;
}

type Params = Record<string, string | number | boolean | undefined>;

function buildQuery(params?: Params): string {
  if (!params) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const api = {
  get: (path: string, params?: Params) =>
    request("GET", path + buildQuery(params)),
  post: (path: string, body: unknown) => request("POST", path, body),
  put: (path: string, body: unknown) => request("PUT", path, body),
  del: (path: string) => request("DELETE", path),
};
