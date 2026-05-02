import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapters, fetchChaptersFromAPI } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";
import { ChevronRight, ArrowLeft } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

type CountsResult = {
  bySubunit: Record<string, { total: number; byType: Record<string, number> }>;
  chapterTotal: number;
};

export function ChaptersPage() {
  const { cls } = useParams<{ cls: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>(() => getChapters(cls || "11"));
  const [countsByChapter, setCountsByChapter] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchChaptersFromAPI(cls || "11").then(setChapters);
  }, [cls]);

  useEffect(() => {
    if (!chapters.length) return;
    (async () => {
      const results: Record<string, number> = {};
      await Promise.all(
        chapters.map(async (ch) => {
          try {
            const res = await fetch(`${API_BASE}/questions/counts?class=${cls}&chapter=${ch.id}`, {  });
            if (!res.ok) return;
            const data = await res.json() as CountsResult;
            results[ch.id] = data.chapterTotal ?? 0;
          } catch {
            results[ch.id] = 0;
          }
        })
      );
      setCountsByChapter(results);
    })();
  }, [chapters, cls]);

  const classLabel = cls === "dropper" ? "Dropper (NEET Repeater)" : `Class ${cls}`;

  return (
    <div
      className="min-h-screen relative font-['Space_Grotesk'] transition-colors duration-300"
      style={{ background: "transparent", color: "var(--bs-text)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/class-select")}
            className="flex items-center gap-2 transition-colors mb-8 font-mono uppercase tracking-wide text-sm"
            style={{ color: "var(--bs-text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Class Select
          </button>

          <div className="mb-10">
            <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
              {classLabel} <span style={{ color: "var(--bs-accent-hex)" }}>Chapters</span>
            </h1>
            <p className="font-mono uppercase tracking-wide text-sm" style={{ color: "var(--bs-text-muted)" }}>
              {chapters.length} chapters available for practice
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {chapters.map((chapter, index) => {
              const qCount = countsByChapter[chapter.id] ?? null;
              return (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/subunits/${cls}/${chapter.id}`)}
                  className="group border border-l-4 border-l-transparent p-5 text-left transition-all shadow-sm"
                  style={{
                    background: "var(--bs-surface)",
                    borderColor: "var(--bs-border-subtle)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--bs-accent-hex)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 border flex items-center justify-center shrink-0 transform -skew-x-12"
                      style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                    >
                      <span className="text-sm font-black transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1 leading-tight uppercase tracking-tight text-sm" style={{ color: "var(--bs-text)" }}>
                        {chapter.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
                        <span>{chapter.subunits.length} subunits</span>
                        {qCount !== null && (
                          <>
                            <span style={{ color: "var(--bs-border-strong)" }}>·</span>
                            <span style={{ color: qCount > 0 ? "var(--bs-accent-hex)" : "var(--bs-text-muted)" }}>
                              {qCount > 0 ? `${qCount} questions` : "No questions yet"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-all shrink-0 mt-1"
                      strokeWidth={3}
                      style={{ color: "var(--bs-text-muted)" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
