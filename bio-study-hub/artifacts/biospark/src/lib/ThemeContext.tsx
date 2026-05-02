import { createContext, useContext, useEffect, useState } from "react";

export type BgAnimName = "cosmos" | "matrix" | "aurora" | "neural" | "void";
export type ColorScheme =
  | "neon-green" | "cyber-blue" | "plasma-purple" | "solar-orange"
  | "arctic-light" | "sky-light" | "rose-light" | "amber-light";
export type ThemeMode = "dark" | "light";

const DARK_SCHEMES: ColorScheme[] = ["neon-green", "cyber-blue", "plasma-purple", "solar-orange"];

export interface ThemeContextValue {
  mode: ThemeMode;
  bgAnim: BgAnimName;
  colorScheme: ColorScheme;
  setMode: (m: ThemeMode) => void;
  setBgAnim: (b: BgAnimName) => void;
  setColorScheme: (c: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark", bgAnim: "cosmos", colorScheme: "neon-green",
  setMode: () => {}, setBgAnim: () => {}, setColorScheme: () => {},
});

export function useTheme() { return useContext(ThemeContext); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeRaw] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem("bs-mode") as ThemeMode) || "dark"; } catch { return "dark"; }
  });
  const [bgAnim, setBgAnimRaw] = useState<BgAnimName>(() => {
    try { return (localStorage.getItem("bs-bg") as BgAnimName) || "cosmos"; } catch { return "cosmos"; }
  });
  const [colorScheme, setColorSchemeRaw] = useState<ColorScheme>(() => {
    try { return (localStorage.getItem("bs-scheme") as ColorScheme) || "neon-green"; } catch { return "neon-green"; }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (mode === "dark") { html.classList.add("dark"); html.classList.remove("light"); }
    else { html.classList.remove("dark"); html.classList.add("light"); }
    html.setAttribute("data-scheme", colorScheme);
    try {
      localStorage.setItem("bs-mode", mode);
      localStorage.setItem("bs-bg", bgAnim);
      localStorage.setItem("bs-scheme", colorScheme);
    } catch { /* ignore */ }
  }, [mode, bgAnim, colorScheme]);

  const setColorScheme = (c: ColorScheme) => {
    setColorSchemeRaw(c);
    setModeRaw(DARK_SCHEMES.includes(c) ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ mode, bgAnim, colorScheme,
      setMode: setModeRaw, setBgAnim: setBgAnimRaw, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
