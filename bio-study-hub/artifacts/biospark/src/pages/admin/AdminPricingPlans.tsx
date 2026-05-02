import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Pencil, Check, Trash2 } from "lucide-react";

interface Plan { id: string; key: string; name: string; price: number; duration: string; active: boolean; features: string[]; limits: Record<string, number>; }

const DEFAULT_PLANS: Omit<Plan, "id">[] = [
  { key: "free", name: "Free", price: 0, duration: "forever", active: true, features: ["10 questions/day", "Basic analytics", "Daily challenge", "Community access"], limits: { questionsPerDay: 10 } },
  { key: "basic", name: "Basic", price: 399, duration: "monthly", active: true, features: ["100 questions/day", "Mock tests", "PYQ access", "Short notes", "Flashcards", "Basic analytics"], limits: { questionsPerDay: 100 } },
  { key: "pro", name: "Pro", price: 699, duration: "monthly", active: true, features: ["Unlimited questions", "All mock tests", "Sample paper generator", "MAA section", "Spaced repetition", "Advanced analytics", "Priority support"], limits: { questionsPerDay: -1 } },
];

export function AdminPricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/app-settings").then((s: any) => {
      if (s?.plans?.length) setPlans(s.plans);
      else setPlans(DEFAULT_PLANS.map((p, i) => ({ ...p, id: String(i) })));
    }).catch(() => setPlans(DEFAULT_PLANS.map((p, i) => ({ ...p, id: String(i) }))));
  }, []);

  async function save() {
    setSaving(true);
    try { await api.put("/app-settings", { plans }); } finally { setSaving(false); }
  }

  function updatePlan(idx: number, field: keyof Plan, value: any) {
    setPlans(ps => ps.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }

  function addFeature(idx: number) {
    setPlans(ps => ps.map((p, i) => i === idx ? { ...p, features: [...p.features, ""] } : p));
  }

  function updateFeature(planIdx: number, featIdx: number, val: string) {
    setPlans(ps => ps.map((p, i) => i === planIdx ? { ...p, features: p.features.map((f, j) => j === featIdx ? val : f) } : p));
  }

  function removeFeature(planIdx: number, featIdx: number) {
    setPlans(ps => ps.map((p, i) => i === planIdx ? { ...p, features: p.features.filter((_, j) => j !== featIdx) } : p));
  }

  const colors: Record<string, string> = { free: "#6366F1", basic: "#F59E0B", pro: "#00FF9D" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Pricing Plans</h2>
          <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>Edit plan features and pricing</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ padding: "10px 20px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save All Plans"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {plans.map((plan, idx) => {
          const color = colors[plan.key] || "#00FF9D";
          const editing = editIdx === idx;
          return (
            <div key={plan.id || idx} style={{ background: "#0a0a0a", border: `1px solid ${color}33`, borderRadius: 12, padding: 24, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  {editing ? (
                    <input value={plan.name} onChange={e => updatePlan(idx, "name", e.target.value)}
                      style={{ background: "transparent", border: "1px solid #ffffff30", borderRadius: 6, color, fontSize: 18, fontWeight: 800, outline: "none", padding: "2px 6px", width: 100 }} />
                  ) : (
                    <h3 style={{ color, fontSize: 18, fontWeight: 800, margin: 0 }}>{plan.name}</h3>
                  )}
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    <span style={{ background: `${color}15`, color, fontSize: 11, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>
                      {plan.price === 0 ? "Free" : `₹${plan.price}/${plan.duration === "monthly" ? "mo" : "yr"}`}
                    </span>
                    {!plan.active && <span style={{ background: "#ff444415", color: "#ff6b6b", fontSize: 11, padding: "2px 7px", borderRadius: 5 }}>Inactive</span>}
                  </div>
                </div>
                <button onClick={() => setEditIdx(editing ? null : idx)} style={{ background: "#ffffff10", border: "none", borderRadius: 6, padding: "6px 8px", color: "#ffffff60", cursor: "pointer" }}>
                  <Pencil size={13} />
                </button>
              </div>

              {editing && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ color: "#ffffff40", fontSize: 11, display: "block", marginBottom: 3 }}>Price (₹)</label>
                      <input type="number" value={plan.price} onChange={e => updatePlan(idx, "price", Number(e.target.value))}
                        style={{ width: "100%", padding: "7px 8px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 6, color: "#fff", fontSize: 12, outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ color: "#ffffff40", fontSize: 11, display: "block", marginBottom: 3 }}>Duration</label>
                      <select value={plan.duration} onChange={e => updatePlan(idx, "duration", e.target.value)}
                        style={{ width: "100%", padding: "7px 8px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 6, color: "#fff", fontSize: 12, outline: "none" }}>
                        <option value="forever">Forever</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#ffffff70", fontSize: 12, marginBottom: 8 }}>
                    <input type="checkbox" checked={plan.active} onChange={e => updatePlan(idx, "active", e.target.checked)} /> Plan Active
                  </label>
                </div>
              )}

              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: editing ? 8 : 0 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Check size={12} color={color} style={{ flexShrink: 0 }} />
                    {editing ? (
                      <div style={{ flex: 1, display: "flex", gap: 4 }}>
                        <input value={f} onChange={e => updateFeature(idx, fi, e.target.value)}
                          style={{ flex: 1, padding: "4px 6px", background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 5, color: "#fff", fontSize: 12, outline: "none" }} />
                        <button onClick={() => removeFeature(idx, fi)} style={{ background: "none", border: "none", color: "#ff6b6b50", cursor: "pointer", padding: "0 4px" }}>×</button>
                      </div>
                    ) : (
                      <span style={{ color: "#ffffffcc", fontSize: 13 }}>{f}</span>
                    )}
                  </li>
                ))}
              </ul>
              {editing && (
                <button onClick={() => addFeature(idx)} style={{ width: "100%", padding: "6px", background: "#ffffff08", border: "1px dashed #ffffff20", borderRadius: 6, color: "#ffffff50", fontSize: 12, cursor: "pointer", marginTop: 4 }}>
                  + Add Feature
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
