import { useState, useEffect } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MessageSquare, ThumbsUp, Clock, User, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Discussion = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  likes: number;
  created_at: string;
  chapter?: string;
};

export function CommunityPage() {
  const { user, profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function fetchDiscussions() {
    setLoading(true);
    try {
      const res = await api.get("/discussions");
      if (res.data) setDiscussions(res.data as Discussion[]);
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiscussions();
  }, []);

  async function postDiscussion() {
    if (!title.trim() || !body.trim() || !user) return;
    setPosting(true);
    try {
      await api.post("/discussions", {
        title,
        body,
        author_name: profile?.name || user.email?.split("@")[0] || "Anonymous",
        user_id: user.id,
        likes: 0,
      });
      setTitle("");
      setBody("");
      setShowForm(false);
      await fetchDiscussions();
    } catch { /* silently fail */ } finally {
      setPosting(false);
    }
  }

  async function likeDiscussion(id: string) {
    try {
      await api.post(`/discussions/${id}/like`, {});
      setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
    } catch { /* silently fail */ }
  }

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const inputStyle = {
    background: "var(--bs-surface-2)",
    border: "1px solid var(--bs-border-subtle)",
    color: "var(--bs-text)",
  };

  return (
    <div className="min-h-screen relative" style={{ background: "transparent" }}>
      <AnimatedBackground />
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--bs-text)" }}>
                <span style={{ color: "var(--bs-accent-hex)" }}>Community</span>
              </h1>
              <p style={{ color: "var(--bs-text-muted)" }}>Discuss doubts, share notes, help each other crack NEET</p>
            </div>
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? "Cancel" : "New Post"}
              </button>
            )}
          </div>

          {showForm && (
            <div
              className="backdrop-blur-xl border rounded-2xl p-6 mb-6"
              style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
            >
              <h3 className="font-semibold mb-4" style={{ color: "var(--bs-text)" }}>Start a Discussion</h3>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Discussion title..."
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all mb-3 text-sm"
                style={inputStyle}
              />
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Describe your doubt or share your thoughts..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all resize-none text-sm mb-3"
                style={inputStyle}
              />
              <button
                onClick={postDiscussion}
                disabled={posting || !title.trim() || !body.trim()}
                className="px-6 py-2.5 font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 text-sm transition-opacity"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                {posting ? "Posting..." : "Post Discussion"}
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div
                className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: "var(--bs-accent-hex) transparent transparent transparent" }}
              />
              <p style={{ color: "var(--bs-text-muted)" }}>Loading discussions...</p>
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--bs-border-strong)" }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--bs-text)" }}>No discussions yet</h3>
              <p className="text-sm" style={{ color: "var(--bs-text-muted)" }}>Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((d) => (
                <div
                  key={d.id}
                  className="backdrop-blur-xl border rounded-2xl p-5 transition-all"
                  style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: "var(--bs-text)" }}>{d.title}</h3>
                  <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: "var(--bs-text-muted)" }}>{d.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--bs-text-muted)" }}>
                        <User className="w-3 h-3" />
                        {d.author_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--bs-text-muted)" }}>
                        <Clock className="w-3 h-3" />
                        {formatDate(d.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => likeDiscussion(d.id)}
                      className="flex items-center gap-1.5 transition-colors text-xs"
                      style={{ color: "var(--bs-text-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bs-secondary-hex)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bs-text-muted)")}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {d.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
