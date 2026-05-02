import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import type { BgAnimName, ColorScheme } from "@/lib/ThemeContext";

const BG_OPTIONS: { id: BgAnimName; label: string; icon: string }[] = [
  { id: "cosmos",  label: "Cosmos",  icon: "✦" },
  { id: "matrix",  label: "Matrix",  icon: "⌘" },
  { id: "aurora",  label: "Aurora",  icon: "≋" },
  { id: "neural",  label: "Neural",  icon: "⬡" },
  { id: "void",    label: "Void",    icon: "◎" },
];

const COLOR_OPTIONS: { id: ColorScheme; label: string; hex: string; dark: boolean }[] = [
  { id: "neon-green",    label: "Emerald", hex: "#00D97E", dark: true  },
  { id: "cyber-blue",    label: "Electric",hex: "#3B82F6", dark: true  },
  { id: "plasma-purple", label: "Violet",  hex: "#8B5CF6", dark: true  },
  { id: "solar-orange",  label: "Amber",   hex: "#F59E0B", dark: true  },
  { id: "arctic-light",  label: "Cloud",   hex: "#059669", dark: false },
  { id: "sky-light",     label: "Ocean",   hex: "#4F46E5", dark: false },
  { id: "rose-light",    label: "Orchid",  hex: "#9333EA", dark: false },
  { id: "amber-light",   label: "Sand",    hex: "#B45309", dark: false },
];

export function ThemePicker() {
  const { bgAnim, colorScheme, setBgAnim, setColorScheme } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", esc); };
  }, [open]);

  const accent = COLOR_OPTIONS.find(c => c.id === colorScheme)?.hex ?? "#00FF9D";
  const isDark = COLOR_OPTIONS.find(c => c.id === colorScheme)?.dark ?? true;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      {open && (
        <div
          ref={panelRef}
          style={{
            width: 288,
            marginBottom: 4,
            overflow: "hidden",
            background: isDark ? "#0d0d0d" : "#ffffff",
            border: `1px solid ${accent}30`,
            boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            animation: "picker-in 0.15s ease-out",
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: `${accent}20` }}>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
              Background
            </p>
          </div>
          <div className="px-4 py-3 flex gap-2">
            {BG_OPTIONS.map(bg => (
              <button
                key={bg.id}
                onClick={() => setBgAnim(bg.id)}
                title={bg.label}
                className="flex-1 flex flex-col items-center gap-1 py-2 border text-xs font-black uppercase transition-all duration-150"
                style={{
                  borderColor: bgAnim === bg.id ? accent : `${accent}25`,
                  background: bgAnim === bg.id ? `${accent}18` : "transparent",
                  color: bgAnim === bg.id ? accent : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                }}
              >
                <span className="text-lg leading-none">{bg.icon}</span>
                <span className="text-[9px]">{bg.label}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pt-1 pb-2 border-t" style={{ borderColor: `${accent}20` }}>
            <p className="text-xs font-black uppercase tracking-[0.18em] mt-2 mb-3" style={{ color: accent }}>
              Color Theme
            </p>
            <div className="mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5"
                 style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
                Dark
              </p>
              <div className="flex gap-2">
                {COLOR_OPTIONS.filter(c => c.dark).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColorScheme(c.id)}
                    title={c.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-9 h-9 rounded-none transition-all duration-150"
                      style={{
                        background: c.hex,
                        outline: colorScheme === c.id ? `2px solid ${c.hex}` : "2px solid transparent",
                        outlineOffset: "3px",
                        boxShadow: colorScheme === c.id ? `0 0 12px ${c.hex}88` : "none",
                      }}
                    />
                    <span className="text-[9px] font-black uppercase"
                          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5"
                 style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
                Light
              </p>
              <div className="flex gap-2">
                {COLOR_OPTIONS.filter(c => !c.dark).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColorScheme(c.id)}
                    title={c.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-9 h-9 rounded-none border transition-all duration-150"
                      style={{
                        background: c.hex,
                        borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                        outline: colorScheme === c.id ? `2px solid ${c.hex}` : "2px solid transparent",
                        outlineOffset: "3px",
                        boxShadow: colorScheme === c.id ? `0 0 12px ${c.hex}66` : "none",
                      }}
                    />
                    <span className="text-[9px] font-black uppercase"
                          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t" style={{ borderColor: `${accent}20` }}>
            <p className="text-[9px] font-black uppercase tracking-widest"
               style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>
              Settings saved automatically
            </p>
          </div>
        </div>
      )}

      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-label="Theme settings"
        style={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: open ? accent : `${accent}22`,
          border: `2px solid ${accent}`,
          color: open ? (isDark ? "#000" : "#fff") : accent,
          boxShadow: open ? `0 0 28px ${accent}66, 0 4px 20px rgba(0,0,0,0.5)` : `0 0 16px ${accent}33, 0 4px 16px rgba(0,0,0,0.4)`,
          transform: open ? "rotate(45deg)" : "none",
          transition: "all 0.2s ease",
          outline: "none",
          padding: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
      </button>

      <style>{`
        @keyframes picker-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
