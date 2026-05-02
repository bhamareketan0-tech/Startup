import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface Comparison { id: string; title: string; class: string; chapter: string; headers: string[]; rows: string[][]; published: boolean; }
const EMPTY: Omit<Comparison, "id"> = { title: "", class: "both", chapter: "", headers: ["Aspect", "Type A", "Type B"], rows: [["", "", ""]], published: false };

export function AdminComparisons() {
  const [items, setItems] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Comparison, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/comparisons", { admin: "true" }).then((d: any) => setItems(d || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  function addRow() { setForm(f => f ? { ...f, rows: [...f.rows, f.headers.map(() => "")] } : f); }
  function removeRow(i: number) { setForm(f => f ? { ...f, rows: f.rows.filter((_, ri) => ri !== i) } : f); }
  function addCol() { setForm(f => f ? { ...f, headers: [...f.headers, ""], rows: f.rows.map(r => [...r, ""]) } : f); }
  function updateCell(ri: number, ci: number, val: string) { setForm(f => f ? { ...f, rows: f.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r) } : f); }
  function updateHeader(i: number, val: string) { setForm(f => f ? { ...f, headers: f.headers.map((h, j) => j === i ? val : h) } : f); }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      if (editId) await api.put(`/comparisons/${editId}`, form);
      else await api.post("/comparisons", form);
      setForm(null); setEditId(null); load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this comparison?")) return;
    await api.del(`/comparisons/${id}`); load();
  }

  async function togglePublish(item: Comparison) {
    await api.put(`/comparisons/${item.id}`, { published: !item.published }); load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Comparison Charts Manager</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>{items.length} comparisons</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY, rows: [["", "", ""], ["", "", ""]] }); setEditId(null); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={16} /> Add Comparison
        </button>
      </div>

      {form !== null && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{editId ? "Edit" : "New"} Comparison</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Class</label>
              <select value={form.class} onChange={e => setForm(f => f && { ...f, class: e.target.value })}
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="both">Both</option><option value="11">Class 11</option><option value="12">Class 12</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Chapter</label>
              <input value={form.chapter} onChange={e => setForm(f => f && { ...f, chapter: e.target.value })} placeholder="Chapter name"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => f && { ...f, title: e.target.value })} placeholder="e.g. Mitosis vs Meiosis"
                style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
            </div>
          </div>

          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
              <thead>
                <tr>
                  {form.headers.map((h, i) => (
                    <th key={i} style={{ padding: 6 }}>
                      <input value={h} onChange={e => updateHeader(i, e.target.value)} placeholder={`Header ${i + 1}`}
                        style={{ width: "100%", padding: "6px 8px", background: "#00FF9D15", border: "1px solid #00FF9D33", borderRadius: 6, color: "#00FF9D", fontSize: 12, fontWeight: 700, outline: "none", textAlign: "center" }} />
                    </th>
                  ))}
                  <th style={{ padding: 6, width: 32 }}>
                    <button onClick={addCol} style={{ padding: "4px 8px", background: "#ffffff10", border: "none", borderRadius: 5, color: "#ffffff60", cursor: "pointer", fontSize: 14 }}>+</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: 4 }}>
                        <input value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder={`Row ${ri + 1}`}
                          style={{ width: "100%", padding: "6px 8px", background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 5, color: "#fff", fontSize: 12, outline: "none" }} />
                      </td>
                    ))}
                    <td style={{ padding: 4 }}>
                      <button onClick={() => removeRow(ri)} style={{ padding: "4px 8px", background: "none", border: "none", color: "#ff6b6b60", cursor: "pointer", fontSize: 14 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={addRow} style={{ padding: "7px 14px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 12, cursor: "pointer" }}>+ Add Row</button>
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

      {loading ? <p style={{ color: "#ffffff40" }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.length === 0 && <p style={{ color: "#ffffff30", fontSize: 14 }}>No comparisons yet.</p>}
          {items.map(item => (
            <div key={item.id} style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.title}</p>
                <p style={{ color: "#ffffff40", fontSize: 12 }}>{item.chapter} · Class {item.class} · {item.headers.length} columns × {item.rows.length} rows</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => togglePublish(item)} style={{ padding: "6px 8px", background: item.published ? "#00FF9D15" : "#ffffff10", border: "none", borderRadius: 6, color: item.published ? "#00FF9D" : "#ffffff50", cursor: "pointer" }}>
                  {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => { setEditId(item.id); setForm({ title: item.title, class: item.class, chapter: item.chapter, headers: [...item.headers], rows: item.rows.map(r => [...r]), published: item.published }); }}
                  style={{ padding: "6px 8px", background: "#ffffff10", border: "none", borderRadius: 6, color: "#ffffff60", cursor: "pointer" }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => del(item.id)} style={{ padding: "6px 8px", background: "#ff444415", border: "none", borderRadius: 6, color: "#ff6b6b", cursor: "pointer" }}>
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
