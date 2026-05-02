import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";

interface Note { id: string; title: string; content: string; class: string; chapter: string; subunit: string; published: boolean; order: number; }

const EMPTY: Omit<Note, "id"> = { title: "", content: "", class: "11", chapter: "", subunit: "", published: false, order: 0 };

export function AdminShortNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Note, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/short-notes", { admin: "true" }).then((d: any) => setNotes(d || [])).catch(() => setNotes([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      if (editId) { await api.put(`/short-notes/${editId}`, form); }
      else { await api.post("/short-notes", form); }
      setForm(null); setEditId(null); load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this note?")) return;
    await api.del(`/short-notes/${id}`); load();
  }

  async function togglePublish(note: Note) {
    await api.put(`/short-notes/${note.id}`, { published: !note.published }); load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Short Notes Manager</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>{notes.length} notes total</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={16} /> Add Note
        </button>
      </div>

      {form !== null && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{editId ? "Edit Note" : "New Note"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Class</label>
              <select value={form.class} onChange={e => setForm(f => f && { ...f, class: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="11">Class 11</option><option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Chapter</label>
              <input value={form.chapter} onChange={e => setForm(f => f && { ...f, chapter: e.target.value })} placeholder="e.g. Cell Biology"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Subunit</label>
              <input value={form.subunit} onChange={e => setForm(f => f && { ...f, subunit: e.target.value })} placeholder="optional"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => f && { ...f, title: e.target.value })} placeholder="Note title"
              style={{ width: "100%", padding: "9px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 14, outline: "none" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Content (HTML or plain text)</label>
            <textarea value={form.content} onChange={e => setForm(f => f && { ...f, content: e.target.value })} rows={8} placeholder="Write note content here. HTML is supported."
              style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ffffff80", fontSize: 13 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => f && { ...f, published: e.target.checked })} /> Publish immediately
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setForm(null); setEditId(null); }} style={{ padding: "9px 18px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: "9px 18px", background: "#00FF9D", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "#ffffff40" }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.length === 0 && <p style={{ color: "#ffffff30", fontSize: 14 }}>No notes yet. Click "Add Note" to create one.</p>}
          {notes.map(n => (
            <div key={n.id} style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{n.title}</span>
                  {!n.published && <span style={{ background: "#F59E0B20", color: "#F59E0B", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>DRAFT</span>}
                </div>
                <p style={{ color: "#ffffff40", fontSize: 12 }}>Class {n.class} · {n.chapter}{n.subunit ? ` · ${n.subunit}` : ""}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => togglePublish(n)} style={{ padding: "6px 10px", background: n.published ? "#00FF9D15" : "#ffffff10", border: "none", borderRadius: 6, color: n.published ? "#00FF9D" : "#ffffff50", cursor: "pointer" }} title={n.published ? "Unpublish" : "Publish"}>
                  {n.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => { setEditId(n.id); setForm({ title: n.title, content: n.content, class: n.class, chapter: n.chapter, subunit: n.subunit, published: n.published, order: n.order }); }}
                  style={{ padding: "6px 10px", background: "#ffffff10", border: "none", borderRadius: 6, color: "#ffffff60", cursor: "pointer" }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => del(n.id)} style={{ padding: "6px 10px", background: "#ff444415", border: "none", borderRadius: 6, color: "#ff6b6b", cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
