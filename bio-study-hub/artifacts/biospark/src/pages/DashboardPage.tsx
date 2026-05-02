import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  BookOpen, Target, Clock, Trophy, Zap, BarChart2,
  FlaskConical, Flame, TrendingUp, Users, Brain, ArrowRight,
  Star, Activity, Bookmark, FileText, Sliders, RotateCcw, BookMarked,
} from "lucide-react";
import { ComebackBanner } from "@/components/ComebackBanner";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

const LEVEL_THRESHOLDS: Record<string, [number, number]> = {
  Beginner: [0, 100], Novice: [100, 300], Apprentice: [300, 600],
  Scholar: [600, 1000], Expert: [1000, 1500], Master: [1500, 2500], Champion: [2500, 2500],
};

interface StatsData { totalQuestions: number; totalStudents: number; totalDiscussions: number }
interface Question { id: string; chapter: string; type: string; difficulty: string; class: string }
interface ChapterStat { name: string; count: number; cls: string }

export function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [chapterStats, setChapterStats] = useState<ChapterStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello");
  const [streak, setStreak] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, questionsRes, streakRes, bookmarksRes] = await Promise.all([
          api.get("/stats"),
          api.get("/questions", { limit: 100, is_active: true }),
          api.get("/daily-challenge/streak").catch(() => ({ current: 0 })),
          api.get("/bookmarks").catch(() => ({ data: [] })),
        ]);

        setStats(statsRes as StatsData);
        setStreak((streakRes as { current: number }).current || 0);
        setBookmarkCount(((bookmarksRes as { data: unknown[] }).data || []).length);

        const qs = (questionsRes as { questions?: Question[] }).questions || (questionsRes as Question[]) || [];
        setRecentQuestions((qs as Question[]).slice(0, 6));

        const chMap: Record<string, number> = {};
        (qs as Question[]).forEach((q) => { chMap[q.chapter] = (chMap[q.chapter] || 0) + 1; });
        const sorted = Object.entries(chMap).map(([name, count]) => ({ name, count, cls: "11" })).sort((a, b) => b.count - a.count).slice(0, 6);
        setChapterStats(sorted);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const userClass = profile?.class || "11";
  const userScore = profile?.score || 0;
  const isPro = profile?.plan === "pro";
  const totalQ = stats?.totalQuestions ?? 0;
  const maxChapter = chapterStats[0]?.count || 1;

  const xp = profile?.xp || 0;
  const level = profile?.level || "Beginner";
  const levelEmoji = LEVEL_EMOJIS[level] || "🌱";
  const [lo, hi] = LEVEL_THRESHOLDS[level] || [0, 100];
  const xpProgressPct = hi > lo ? Math.min(100, Math.round(((xp - lo) / (hi - lo)) * 100)) : 100;
  const badgeCount = profile?.badges?.length || 0;
  const username = profile?.username || user?.email?.split("@")[0] || "";

  const QUICK_ACTIONS = [
    { label: "Practice", desc: "Chapter-wise MCQs", icon: BookOpen, to: "/class-select", color: "#00FF9D" },
    { label: "Mock Test", desc: "Full timed test", icon: Clock, to: "/mock-test", color: "#00FF9D" },
    { label: "Daily Challenge", desc: `Streak: ${streak}🔥`, icon: Flame, to: "/daily-challenge", color: "#ff4444" },
    { label: "Custom Quiz", desc: "Build your quiz", icon: Sliders, to: "/custom-quiz", color: "#00FF9D" },
    { label: "Revision", desc: "Wrong questions", icon: RotateCcw, to: "/revision", color: "#facc15" },
    { label: "Bookmarks", desc: `${bookmarkCount} saved`, icon: Bookmark, to: "/bookmarks", color: "#00FF9D" },
    { label: "My Notes", desc: "Revision notes", icon: FileText, to: "/notes", color: "#00FF9D" },
    { label: "Syllabus", desc: "Track progress", icon: BookMarked, to: "/syllabus", color: "#00FF9D" },
  ];

  return (
    <div className="min-h-screen font-['Space_Grotesk'] pt-24 pb-20 px-4 relative" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <ComebackBanner />
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <div className="relative border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--bs-accent-hex) 8%, transparent), transparent 60%)" }} />
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, var(--bs-accent-hex), transparent)" }} />
          <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--bs-accent-hex)" }}>{greeting} 👋</p>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2" style={{ color: "var(--bs-text)" }}>
                Welcome Back, <span style={{ color: "var(--bs-accent-hex)" }}>{userName}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
                <span className="border px-2 py-0.5" style={{ borderColor: "var(--bs-border-subtle)" }}>Class {userClass}</span>
                {isPro && (
                  <span className="border px-2 py-0.5 font-black" style={{ borderColor: "#00FF9D", color: "#00FF9D", background: "color-mix(in srgb, #00FF9D 10%, transparent)" }}>⭐ Pro Pass</span>
                )}
                {streak > 0 && (
                  <span className="border px-2 py-0.5 font-black" style={{ borderColor: "#ff444440", color: "#ff4444", background: "rgba(255,68,68,0.08)" }}>🔥 {streak} day streak</span>
                )}
                <span className="border px-2 py-0.5 font-black" style={{ borderColor: "color-mix(in srgb, var(--bs-accent-hex) 30%, transparent)", color: "var(--bs-accent-hex)" }}>
                  {levelEmoji} {level}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link to="/class-select" className="group relative">
                <div className="absolute inset-0 transform -skew-x-12 translate-x-1.5 translate-y-1.5 opacity-30 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                <div className="relative flex items-center gap-2 px-6 py-3 font-black uppercase tracking-widest text-sm transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                  <span className="transform skew-x-12 inline-flex items-center gap-2"><Zap className="w-4 h-4" /> Practice</span>
                </div>
              </Link>
              <Link to="/performance" className="flex items-center gap-2 px-5 py-3 border font-black uppercase tracking-widest text-sm transform -skew-x-12 transition-all"
                style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                <span className="transform skew-x-12 inline-flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Stats</span>
              </Link>
              {username && (
                <Link to={`/profile/${username}`} className="flex items-center gap-2 px-5 py-3 border font-black uppercase tracking-widest text-sm transform -skew-x-12 transition-all"
                  style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                  <span className="transform skew-x-12 inline-flex items-center gap-2"><Users className="w-4 h-4" /> Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* XP & Level Progress Card */}
        <div className="border p-6 relative overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #00FF9D, #00ccff, transparent)" }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-4xl shrink-0">{levelEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black uppercase tracking-tight text-lg" style={{ color: "var(--bs-text)" }}>{level}</span>
                  <span className="border px-2 py-0.5 text-[10px] font-black uppercase" style={{ borderColor: "color-mix(in srgb, #00FF9D 30%, transparent)", color: "#00FF9D" }}>
                    {xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden mb-1" style={{ background: "var(--bs-surface-2)", borderRadius: "2px" }}>
                  <div
                    className="h-full transition-all duration-1000"
                    style={{ width: `${xpProgressPct}%`, background: "linear-gradient(90deg, #00FF9D, #00ccff)" }}
                  />
                </div>
                <p className="text-[10px] font-mono" style={{ color: "var(--bs-text-muted)" }}>
                  {hi > lo ? `${xpProgressPct}% to next level (${hi.toLocaleString()} XP)` : "Max level reached! 🎉"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: "#FFD700" }}>{badgeCount}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: "#00FF9D" }}>{userScore.toFixed(0)}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Questions", value: loading ? "…" : totalQ.toLocaleString() + "+", icon: BookOpen, color: "#00FF9D", sub: "In question bank" },
            { label: "Total XP", value: xp.toLocaleString(), icon: Star, color: "#00FF9D", sub: "Experience points" },
            { label: "Daily Streak", value: streak > 0 ? `${streak}🔥` : "0", icon: Flame, color: "#ff4444", sub: "Days in a row" },
            { label: "Bookmarks", value: bookmarkCount.toString(), icon: Bookmark, color: "#00FF9D", sub: "Saved questions" },
          ].map((stat) => (
            <div key={stat.label} className="border p-6 relative group overflow-hidden transition-all hover:scale-[1.01]"
              style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="absolute top-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500" style={{ background: stat.color }} />
              <stat.icon className="w-6 h-6 mb-3" style={{ color: stat.color }} />
              <div className="text-3xl font-black tracking-tighter mb-0.5" style={{ color: "var(--bs-text)" }}>{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "var(--bs-text-muted)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.label} to={action.to}
                className="border p-5 flex flex-col gap-3 group transition-all hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
                style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="absolute top-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500" style={{ background: action.color }} />
                <div className="w-10 h-10 border flex items-center justify-center transform -skew-x-12 transition-all"
                  style={{ background: `color-mix(in srgb, ${action.color} 12%, transparent)`, borderColor: `color-mix(in srgb, ${action.color} 30%, transparent)` }}>
                  <action.icon className="w-5 h-5 transform skew-x-12" style={{ color: action.color }} />
                </div>
                <div>
                  <div className="font-black uppercase text-sm tracking-tight mb-0.5" style={{ color: "var(--bs-text)" }}>{action.label}</div>
                  <div className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{action.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 self-end opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: action.color }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chapter Distribution */}
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
                <h3 className="font-black uppercase tracking-tight text-sm">Top Chapters</h3>
              </div>
              <Link to="/class-select" className="text-xs font-mono uppercase tracking-wide flex items-center gap-1" style={{ color: "var(--bs-accent-hex)" }}>
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded" style={{ background: "var(--bs-surface-2)" }} />)}</div>
            ) : chapterStats.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "var(--bs-text-muted)" }} />
                <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>No questions loaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chapterStats.map((ch) => {
                  const pct = (ch.count / maxChapter) * 100;
                  return (
                    <div key={ch.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono truncate max-w-[200px]" style={{ color: "var(--bs-text-muted)" }}>{ch.name}</span>
                        <span className="text-xs font-black ml-2 shrink-0" style={{ color: "#00FF9D" }}>{ch.count}q</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: "#00FF9D" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Questions */}
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
                <h3 className="font-black uppercase tracking-tight text-sm">Recent Questions</h3>
              </div>
              <Link to="/class-select" className="text-xs font-mono uppercase tracking-wide flex items-center gap-1" style={{ color: "var(--bs-accent-hex)" }}>
                Practice <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded" style={{ background: "var(--bs-surface-2)" }} />)}</div>
            ) : recentQuestions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "var(--bs-text-muted)" }} />
                <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>No questions available yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentQuestions.map((q, i) => {
                  const typeColors: Record<string, string> = { mcq: "#00FF9D", assertion: "#ff4444", match: "#00FF9D", statements: "#00FF9D", truefalse: "#00FF9D", fillblanks: "#00FF9D" };
                  const color = typeColors[q.type] ?? "#00FF9D";
                  return (
                    <div key={q.id || i} className="flex items-center gap-3 border p-3 text-xs group transition-all hover:scale-[1.01] cursor-pointer"
                      style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}
                      onClick={() => navigate("/class-select")}>
                      <span className="border px-2 py-0.5 font-black uppercase shrink-0" style={{ borderColor: `${color}40`, color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>{q.type || "MCQ"}</span>
                      <span className="font-mono truncate flex-1" style={{ color: "var(--bs-text-muted)" }}>{q.chapter}</span>
                      <span className="shrink-0 font-mono text-[10px] uppercase" style={{ color: "var(--bs-text-muted)" }}>Cl {q.class}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Study Strategy */}
        <div className="border p-8 relative overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 -translate-y-1/2 translate-x-1/2">
            <FlaskConical className="w-full h-full" style={{ color: "var(--bs-accent-hex)" }} />
          </div>
          <h3 className="font-black uppercase tracking-tight text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} /> Study Strategy
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🎯", tip: "Chapter Focus", desc: `Start with Class ${userClass} chapters you find hardest. Repeated practice builds confidence.` },
              { icon: "⏱️", tip: "Time Yourself", desc: "Take mock tests under timed conditions. NEET gives ~1 min per question. Train your speed." },
              { icon: "📊", tip: "Analyse Weak Areas", desc: "Use the Revision Mode to target questions you got wrong. Check Performance Stats daily." },
            ].map((t) => (
              <div key={t.tip} className="flex gap-4">
                <span className="text-2xl shrink-0">{t.icon}</span>
                <div>
                  <div className="font-black uppercase text-sm mb-1" style={{ color: "var(--bs-text)" }}>{t.tip}</div>
                  <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
