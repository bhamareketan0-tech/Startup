import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { BadgeGrid } from "@/components/BadgeGrid";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { Trophy, Flame, Target, Users, Star, Copy, CheckCircle, ArrowLeft, Calendar } from "lucide-react";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

interface PublicProfile {
  username: string;
  displayName: string;
  initials: string;
  level: string;
  xp: number;
  badges: Array<{ id: string; name: string; emoji: string; description: string; unlockedAt?: string }>;
  streakCount: number;
  streakHistory: string[];
  rank: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPct: number;
  strongestChapters: Array<{ name: string; accuracy: number; total: number }>;
  class: string;
  plan: string;
  memberSince: string;
}

function StreakCalendar({ history }: { history: string[] }) {
  const historySet = new Set(history);
  const today = new Date();
  const weeks: Array<Array<{ date: string; filled: boolean; day: number }>> = [];

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6 * 7 + 1);

  const days: Array<{ date: string; filled: boolean }> = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    const dateStr = cur.toISOString().split("T")[0];
    days.push({ date: dateStr, filled: historySet.has(dateStr) });
    cur.setDate(cur.getDate() + 1);
  }

  const weekChunks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekChunks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weekChunks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((d, di) => (
              <div
                key={di}
                title={d.date}
                className="w-3 h-3 shrink-0"
                style={{
                  background: d.filled ? "#00FF9D" : "var(--bs-surface-2)",
                  border: d.date === today.toISOString().split("T")[0] ? "1px solid #00FF9D" : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono" style={{ color: "var(--bs-text-muted)" }}>
        <div className="w-3 h-3" style={{ background: "var(--bs-surface-2)" }} /> Less
        <div className="w-3 h-3" style={{ background: "#00FF9D" }} /> More
      </div>
    </div>
  );
}

function XPBar({ xp, level }: { xp: number; level: string }) {
  const thresholds: Record<string, [number, number]> = {
    Beginner: [0, 100], Novice: [100, 300], Apprentice: [300, 600],
    Scholar: [600, 1000], Expert: [1000, 1500], Master: [1500, 2500], Champion: [2500, 2500],
  };
  const [lo, hi] = thresholds[level] || [0, 100];
  const pct = hi > lo ? Math.min(100, Math.round(((xp - lo) / (hi - lo)) * 100)) : 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
        <span>{xp.toLocaleString()} XP</span>
        {hi > lo && <span>Next: {hi.toLocaleString()} XP</span>}
      </div>
      <div className="h-2 w-full overflow-hidden" style={{ background: "var(--bs-surface-2)" }}>
        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #00FF9D, #00ccff)" }} />
      </div>
    </div>
  );
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;
    api.get(`/profile/${encodeURIComponent(username)}`)
      .then((res) => {
        const data = res as { profile: PublicProfile };
        setProfile(data.profile);
      })
      .catch(() => setError("Profile not found."))
      .finally(() => setLoading(false));
  }, [username]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const levelEmoji = profile ? (LEVEL_EMOJIS[profile.level] || "🌱") : "🌱";

  return (
    <div className="min-h-screen font-['Space_Grotesk'] pt-24 pb-20 px-4 relative" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link to="/leaderboard" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-8 transition-colors" style={{ color: "var(--bs-text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Leaderboard
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--bs-accent-hex) transparent transparent transparent", borderRadius: "50%" }} />
          </div>
        )}

        {error && (
          <div className="border p-16 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--bs-text-muted)" }} />
            <p className="font-black uppercase text-lg mb-2" style={{ color: "var(--bs-text)" }}>Profile not found</p>
            <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>The user @{username} doesn't exist.</p>
          </div>
        )}

        {profile && !loading && (
          <div className="space-y-6">
            {/* Hero card */}
            <div className="relative border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, var(--bs-accent-hex), #00ccff, transparent)" }} />
              <div className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-20 h-20 border-2 flex items-center justify-center text-2xl font-black shrink-0 transform -skew-x-6"
                    style={{ background: "color-mix(in srgb, var(--bs-accent-hex) 15%, var(--bs-surface))", borderColor: "var(--bs-accent-hex)", color: "var(--bs-accent-hex)" }}>
                    <span className="transform skew-x-6">{profile.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>
                        {profile.displayName}
                      </h1>
                      {profile.plan === "pro" && (
                        <span className="border px-2 py-0.5 text-xs font-black uppercase" style={{ borderColor: "#00FF9D", color: "#00FF9D" }}>⭐ Pro</span>
                      )}
                    </div>
                    <p className="text-xs font-mono mb-3" style={{ color: "var(--bs-text-muted)" }}>@{profile.username} · Class {profile.class}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-4">
                      <span className="border px-2 py-1 font-black" style={{ borderColor: "var(--bs-border-subtle)" }}>
                        {levelEmoji} {profile.level}
                      </span>
                      {profile.streakCount > 0 && (
                        <span className="border px-2 py-1 font-black" style={{ borderColor: "rgba(255,68,68,0.3)", color: "#ff4444" }}>
                          🔥 {profile.streakCount} day streak
                        </span>
                      )}
                      {profile.rank > 0 && (
                        <span className="border px-2 py-1 font-black" style={{ borderColor: "rgba(255,215,0,0.3)", color: "#FFD700" }}>
                          #{profile.rank} Rank
                        </span>
                      )}
                    </div>
                    <XPBar xp={profile.xp} level={profile.level} />
                  </div>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 border px-4 py-2 text-xs font-black uppercase tracking-widest shrink-0 transition-all"
                    style={{ borderColor: copied ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)", color: copied ? "var(--bs-accent-hex)" : "var(--bs-text-muted)" }}
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Share"}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total XP", value: profile.xp.toLocaleString(), icon: Star, color: "#00FF9D" },
                { label: "Questions", value: profile.totalAttempts.toLocaleString(), icon: Target, color: "#00ccff" },
                { label: "Accuracy", value: `${profile.accuracyPct}%`, icon: Trophy, color: "#FFD700" },
                { label: "Badges", value: profile.badges.length.toString(), icon: Users, color: "#ff6b6b" },
              ].map((stat) => (
                <div key={stat.label} className="border p-5 relative group overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <div className="absolute top-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500" style={{ background: stat.color }} />
                  <stat.icon className="w-5 h-5 mb-3" style={{ color: stat.color }} />
                  <div className="text-2xl font-black tracking-tighter mb-0.5" style={{ color: "var(--bs-text)" }}>{stat.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm mb-0.5">Badges</h3>
                  <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
                    {profile.badges.length} / {BADGE_DEFINITIONS.length} earned
                  </p>
                </div>
              </div>
              <BadgeGrid earnedBadges={profile.badges} showLocked={true} />
            </div>

            {/* Streak calendar + Strongest chapters */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4" style={{ color: "#ff4444" }} />
                  <h3 className="font-black uppercase tracking-tight text-sm">Activity Streak</h3>
                </div>
                <StreakCalendar history={profile.streakHistory} />
                <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--bs-border-subtle)" }}>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Current Streak</p>
                    <p className="text-2xl font-black" style={{ color: profile.streakCount > 0 ? "#ff4444" : "var(--bs-text-muted)" }}>
                      {profile.streakCount > 0 ? `${profile.streakCount} 🔥` : "0"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--bs-text-muted)" }}>Member Since</p>
                    <p className="text-sm font-black" style={{ color: "var(--bs-text)" }}>
                      {profile.memberSince ? new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4" style={{ color: "#FFD700" }} />
                  <h3 className="font-black uppercase tracking-tight text-sm">Strongest Chapters</h3>
                </div>
                {profile.strongestChapters.length === 0 ? (
                  <div className="flex items-center justify-center h-24">
                    <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>No data yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.strongestChapters.map((ch, i) => (
                      <div key={ch.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono truncate max-w-[180px]" style={{ color: "var(--bs-text)" }}>
                            <span className="font-black mr-1" style={{ color: "#FFD700" }}>#{i + 1}</span> {ch.name}
                          </span>
                          <span className="text-xs font-black shrink-0 ml-2" style={{ color: "#00FF9D" }}>{ch.accuracy}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden" style={{ background: "var(--bs-surface-2)" }}>
                          <div className="h-full transition-all duration-1000" style={{ width: `${ch.accuracy}%`, background: "#00FF9D" }} />
                        </div>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{ch.total} questions attempted</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
