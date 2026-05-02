import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Question } from "@/lib/types";
import { Flame, Clock, CheckCircle, XCircle, ArrowLeft, Trophy, Calendar, Zap, Share2 } from "lucide-react";
import { XPPopupManager } from "@/components/XPPopup";
import { LevelUpModal } from "@/components/LevelUpModal";
import { BadgeQueueManager } from "@/components/BadgeUnlockPopup";
import { useAuth } from "@/lib/auth";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

interface DailyData {
  date: string;
  questions: Question[];
  completed: boolean;
  userAttempt: { score: number; correct: number; wrong: number; answers: Record<string, string> } | null;
  streak: { current: number; best: number };
}

interface LeaderboardEntry {
  user_id: string;
  score: number;
  correct: number;
  user: { name: string; avatar?: string } | null;
}

type Screen = "lobby" | "test" | "result";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function DailyChallengePage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [screen, setScreen] = useState<Screen>("lobby");
  const [daily, setDaily] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; correct: number; wrong: number; skipped: number; questions: Question[] } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [streak, setStreak] = useState<{ current: number; best: number }>({ current: 0, best: 0 });
  const [xpEvents, setXpEvents] = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: string; emoji: string; xp: number; totalXP: number } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<Array<{ id: string; name: string; emoji: string; description: string }>>([]);

  useEffect(() => {
    api.get("/daily-challenge/today").then((d: unknown) => {
      const data = d as DailyData;
      setDaily(data);
      setStreak(data.streak || { current: 0, best: 0 });
      if (data.completed && data.userAttempt) {
        setResult({ score: data.userAttempt.score, correct: data.userAttempt.correct, wrong: data.userAttempt.wrong, skipped: 10 - data.userAttempt.correct - data.userAttempt.wrong, questions: data.questions });
        setScreen("result");
      }
    }).catch(() => {}).finally(() => setLoading(false));
    api.get("/daily-challenge/leaderboard").then((r: unknown) => {
      setLeaderboard(((r as { data: LeaderboardEntry[] }).data) || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (screen !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); submitAnswers(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const submitAnswers = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const r = await api.post("/daily-challenge/attempt", { answers }) as { score: number; correct: number; wrong: number; skipped: number; questions: Question[]; xpResult?: { xpAwarded: number; leveledUp: boolean; newLevel: string }; newBadges?: Array<{ id: string; name: string; emoji: string; description: string }> };
      setResult(r);
      setScreen("result");
      api.get("/daily-challenge/streak").then((s: unknown) => setStreak(s as { current: number; best: number })).catch(() => {});
      if (r.xpResult && r.xpResult.xpAwarded > 0) {
        setXpEvents((prev) => [...prev, { id: Date.now().toString(), amount: r.xpResult!.xpAwarded }]);
        if (r.xpResult.leveledUp) {
          const lvl = r.xpResult.newLevel;
          setLevelUpInfo({ level: lvl, emoji: LEVEL_EMOJIS[lvl] || "🌱", xp: r.xpResult.xpAwarded, totalXP: (r.xpResult as unknown as { totalXP: number }).totalXP || r.xpResult.xpAwarded });
        }
        refreshProfile().catch(() => {});
      }
      if (r.newBadges && r.newBadges.length > 0) {
        setBadgeQueue((prev) => [...prev, ...r.newBadges!]);
      }
    } catch (e: unknown) {
      const msg = (e as Error).message || "";
      if (msg.includes("Already attempted")) {
        setScreen("result");
      }
    } finally {
      setSubmitting(false);
    }
  }, [answers, submitting]);

  const selectAnswer = (qid: string, opt: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center font-['Space_Grotesk']">
        <div className="w-10 h-10 border-2 border-t-transparent animate-spin" style={{ borderColor: "#00FF9D transparent transparent transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  const XPOverlays = () => (
    <>
      <XPPopupManager events={xpEvents} onRemove={(id) => setXpEvents((prev) => prev.filter((e) => e.id !== id))} />
      {levelUpInfo && <LevelUpModal level={levelUpInfo.level} emoji={levelUpInfo.emoji} xp={levelUpInfo.xp} totalXP={levelUpInfo.totalXP} onClose={() => setLevelUpInfo(null)} />}
      <BadgeQueueManager badges={badgeQueue} onRemove={(id) => setBadgeQueue((prev) => prev.filter((b) => b.id !== id))} />
    </>
  );

  // Lobby
  if (screen === "lobby") {
    const today = daily?.date || new Date().toISOString().split("T")[0];
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <XPOverlays />
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>

          <div className="border p-8 mb-6 relative overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #00FF9D, transparent)" }} />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
                <Flame className="w-8 h-8 text-black transform skew-x-12" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Daily Challenge</h1>
                <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>{today} · 10 Questions · 10 Minutes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border p-4 text-center" style={{ background: "rgba(0,255,157,0.06)", borderColor: "rgba(0,255,157,0.3)" }}>
                <div className="text-3xl font-black" style={{ color: "#00FF9D" }}>{streak.current}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Current Streak 🔥</div>
              </div>
              <div className="border p-4 text-center" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="text-3xl font-black">{streak.best}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Best Streak 🏆</div>
              </div>
            </div>

            <div className="border p-4 mb-6 space-y-2" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="font-black uppercase text-sm mb-3">Rules</div>
              {[
                ["10 Questions", "Mixed chapters, all difficulty levels"],
                ["+4 / -1 / 0", "Correct / Wrong / Skipped"],
                ["10 Minutes", "Auto-submits when timer hits 0"],
                ["Once Per Day", "You can only attempt once — make it count!"],
                ["Streak Bonus", "Complete every day to build your streak"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#00FF9D" }} />
                  <span><strong style={{ color: "var(--bs-text)" }}>{title}</strong> — <span style={{ color: "var(--bs-text-muted)" }}>{desc}</span></span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { if (!daily?.completed) { setTimeLeft(600); setScreen("test"); } }}
              disabled={daily?.completed}
              className="w-full py-4 font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#00FF9D", color: "black" }}
            >
              {daily?.completed ? "Already Attempted Today ✓" : "Start Challenge →"}
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{ color: "#facc15" }} /> Today's Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((e, i) => (
                  <div key={e.user_id} className="flex items-center gap-3 p-3 border" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                    <span className="w-6 font-black text-sm" style={{ color: i < 3 ? ["#facc15", "rgba(255,255,255,0.6)", "#cd7f32"][i] : "var(--bs-text-muted)" }}>#{i + 1}</span>
                    <span className="flex-1 font-mono text-sm truncate" style={{ color: "var(--bs-text)" }}>{e.user?.name || "Student"}</span>
                    <span className="font-black text-sm" style={{ color: "#00FF9D" }}>{e.score}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{e.correct}/10 ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Test
  if (screen === "test" && daily) {
    const q = daily.questions[current];
    const opts = [
      { key: "option1", label: "A", text: q.option1 },
      { key: "option2", label: "B", text: q.option2 },
      { key: "option3", label: "C", text: q.option3 },
      { key: "option4", label: "D", text: q.option4 },
    ].filter((o) => o.text);
    const answered = Object.keys(answers).length;
    const isUrgent = timeLeft <= 60;

    return (
      <div className="min-h-screen font-['Space_Grotesk']" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>
        <XPOverlays />
        <div className="sticky top-0 z-20 border-b px-4 py-3 flex items-center gap-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: "#00FF9D" }} />
            <span className="font-black uppercase text-sm">Daily Challenge</span>
          </div>
          <div className="flex items-center gap-1 border px-3 py-1 ml-auto" style={{ borderColor: isUrgent ? "#ff4444" : "var(--bs-border-subtle)", background: isUrgent ? "rgba(255,68,68,0.1)" : "transparent" }}>
            <Clock className="w-4 h-4" style={{ color: isUrgent ? "#ff4444" : "var(--bs-text-muted)" }} />
            <span className="font-black text-sm tabular-nums" style={{ color: isUrgent ? "#ff4444" : "var(--bs-text)" }}>{formatTime(timeLeft)}</span>
          </div>
          <span className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>{answered}/10 answered</span>
          <button onClick={submitAnswers} disabled={submitting} className="px-4 py-2 font-black uppercase text-xs" style={{ background: "#00FF9D", color: "black" }}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex gap-1.5 mb-8">
            {daily.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i === current ? "#00FF9D" : answers[daily.questions[i].id] ? "rgba(0,255,157,0.4)" : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Q{current + 1} of {daily.questions.length}</span>
            <span className="text-xs border px-2 py-0.5 font-black uppercase" style={{ borderColor: "rgba(0,255,157,0.3)", color: "#00FF9D" }}>{q.type}</span>
          </div>

          <div className="border p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <p className="text-lg font-bold leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-3 mb-8">
            {opts.map((o) => {
              const selected = answers[q.id] === o.key;
              return (
                <button key={o.key} onClick={() => selectAnswer(q.id, o.key)} className="w-full text-left border p-4 flex items-start gap-4 transition-all min-h-[52px]"
                  style={{ background: selected ? "rgba(0,255,157,0.1)" : "var(--bs-surface)", borderColor: selected ? "#00FF9D" : "var(--bs-border-subtle)" }}>
                  <span className="w-7 h-7 border flex items-center justify-center shrink-0 font-black text-sm" style={{ borderColor: selected ? "#00FF9D" : "var(--bs-border-subtle)", background: selected ? "#00FF9D" : "transparent", color: selected ? "black" : "var(--bs-text-muted)" }}>{o.label}</span>
                  <span className="flex-1 text-sm font-mono leading-relaxed" style={{ color: "var(--bs-text)" }}>{o.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="flex-1 py-3 border font-black uppercase text-sm disabled:opacity-30" style={{ borderColor: "var(--bs-border-subtle)" }}>← Prev</button>
            {current < daily.questions.length - 1
              ? <button onClick={() => setCurrent((c) => c + 1)} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Next →</button>
              : <button onClick={submitAnswers} disabled={submitting} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Submit</button>}
          </div>
        </div>
      </div>
    );
  }

  // Result
  if (screen === "result" && (result || daily?.userAttempt)) {
    const r = result || { score: daily!.userAttempt!.score, correct: daily!.userAttempt!.correct, wrong: daily!.userAttempt!.wrong, skipped: 0, questions: daily!.questions };
    const total = r.questions.length;
    const accuracy = total > 0 ? Math.round((r.correct / total) * 100) : 0;

    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <XPOverlays />
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="border p-8 mb-6 relative overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #00FF9D, transparent)" }} />
            <div className="text-center mb-6">
              <div className="text-6xl font-black mb-2" style={{ color: r.score > 0 ? "#00FF9D" : "#ff4444" }}>{r.score > 0 ? "+" : ""}{r.score}</div>
              <div className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>NEET Score · {accuracy}% accuracy</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center border p-3" style={{ background: "rgba(0,255,157,0.06)", borderColor: "rgba(0,255,157,0.2)" }}>
                <div className="text-2xl font-black" style={{ color: "#00FF9D" }}>{r.correct}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Correct</div>
              </div>
              <div className="text-center border p-3" style={{ background: "rgba(255,68,68,0.06)", borderColor: "rgba(255,68,68,0.2)" }}>
                <div className="text-2xl font-black" style={{ color: "#ff4444" }}>{r.wrong}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Wrong</div>
              </div>
              <div className="text-center border p-3" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="text-2xl font-black">{r.skipped || total - r.correct - r.wrong}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Skipped</div>
              </div>
            </div>
            <div className="border p-4 mb-4 flex items-center justify-between" style={{ background: "rgba(0,255,157,0.06)", borderColor: "rgba(0,255,157,0.3)" }}>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: "#00FF9D" }} />
                <span className="font-black uppercase">Streak: {streak.current} days 🔥</span>
              </div>
              <span className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>Best: {streak.best}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/dashboard")} className="flex-1 py-3 border font-black uppercase text-sm" style={{ borderColor: "var(--bs-border-subtle)" }}>Dashboard</button>
              <button onClick={() => navigate("/performance")} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>View Stats</button>
            </div>
          </div>

          <div className="border p-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <h3 className="font-black uppercase text-sm mb-4">Review Answers</h3>
            <div className="space-y-3">
              {r.questions.map((q, i) => {
                const userAns = (result ? answers : daily?.userAttempt?.answers || {})[q.id];
                const isCorrect = userAns === q.correct;
                return (
                  <div key={q.id} className="border p-3" style={{ background: isCorrect ? "rgba(0,255,157,0.05)" : userAns ? "rgba(255,68,68,0.05)" : "var(--bs-surface-2)", borderColor: isCorrect ? "rgba(0,255,157,0.2)" : userAns ? "rgba(255,68,68,0.2)" : "var(--bs-border-subtle)" }}>
                    <div className="flex items-start gap-2 mb-1">
                      {isCorrect ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#00FF9D" }} /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: userAns ? "#ff4444" : "var(--bs-text-muted)" }} />}
                      <p className="text-sm font-mono leading-relaxed" style={{ color: "var(--bs-text)" }}>Q{i + 1}. {q.question}</p>
                    </div>
                    {!isCorrect && q.explanation && <p className="text-xs font-mono pl-6 mt-1" style={{ color: "var(--bs-text-muted)" }}>💡 {q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
