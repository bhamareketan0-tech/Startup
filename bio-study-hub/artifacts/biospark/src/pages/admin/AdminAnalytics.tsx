import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { BarChart2 } from "lucide-react";

const COLORS = ["#00FF9D", "#00FF9D", "#00FF9D", "#00FF9D", "#00FF9D", "#00FF9D99", "#00FF9D99", "#00FF9D99"];

async function fetchAllPages<T>(endpoint: string, extra?: Record<string, unknown>): Promise<T[]> {
  const PAGE = 500;
  const results: T[] = [];
  let skip = 0;
  while (true) {
    const res = await api.get(endpoint, { limit: PAGE, skip, ...extra });
    const page: T[] = res.data || res || [];
    if (!Array.isArray(page) || page.length === 0) break;
    results.push(...page);
    if (page.length < PAGE) break;
    skip += PAGE;
  }
  return results;
}

export function AdminAnalytics() {
  const [chapterData, setChapterData] = useState<{ chapter: string; count: number }[]>([]);
  const [diffData, setDiffData] = useState<{ name: string; value: number }[]>([]);
  const [typeData, setTypeData] = useState<{ name: string; value: number }[]>([]);
  const [studentGrowth, setStudentGrowth] = useState<{ month: string; students: number }[]>([]);
  const [topChapters, setTopChapters] = useState<{ chapter: string; attempts: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const [questions, users] = await Promise.all([
        fetchAllPages<{ chapter: string; difficulty: string; type: string }>("/questions"),
        fetchAllPages<{ created_at: string; createdAt: string }>("/students"),
      ]);

      const chapterCounts: Record<string, number> = {};
      questions.forEach(q => {
        if (q.chapter) chapterCounts[q.chapter] = (chapterCounts[q.chapter] || 0) + 1;
      });
      setChapterData(
        Object.entries(chapterCounts)
          .map(([chapter, count]) => ({ chapter: chapter.slice(0, 20), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );

      const diffCounts: Record<string, number> = {};
      questions.forEach(q => {
        const d = q.difficulty || "unknown";
        diffCounts[d] = (diffCounts[d] || 0) + 1;
      });
      setDiffData(Object.entries(diffCounts).map(([name, value]) => ({ name, value })));

      const typeCounts: Record<string, number> = {};
      questions.forEach(q => {
        const t = q.type || "mcq";
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      const months: { month: string; students: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const count = users.filter(u => (u.created_at || u.createdAt || "").startsWith(monthStr)).length;
        months.push({ month: label, students: count });
      }
      setStudentGrowth(months);

      setTopChapters([]);
    } finally {
      setLoading(false);
    }
  }

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
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Insights and performance data</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Questions by Chapter</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chapterData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="chapter" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              <Bar dataKey="count" fill="#00FF9D" radius={[0, 4, 4, 0]} name="Questions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Student Growth (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={studentGrowth} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              <Line type="monotone" dataKey="students" stroke="#00FF9D" strokeWidth={2} dot={{ fill: "#00FF9D", r: 4 }} name="New Students" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Difficulty Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={diffData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {diffData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {diffData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white/60 text-xs capitalize flex-1">{d.name}</span>
                  <span className="text-white text-xs font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Question Type Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {typeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white/60 text-xs capitalize flex-1">{d.name}</span>
                  <span className="text-white text-xs font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Top Chapters by Quiz Attempts</h3>
        {topChapters.length === 0 ? (
          <p className="text-white/30 text-sm">No attempts data available yet.</p>
        ) : (
          <div className="space-y-3">
            {topChapters.map((c, i) => (
              <div key={c.chapter} className="flex items-center gap-4">
                <span className="text-white/30 text-xs w-4">{i + 1}</span>
                <span className="text-white/70 text-sm flex-1">{c.chapter}</span>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((c.attempts / (topChapters[0]?.attempts || 1)) * 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-white text-sm font-semibold w-10 text-right">{c.attempts}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
