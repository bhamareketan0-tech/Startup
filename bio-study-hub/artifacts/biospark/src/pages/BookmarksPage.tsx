import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Bookmark, Search, Filter, Play, Trash2, ChevronRight, ArrowLeft, BookOpen } from "lucide-react";

interface BookmarkItem {
  id: string;
  question_id: string;
  question_text: string;
  chapter: string;
  subunit: string;
  class: string;
  question_type: string;
  difficulty: string;
  created_at: string;
}

const DIFF_COLOR: Record<string, string> = { easy: "#00FF9D", medium: "#facc15", hard: "#ff4444" };
const TYPE_COLOR: Record<string, string> = { mcq: "#00FF9D", assertion: "#ff4444", truefalse: "#00FF9D", match: "#00FF9D", fillblanks: "#00FF9D", statements: "#00FF9D", diagram: "#00FF9D", table_based: "#00FF9D", pyq: "#facc15" };

export function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    api.get("/bookmarks").then((r: unknown) => {
      setBookmarks(((r as { data: BookmarkItem[] }).data) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteBookmark = useCallback(async (qid: string) => {
    setBookmarks((prev) => prev.filter((b) => b.question_id !== qid));
    await api.del(`/bookmarks/${qid}`).catch(() => {});
  }, []);

  const chapters = [...new Set(bookmarks.map((b) => b.chapter))].sort();
  const types = [...new Set(bookmarks.map((b) => b.question_type))].sort();

  const filtered = bookmarks.filter((b) => {
    if (filterChapter !== "all" && b.chapter !== filterChapter) return false;
    if (filterType !== "all" && b.question_type !== filterType) return false;
    if (filterDiff !== "all" && b.difficulty !== filterDiff) return false;
    if (search && !b.question_text.toLowerCase().includes(search.toLowerCase()) && !b.chapter.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, BookmarkItem[]> = {};
  for (const b of filtered) {
    if (!grouped[b.chapter]) grouped[b.chapter] = [];
    grouped[b.chapter].push(b);
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-5xl mx-auto">

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
            <Bookmark className="w-6 h-6 text-black transform skew-x-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>My Bookmarks</h1>
            <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>{bookmarks.length} questions saved</p>
          </div>
        </div>

        <div className="border p-4 mb-6 flex flex-col md:flex-row gap-3" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center gap-2 flex-1 border px-3" style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface-2)" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search bookmarks..." className="flex-1 bg-transparent py-2 text-sm outline-none font-mono" style={{ color: "var(--bs-text)" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterChapter} onChange={(e) => { setFilterChapter(e.target.value); setPage(1); }} className="border px-3 py-2 text-xs font-mono uppercase bg-transparent outline-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", background: "var(--bs-surface-2)" }}>
              <option value="all">All Chapters</option>
              {chapters.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="border px-3 py-2 text-xs font-mono uppercase bg-transparent outline-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", background: "var(--bs-surface-2)" }}>
              <option value="all">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterDiff} onChange={(e) => { setFilterDiff(e.target.value); setPage(1); }} className="border px-3 py-2 text-xs font-mono uppercase bg-transparent outline-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", background: "var(--bs-surface-2)" }}>
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          {filtered.length > 0 && (
            <button
              onClick={() => navigate(`/custom-quiz?bookmarks=1&chapter=${filterChapter !== "all" ? filterChapter : ""}`)}
              className="flex items-center gap-2 px-4 py-2 font-black uppercase text-xs tracking-widest"
              style={{ background: "#00FF9D", color: "black" }}
            >
              <Play className="w-4 h-4" /> Practice ({filtered.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse" style={{ background: "var(--bs-surface)" }} />)}</div>
        ) : paginated.length === 0 ? (
          <div className="border p-16 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: "var(--bs-text-muted)" }} />
            <p className="font-black uppercase text-lg mb-2" style={{ color: "var(--bs-text)" }}>No bookmarks yet</p>
            <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>Tap the bookmark icon on any question while practising to save it here.</p>
            <button onClick={() => navigate("/class-select")} className="mt-6 px-6 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Start Practising</button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginated.map((b) => (
                <div key={b.id} className="border p-4 flex items-start gap-4 group transition-all hover:scale-[1.005]" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono leading-relaxed line-clamp-2 mb-2" style={{ color: "var(--bs-text)" }}>{b.question_text || "(question text not saved)"}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs border px-2 py-0.5 font-black uppercase" style={{ borderColor: "rgba(0,255,157,0.3)", color: "#00FF9D", background: "rgba(0,255,157,0.08)" }}>{b.chapter}</span>
                      {b.subunit && <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{b.subunit}</span>}
                      <span className="text-xs border px-2 py-0.5 font-mono uppercase" style={{ borderColor: `${(TYPE_COLOR[b.question_type] || "#00FF9D")}40`, color: TYPE_COLOR[b.question_type] || "#00FF9D" }}>{b.question_type}</span>
                      <span className="text-xs border px-2 py-0.5 font-mono uppercase" style={{ borderColor: `${(DIFF_COLOR[b.difficulty] || "#00FF9D")}40`, color: DIFF_COLOR[b.difficulty] || "#00FF9D" }}>{b.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => deleteBookmark(b.question_id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity min-w-[36px] min-h-[36px] flex items-center justify-center" style={{ color: "#ff4444" }} title="Remove bookmark">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border text-xs font-black uppercase disabled:opacity-30" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)" }}>Prev</button>
                <span className="font-mono text-sm px-2" style={{ color: "var(--bs-text-muted)" }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border text-xs font-black uppercase disabled:opacity-30" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)" }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
