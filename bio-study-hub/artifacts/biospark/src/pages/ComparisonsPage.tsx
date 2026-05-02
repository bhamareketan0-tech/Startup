import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, GitCompareArrows, Bookmark, BookmarkCheck } from "lucide-react";

interface Comparison {
  id: string;
  title: string;
  class: string;
  chapter: string;
  headers: string[];
  rows: string[][];
  bookmarkedBy: string[];
}

function ComparisonTable({ comp, userId, onBookmark }: { comp: Comparison; userId: string; onBookmark: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const isBookmarked = comp.bookmarkedBy?.includes(userId);

  return (
    <div style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, overflow: "hidden", transition: "all 0.15s" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{comp.title}</p>
          <p style={{ color: "#ffffff40", fontSize: 12 }}>{comp.chapter}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onBookmark(comp.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: isBookmarked ? "#00FF9D" : "#ffffff30", padding: 4 }}>
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <span style={{ color: "#ffffff30", fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>›</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                {comp.headers.map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", background: "#00FF9D15", color: "#00FF9D", fontSize: 13, fontWeight: 700, textAlign: "left", borderBottom: "2px solid #00FF9D33", borderRight: i < comp.headers.length - 1 ? "1px solid #ffffff10" : "none" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comp.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "#ffffff04" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "9px 14px", color: ci === 0 ? "#ffffffcc" : "#ffffff80", fontSize: 13, borderBottom: "1px solid #ffffff08", borderRight: ci < row.length - 1 ? "1px solid #ffffff08" : "none", lineHeight: 1.5, fontWeight: ci === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ComparisonsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comps, setComps] = useState<Comparison[]>([]);
  const [filterChapter, setFilterChapter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterChapter !== "all") params.chapter = filterChapter;
    setLoading(true);
    api.get("/comparisons", params)
      .then((d: any) => setComps(d || []))
      .catch(() => setComps([]))
      .finally(() => setLoading(false));
  }, [filterChapter]);

  const chapters = [...new Set(comps.map(c => c.chapter))].sort();

  async function handleBookmark(id: string) {
    if (!user) return;
    const res: any = await api.post(`/comparisons/${id}/bookmark`, { userId: user.id });
    setComps(cs => cs.map(c => c.id === id
      ? { ...c, bookmarkedBy: res.bookmarked ? [...c.bookmarkedBy, user.id] : c.bookmarkedBy.filter(u => u !== user.id) }
      : c));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Comparison Charts</h1>
            <p style={{ color: "#ffffff50", fontSize: 14 }}>Side-by-side tables for similar biological concepts</p>
          </div>
          {chapters.length > 0 && (
            <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)}
              style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
              <option value="all">All Chapters</option>
              {chapters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: "#111111", borderRadius: 10, height: 64 }} />)}
          </div>
        ) : comps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <GitCompareArrows size={48} style={{ color: "#ffffff15", margin: "0 auto 16px" }} />
            <h3 style={{ color: "#ffffff40", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Comparisons Coming Soon</h3>
            <p style={{ color: "#ffffff25", fontSize: 14 }}>Charts like Mitosis vs Meiosis, C3 vs C4 plants are being prepared.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {comps.map(comp => (
              <ComparisonTable key={comp.id} comp={comp} userId={user?.id || ""} onBookmark={handleBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
