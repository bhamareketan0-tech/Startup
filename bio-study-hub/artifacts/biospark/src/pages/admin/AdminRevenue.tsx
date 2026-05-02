import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { TrendingUp, Users, CreditCard, DollarSign, Download } from "lucide-react";

export function AdminRevenue() {
  const [stats, setStats] = useState({ totalRevenue: 0, monthRevenue: 0, weekRevenue: 0, activeSubs: 0, free: 0, pro: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/stats/admin").catch(() => ({})),
      api.get("/users", { limit: "100" }).catch(() => []),
    ]).then(([s, users]: any) => {
      const arr = Array.isArray(users) ? users : [];
      const pro = arr.filter((u: any) => u.plan === "pro").length;
      setStats({ totalRevenue: 0, monthRevenue: 0, weekRevenue: 0, activeSubs: pro, free: arr.length - pro, pro });
    }).finally(() => setLoading(false));
  }, []);

  function exportCSV() {
    const rows = [["Name", "Plan", "Amount", "Date", "Status"]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
  }

  const cards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "#00FF9D", note: "All time" },
    { label: "This Month", value: `₹${stats.monthRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "#6366F1", note: "Current month" },
    { label: "Active Subscriptions", value: stats.activeSubs, icon: CreditCard, color: "#F59E0B", note: "Pro plan users" },
    { label: "Total Students", value: stats.free + stats.pro, icon: Users, color: "#EC4899", note: `${stats.pro} pro · ${stats.free} free` },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Revenue Dashboard</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>Financial overview and subscription metrics</p>
        </div>
        <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#ffffff10", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, cursor: "pointer" }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: "#0a0a0a", border: `1px solid ${card.color}22`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <p style={{ color: "#ffffff50", fontSize: 12, marginBottom: 4 }}>{card.label}</p>
              <p style={{ color: card.color, fontSize: 26, fontWeight: 800 }}>{card.value}</p>
              <p style={{ color: "#ffffff30", fontSize: 11, marginTop: 4 }}>{card.note}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Plan Distribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ label: "Free", value: stats.free, color: "#ffffff40" }, { label: "Pro", value: stats.pro, color: "#00FF9D" }].map(p => {
              const total = stats.free + stats.pro || 1;
              const pct = Math.round((p.value / total) * 100);
              return (
                <div key={p.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#ffffff80", fontSize: 13 }}>{p.label}</span>
                    <span style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>{p.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "#ffffff10", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 10, padding: 20 }}>
          <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Quick Stats</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Conversion Rate", value: `${stats.free + stats.pro > 0 ? Math.round((stats.pro / (stats.free + stats.pro)) * 100) : 0}%` },
              { label: "Avg Revenue/User", value: stats.pro > 0 ? `₹${Math.round(stats.totalRevenue / stats.pro)}` : "₹0" },
              { label: "Monthly Target", value: "Set in Settings" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ffffff08" }}>
                <span style={{ color: "#ffffff60", fontSize: 13 }}>{s.label}</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: 10, padding: 20 }}>
        <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p style={{ color: "#ffffff30", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
            Connect Razorpay to see transaction history. Go to <strong>Razorpay Settings</strong> to configure.
          </p>
        ) : null}
      </div>
    </div>
  );
}
