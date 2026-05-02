import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Wind, Brain, Moon, ArrowLeft, Play, RotateCcw, ChevronRight, Sparkles } from "lucide-react";

type Tab = "breathe" | "memory" | "sleep";
type ExerciseKey = "box" | "478" | "energize" | "equal";

interface Exercise {
  key: ExerciseKey;
  name: string;
  desc: string;
  use: string;
  phases: { label: string; duration: number }[];
  rounds: number;
  color: string;
}

const EXERCISES: Exercise[] = [
  {
    key: "box",
    name: "Box Breathing",
    desc: "4-4-4-4 pattern",
    use: "Calming anxiety before exam",
    color: "#00D97E",
    phases: [
      { label: "Breathe In", duration: 4 },
      { label: "Hold", duration: 4 },
      { label: "Breathe Out", duration: 4 },
      { label: "Hold", duration: 4 },
    ],
    rounds: 4,
  },
  {
    key: "478",
    name: "4-7-8 Breathing",
    desc: "4-7-8 pattern",
    use: "Deep relaxation, sleep",
    color: "#6366F1",
    phases: [
      { label: "Breathe In", duration: 4 },
      { label: "Hold", duration: 7 },
      { label: "Breathe Out", duration: 8 },
    ],
    rounds: 4,
  },
  {
    key: "energize",
    name: "Energizing Breath",
    desc: "2-1-4 pattern",
    use: "Increasing focus before studying",
    color: "#F59E0B",
    phases: [
      { label: "Breathe In", duration: 2 },
      { label: "Hold", duration: 1 },
      { label: "Breathe Out", duration: 4 },
    ],
    rounds: 6,
  },
  {
    key: "equal",
    name: "Equal Breathing",
    desc: "5-5 pattern",
    use: "General calm",
    color: "#EC4899",
    phases: [
      { label: "Breathe In", duration: 5 },
      { label: "Breathe Out", duration: 5 },
    ],
    rounds: 5,
  },
];

const NEET_QUOTES = [
  { text: "Every expert was once a beginner. Keep going.", author: "NEET Wisdom" },
  { text: "Your hard work today is your rank tomorrow.", author: "BioSpark" },
  { text: "Consistency beats intensity every time.", author: "Study Science" },
  { text: "One more question, one step closer to MBBS.", author: "BioSpark" },
  { text: "Breathe. You've got this. The exam rewards the prepared.", author: "NEET Mentor" },
];

function BreathingCircle({ ex, onDone }: { ex: Exercise; onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(ex.phases[0].duration);
  const [scale, setScale] = useState(1);
  const [done, setDone] = useState(false);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const phase = ex.phases[phaseIdx];
    const isExpand = phase.label === "Breathe In";
    const isHold = phase.label === "Hold";
    if (isExpand) setScale(1.5);
    else if (isHold) { /* keep */ }
    else setScale(1);

    setCountdown(phase.duration);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed++;
      setCountdown(phase.duration - elapsed);
      if (elapsed >= phase.duration) {
        clearInterval(interval);
        const nextPhase = (phaseIdx + 1) % ex.phases.length;
        const nextRound = nextPhase === 0 ? round + 1 : round;
        if (nextRound >= ex.rounds) {
          setDone(true);
          onDone();
        } else {
          setRound(nextRound);
          setPhaseIdx(nextPhase);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIdx, round, done]);

  const phase = ex.phases[phaseIdx];
  const progress = ((phaseIdx * 1 + (phase.duration - countdown) / phase.duration) / ex.phases.length) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 200 * scale,
          height: 200 * scale,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ex.color}22, ${ex.color}08)`,
          border: `2px solid ${ex.color}55`,
          transition: `width ${phase.duration * 0.8}s ease-in-out, height ${phase.duration * 0.8}s ease-in-out`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column" as const,
          position: "absolute",
        }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: ex.color }}>{countdown}</span>
          <span style={{ fontSize: 13, color: "#fff8", marginTop: 4 }}>{phase.label}</span>
        </div>
        <div style={{
          position: "absolute",
          width: 220, height: 220, borderRadius: "50%",
          border: `3px solid ${ex.color}33`,
          boxShadow: `0 0 40px ${ex.color}22`,
        }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#fff6", fontSize: 14 }}>Round {round + 1} of {ex.rounds}</p>
        <div style={{ width: 200, height: 4, background: "#ffffff15", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((round / ex.rounds) * 100).toFixed(1)}%`, background: ex.color, borderRadius: 4, transition: "width 1s linear" }} />
        </div>
      </div>
    </div>
  );
}

function SessionComplete({ ex, onRestart, onStudy }: { ex: Exercise; onRestart: () => void; onStudy: () => void }) {
  const quote = NEET_QUOTES[Math.floor(Math.random() * NEET_QUOTES.length)];
  return (
    <div style={{ textAlign: "center", maxWidth: 400, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
      <h2 style={{ color: "#00FF9D", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>You are ready to study</h2>
      <p style={{ color: "#fff6", fontSize: 14, marginBottom: 32 }}>+10 XP earned for completing your session</p>
      <div style={{ background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
        <p style={{ color: "#ffffffcc", fontSize: 16, fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>"{quote.text}"</p>
        <p style={{ color: "#00FF9D", fontSize: 12 }}>— {quote.author}</p>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onRestart} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff", fontSize: 14, cursor: "pointer" }}>
          <RotateCcw size={16} /> Again
        </button>
        <button onClick={onStudy} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Start Studying <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function BreathePage() {
  const [selected, setSelected] = useState<Exercise>(EXERCISES[0]);
  const [running, setRunning] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  function start(ex: Exercise) {
    setSelected(ex);
    setRunning(true);
    setSessionDone(false);
  }

  function handleDone() {
    setRunning(false);
    setSessionDone(true);
    if (user) {
      api.post("/users/xp", { userId: user.id, xp: 10, reason: "maa_session" }).catch(() => {});
    }
  }

  if (sessionDone) {
    return <SessionComplete ex={selected} onRestart={() => start(selected)} onStudy={() => navigate("/dashboard")} />;
  }

  if (running) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 40 }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{selected.name}</h2>
          <p style={{ color: "#fff6", fontSize: 13, marginTop: 4 }}>{selected.desc}</p>
        </div>
        <BreathingCircle ex={selected} onDone={handleDone} />
        <button onClick={() => setRunning(false)} style={{ color: "#ffffff50", background: "none", border: "none", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
          Stop session
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ color: "#fff8", fontSize: 15 }}>Take a moment before you study</p>
        <p style={{ color: "#fff4", fontSize: 13, marginTop: 4 }}>Choose a breathing technique</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {EXERCISES.map((ex) => (
          <button key={ex.key} onClick={() => start(ex)} style={{ background: "#ffffff08", border: `1px solid ${ex.color}33`, borderRadius: 12, padding: "20px 24px", textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ffffff12")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ffffff08")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${ex.color}22`, border: `1.5px solid ${ex.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wind size={18} color={ex.color} />
              </div>
              <span style={{ background: `${ex.color}18`, color: ex.color, fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{ex.rounds} rounds</span>
            </div>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{ex.name}</p>
            <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 8 }}>{ex.desc}</p>
            <p style={{ color: "#ffffff40", fontSize: 12 }}>Best for: {ex.use}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function MemoryPage() {
  const [memPalaces, setMemPalaces] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get("/memory-palace").then((d: any) => setMemPalaces(d || [])).catch(() => {});
  }, []);

  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setRevealed(new Set()); }} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff60", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selected.title}</h2>
        <p style={{ color: "#ffffff50", fontSize: 13, marginBottom: 24 }}>Click the dots to reveal labels</p>
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
          <img src={selected.imageUrl} alt={selected.title} style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #ffffff15" }} />
          {(selected.labels || []).map((label: any) => (
            <button key={label.id} onClick={() => setRevealed(r => { const s = new Set(r); s.has(label.id) ? s.delete(label.id) : s.add(label.id); return s; })}
              style={{ position: "absolute", left: `${label.x}%`, top: `${label.y}%`, transform: "translate(-50%,-50%)", width: 24, height: 24, borderRadius: "50%", background: revealed.has(label.id) ? "#00FF9D" : "#00FF9D44", border: "2px solid #00FF9D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              {revealed.has(label.id) && (
                <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "#0a0a0a", border: "1px solid #00FF9D44", borderRadius: 6, padding: "6px 10px", whiteSpace: "nowrap", fontSize: 12, color: "#fff", marginBottom: 6, zIndex: 10 }}>
                  <p style={{ fontWeight: 600, color: "#00FF9D" }}>{label.text}</p>
                  {label.revealText && <p style={{ color: "#ffffff80", marginTop: 2 }}>{label.revealText}</p>}
                </div>
              )}
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF9D" }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Memory Palace</h3>
        <p style={{ color: "#ffffff50", fontSize: 13, marginTop: 4 }}>Click on diagrams to explore and recall labels</p>
      </div>
      {memPalaces.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#ffffff30" }}>
          <Brain size={48} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Diagrams coming soon</p>
          <p style={{ fontSize: 13 }}>Admin is adding interactive diagrams for Heart, Cell, Neuron and more</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {memPalaces.map((mp) => (
            <button key={mp.id} onClick={() => setSelected(mp)} style={{ background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 12, overflow: "hidden", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.border = "1px solid #00FF9D44")}
              onMouseLeave={e => (e.currentTarget.style.border = "1px solid #ffffff15")}>
              <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#ffffff05" }}>
                <img src={mp.imageUrl} alt={mp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              </div>
              <div style={{ padding: "12px 16px" }}>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{mp.title}</p>
                <p style={{ color: "#ffffff50", fontSize: 12, marginTop: 4 }}>{mp.chapter} • {mp.labels?.length || 0} labels</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SleepPage() {
  const [bedtime, setBedtime] = useState("22:00");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [status, setStatus] = useState("");

  async function enableNotifications() {
    if (!("Notification" in window)) { setStatus("Browser notifications not supported"); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotifEnabled(true);
      setStatus("Notifications enabled! You'll get a reminder 10 min before bedtime.");
      localStorage.setItem("bs-bedtime", bedtime);
    } else {
      setStatus("Permission denied. Enable notifications in browser settings.");
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Sleep Revision Reminder</h3>
      <p style={{ color: "#ffffff50", fontSize: 13, marginBottom: 32 }}>Get a gentle reminder to review 5 questions before sleep</p>
      <div style={{ background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <label style={{ color: "#ffffff80", fontSize: 13, display: "block", marginBottom: 8 }}>Your bedtime</label>
        <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
          style={{ background: "#ffffff10", border: "1px solid #ffffff20", borderRadius: 8, color: "#fff", fontSize: 16, padding: "10px 16px", width: "100%", outline: "none" }} />
      </div>
      <div style={{ background: "#6366F108", border: "1px solid #6366F133", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ color: "#ffffffcc", fontSize: 14, lineHeight: 1.6 }}>
          10 minutes before <strong style={{ color: "#00FF9D" }}>{bedtime}</strong>, you'll get a notification with 5 questions from your recent wrong answers. No timer, no pressure — just calm review.
        </p>
      </div>
      <button onClick={enableNotifications} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
        <Moon size={16} /> Enable Sleep Reminder
      </button>
      {status && <p style={{ color: notifEnabled ? "#00FF9D" : "#ff6b6b", fontSize: 13, marginTop: 8 }}>{status}</p>}
    </div>
  );
}

export function MaaPage() {
  const [tab, setTab] = useState<Tab>("breathe");
  const navigate = useNavigate();

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "breathe", icon: <Wind size={16} />, label: "Breathe" },
    { key: "memory", icon: <Brain size={16} />, label: "Memory Boost" },
    { key: "sleep", icon: <Moon size={16} />, label: "Sleep Reminder" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 30% 20%, #00FF9D08 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #6366F108 0%, transparent 60%), #0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#00FF9D15", border: "1.5px solid #00FF9D44", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sparkles size={28} color="#00FF9D" />
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>MAA</h1>
          <p style={{ color: "#ffffff60", fontSize: 15 }}>Mind. Awareness. Action.</p>
        </div>

        <div style={{ display: "flex", gap: 4, background: "#ffffff08", borderRadius: 10, padding: 4, marginBottom: 40, width: "fit-content", margin: "0 auto 40px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 7, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: tab === t.key ? "#00FF9D" : "transparent", color: tab === t.key ? "#000" : "#ffffff60" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "breathe" && <BreathePage />}
        {tab === "memory" && <MemoryPage />}
        {tab === "sleep" && <SleepPage />}
      </div>
    </div>
  );
}
