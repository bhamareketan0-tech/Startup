import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapters, fetchChaptersFromAPI } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";
import { ChevronRight, ArrowLeft, Play } from "lucide-react";
import { getChapterAnim } from "@/data/animationContent";

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
            const res = await fetch(`${API_BASE}/questions/counts?class=${cls}&chapter=${ch.id}`, { credentials: "include" });
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
              {chapters.length} chapters · Click <span style={{ color: "var(--bs-accent-hex)" }}>▶ Animate</span> on any chapter to watch animated explanations
            </p>
          </div>

          {/* Animated Explanation Banner */}
          <div
            className="flex items-center gap-4 p-4 mb-6 border"
            style={{
              background: "color-mix(in srgb, var(--bs-accent-hex) 8%, transparent)",
              borderColor: "var(--bs-accent-hex)",
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 border-2"
              style={{ borderColor: "var(--bs-accent-hex)", background: "color-mix(in srgb, var(--bs-accent-hex) 15%, transparent)" }}
            >
              <Play className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--bs-accent-hex)" }}>
                Animated Explanations — New!
              </p>
              <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
                Every sub-topic now has a narrated animation. Click ▶ Animate on a chapter or go inside any chapter to watch.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {chapters.map((chapter, index) => {
              const qCount = countsByChapter[chapter.id] ?? null;
              const chapterAnim = getChapterAnim(chapter.id);
              const accentColor = chapterAnim?.color || "var(--bs-accent-hex)";
              const firstSubunit = chapter.subunits[0] || "Introduction";

              return (
                <div
                  key={chapter.id}
                  className="border border-l-4 border-l-transparent transition-all"
                  style={{
                    background: "var(--bs-surface)",
                    borderColor: "var(--bs-border-subtle)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderLeftColor = accentColor;
                    (e.currentTarget as HTMLElement).style.background = "var(--bs-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                    (e.currentTarget as HTMLElement).style.background = "var(--bs-surface)";
                  }}
                >
                  {/* Chapter header — click to go to subunits */}
                  <button
                    onClick={() => navigate(`/subunits/${cls}/${chapter.id}`)}
                    className="w-full p-5 pb-3 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 border flex items-center justify-center shrink-0 transform -skew-x-12"
                        style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                      >
                        {chapterAnim?.icon ? (
                          <span className="text-base transform skew-x-12">{chapterAnim.icon}</span>
                        ) : (
                          <span className="text-sm font-black transform skew-x-12" style={{ color: accentColor }}>{index + 1}</span>
                        )}
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
                              <span style={{ color: qCount > 0 ? accentColor : "var(--bs-text-muted)" }}>
                                {qCount > 0 ? `${qCount} questions` : "No questions yet"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 shrink-0 mt-1 opacity-50"
                        strokeWidth={3}
                        style={{ color: "var(--bs-text-muted)" }}
                      />
                    </div>
                  </button>

                  {/* Animate button row */}
                  <div className="px-5 pb-4">
                    <button
                      onClick={() =>
                        navigate(`/animations/${cls}/${chapter.id}/${encodeURIComponent(firstSubunit)}`)
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 border font-black uppercase tracking-widest text-xs transition-all"
                      style={{
                        borderColor: accentColor,
                        background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                        color: accentColor,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = `color-mix(in srgb, ${accentColor} 22%, transparent)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = `color-mix(in srgb, ${accentColor} 10%, transparent)`;
                      }}
                    >
                      <Play className="w-3 h-3" />
                      ▶ Watch Animated Explanation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
