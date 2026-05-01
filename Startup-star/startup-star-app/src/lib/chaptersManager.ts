import { chapters11 as defaultChapters11, chapters12 as defaultChapters12 } from "./chapters";
import type { Chapter } from "./chapters";

const LS_KEY_11 = "biospark_chapters_11";
const LS_KEY_12 = "biospark_chapters_12";

export type { Chapter };

export function getChapters(cls: "11" | "12"): Chapter[] {
  try {
    const key = cls === "11" ? LS_KEY_11 : LS_KEY_12;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Chapter[];
    }
  } catch {}
  return cls === "11" ? JSON.parse(JSON.stringify(defaultChapters11)) : JSON.parse(JSON.stringify(defaultChapters12));
}

export function saveChapters(cls: "11" | "12", chapters: Chapter[]): void {
  const key = cls === "11" ? LS_KEY_11 : LS_KEY_12;
  localStorage.setItem(key, JSON.stringify(chapters));
}

export function resetChapters(cls: "11" | "12"): void {
  const key = cls === "11" ? LS_KEY_11 : LS_KEY_12;
  localStorage.removeItem(key);
}

export function hasOverride(cls: "11" | "12"): boolean {
  const key = cls === "11" ? LS_KEY_11 : LS_KEY_12;
  return localStorage.getItem(key) !== null;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
