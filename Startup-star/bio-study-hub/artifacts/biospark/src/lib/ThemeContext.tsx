import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type DarkTheme = "midnight" | "obsidian" | "forest" | "cosmic";
export type LightTheme = "chalk" | "parchment" | "sky" | "blossom";
export type ThemeName = DarkTheme | LightTheme;
export type BgAnimName = "cosmos" | "aurora" | "matrix" | "neural" | "fireflies";

export const BG_ANIM_META: Record<BgAnimName, { label: string; icon: string; desc: string }> = {
  cosmos:    { label: "Cosmos",    icon: "🌌", desc: "Stars & shooting stars" },
  aurora:    { label: "Aurora",    icon: "🌊", desc: "Northern lights waves" },
  matrix:    { label: "Matrix",    icon: "💚", desc: "Digital rain" },
  neural:    { label: "Neural",    icon: "🔵", desc: "Connected particles" },
  fireflies: { label: "Fireflies", icon: "✨", desc: "Glowing fireflies" },
};

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeName;
  bgAnim: BgAnimName;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: ThemeName) => void;
  setBgAnim: (anim: BgAnimName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  theme: "midnight",
  bgAnim: "cosmos",
  setMode: () => {},
  setTheme: () => {},
  setBgAnim: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const DARK_THEMES: DarkTheme[] = ["midnight", "obsidian", "forest", "cosmic"];
const LIGHT_THEMES: LightTheme[] = ["chalk", "parchment", "sky", "blossom"];

export const THEME_META: Record<ThemeName, { label: string; swatch: string; mode: ThemeMode }> = {
  midnight:  { label: "Midnight",  swatch: "#00ff87", mode: "dark" },
  obsidian:  { label: "Obsidian",  swatch: "#a855f7", mode: "dark" },
  forest:    { label: "Forest",    swatch: "#84cc16", mode: "dark" },
  cosmic:    { label: "Cosmic",    swatch: "#22d3ee", mode: "dark" },
  chalk:     { label: "Chalk",     swatch: "#65a30d", mode: "light" },
  parchment: { label: "Parchment", swatch: "#ea580c", mode: "light" },
  sky:       { label: "Sky",       swatch: "#4338ca", mode: "light" },
  blossom:   { label: "Blossom",   swatch: "#9333ea", mode: "light" },
};

export { DARK_THEMES, LIGHT_THEMES };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    (localStorage.getItem("bs-mode") as ThemeMode) || "dark"
  );
  const [theme, setThemeState] = useState<ThemeName>(() =>
    (localStorage.getItem("bs-theme") as ThemeName) || "midnight"
  );
  const [bgAnim, setBgAnimState] = useState<BgAnimName>(() =>
    (localStorage.getItem("bs-bganim") as BgAnimName) || "cosmos"
  );

  function applyTheme(newMode: ThemeMode, newTheme: ThemeName) {
    const html = document.documentElement;
    if (newMode === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    html.setAttribute("data-theme", newTheme);
  }

  useEffect(() => {
    applyTheme(mode, theme);
  }, [mode, theme]);

  function setMode(newMode: ThemeMode) {
    const defaultTheme = newMode === "dark" ? "midnight" : "chalk";
    setModeState(newMode);
    setThemeState(defaultTheme);
    localStorage.setItem("bs-mode", newMode);
    localStorage.setItem("bs-theme", defaultTheme);
  }

  function setTheme(newTheme: ThemeName) {
    const meta = THEME_META[newTheme];
    setModeState(meta.mode);
    setThemeState(newTheme);
    localStorage.setItem("bs-mode", meta.mode);
    localStorage.setItem("bs-theme", newTheme);
  }

  function setBgAnim(anim: BgAnimName) {
    setBgAnimState(anim);
    localStorage.setItem("bs-bganim", anim);
  }

  return (
    <ThemeContext.Provider value={{ mode, theme, bgAnim, setMode, setTheme, setBgAnim }}>
      {children}
    </ThemeContext.Provider>
  );
}
