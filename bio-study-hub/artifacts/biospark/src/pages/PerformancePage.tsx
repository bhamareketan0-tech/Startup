import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, TrendingUp, Target, Clock, Flame, Zap, Star, BarChart2, BookOpen, CheckCircle, XCircle, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from "recharts";

interface PerfData {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
  totalStudyMinutes: number;
  streak: number;
  byChapter: Record<string, { total: number; correct: number; timeSec: number }>;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  dailyActivity: Record<string, number>;
  chapterAccuracy: Array<{ name: string; accuracy: number; total: number }>;
  thisWeekQuestions: number;
  prevWeekQuestions: number;
  dailyChallengesCompleted: number;
  xp: number;
}

interface ActivityDay { date: string; count: number; correct: number; accuracy: number }

const DIFF_COLORS: Record<string, string> = { easy: "#00FF9D", medium: "#facc15", hard: "#ff4444" };
const TYPE_LABELS: Record<string, string> = { mcq: "MCQ", assertion: "Assertion", truefalse: "T/F", fillblanks: "Fill", match: "Match", statements: "Statements", diagram: "Diagram", table_based: "Table", pyq: "PYQ" };

function getIntensity(count: number): string {
  if (count === 0) return "#1a1a1a";
  if (count <= 10) return "#003d2b";
  if (count <= 30) return "#006644";
  if (count <= 50) return "#00993d";
  return "#00FF9D";
}

function getLast12MonthsDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export function PerformancePage() {
  const navigate = useNavigate();
  const [perf, setPerf] = useState<PerfData | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<{ date: string; count: number; accuracy: number } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/performance/overview"),
      api.get("/performance/activity"),
    ]).then(([p, a]) => {
      setPerf(p as PerfData);
      setActivity(((a as { data: ActivityDay[] }).data) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent" }}>
        <div className="max-w-6xl mx-auto space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 animate-pulse" style={{ background: "var(--bs-surface)" }} />)}
        </div>
      </div>
    );
  }

  if (!perf) return null;

  const days = getLast12MonthsDays();
  const activityMap: Record<string, number> = {};
  for (const a of activity) activityMap[a.date] = a.count;
  const accMap: Record<string, number> = {};
  for (const a of activity) accMap[a.date] = a.accuracy;

  const weekDiff = perf.prevWeekQuestions > 0 ? Math.round(((perf.thisWeekQuestions - perf.prevWeekQuestions) / perf.prevWeekQuestions) * 100) : 0;

  const typeData = Object.entries(perf.byType).map(([k, v]) => ({ name: TYPE_LABELS[k] || k, value: v }));
  const diffData = Object.entries(perf.byDifficulty).map(([k, v]) => ({ name: k, value: v, color: DIFF_COLORS[k] || "#00FF9D" }));
  const topChapters = perf.chapterAccuracy.slice(0, 10);
  const bestChapters = [...perf.chapterAccuracy].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
  const worstChapters = [...perf.chapterAccuracy].filter((c) => c.total >= 3).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  const last30Days = days.slice(-30);
  const lineData = last30Days.map((d) => ({ date: d.slice(5), count: activityMap[d] || 0 }));

  const level = Math.floor(perf.xp / 500) + 1;
  const xpInLevel = perf.xp % 500;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
            <BarChart2 className="w-6 h-6 text-black transform skew-x-12" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Performance</h1>
            <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>Your complete study analytics</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Attempted", value: perf.totalAttempted.toLocaleString(), icon: BookOpen, color: "#00FF9D" },
            { label: "Accuracy", value: `${perf.accuracy}%`, icon: Target, color: "#00FF9D" },
            { label: "Streak", value: `${perf.streak}d`, icon: Flame, color: "#ff4444" },
            { label: "Study Time", value: `${Math.floor(perf.totalStudyMinutes / 60)}h ${perf.totalStudyMinutes % 60}m`, icon: Clock, color: "#00FF9D" },
            { label: "XP Points", value: perf.xp.toLocaleString(), icon: Star, color: "#facc15" },
            { label: "Level", value: `Lv ${level}`, icon: Zap, color: "#00FF9D" },
          ].map((s) => (
            <div key={s.label} className="border p-4 relative overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-black tracking-tighter" style={{ color: "var(--bs-text)" }}>{s.value}</div>
              <div className="text-xs font-mono uppercase tracking-wide mt-0.5" style={{ color: "var(--bs-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="border p-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black uppercase text-sm">Level {level}</span>
            <span className="font-mono text-sm" style={{ color: "#facc15" }}>{xpInLevel} / 500 XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(xpInLevel / 500) * 100}%`, background: "#facc15" }} />
          </div>
        </div>

        {/* 30-Day Activity + Type Donut */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2" style={{ color: "var(--bs-text)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#00FF9D" }} /> Questions (Last 30 Days)
            </h3>
            <div className="flex items-center gap-4 mb-2 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
              <span>This week: <strong style={{ color: "var(--bs-text)" }}>{perf.thisWeekQuestions}</strong></span>
              {weekDiff !== 0 && <span style={{ color: weekDiff > 0 ? "#00FF9D" : "#ff4444" }}>{weekDiff > 0 ? "+" : ""}{weekDiff}% vs last week</span>}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={lineData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} width={28} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #00FF9D44", color: "#fff", fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#00FF9D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4" style={{ color: "var(--bs-text)" }}>Question Type Breakdown</h3>
            {typeData.length === 0 ? (
              <div className="flex items-center justify-center h-40 font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>No data yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                      {typeData.map((_, i) => (
                        <Cell key={i} fill={["#00FF9D", "#00cc7d", "#009960", "#006644", "#00FF9D88", "#00FF9D44", "#facc15", "#ff4444", "#ff944444"][i % 9]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #00FF9D44", color: "#fff", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {typeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs font-mono">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ["#00FF9D", "#00cc7d", "#009960", "#006644", "#00FF9D88", "#00FF9D44", "#facc15", "#ff4444", "#ff944444"][i % 9] }} />
                      <span style={{ color: "var(--bs-text-muted)" }}>{d.name}</span>
                      <span className="ml-auto font-black" style={{ color: "var(--bs-text)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Accuracy Bar */}
        <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2" style={{ color: "var(--bs-text)" }}>
            <BarChart2 className="w-4 h-4" style={{ color: "#00FF9D" }} /> Accuracy by Chapter
          </h3>
          {topChapters.length === 0 ? (
            <div className="py-8 text-center font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>No chapter data yet — start practising!</div>
          ) : (
            <div className="space-y-3">
              {topChapters.map((ch) => (
                <div key={ch.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono truncate max-w-[240px]" style={{ color: "var(--bs-text-muted)" }} title={ch.name}>{ch.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{ch.total}q</span>
                      <span className="text-xs font-black w-12 text-right" style={{ color: ch.accuracy >= 70 ? "#00FF9D" : ch.accuracy >= 40 ? "#facc15" : "#ff4444" }}>{ch.accuracy}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ch.accuracy}%`, background: ch.accuracy >= 70 ? "#00FF9D" : ch.accuracy >= 40 ? "#facc15" : "#ff4444" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best / Worst + Difficulty */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4">Best Chapters 🏆</h3>
            <div className="space-y-2">
              {bestChapters.length === 0 ? <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>No data yet</p> : bestChapters.map((c) => (
                <div key={c.name} className="flex items-center justify-between border p-3" style={{ background: "rgba(0,255,157,0.05)", borderColor: "rgba(0,255,157,0.2)" }}>
                  <span className="text-sm font-mono truncate" style={{ color: "var(--bs-text)" }}>{c.name}</span>
                  <span className="font-black text-sm shrink-0 ml-2" style={{ color: "#00FF9D" }}>{c.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4">Needs Work 🎯</h3>
            <div className="space-y-2">
              {worstChapters.length === 0 ? <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>No data yet</p> : worstChapters.map((c) => (
                <div key={c.name} className="flex items-center justify-between border p-3" style={{ background: "rgba(255,68,68,0.05)", borderColor: "rgba(255,68,68,0.2)" }}>
                  <span className="text-sm font-mono truncate" style={{ color: "var(--bs-text)" }}>{c.name}</span>
                  <span className="font-black text-sm shrink-0 ml-2" style={{ color: "#ff4444" }}>{c.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Distribution */}
        {diffData.length > 0 && (
          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4">Difficulty Distribution</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={diffData}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} width={28} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #00FF9D44", color: "#fff", fontSize: 12 }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {diffData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Study Streak Calendar */}
        <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2" style={{ color: "var(--bs-text)" }}>
            <Calendar className="w-4 h-4" style={{ color: "#00FF9D" }} /> Study Activity — Last 12 Months
          </h3>
          <div className="overflow-x-auto pb-2">
            <div style={{ display: "grid", gridTemplateColumns: `repeat(53, 14px)`, gap: "2px", width: "fit-content" }}>
              {days.map((d) => {
                const count = activityMap[d] || 0;
                const acc = accMap[d] || 0;
                return (
                  <div
                    key={d}
                    title={`${d}: ${count} questions${count > 0 ? `, ${acc}% accuracy` : ""}`}
                    onMouseEnter={() => setHovered({ date: d, count, accuracy: acc })}
                    onMouseLeave={() => setHovered(null)}
                    style={{ width: 12, height: 12, borderRadius: 2, background: getIntensity(count), cursor: "pointer", border: hovered?.date === d ? "1px solid #00FF9D" : "1px solid transparent" }}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
              <span>Less</span>
              {["#1a1a1a", "#003d2b", "#006644", "#00993d", "#00FF9D"].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
              ))}
              <span>More</span>
            </div>
            {hovered && hovered.count > 0 && (
              <span className="text-xs font-mono" style={{ color: "#00FF9D" }}>
                {hovered.date}: {hovered.count} questions · {hovered.accuracy}% accuracy
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
