import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, RefreshCw } from "lucide-react";

const CLASSES = [
  {
    cls: "11",
    label: "Class 11",
    desc: "Foundation topics — Botany, Zoology, Cell Biology & more",
    tag: null,
  },
  {
    cls: "12",
    label: "Class 12",
    desc: "Advanced topics — Genetics, Evolution, Biotechnology & more",
    tag: null,
  },
  {
    cls: "dropper",
    label: "Dropper",
    desc: "Complete NEET syllabus — All Class 11 & 12 Biology topics",
    tag: "NEET Repeater",
  },
];

export function ClassSelectPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-['Space_Grotesk'] transition-colors duration-300"
      style={{ background: "transparent", color: "var(--bs-text)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 blur-[100px] pointer-events-none"
        style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 12%, transparent)` }}
      />

      <div className="relative z-10 w-full max-w-4xl px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 border px-4 py-2 mb-6 transform -skew-x-12"
            style={{ background: "var(--bs-surface)", borderColor: "var(--bs-accent-hex)" }}
          >
            <span className="text-sm font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
              Choose Class
            </span>
          </div>
          <h1 className="text-5xl font-black mb-3 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
            Select Your <span style={{ color: "var(--bs-accent-hex)" }}>Class</span>
          </h1>
          <p className="font-mono uppercase tracking-wide text-sm" style={{ color: "var(--bs-text-muted)" }}>
            Choose your NEET preparation class to get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CLASSES.map(({ cls, label, desc, tag }) => (
            <button
              key={cls}
              onClick={() => navigate(`/chapters/${cls}`)}
              className="group border border-l-4 p-8 text-left transition-all relative overflow-hidden shadow-sm"
              style={{
                background: "var(--bs-surface)",
                borderColor: "var(--bs-border-subtle)",
                borderLeftColor: "var(--bs-accent-hex)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                style={{ background: "var(--bs-accent-hex)" }}
              />
              <div
                className="w-16 h-16 border flex items-center justify-center mb-6 transform -skew-x-12 transition-colors"
                style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
              >
                {cls === "dropper" ? (
                  <RefreshCw className="w-8 h-8 transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }} />
                ) : (
                  <BookOpen className="w-8 h-8 transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }} />
                )}
              </div>
              <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
                {label}
              </h2>
              {tag && (
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border mb-3"
                  style={{
                    background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)`,
                    borderColor: `color-mix(in srgb, var(--bs-accent-hex) 30%, transparent)`,
                    color: "var(--bs-accent-hex)",
                  }}
                >
                  {tag}
                </span>
              )}
              <p className="font-mono text-sm mb-6 uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>{desc}</p>
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm" style={{ color: "var(--bs-accent-hex)" }}>
                Start Practicing
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
