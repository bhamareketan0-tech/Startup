import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2, X, Check, FileText, AlertCircle } from "lucide-react";

interface Passage {
  id: string;
  title: string;
  body: string;
  chapter: string;
  class: string;
  status: string;
  created_at: string;
}

export function AdminPassages() {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingP, setEditingP] = useState<Partial<Passage> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchPassages(); }, []);

  async function fetchPassages() {
    setLoading(true);
    try {
      const res = await api.get("/passages");
      setPassages((res.data || []) as Passage[]);
    } catch {
      setPassages([]);
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setEditingP({ title: "", body: "", chapter: "", class: "11", status: "active" });
    setIsNew(true);
    setError("");
    setShowModal(true);
  }

  function startEdit(p: Passage) {
    setEditingP({ ...p });
    setIsNew(false);
    setError("");
    setShowModal(true);
  }

  async function save() {
    if (!editingP?.title?.trim()) { setError("Title is required."); return; }
    if (!editingP?.body?.trim()) { setError("Passage body is required."); return; }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const res = await api.post("/passages", editingP);
        setPassages((prev) => [res.data as Passage, ...prev]);
      } else {
        const res = await api.put(`/passages/${(editingP as Passage).id}`, editingP);
        setPassages((prev) => prev.map((p) => p.id === (editingP as Passage).id ? res.data as Passage : p));
      }
      setShowModal(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePassage(id: string) {
    if (!confirm("Delete this passage?")) return;
    try {
      await api.del(`/passages/${id}`);
      setPassages((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silently fail */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Passages</h1>
          <p className="text-white/40 text-sm mt-1">Manage passage blocks for reading-based questions</p>
        </div>
        <button onClick={startNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Passage
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#00FF9D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {passages.map((p) => (
            <div key={p.id} className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-4 h-4 text-[#00FF9D] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] rounded text-xs border border-[#00FF9D]/20">Class {p.class}</span>
                    {p.chapter && <span className="px-1.5 py-0.5 bg-white/5 text-white/40 rounded text-xs border border-white/10">{p.chapter}</span>}
                    <span className={`px-1.5 py-0.5 rounded text-xs border ${p.status === "active" ? "bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/20" : "bg-white/5 text-white/30 border-white/10"}`}>{p.status || "active"}</span>
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-xs line-clamp-3 mb-3">{p.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/20 text-xs">{new Date(p.created_at).toLocaleDateString("en-IN")}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)}
                    className="p-1.5 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] rounded-lg hover:bg-[#00FF9D]/20 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deletePassage(p.id)}
                    className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {passages.length === 0 && (
            <div className="col-span-2 text-center py-16 text-white/30">No passages yet. Create one to use in passage-based questions.</div>
          )}
        </div>
      )}

      {showModal && editingP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">{isNew ? "New Passage" : "Edit Passage"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">Title *</label>
                <input value={editingP.title || ""} onChange={(e) => setEditingP({ ...editingP, title: e.target.value })}
                  className="w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Class</label>
                  <select value={editingP.class || "11"} onChange={(e) => setEditingP({ ...editingP, class: e.target.value })}
                    className="w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50">
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Chapter</label>
                  <input value={editingP.chapter || ""} onChange={(e) => setEditingP({ ...editingP, chapter: e.target.value })}
                    placeholder="e.g. Cell Biology"
                    className="w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Status</label>
                <select value={editingP.status || "active"} onChange={(e) => setEditingP({ ...editingP, status: e.target.value })}
                  className="w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Passage Body *</label>
                <textarea value={editingP.body || ""} onChange={(e) => setEditingP({ ...editingP, body: e.target.value })}
                  rows={8} placeholder="Enter the passage text here..."
                  className="w-full bg-[#111e30] border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-[#00FF9D]/50 placeholder-white/20" />
              </div>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-50">
                <Check className="w-4 h-4" /> {saving ? "Saving..." : isNew ? "Create Passage" : "Save Changes"}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-white/20 text-white rounded-xl text-sm hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
