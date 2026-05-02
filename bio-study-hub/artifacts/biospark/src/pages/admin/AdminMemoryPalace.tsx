import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff, MapPin, X } from "lucide-react";

interface Label { id: string; text: string; revealText: string; x: number; y: number; }
interface MPItem { id: string; title: string; class: string; chapter: string; subunit: string; imageUrl: string; labels: Label[]; published: boolean; }

const EMPTY_FORM = { title: "", class: "both", chapter: "", subunit: "", imageUrl: "", labels: [] as Label[], published: false };

export function AdminMemoryPalace() {
  const [items, setItems] = useState<MPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY_FORM | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [labelEdit, setLabelEdit] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const load = () => {
    setLoading(true);
    api.get("/memory-palace", { admin: "true" }).then((d: any) => setItems(d || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  function addLabelAt(e: React.MouseEvent<HTMLDivElement>) {
    if (!form) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now().toString();
    setForm(f => f ? { ...f, labels: [...f.labels, { id, text: "Label", revealText: "", x, y }] } : f);
    setLabelEdit(id);
  }

  function updateLabel(id: string, field: keyof Label, val: string) {
    setForm(f => f ? { ...f, labels: f.labels.map(l => l.id === id ? { ...l, [field]: val } : l) } : f);
  }

  function removeLabel(id: string) {
    setForm(f => f ? { ...f, labels: f.labels.filter(l => l.id !== id) } : f);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      if (editId) await api.put(`/memory-palace/${editId}`, form);
      else await api.post("/memory-palace", form);
      setForm(null); setEditId(null); load();
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this diagram?")) return;
    await api.del(`/memory-palace/${id}`); load();
  }

  async function togglePublish(item: MPItem) {
    await api.put(`/memory-palace/${item.id}`, { published: !item.published }); load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Memory Palace Manager</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>Upload diagrams with clickable labels</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY_FORM, labels: [] }); setEditId(null); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={16} /> Add Diagram
        </button>
      </div>

      {form !== null && (
        <div style={{ background: "#0d1a12", border: "1px solid #00FF9D33", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#00FF9D", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{editId ? "Edit" : "New"} Diagram</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 12, marginBottom: 12 }}>
            {[["Class","class",["both","11","12"]], ["Chapter","chapter"], ["Subunit","subunit"], ["Title","title"]].map(([label, key, opts]: any) => (
              <div key={key}>
                <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>{label}</label>
                {opts ? (
                  <select value={(form as any)[key]} onChange={e => setForm(f => f && { ...f, [key]: e.target.value })} style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
                    {opts.map((o: string) => <option key={o} value={o}>{o === "both" ? "Both" : `Class ${o}`}</option>)}
                  </select>
                ) : (
                  <input value={(form as any)[key]} onChange={e => setForm(f => f && { ...f, [key]: e.target.value })} placeholder={label as string}
                    style={{ width: "100%", padding: "9px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>Image URL</label>
            <input value={form.imageUrl} onChange={e => setForm(f => f && { ...f, imageUrl: e.target.value })} placeholder="https://… (hosted image URL)"
              style={{ width: "100%", padding: "9px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
          </div>

          {form.imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: "#ffffff60", fontSize: 12, marginBottom: 8 }}>Click on the image to add labels ({form.labels.length} added)</p>
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%", cursor: "crosshair" }} onClick={addLabelAt}>
                <img ref={imgRef} src={form.imageUrl} alt="Diagram" style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8, border: "1px solid #ffffff15", display: "block" }} />
                {form.labels.map(label => (
                  <div key={label.id} style={{ position: "absolute", left: `${label.x}%`, top: `${label.y}%`, transform: "translate(-50%,-50%)", zIndex: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#00FF9D", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={e => { e.stopPropagation(); setLabelEdit(labelEdit === label.id ? null : label.id); }}>
                      <MapPin size={10} color="#000" />
                    </div>
                    {labelEdit === label.id && (
                      <div style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", background: "#0a0a0a", border: "1px solid #00FF9D44", borderRadius: 8, padding: 12, width: 200, zIndex: 10 }}
                        onClick={e => e.stopPropagation()}>
                        <input value={label.text} onChange={e => updateLabel(label.id, "text", e.target.value)} placeholder="Label name"
                          style={{ width: "100%", padding: "6px 8px", background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 5, color: "#00FF9D", fontSize: 12, outline: "none", marginBottom: 6 }} />
                        <input value={label.revealText} onChange={e => updateLabel(label.id, "revealText", e.target.value)} placeholder="Details on reveal"
                          style={{ width: "100%", padding: "6px 8px", background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 5, color: "#fff", fontSize: 12, outline: "none", marginBottom: 6 }} />
                        <button onClick={() => removeLabel(label.id)} style={{ width: "100%", padding: "5px", background: "#ff444420", border: "none", borderRadius: 5, color: "#ff6b6b", fontSize: 11, cursor: "pointer" }}>Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ffffff80", fontSize: 13 }}>
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => f && { ...f, published: e.target.checked })} /> Publish
            </label>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setForm(null); setEditId(null); }} style={{ padding: "9px 18px", background: "#ffffff10", border: "none", borderRadius: 7, color: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding: "9px 18px", background: "#00FF9D", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{saving ? "Saving…" : "Save Diagram"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: "#ffffff40" }}>Loading…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {items.length === 0 && <p style={{ color: "#ffffff30", fontSize: 14, gridColumn: "1/-1" }}>No diagrams yet.</p>}
          {items.map(item => (
            <div key={item.id} style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 10, overflow: "hidden" }}>
              {item.imageUrl && <div style={{ aspectRatio: "16/9", overflow: "hidden" }}><img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{item.title}</p>
                  <p style={{ color: "#ffffff40", fontSize: 12, marginTop: 2 }}>{item.chapter} · {item.labels.length} labels</p>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => togglePublish(item)} style={{ padding: "5px 7px", background: item.published ? "#00FF9D15" : "#ffffff10", border: "none", borderRadius: 5, color: item.published ? "#00FF9D" : "#ffffff50", cursor: "pointer" }}>
                    {item.published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => { setEditId(item.id); setForm({ title: item.title, class: item.class, chapter: item.chapter, subunit: item.subunit, imageUrl: item.imageUrl, labels: item.labels.map(l => ({ ...l })), published: item.published }); }}
                    style={{ padding: "5px 7px", background: "#ffffff10", border: "none", borderRadius: 5, color: "#ffffff60", cursor: "pointer" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => del(item.id)} style={{ padding: "5px 7px", background: "#ff444415", border: "none", borderRadius: 5, color: "#ff6b6b", cursor: "pointer" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
