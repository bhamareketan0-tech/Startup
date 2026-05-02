import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Quote } from "lucide-react";

interface QuoteItem { id: string; text: string; author: string; category: string; active: boolean; }

const CATS = ["general", "morning", "evening", "exam"];

export function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<QuoteItem, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/quotes").then((d: any) => setQuotes(Array.isArray(d) ? d : [])).catch(() => setQuotes([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      if (editId) await api.put(`/quotes/${editId}`, form);
      else await api.post("/quotes", form);
      setForm(null); setEditId(null); load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this quote?")) return;
    await api.del(`/quotes/${id}`); load();
  }

  const catColors: Record<string, string> = { general: "#6366F1", morning: "#F59E0B", evening: "#EC4899", exam: "#00FF9D" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Motivational Quotes</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>{quotes.length} quotes · shown in MAA section & dashboard</p>
        </div>
        <button onClick={() => { setForm({ text: "", author: "", category: "general", active: true }); setEditId(null); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={16} /> Add Quote
        </button>
      </div>

      {form !== null && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{editId ? "Edit" : "New"} Quote</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Quote Text</label>
            <textarea value={form.text} onChange={e => setForm(f => f && { ...f, text: e.target.value })} rows={3} placeholder="Write an inspiring quote…"
              style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.6 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Author (optional)</label>
              <input value={form.author} onChange={e => setForm(f => f && { ...f, author: e.target.value })} placeholder="e.g. APJ Abdul Kalam"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => f && { ...f, category: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ffffff80", fontSize: 13 }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => f && { ...f, active: e.target.checked })} /> Active
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setForm(null); setEditId(null); }} style={{ padding: "9px 18px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: "9px 18px", background: "#00FF9D", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "#ffffff40" }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quotes.length === 0 && <p style={{ color: "#ffffff30", fontSize: 14 }}>No quotes yet.</p>}
          {quotes.map(q => (
            <div key={q.id} style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 8, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Quote size={16} style={{ color: catColors[q.category] || "#6366F1", marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#ffffffcc", fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>{q.text}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {q.author && <span style={{ color: "#ffffff50", fontSize: 12 }}>— {q.author}</span>}
                  <span style={{ background: `${catColors[q.category]}20`, color: catColors[q.category], fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase" }}>{q.category}</span>
                  {!q.active && <span style={{ color: "#ff6b6b", fontSize: 10 }}>inactive</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditId(q.id); setForm({ text: q.text, author: q.author, category: q.category, active: q.active }); }}
                  style={{ padding: "6px 8px", background: "#ffffff10", border: "none", borderRadius: 6, color: "#ffffff60", cursor: "pointer" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => del(q.id)} style={{ padding: "6px 8px", background: "#ff444415", border: "none", borderRadius: 6, color: "#ff6b6b", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
