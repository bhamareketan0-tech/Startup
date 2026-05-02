import { useState } from "react";
import { api } from "@/lib/api";
import { Mail, MessageSquare, Smartphone, Bell, Send, Clock } from "lucide-react";

type Channel = "email" | "whatsapp" | "sms" | "push";

const CHANNEL_INFO = {
  email: { label: "Email", icon: Mail, color: "#6366F1", note: "Uses your SMTP settings from Credentials" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "#25D366", note: "Requires WhatsApp Business API key" },
  sms: { label: "SMS", icon: Smartphone, color: "#F59E0B", note: "Requires Twilio or MSG91 API key" },
  push: { label: "Push Notification", icon: Bell, color: "#00FF9D", note: "Browser push notifications (no API key needed)" },
};

const TARGETS = ["All Students", "Pro Students", "Free Students", "Class 11", "Class 12"];

export function AdminCommunication() {
  const [channel, setChannel] = useState<Channel>("push");
  const [target, setTarget] = useState("All Students");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const info = CHANNEL_INFO[channel];
  const isPush = channel === "push";
  const isSMS = channel === "sms";
  const maxChars = isSMS ? 160 : channel === "whatsapp" ? 1000 : Infinity;

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    try {
      await api.post("/communications/send", { channel, target, subject, body }).catch(() => {});
      setSent(true);
      setTimeout(() => { setSent(false); setBody(""); setSubject(""); }, 3000);
    } finally { setSending(false); }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Communication</h2>
        <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 2 }}>Send messages to students via multiple channels</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {(Object.entries(CHANNEL_INFO) as [Channel, typeof CHANNEL_INFO.email][]).map(([key, val]) => {
          const Icon = val.icon;
          return (
            <button key={key} onClick={() => setChannel(key)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: `1px solid ${channel === key ? val.color : "#ffffff15"}`, background: channel === key ? `${val.color}15` : "transparent", color: channel === key ? val.color : "#ffffff50", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              <Icon size={15} /> {val.label}
            </button>
          );
        })}
      </div>

      <div style={{ background: `${info.color}08`, border: `1px solid ${info.color}22`, borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
        <p style={{ color: info.color, fontSize: 12 }}>{info.note}</p>
      </div>

      <div style={{ background: "#0a0a0a", border: "1px solid #ffffff15", borderRadius: 10, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 6 }}>Send To</label>
          <select value={target} onChange={e => setTarget(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }}>
            {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {(channel === "email" || isPush) && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#ffffff60", fontSize: 12, display: "block", marginBottom: 6 }}>
              {isPush ? "Notification Title" : "Subject"}
            </label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder={isPush ? "e.g. New mock test available!" : "Email subject"}
              style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 7, color: "#fff", fontSize: 13, outline: "none" }} />
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ color: "#ffffff60", fontSize: 12 }}>Message</label>
            {maxChars < Infinity && <span style={{ color: body.length > maxChars ? "#ff6b6b" : "#ffffff40", fontSize: 12 }}>{body.length}/{maxChars}</span>}
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={channel === "email" ? 8 : 4}
            placeholder={channel === "email" ? "Write your email content here…" : `Write your ${info.label.toLowerCase()} message…`}
            style={{ width: "100%", padding: "10px 12px", background: "#ffffff08", border: `1px solid ${body.length > maxChars ? "#ff444455" : "#ffffff15"}`, borderRadius: 7, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6 }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSend} disabled={sending || !body.trim()}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: sent ? "#00FF9D" : info.color, border: "none", borderRadius: 8, color: sent ? "#000" : "#fff", fontWeight: 700, fontSize: 14, cursor: sending ? "wait" : "pointer", opacity: !body.trim() ? 0.5 : 1 }}>
            <Send size={16} /> {sending ? "Sending…" : sent ? "Sent! ✓" : `Send ${info.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
