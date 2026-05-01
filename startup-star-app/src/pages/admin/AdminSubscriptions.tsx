import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Crown, TrendingUp, Users, DollarSign } from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  start_date: string;
  end_date: string;
  status: string;
  amount: number;
  user_name?: string;
  user_email?: string;
}

const PLAN_STYLES: Record<string, string> = {
  elite: "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20",
  pro: "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20",
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-[#00ffb3] bg-[#00ffb3]/10 border-[#00ffb3]/20",
  expired: "text-white/40 bg-white/5 border-white/10",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, active: 0, revenue: 0 });

  useEffect(() => { fetchSubscriptions(); }, []);

  async function fetchSubscriptions() {
    setLoading(true);
    try {
      const res = await api.get("/users", { limit: 200 });
      const allUsers: { id: string; name: string; email: string; plan: string; created_at: string }[] = res.data || [];
      const premiumUsers = allUsers.filter((u) => u.plan && u.plan !== "free");
      const subs: Subscription[] = premiumUsers.map((u) => ({
        id: u.id,
        user_id: u.id,
        plan: u.plan,
        start_date: u.created_at,
        end_date: "",
        status: "active",
        amount: u.plan === "elite" ? 2999 : 999,
        user_name: u.name || "—",
        user_email: u.email,
      }));
      setSubscriptions(subs);
      const revenue = subs.reduce((sum, s) => sum + s.amount, 0);
      setSummary({ total: subs.length, active: subs.length, revenue });
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-white/40 text-sm mt-1">All subscription records (display-only)</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <Crown className="w-5 h-5 text-[#a855f7] mb-2" />
          <div className="text-2xl font-bold text-white">{summary.total}</div>
          <div className="text-xs text-white/40">Total Subscriptions</div>
        </div>
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <Users className="w-5 h-5 text-[#00ffb3] mb-2" />
          <div className="text-2xl font-bold text-white">{summary.active}</div>
          <div className="text-xs text-white/40">Active Now</div>
        </div>
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-5">
          <TrendingUp className="w-5 h-5 text-[#00d4ff] mb-2" />
          <div className="text-2xl font-bold text-white">₹{summary.revenue.toLocaleString("en-IN")}</div>
          <div className="text-xs text-white/40">Total Revenue</div>
        </div>
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
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs">Student</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Plan</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Start Date</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">End Date</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Status</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <div className="text-white text-sm">{s.user_name}</div>
                      <div className="text-white/30 text-xs">{s.user_email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${PLAN_STYLES[s.plan] || "text-white/40 bg-white/5 border-white/10"}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {s.start_date ? new Date(s.start_date).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {s.end_date ? new Date(s.end_date).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${STATUS_STYLES[s.status] || STATUS_STYLES.expired}`}>
                      {s.status || "active"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-white font-semibold text-sm">
                    ₹{(s.amount || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-white/30">No subscription records</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
