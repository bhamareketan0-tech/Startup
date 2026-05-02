import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, Search, Bookmark, BookmarkCheck, FileText, Clock } from "lucide-react";

interface ShortNote {
  id: string;
  title: string;
  content: string;
  class: string;
  chapter: string;
  subunit: string;
  published: boolean;
  bookmarkedBy: string[];
  createdAt: string;
}

function NoteCard({ note, userId, onBookmark }: { note: ShortNote; userId: string; onBookmark: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const isBookmarked = note.bookmarkedBy?.includes(userId);
  const preview = note.content.replace(/<[^>]*>/g, "").slice(0, 120);

  if (open) {
    return (
      <div style={{ background: "#111111", border: "1px solid #ffffff20", borderRadius: 8, padding: 24, gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{note.title}</h2>
            <p style={{ color: "#ffffff50", fontSize: 13 }}>{note.chapter}{note.subunit ? ` • ${note.subunit}` : ""} • Class {note.class}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => onBookmark(note.id)} style={{ background: "none", border: "none", cursor: "pointer", color: isBookmarked ? "#00FF9D" : "#ffffff40" }}>
              {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
            <button onClick={() => setOpen(false)} style={{ background: "#ffffff10", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", padding: "6px 14px", fontSize: 13 }}>Close</button>
          </div>
        </div>
        <div className="prose-note" dangerouslySetInnerHTML={{ __html: note.content }}
          style={{ color: "#ffffffcc", lineHeight: 1.8, fontSize: 15 }} />
      </div>
    );
  }

  return (
    <button onClick={() => setOpen(true)} style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 8, padding: "20px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", position: "relative" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#00FF9D44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#ffffff15")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ background: "#00FF9D15", color: "#00FF9D", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>Class {note.class}</span>
        {isBookmarked && <BookmarkCheck size={14} color="#00FF9D" />}
      </div>
      <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{note.title}</h3>
      <p style={{ color: "#ffffff50", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{preview}{preview.length >= 120 ? "…" : ""}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#ffffff30", fontSize: 12 }}>
        <span>{note.chapter}</span>
        {note.subunit && <><span>•</span><span>{note.subunit}</span></>}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={11} /> {new Date(note.createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>
    </button>
  );
}

export function ShortNotesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterClass !== "all") params.cls = filterClass;
    if (filterChapter !== "all") params.chapter = filterChapter;
    if (search) params.search = search;
    setLoading(true);
    api.get("/short-notes", params)
      .then((d: any) => setNotes(d || []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [filterClass, filterChapter, search]);

  const chapters = [...new Set(notes.map(n => n.chapter))].sort();

  async function handleBookmark(id: string) {
    if (!user) return;
    const res = await api.post(`/short-notes/${id}/bookmark`, { userId: user.id });
    setNotes(ns => ns.map(n => n.id === id
      ? { ...n, bookmarkedBy: (res as any).bookmarked ? [...n.bookmarkedBy, user.id] : n.bookmarkedBy.filter(u => u !== user.id) }
      : n));
  }

  const hasNotes = notes.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Short Notes</h1>
            <p style={{ color: "#ffffff50", fontSize: 14 }}>{hasNotes ? `${notes.length} notes available` : "Quick reference cards for every chapter"}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ffffff40" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
                style={{ paddingLeft: 32, paddingRight: 12, height: 40, background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", width: 200 }} />
            </div>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
              <option value="all">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
            {chapters.length > 0 && (
              <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)}
                style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="all">All Chapters</option>
                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#111111", borderRadius: 8, height: 160, animation: "pulse 2s infinite" }} />
            ))}
          </div>
        ) : !hasNotes ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <FileText size={48} style={{ color: "#ffffff15", margin: "0 auto 16px" }} />
            <h3 style={{ color: "#ffffff40", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Notes Coming Soon</h3>
            <p style={{ color: "#ffffff25", fontSize: 14 }}>Your teachers are preparing comprehensive short notes. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} userId={user?.id || ""} onBookmark={handleBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
