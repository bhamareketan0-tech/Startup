import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  BookOpen, Users, Crown, MessageSquare,
  TrendingUp, Activity, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface Stats {
  questions: number;
  students: number;
  premium: number;
  discussions: number;
}

interface DailyActivity {
  day: string;
  solved: number;
}

interface TypeDist {
  type: string;
  count: number;
  pct: number;
}

interface RecentQuestion {
  id: string;
  question: string;
  chapter: string;
  class: string;
  difficulty: string;
  type: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  mcq: "#00FF9D",
  passage: "#00FF9D",
  assertion: "#00FF9D",
  truefalse: "#00FF9D",
  match: "#00FF9D",
  pointer: "#00FF9D",
  statements: "#00FF9D",
  fillinblanks: "#00FF9D",
};

const DIFF_COLORS: Record<string, string> = {
  easy: "#00FF9D",
  medium: "#00FF9D",
  hard: "#ff4444",
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ questions: 0, students: 0, premium: 0, discussions: 0 });
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [typeDist, setTypeDist] = useState<TypeDist[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get("/stats");
      setStats({
        questions: res.questions || 0,
        students: res.students || 0,
        premium: res.premium || 0,
        discussions: res.discussions || 0,
      });
      if (res.typeDist) setTypeDist(res.typeDist);
      if (res.dailyActivity) setDailyActivity(res.dailyActivity);
      // Fetch recent questions separately
      const qRes = await api.get("/questions", { limit: 5 });
      if (qRes.data) setRecentQuestions(qRes.data as RecentQuestion[]);
    } catch {
      // silently fail — db may not be connected yet
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Total Questions", value: stats.questions, icon: BookOpen, color: "#00FF9D" },
    { label: "Total Students", value: stats.students, icon: Users, color: "#00FF9D" },
    { label: "Premium Users", value: stats.premium, icon: Crown, color: "#00FF9D" },
    { label: "Discussions", value: stats.discussions, icon: MessageSquare, color: "#00FF9D" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-[#00FF9D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Overview of your BioSpark platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
              <TrendingUp className="w-4 h-4 text-white/20" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</div>
            <div className="text-xs text-white/40">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="col-span-2 bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#00FF9D]" />
            <h3 className="text-white font-semibold text-sm">Quiz Attempts — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="solved" fill="#00FF9D" radius={[4, 4, 0, 0]} name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type Distribution */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Question Types</h3>
          <div className="space-y-2">
            {typeDist.slice(0, 7).map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs capitalize">{t.type}</span>
                  <span className="text-white text-xs font-semibold">{t.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${t.pct}%`,
                      backgroundColor: TYPE_COLORS[t.type] || "#00FF9D"
                    }}
                  />
                </div>
              </div>
            ))}
            {typeDist.length === 0 && (
              <p className="text-white/30 text-xs">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#00FF9D]" />
          <h3 className="text-white font-semibold text-sm">Recently Added Questions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Question</th>
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Chapter</th>
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Class</th>
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Difficulty</th>
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Type</th>
                <th className="text-left py-2 px-3 text-white/30 text-xs font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {recentQuestions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="py-3 px-3 text-white/70 text-xs max-w-xs">
                    <span className="line-clamp-2">{q.question}</span>
                  </td>
                  <td className="py-3 px-3 text-white/50 text-xs">{q.chapter || "—"}</td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] rounded text-xs">{q.class}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs capitalize"
                      style={{
                        backgroundColor: (DIFF_COLORS[q.difficulty] || "#00FF9D") + "20",
                        color: DIFF_COLORS[q.difficulty] || "#00FF9D",
                      }}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white/50 text-xs capitalize">{q.type}</td>
                  <td className="py-3 px-3 text-white/30 text-xs">
                    {new Date(q.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
              {recentQuestions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-white/30 text-sm">No questions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
