import { useParams, useNavigate } from "react-router-dom";
import { getChapters } from "@/lib/chaptersManager";
import { ChevronRight, ArrowLeft } from "lucide-react";

export function SubunitsPage() {
  const { cls, chapterId } = useParams<{ cls: string; chapterId: string }>();
  const navigate = useNavigate();

  const chapters = getChapters((cls as "11" | "12") || "11");
  const chapter = chapters.find((c) => c.id === chapterId);

  if (!chapter) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-['Space_Grotesk']"
        style={{ background: "transparent" }}
      >
        <p className="uppercase tracking-widest font-black" style={{ color: "var(--bs-text)" }}>Chapter not found</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative font-['Space_Grotesk']"
      style={{ background: "transparent" }}
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
        style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 8%, transparent)` }}
      />

      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/chapters/${cls}`)}
            className="flex items-center gap-2 transition-colors mb-8 font-mono uppercase tracking-wide text-sm"
            style={{ color: "var(--bs-text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chapters
          </button>

          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 border px-3 py-1 mb-4 transform -skew-x-12"
              style={{ background: "var(--bs-surface)", borderColor: "var(--bs-accent-hex)" }}
            >
              <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
                Class {cls} — Biology
              </span>
            </div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>{chapter.name}</h1>
            <p className="font-mono uppercase tracking-wide text-sm" style={{ color: "var(--bs-text-muted)" }}>
              {chapter.subunits.length} subunits to practice
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {chapter.subunits.map((subunit, index) => (
              <button
                key={subunit}
                onClick={() => navigate(`/practice/${cls}/${chapterId}/${encodeURIComponent(subunit)}`)}
                className="group border border-l-4 border-l-transparent p-5 text-left transition-all relative overflow-hidden"
                style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--bs-accent-hex)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bs-surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                  (e.currentTarget as HTMLElement).style.background = "var(--bs-surface)";
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 border flex items-center justify-center shrink-0 transform -skew-x-12 transition-colors"
                    style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                  >
                    <span className="text-sm font-black transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>{subunit}</h3>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-all shrink-0"
                    strokeWidth={3}
                    style={{ color: "var(--bs-text-muted)" }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
