import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { FileText, Search, Trash2, Edit2, Check, ArrowLeft, Tag, Calendar } from "lucide-react";

interface NoteItem {
  id: string;
  question_id: string;
  question_text: string;
  note_text: string;
  chapter: string;
  subunit: string;
  class: string;
  created_at: string;
  updated_at: string;
}

export function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api.get("/notes").then((r: unknown) => {
      setNotes(((r as { data: NoteItem[] }).data) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteNote = useCallback(async (qid: string) => {
    setNotes((prev) => prev.filter((n) => n.question_id !== qid));
    await api.del(`/notes/${qid}`).catch(() => {});
  }, []);

  const startEdit = (note: NoteItem) => {
    setEditingId(note.question_id);
    setEditText(note.note_text);
  };

  const saveEdit = async (note: NoteItem) => {
    clearTimeout(debounceRef.current);
    setNotes((prev) => prev.map((n) => n.question_id === note.question_id ? { ...n, note_text: editText } : n));
    setEditingId(null);
    await api.put(`/notes/${note.question_id}`, { note_text: editText, question_text: note.question_text, chapter: note.chapter, subunit: note.subunit, class: note.class }).catch(() => {});
  };

  const chapters = [...new Set(notes.map((n) => n.chapter).filter(Boolean))].sort();

  const filtered = notes.filter((n) => {
    if (filterChapter !== "all" && n.chapter !== filterChapter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.note_text.toLowerCase().includes(q) && !n.question_text.toLowerCase().includes(q) && !n.chapter.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const grouped: Record<string, NoteItem[]> = {};
  for (const n of paginated) {
    if (!grouped[n.chapter]) grouped[n.chapter] = [];
    grouped[n.chapter].push(n);
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-5xl mx-auto">

        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
            <FileText className="w-6 h-6 text-black transform skew-x-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>My Notes</h1>
            <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>{notes.length} notes across {chapters.length} chapters</p>
          </div>
        </div>

        <div className="border p-4 mb-6 flex flex-col md:flex-row gap-3" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center gap-2 flex-1 border px-3" style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface-2)" }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search notes..." className="flex-1 bg-transparent py-2 text-sm outline-none font-mono" style={{ color: "var(--bs-text)" }} />
          </div>
          <select value={filterChapter} onChange={(e) => { setFilterChapter(e.target.value); setPage(1); }} className="border px-3 py-2 text-xs font-mono uppercase outline-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", background: "var(--bs-surface-2)" }}>
            <option value="all">All Chapters</option>
            {chapters.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse" style={{ background: "var(--bs-surface)" }} />)}</div>
        ) : paginated.length === 0 ? (
          <div className="border p-16 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: "var(--bs-text-muted)" }} />
            <p className="font-black uppercase text-lg mb-2" style={{ color: "var(--bs-text)" }}>No notes yet</p>
            <p className="font-mono text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Tap the notes icon 📝 on any question while practising to add a note.</p>
            <button onClick={() => navigate("/class-select")} className="px-6 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Start Practising</button>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([chapter, chNotes]) => (
              <div key={chapter} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" style={{ color: "#00FF9D" }} />
                  <h2 className="font-black uppercase text-sm tracking-widest" style={{ color: "#00FF9D" }}>{chapter || "General"}</h2>
                  <span className="font-mono text-xs px-2" style={{ color: "var(--bs-text-muted)" }}>({chNotes.length})</span>
                </div>
                <div className="space-y-3">
                  {chNotes.map((note) => (
                    <div key={note.id} className="border p-4 group transition-all" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                      {note.question_text && (
                        <p className="text-xs font-mono leading-relaxed mb-3 pb-3 line-clamp-2 border-b" style={{ color: "var(--bs-text-muted)", borderColor: "var(--bs-border-subtle)" }}>{note.question_text}</p>
                      )}
                      {editingId === note.question_id ? (
                        <div className="flex gap-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 border p-2 text-sm font-mono bg-transparent outline-none resize-none"
                            style={{ borderColor: "#00FF9D", color: "var(--bs-text)", minHeight: "80px" }}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(note)} className="p-2 self-start min-w-[36px] min-h-[36px] flex items-center justify-center" style={{ background: "#00FF9D", color: "black" }}>
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap mb-2" style={{ color: "var(--bs-text)" }}>{note.note_text || <em style={{ color: "var(--bs-text-muted)" }}>Empty note</em>}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {note.subunit && <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{note.subunit}</span>}
                          <span className="flex items-center gap-1 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
                            <Calendar className="w-3 h-3" /> {new Date(note.updated_at || note.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(note)} className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center" style={{ color: "#00FF9D" }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteNote(note.question_id)} className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center" style={{ color: "#ff4444" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
