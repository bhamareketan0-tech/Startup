import { chapters11 as defaultChapters11, chapters12 as defaultChapters12 } from "./chapters";
import type { Chapter } from "./chapters";

export type { Chapter };

const API_BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";
const memCache: Record<string, Chapter[]> = {};

export async function fetchChaptersFromAPI(cls: string): Promise<Chapter[]> {
  try {
    const res = await fetch(`${API_BASE}/chapters?class=${cls}`, { credentials: "include" });
    if (!res.ok) throw new Error("API error");
    const json = await res.json() as { data: Chapter[] };
    if (Array.isArray(json.data) && json.data.length > 0) {
      memCache[cls] = json.data;
      return json.data;
    }
  } catch { /* fall through to defaults */ }
  if (cls === "dropper") {
    const all = [...defaultChapters11, ...defaultChapters12];
    memCache[cls] = all;
    return all;
  }
  const defaults = cls === "11" ? defaultChapters11 : defaultChapters12;
  memCache[cls] = defaults;
  return defaults;
}

export async function saveChaptersToAPI(cls: string, chapters: Chapter[]): Promise<void> {
  const res = await fetch(`${API_BASE}/chapters/bulk`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
  if (memCache[cls] && memCache[cls].length > 0) return memCache[cls];
  if (cls === "dropper") {
    const all = [...defaultChapters11, ...defaultChapters12];
    memCache[cls] = JSON.parse(JSON.stringify(all));
    return memCache[cls];
  }
  const defaults = cls === "11" ? defaultChapters11 : defaultChapters12;
  memCache[cls] = JSON.parse(JSON.stringify(defaults));
  return memCache[cls];
}

export function hasOverride(_cls: string): boolean {
  return false;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function saveChapters(_cls: string, _chapters: Chapter[]): void {}
export function resetChapters(_cls: string): void {}
