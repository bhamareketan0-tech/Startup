import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function AdminRazorpay() {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"unknown" | "connected" | "error">("unknown");

  useEffect(() => {
    api.get("/app-settings").then((s: any) => {
      if (s?.razorpayKeyId) { setKeyId(s.razorpayKeyId); setStatus("connected"); }
      if (s?.razorpayTestMode !== undefined) setTestMode(s.razorpayTestMode);
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api.put("/app-settings", { razorpayKeyId: keyId, razorpayKeySecret: keySecret, razorpayTestMode: testMode });
      setSaved(true); setStatus(keyId ? "connected" : "unknown");
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Razorpay Settings</h2>
        <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>Paste your credentials to activate payments — no coding needed</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: status === "connected" ? "#00FF9D08" : "#ff444408", border: `1px solid ${status === "connected" ? "#00FF9D33" : "#ff444433"}`, borderRadius: 10, padding: "14px 20px", marginBottom: 24 }}>
        {status === "connected" ? <CheckCircle size={18} color="#00FF9D" /> : status === "error" ? <XCircle size={18} color="#ff6b6b" /> : <AlertCircle size={18} color="#F59E0B" />}
        <div>
          <p style={{ color: status === "connected" ? "#00FF9D" : status === "error" ? "#ff6b6b" : "#F59E0B", fontWeight: 600, fontSize: 14 }}>
            {status === "connected" ? "Razorpay Connected ✓" : status === "error" ? "Connection Error" : "Not Connected"}
          </p>
          <p style={{ color: "#ffffff50", fontSize: 12, marginTop: 1 }}>
            {status === "connected" ? "Payments are active and working" : "Enter your credentials below to activate"}
          </p>
        </div>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, display: "flex", gap: 4, background: "#ffffff08", borderRadius: 8, padding: 3 }}>
            {["Test Mode", "Live Mode"].map((mode, i) => (
              <button key={mode} onClick={() => setTestMode(i === 0)}
                style={{ flex: 1, padding: "7px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: testMode === (i === 0) ? (i === 0 ? "#F59E0B" : "#00FF9D") : "transparent", color: testMode === (i === 0) ? "#000" : "#ffffff60", transition: "all 0.15s" }}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {testMode && (
          <div style={{ background: "#F59E0B10", border: "1px solid #F59E0B33", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ color: "#F59E0B", fontSize: 12 }}>⚠ Test mode — use Razorpay test keys. Payments won't be real.</p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>
            Razorpay Key ID <span style={{ color: "#F59E0B" }}>({testMode ? "test_" : "live_"} key)</span>
          </label>
          <input value={keyId} onChange={e => setKeyId(e.target.value)} placeholder={testMode ? "rzp_test_xxxxxxxxxx" : "rzp_live_xxxxxxxxxx"}
            style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 4 }}>
            Razorpay Key Secret <span style={{ color: "#ffffff40" }}>(stored securely)</span>
          </label>
          <input type="password" value={keySecret} onChange={e => setKeySecret(e.target.value)} placeholder="Key secret"
            style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
        </div>

        <button onClick={save} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <CreditCard size={16} /> {saving ? "Saving…" : saved ? "Saved ✓" : "Save Credentials"}
        </button>
      </div>

      <div style={{ background: "#6366F108", border: "1px solid #6366F133", borderRadius: 10, padding: 20 }}>
        <h4 style={{ color: "#818CF8", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>How to get your keys</h4>
        <ol style={{ color: "#ffffff60", fontSize: 13, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          <li>Login to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener" style={{ color: "#818CF8" }}>dashboard.razorpay.com</a></li>
          <li>Go to Settings → API Keys</li>
          <li>Generate or copy your Key ID and Key Secret</li>
          <li>Paste both here and click Save</li>
        </ol>
      </div>
    </div>
  );
}
