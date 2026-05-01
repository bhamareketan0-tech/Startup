import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Search, Eye, Trash2, Flag, CheckCircle, X, MessageSquare } from "lucide-react";

interface Discussion {
  id: string;
  title: string;
  content: string;
  author_name?: string;
  author_id: string;
  replies_count?: number;
  likes?: number;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  open: "text-[#00ffb3] bg-[#00ffb3]/10 border-[#00ffb3]/20",
  solved: "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20",
  reported: "text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/20",
  removed: "text-white/30 bg-white/5 border-white/10",
};

export function AdminCommunity() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  useEffect(() => { fetchDiscussions(); }, [filterStatus]);

  async function fetchDiscussions() {
    setLoading(true);
    try {
      const res = await api.get("/discussions");
      let data: Discussion[] = res.data || [];
      if (filterStatus) data = data.filter((d) => (d.status || "open") === filterStatus);
      setDiscussions(data);
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.put(`/discussions/${id}`, { status });
      setDiscussions((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
      if (selectedDiscussion?.id === id) setSelectedDiscussion((prev) => prev ? { ...prev, status } : null);
    } catch { /* silently fail */ }
  }

  async function deleteDiscussion(id: string) {
    if (!confirm("Delete this discussion?")) return;
    try {
      await api.del(`/discussions/${id}`);
      fetchDiscussions();
    } catch { /* silently fail */ }
  }

  const filtered = discussions.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.title?.toLowerCase().includes(q) || d.author_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Community Discussions</h1>
        <p className="text-white/40 text-sm mt-1">Moderate and manage community content</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions..."
            className="w-full bg-[#0d1b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00ffb3]/50" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00ffb3]/50">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="solved">Solved</option>
          <option value="reported">Reported</option>
          <option value="removed">Removed</option>
        </select>
        {(search || filterStatus) && (
          <button onClick={() => { setSearch(""); setFilterStatus(""); }}
            className="px-3 py-2 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white transition-colors flex items-center gap-1">
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
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs">Title</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Author</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Replies</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Likes</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Status</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Date</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white text-xs line-clamp-2 max-w-xs">{d.title || "(No title)"}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{d.author_name || "Anonymous"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <MessageSquare className="w-3 h-3" />
                      {d.replies_count || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">♥ {d.likes || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs border capitalize ${STATUS_STYLES[d.status] || STATUS_STYLES.open}`}>
                      {d.status || "open"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs">{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setSelectedDiscussion(d)} title="View"
                        className="p-1.5 bg-white/5 border border-white/10 text-white/50 rounded-lg hover:text-white hover:border-white/20 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {d.status !== "solved" && (
                        <button onClick={() => updateStatus(d.id, "solved")} title="Mark Solved"
                          className="p-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] rounded-lg hover:bg-[#00d4ff]/20 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {d.status !== "reported" && (
                        <button onClick={() => updateStatus(d.id, "reported")} title="Flag as Reported"
                          className="p-1.5 bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] rounded-lg hover:bg-[#f43f5e]/20 transition-colors">
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteDiscussion(d.id)} title="Delete"
                        className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-white/30">No discussions found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View modal */}
      {selectedDiscussion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDiscussion(null)} />
          <div className="relative bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Discussion Details</h3>
              <button onClick={() => setSelectedDiscussion(null)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/30">Title</label>
                <p className="text-white text-sm mt-1">{selectedDiscussion.title || "(No title)"}</p>
              </div>
              <div>
                <label className="text-xs text-white/30">Content</label>
                <p className="text-white/70 text-sm mt-1 max-h-32 overflow-y-auto">{selectedDiscussion.content || "(No content)"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/30">Author</label>
                  <p className="text-white text-sm mt-1">{selectedDiscussion.author_name || "Anonymous"}</p>
                </div>
                <div>
                  <label className="text-xs text-white/30">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${STATUS_STYLES[selectedDiscussion.status] || STATUS_STYLES.open}`}>
                      {selectedDiscussion.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {selectedDiscussion.status !== "solved" && (
                  <button onClick={() => { updateStatus(selectedDiscussion.id, "solved"); setSelectedDiscussion(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] rounded-lg text-xs hover:bg-[#00d4ff]/20 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Solved
                  </button>
                )}
                <button onClick={() => { deleteDiscussion(selectedDiscussion.id); setSelectedDiscussion(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
