import type { Chapter } from "./chapters";

export type { Chapter };

const API_BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";
const memCache: Record<string, Chapter[]> = {};

export async function fetchChaptersFromAPI(cls: string): Promise<Chapter[]> {
  const res = await fetch(`${API_BASE}/chapters?class=${cls}`, {  });
  if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.status}`);
  const json = await res.json() as { data: Chapter[] };
  if (!Array.isArray(json.data)) throw new Error("Invalid chapters response from API");
  memCache[cls] = json.data;
  return json.data;
}

export async function saveChaptersToAPI(cls: string, chapters: Chapter[]): Promise<void> {
  const res = await fetch(`${API_BASE}/chapters/bulk`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    ,
    body: JSON.stringify({ class: cls, chapters }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? "Failed to save chapters");
  }
  const json = await res.json() as { data: Chapter[] };
  if (Array.isArray(json.data)) memCache[cls] = json.data;
}

export function getChapters(cls: string): Chapter[] {
  return memCache[cls] ?? [];
}

export function hasOverride(_cls: string): boolean {
  return false;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function saveChapters(_cls: string, _chapters: Chapter[]): void {}
export function resetChapters(_cls: string): void {}
