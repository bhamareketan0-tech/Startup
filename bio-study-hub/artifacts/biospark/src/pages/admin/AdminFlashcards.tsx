import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload } from "lucide-react";

interface Card { id: string; front: string; back: string; frontImage: string; backImage: string; class: string; chapter: string; subunit: string; published: boolean; order: number; }
const EMPTY: Omit<Card, "id"> = { front: "", back: "", frontImage: "", backImage: "", class: "11", chapter: "", subunit: "", published: false, order: 0 };

export function AdminFlashcards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Card, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkClass, setBulkClass] = useState("11");
  const [bulkChapter, setBulkChapter] = useState("");
  const [filterChapter, setFilterChapter] = useState("all");

  const load = () => {
    setLoading(true);
    api.get("/flashcards", { admin: "true" }).then((d: any) => setCards(d || [])).catch(() => setCards([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      if (editId) await api.put(`/flashcards/${editId}`, form);
      else await api.post("/flashcards", form);
      setForm(null); setEditId(null); load();
    } finally { setSaving(false); }
  }

  async function saveBulk() {
    if (!bulkText.trim() || !bulkChapter) return alert("Fill in class, chapter and paste flashcards");
    setSaving(true);
    try {
      const parsed = bulkText.trim().split("\n").map(line => {
        const [front, back] = line.split("|").map(s => s.trim());
        return { front, back, frontImage: "", backImage: "", class: bulkClass, chapter: bulkChapter, subunit: "", published: false, order: 0 };
      }).filter(c => c.front && c.back);
      await api.post("/flashcards/bulk", { cards: parsed });
      setBulkText(""); setBulkMode(false); load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this flashcard?")) return;
    await api.del(`/flashcards/${id}`); load();
  }

  async function togglePublish(card: Card) {
    await api.put(`/flashcards/${card.id}`, { published: !card.published }); load();
  }

  const chapters = [...new Set(cards.map(c => c.chapter))].sort();
  const filtered = filterChapter === "all" ? cards : cards.filter(c => c.chapter === filterChapter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Flashcard Manager</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>{cards.length} total flashcards</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setBulkMode(m => !m); setForm(null); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#ffffff10", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, cursor: "pointer" }}>
            <Upload size={14} /> Bulk Add
          </button>
          <button onClick={() => { setForm({ ...EMPTY }); setEditId(null); setBulkMode(false); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus size={16} /> Add Card
          </button>
        </div>
      </div>

      {bulkMode && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Bulk Add Flashcards</h3>
          <p style={{ color: "#ffffff50", fontSize: 12, marginBottom: 16 }}>One card per line. Format: Front text | Back text</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Class</label>
              <select value={bulkClass} onChange={e => setBulkClass(e.target.value)} style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="11">Class 11</option><option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Chapter</label>
              <input value={bulkChapter} onChange={e => setBulkChapter(e.target.value)} placeholder="Chapter name"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8}
            placeholder={"Mitochondria | Powerhouse of the cell\nChlorophyll | Green pigment for photosynthesis\nDNA | Deoxyribonucleic acid — genetic material"}
            style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "monospace" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setBulkMode(false)} style={{ padding: "9px 18px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={saveBulk} disabled={saving} style={{ padding: "9px 18px", background: "#00FF9D", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{saving ? "Saving…" : "Import Cards"}</button>
          </div>
        </div>
      )}

      {form !== null && !bulkMode && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{editId ? "Edit Card" : "New Card"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[["Class", "class", ["11","12"]], ["Chapter", "chapter"], ["Subunit", "subunit"]].map(([label, key, opts]: any) => (
              <div key={key}>
                <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>{label}</label>
                {opts ? (
                  <select value={(form as any)[key]} onChange={e => setForm(f => f && { ...f, [key]: e.target.value })} style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                    {opts.map((o: string) => <option key={o} value={o}>Class {o}</option>)}
                  </select>
                ) : (
                  <input value={(form as any)[key]} onChange={e => setForm(f => f && { ...f, [key]: e.target.value })} placeholder={label as string}
                    style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {(["front", "back"] as const).map(side => (
              <div key={side}>
                <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>{side === "front" ? "Front (Question)" : "Back (Answer)"}</label>
                <textarea value={form[side]} onChange={e => setForm(f => f && { ...f, [side]: e.target.value })} rows={3} placeholder={side === "front" ? "Question or term" : "Answer or definition"}
                  style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }} />
                <input value={form[`${side}Image` as "frontImage" | "backImage"]} onChange={e => setForm(f => f && { ...f, [`${side}Image`]: e.target.value })} placeholder={`${side} image URL (optional)`}
                  style={{ marginTop: 6, width: "100%", padding: "7px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 12, outline: "none" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ffffff80", fontSize: 13 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => f && { ...f, published: e.target.checked })} /> Publish
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setForm(null); setEditId(null); }} style={{ padding: "9px 18px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: "9px 18px", background: "#00FF9D", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {chapters.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {["all", ...chapters].map(c => (
            <button key={c} onClick={() => setFilterChapter(c)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: filterChapter === c ? "#00FF9D" : "#ffffff10", color: filterChapter === c ? "#000" : "#ffffff60", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      )}

      {loading ? <p style={{ color: "#ffffff40" }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.length === 0 && <p style={{ color: "#ffffff30", fontSize: 14 }}>No flashcards yet.</p>}
          {filtered.map(c => (
            <div key={c.id} style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "#00FF9D", fontSize: 13, fontWeight: 600 }}>Q:</span>
                  <span style={{ color: "#fff", fontSize: 13 }}>{c.front.slice(0, 60)}{c.front.length > 60 ? "…" : ""}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: "#ffffff50", fontSize: 12 }}>A:</span>
                  <span style={{ color: "#ffffff80", fontSize: 12 }}>{c.back.slice(0, 60)}{c.back.length > 60 ? "…" : ""}</span>
                </div>
                <p style={{ color: "#ffffff30", fontSize: 11, marginTop: 4 }}>Class {c.class} · {c.chapter}{c.subunit ? ` · ${c.subunit}` : ""}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => togglePublish(c)} style={{ padding: "6px 8px", background: c.published ? "#00FF9D15" : "#ffffff10", border: "none", borderRadius: 6, color: c.published ? "#00FF9D" : "#ffffff50", cursor: "pointer" }}>
                  {c.published ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => { setEditId(c.id); setForm({ front: c.front, back: c.back, frontImage: c.frontImage, backImage: c.backImage, class: c.class, chapter: c.chapter, subunit: c.subunit, published: c.published, order: c.order }); setBulkMode(false); }}
                  style={{ padding: "6px 8px", background: "#ffffff10", border: "none", borderRadius: 6, color: "#ffffff60", cursor: "pointer" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => del(c.id)} style={{ padding: "6px 8px", background: "#ff444415", border: "none", borderRadius: 6, color: "#ff6b6b", cursor: "pointer" }}>
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
