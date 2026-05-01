import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme, THEME_META, DARK_THEMES, LIGHT_THEMES, BG_ANIM_META, ThemeName, ThemeMode, BgAnimName } from "@/lib/ThemeContext";

const BG_ANIMS: BgAnimName[] = ["cosmos", "aurora", "matrix", "neural", "fireflies"];

export function ThemePicker() {
  const { mode, theme, bgAnim, setMode, setTheme, setBgAnim } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {open && (
        <div
          className="absolute bottom-14 right-0 w-72 rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            background: "var(--bs-picker-bg)",
            borderColor: "var(--bs-picker-border)",
          }}
        >
          {/* ── Background Animation ── */}
          <div className="px-4 pt-4 pb-1">
            <div
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: "var(--bs-picker-label)" }}
            >
              Background Animation
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {BG_ANIMS.map((anim) => {
                const meta = BG_ANIM_META[anim];
                const isActive = bgAnim === anim;
                return (
                  <button
                    key={anim}
                    onClick={() => setBgAnim(anim)}
                    title={meta.desc}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all border ${
                      isActive
                        ? "border-white/30 bg-white/15 scale-105"
                        : "border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    style={{ color: "var(--bs-picker-label)" }}
                  >
                    <span className="text-lg leading-none">{meta.icon}</span>
                    <span className="text-[9px] leading-none opacity-80">{meta.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-4 my-3 h-px" style={{ background: "var(--bs-picker-border)" }} />

          {/* ── Colour Theme ── */}
          <div className="px-4 pb-1">
            <div
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: "var(--bs-picker-label)" }}
            >
              Colour Theme
            </div>

            {/* Mode toggle */}
            <div
              className="flex rounded-lg overflow-hidden border mb-3"
              style={{ borderColor: "var(--bs-picker-border)" }}
            >
              {(["dark", "light"] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    background: mode === m ? "hsl(var(--primary))" : "transparent",
                    color: mode === m ? "hsl(var(--primary-foreground))" : "var(--bs-picker-label)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Dark themes */}
            <div
              className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50"
              style={{ color: "var(--bs-picker-label)" }}
            >
              Dark
            </div>
            <div className="flex gap-2 mb-1">
              {DARK_THEMES.map((t) => {
                const meta = THEME_META[t];
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    title={meta.label}
                    onClick={() => setTheme(t)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: meta.swatch,
                      outline: isActive ? `2px solid ${meta.swatch}` : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  >
                    {isActive && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mb-3">
              {DARK_THEMES.map((t) => (
                <div
                  key={t}
                  className="w-9 text-center text-[9px] font-mono uppercase opacity-40"
                  style={{ color: "var(--bs-picker-label)" }}
                >
                  {THEME_META[t].label.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Light themes */}
            <div
              className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-50"
              style={{ color: "var(--bs-picker-label)" }}
            >
              Light
            </div>
            <div className="flex gap-2 mb-1">
              {LIGHT_THEMES.map((t) => {
                const meta = THEME_META[t];
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    title={meta.label}
                    onClick={() => setTheme(t)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: meta.swatch,
                      outline: isActive ? `2px solid ${meta.swatch}` : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  >
                    {isActive && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pb-4">
              {LIGHT_THEMES.map((t) => (
                <div
                  key={t}
                  className="w-9 text-center text-[9px] font-mono uppercase opacity-40"
                  style={{ color: "var(--bs-picker-label)" }}
                >
                  {THEME_META[t].label.slice(0, 3)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
        }}
        title="Background & theme"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
}
