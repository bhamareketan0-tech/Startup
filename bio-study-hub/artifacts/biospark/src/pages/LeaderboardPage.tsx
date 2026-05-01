import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Trophy, Medal, Crown, Flame, Star, Users, ChevronRight, TrendingUp } from "lucide-react";

interface LeaderUser {
  id: string;
  name: string;
  email: string;
  score: number;
  class: string;
  plan: string;
  created_at?: string;
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5" style={{ color: "#FFD700" }} />;
  if (rank === 2) return <Medal className="w-5 h-5" style={{ color: "#C0C0C0" }} />;
  if (rank === 3) return <Medal className="w-5 h-5" style={{ color: "#CD7F32" }} />;
  return <span className="text-sm font-black w-5 text-center" style={{ color: "var(--bs-text-muted)" }}>#{rank}</span>;
}

function rankColor(rank: number) {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "var(--bs-text-muted)";
}

export function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "11" | "12">("all");

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        const all = (res as { users?: LeaderUser[] }).users || (res as LeaderUser[]) || [];
        const sorted = [...(all as LeaderUser[])].sort((a, b) => (b.score || 0) - (a.score || 0));
        setUsers(sorted);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? users : users.filter((u) => u.class === filter);
  const myRank = users.findIndex((u) => u.id === user?.id) + 1;
  const myEntry = users.find((u) => u.id === user?.id);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3, 50);

  return (
    <div className="min-h-screen font-['Space_Grotesk'] pt-24 pb-20 px-4 relative" style={{ background: "transparent", color: "var(--bs-text)" }}>

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[120px] pointer-events-none opacity-15"
        style={{ background: "#FFD700" }} />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 border px-4 py-2 mb-6 transform -skew-x-12"
            style={{ background: "var(--bs-surface)", borderColor: "#FFD700" }}>
            <Trophy className="w-4 h-4 transform skew-x-12" style={{ color: "#FFD700" }} />
            <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color: "#FFD700" }}>Hall of Fame</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-3" style={{ color: "var(--bs-text)" }}>
            Leader<span style={{ color: "#FFD700" }}>board</span>
          </h1>
          <p className="text-sm font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
            Top NEET Biology performers — updated live
          </p>
        </div>

        {/* My Rank Banner (if logged in) */}
        {user && myEntry && (
          <div className="relative border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-2 flex items-center justify-center font-black text-xl transform -skew-x-12"
                  style={{ borderColor: "#FFD700", background: "color-mix(in srgb, #FFD700 10%, transparent)", color: "#FFD700" }}>
                  <span className="transform skew-x-12">#{myRank}</span>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: "#FFD700" }}>Your Rank</p>
                  <p className="font-black uppercase text-lg" style={{ color: "var(--bs-text)" }}>
                    {profile?.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Score</p>
                <p className="text-2xl font-black" style={{ color: "#FFD700" }}>{(myEntry.score || 0).toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(["all", "11", "12"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-5 py-2 border font-black uppercase tracking-widest text-xs transform -skew-x-12 transition-all"
              style={{
                background: filter === f ? "var(--bs-accent-hex)" : "var(--bs-surface)",
                color: filter === f ? "black" : "var(--bs-text-muted)",
                borderColor: filter === f ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)",
              }}
            >
              <span className="transform skew-x-12 inline-block">
                {f === "all" ? "All Classes" : `Class ${f}`}
              </span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
            <Users className="w-4 h-4" />
            {loading ? "…" : filtered.length} students
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse border" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border p-16 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--bs-text-muted)" }} />
            <p className="font-black uppercase text-lg mb-2" style={{ color: "var(--bs-text)" }}>No students yet</p>
            <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>Be the first to set a score!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  top3[1],
                  top3[0],
                  top3[2],
                ].map((u, podiumIdx) => {
                  if (!u) return <div key={podiumIdx} />;
                  const actualRank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
                  const colors = ["#C0C0C0", "#FFD700", "#CD7F32"];
                  const color = colors[podiumIdx];
                  const isMe = u.id === user?.id;
                  return (
                    <div
                      key={u.id}
                      className={`relative border p-4 text-center overflow-hidden transition-all ${podiumIdx === 1 ? "scale-105 shadow-2xl" : ""}`}
                      style={{
                        background: "var(--bs-surface)",
                        borderColor: color,
                        boxShadow: `0 0 20px color-mix(in srgb, ${color} 20%, transparent)`,
                      }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1" style={{ background: color }} />
                      <div className="text-3xl mb-2">{actualRank === 1 ? "👑" : actualRank === 2 ? "🥈" : "🥉"}</div>
                      <div className="w-12 h-12 border-2 flex items-center justify-center font-black text-lg mx-auto mb-3 transform -skew-x-12"
                        style={{ borderColor: color, background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                        <span className="transform skew-x-12">{(u.name || u.email?.split("@")[0] || "?").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="font-black uppercase text-sm mb-0.5 truncate" style={{ color: "var(--bs-text)" }}>
                        {u.name?.split(" ")[0] || u.email?.split("@")[0]}
                        {isMe && <span className="ml-1 text-[10px]" style={{ color: "var(--bs-accent-hex)" }}>(You)</span>}
                      </div>
                      <div className="text-xs font-mono mb-3" style={{ color: "var(--bs-text-muted)" }}>Class {u.class || "–"}</div>
                      <div className="text-2xl font-black" style={{ color }}>{(u.score || 0).toFixed(0)}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>points</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rank Table */}
            {rest.length > 0 && (
              <div className="border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                {rest.map((u, idx) => {
                  const rank = idx + 4;
                  const isMe = u.id === user?.id;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-4 px-6 py-4 border-b transition-all"
                      style={{
                        borderColor: "var(--bs-border-subtle)",
                        background: isMe ? "color-mix(in srgb, var(--bs-accent-hex) 6%, transparent)" : "transparent",
                      }}
                    >
                      <div className="w-8 flex items-center justify-center shrink-0">
                        <MedalIcon rank={rank} />
                      </div>
                      <div className="w-10 h-10 border flex items-center justify-center font-black text-sm transform -skew-x-12 shrink-0"
                        style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)", color: "var(--bs-accent-hex)" }}>
                        <span className="transform skew-x-12">{(u.name || u.email?.split("@")[0] || "?").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black uppercase text-sm truncate" style={{ color: "var(--bs-text)" }}>
                          {u.name || u.email?.split("@")[0]}
                          {isMe && <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--bs-accent-hex)" }}>← YOU</span>}
                        </div>
                        <div className="text-xs font-mono flex items-center gap-2" style={{ color: "var(--bs-text-muted)" }}>
                          <span>Class {u.class || "–"}</span>
                          {u.plan === "pro" && <span style={{ color: "#f59e0b" }}>⭐ Pro</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-lg" style={{ color: isMe ? "var(--bs-accent-hex)" : "var(--bs-text)" }}>
                          {(u.score || 0).toFixed(0)}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Motivational footer */}
        {!loading && filtered.length > 0 && (
          <div className="border p-6 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--bs-accent-hex)" }} />
            <p className="font-black uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>Climb the ranks</p>
            <p className="text-xs font-mono mt-1 mb-4" style={{ color: "var(--bs-text-muted)" }}>
              Scores update as you practice. Every correct answer moves you up.
            </p>
            <a href="/class-select" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest border px-5 py-2.5 transition-all hover:opacity-80"
              style={{ background: "var(--bs-accent-hex)", color: "black", borderColor: "var(--bs-accent-hex)" }}>
              <Flame className="w-4 h-4" /> Start Practicing
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
