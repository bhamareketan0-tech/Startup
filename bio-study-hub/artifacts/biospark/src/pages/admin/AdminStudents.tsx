import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Search, X, ChevronLeft, ChevronRight, User, Pencil, Save, Trash2, CheckCircle } from "lucide-react";

const PLAN_STYLES: Record<string, string> = {
  elite: "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20",
  pro: "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20",
  free: "text-white/40 bg-white/5 border-white/10",
};

const PLAN_COLORS: Record<string, string> = {
  elite: "#a855f7",
  pro: "#00d4ff",
  free: "rgba(255,255,255,0.3)",
};

interface StudentDetail extends UserProfile {
  attempts_count?: number;
}

export function AdminStudents() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [page, setPage] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const PAGE_SIZE = 20;

  useEffect(() => { fetchStudents(); }, [page, filterClass, filterPlan]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, skip: page * PAGE_SIZE };
      if (filterClass) params.class = filterClass;
      if (filterPlan) params.plan = filterPlan;
      const res = await api.get("/users", params);
      if (res.data) setStudents(res.data as UserProfile[]);
      setTotal(res.total || 0);
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }

  async function openStudent(s: UserProfile) {
    setSelectedStudent(s);
    setDrawerOpen(true);
    setEditing(false);
    setSaved(false);
    setConfirmDelete(false);
    try {
      const res = await api.get(`/users/${s.id}/stats`);
      setSelectedStudent({ ...s, attempts_count: res.attempts_count || 0 });
    } catch { /* silently fail */ }
  }

  function startEdit() {
    if (!selectedStudent) return;
    setEditName(selectedStudent.name || "");
    setEditClass(selectedStudent.class || "11");
    setEditPlan(selectedStudent.plan || "free");
    setEditing(true);
    setSaved(false);
  }

  async function saveStudent() {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const res = await api.put(`/users/${selectedStudent.id}`, { name: editName, class: editClass, plan: editPlan });
      if (res.user) {
        const updated = { ...selectedStudent, name: res.user.name, class: res.user.class, plan: res.user.plan };
        setSelectedStudent(updated);
        setStudents((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  async function deleteStudent() {
    if (!selectedStudent) return;
    try {
      await api.del(`/users/${selectedStudent.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setTotal((t) => t - 1);
      setDrawerOpen(false);
      setConfirmDelete(false);
    } catch { /* silently fail */ }
  }

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <p className="text-white/40 text-sm mt-1">{total} registered students</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full bg-[#0d1b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00ffb3]/50" />
        </div>
        <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(0); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00ffb3]/50">
          <option value="">All Classes</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
        </select>
        <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(0); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00ffb3]/50">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="elite">Elite</option>
        </select>
        {(search || filterClass || filterPlan) && (
          <button onClick={() => { setSearch(""); setFilterClass(""); setFilterPlan(""); setPage(0); }}
            className="px-3 py-2 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#00ffb3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs">Name</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Email</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Class</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Plan</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Score</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors" onClick={() => openStudent(s)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-[#a855f7]" />
                      </div>
                      <span className="text-white text-sm">{s.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{s.email}</td>
                  <td className="px-4 py-3">
                    {s.class && <span className="px-1.5 py-0.5 bg-[#00d4ff]/10 text-[#00d4ff] rounded text-xs border border-[#00d4ff]/20">Class {s.class}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${PLAN_STYLES[s.plan] || PLAN_STYLES.free}`}>
                      {s.plan || "free"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70 text-sm">{s.score || 0}</td>
                  <td className="px-4 py-3 text-white/30 text-xs">{new Date(s.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-white/30">No students found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}
              className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
              className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      {drawerOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => { setDrawerOpen(false); setEditing(false); setConfirmDelete(false); }} />
          <div className="w-88 bg-[#0a1628] border-l border-white/10 flex flex-col overflow-hidden" style={{ width: 340 }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
              <h3 className="text-white font-bold text-sm">Student Details</h3>
              <button onClick={() => { setDrawerOpen(false); setEditing(false); setConfirmDelete(false); }}>
                <X className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Avatar */}
              <div className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-[#a855f7]/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-[#a855f7]">
                  {(selectedStudent.name || selectedStudent.email || "?").slice(0, 2).toUpperCase()}
                </div>
                {editing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-center bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-white font-semibold w-full text-sm focus:outline-none focus:border-[#00ffb3]/50"
                    placeholder="Full name"
                  />
                ) : (
                  <h4 className="text-white font-semibold">{selectedStudent.name || "Unnamed"}</h4>
                )}
                <p className="text-white/40 text-xs mt-1 break-all">{selectedStudent.email}</p>
              </div>

              {/* Success toast */}
              {saved && (
                <div className="flex items-center gap-2 bg-[#00ffb3]/10 border border-[#00ffb3]/20 rounded-xl px-3 py-2 text-[#00ffb3] text-xs">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Saved successfully
                </div>
              )}

              {/* Class */}
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Class</div>
                {editing ? (
                  <div className="flex gap-2">
                    {["11", "12"].map((c) => (
                      <button key={c} onClick={() => setEditClass(c)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style={editClass === c
                          ? { background: "#00ffb3", color: "black", borderColor: "#00ffb3" }
                          : { background: "transparent", color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>
                        Class {c}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-white text-sm font-semibold">Class {selectedStudent.class || "—"}</div>
                )}
              </div>

              {/* Plan */}
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Plan</div>
                {editing ? (
                  <div className="flex gap-2">
                    {["free", "pro", "elite"].map((p) => (
                      <button key={p} onClick={() => setEditPlan(p)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all"
                        style={editPlan === p
                          ? { background: PLAN_COLORS[p], color: p === "free" ? "white" : "black", borderColor: PLAN_COLORS[p] }
                          : { background: "transparent", color: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.1)" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className={`px-2 py-0.5 rounded text-xs border capitalize ${PLAN_STYLES[selectedStudent.plan] || PLAN_STYLES.free}`}>
                    {selectedStudent.plan || "free"}
                  </span>
                )}
              </div>

              {/* Stats — read-only */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-white text-xl font-bold">{selectedStudent.score || 0}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Attempts</div>
                  <div className="text-white text-xl font-bold">{selectedStudent.attempts_count ?? "…"}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Joined</div>
                <div className="text-white text-sm">{new Date(selectedStudent.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>

              {/* Delete confirm */}
              {confirmDelete && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-400 text-xs mb-3 font-medium">Delete this student account permanently?</p>
                  <div className="flex gap-2">
                    <button onClick={deleteStudent} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">Yes, Delete</button>
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-white/8 shrink-0 space-y-2">
              {editing ? (
                <div className="flex gap-2">
                  <button onClick={saveStudent} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#00ffb3] text-black text-xs font-bold hover:bg-[#00e5a0] disabled:opacity-50 transition-all">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditing(false); setSaved(false); }} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 text-xs hover:text-white transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={startEdit}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit Details
                </button>
              )}
              {!editing && !confirmDelete && (
                <button onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Remove Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
