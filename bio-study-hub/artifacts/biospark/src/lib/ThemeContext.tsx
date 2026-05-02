import { createContext, useContext, useEffect } from "react";

export type ThemeMode = "dark" | "light";
export type BgAnimName = "cosmos";

export interface ThemeContextValue {
  mode: ThemeMode;
  bgAnim: BgAnimName;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  bgAnim: "cosmos",
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.removeAttribute("data-theme");
  }, []);

  return (
    <ThemeContext.Provider value={{ mode: "dark", bgAnim: "cosmos", setMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
