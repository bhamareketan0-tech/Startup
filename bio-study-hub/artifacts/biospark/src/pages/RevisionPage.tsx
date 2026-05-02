import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Question } from "@/lib/types";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Filter, BookOpen, Target, Trophy } from "lucide-react";
import { XPPopupManager } from "@/components/XPPopup";
import { LevelUpModal } from "@/components/LevelUpModal";
import { BadgeQueueManager } from "@/components/BadgeUnlockPopup";
import { useAuth } from "@/lib/auth";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

interface WrongAttempt {
  question_id: string;
  question_text: string;
  chapter: string;
  subunit: string;
  class: string;
  question_type: string;
  difficulty: string;
  consecutive_correct: number;
  mastered: boolean;
}

type Screen = "list" | "practice" | "done";

export function RevisionPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [wrong, setWrong] = useState<WrongAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChapter, setFilterChapter] = useState("all");
  const [screen, setScreen] = useState<Screen>("list");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [xpEvents, setXpEvents] = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: string; emoji: string; xp: number; totalXP: number } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<Array<{ id: string; name: string; emoji: string; description: string }>>([]);

  useEffect(() => {
    api.get("/question-attempts/wrong").then((r: unknown) => {
      setWrong(((r as { data: WrongAttempt[] }).data) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const chapters = [...new Set(wrong.map((w) => w.chapter).filter(Boolean))].sort();
  const filtered = wrong.filter((w) => filterChapter === "all" || w.chapter === filterChapter);

  const startRevision = async () => {
    setLoadingQ(true);
    const ids = filtered.map((w) => w.question_id);
    if (ids.length === 0) { setLoadingQ(false); return; }
    try {
      const r = await api.get("/questions", { ids: ids.join(","), limit: 50 }) as { questions?: Question[] };
      const qs = r.questions || [];
      const shuffled = [...qs].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrent(0);
      setSelected(null);
      setRevealed(false);
      setSessionResults({ correct: 0, total: 0 });
      setScreen("practice");
    } catch {
      // fallback: create minimal questions from wrong attempts
      const minimal: Question[] = filtered.map((w) => ({
        id: w.question_id,
        question: w.question_text || "Question text not available",
        option1: "", option2: "", option3: "", option4: "",
        correct: "option1", subject: "Biology",
        chapter: w.chapter, subunit: w.subunit, type: w.question_type,
        explanation: "", class: w.class, difficulty: w.difficulty,
        is_active: true, created_at: "",
      }));
      setQuestions(minimal.slice(0, 50));
      setCurrent(0);
      setSelected(null);
      setRevealed(false);
      setSessionResults({ correct: 0, total: 0 });
      setScreen("practice");
    } finally {
      setLoadingQ(false);
    }
  };

  const q = questions[current];

  const handleAnswer = async (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const isCorrect = opt === q.correct;
    setSessionResults((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    try {
      const res = await api.post("/question-attempts", {
        question_id: q.id,
        question_text: q.question,
        chapter: q.chapter,
        subunit: q.subunit,
        class: q.class,
        question_type: q.type,
        difficulty: q.difficulty,
        is_correct: isCorrect,
        user_answer: opt,
        correct_answer: q.correct,
      }) as { xpResult?: { xpAwarded: number; totalXP: number; leveledUp: boolean; newLevel: string }; newBadges?: Array<{ id: string; name: string; emoji: string; description: string }> };
      if (res.xpResult && res.xpResult.xpAwarded > 0) {
        setXpEvents((prev) => [...prev, { id: Date.now().toString(), amount: res.xpResult!.xpAwarded }]);
        if (res.xpResult.leveledUp) {
          const lvl = res.xpResult.newLevel;
          setLevelUpInfo({ level: lvl, emoji: LEVEL_EMOJIS[lvl] || "🌱", xp: res.xpResult.xpAwarded, totalXP: res.xpResult.totalXP });
        }
        refreshProfile().catch(() => {});
      }
      if (res.newBadges && res.newBadges.length > 0) {
        setBadgeQueue((prev) => [...prev, ...res.newBadges!]);
      }
    } catch {}
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setScreen("done");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const XPOverlays = () => (
    <>
      <XPPopupManager events={xpEvents} onRemove={(id) => setXpEvents((prev) => prev.filter((e) => e.id !== id))} />
      {levelUpInfo && <LevelUpModal level={levelUpInfo.level} emoji={levelUpInfo.emoji} xp={levelUpInfo.xp} totalXP={levelUpInfo.totalXP} onClose={() => setLevelUpInfo(null)} />}
      <BadgeQueueManager badges={badgeQueue} onRemove={(id) => setBadgeQueue((prev) => prev.filter((b) => b.id !== id))} />
    </>
  );

  if (screen === "list") {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <XPOverlays />
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#ff4444" }}>
              <RotateCcw className="w-6 h-6 text-white transform skew-x-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Revision Mode</h1>
              <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>Practice your wrong questions until mastered</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border p-4 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="text-2xl font-black" style={{ color: "#ff4444" }}>{wrong.length}</div>
              <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>To Revise</div>
            </div>
            <div className="border p-4 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="text-2xl font-black" style={{ color: "#facc15" }}>{filtered.length}</div>
              <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Filtered</div>
            </div>
            <div className="border p-4 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="text-2xl font-black" style={{ color: "#00FF9D" }}>0</div>
              <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Mastered</div>
            </div>
          </div>

          <div className="border p-4 mb-6 flex flex-col md:flex-row gap-3 items-start md:items-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Filter className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} />
            <select value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)} className="border px-3 py-2 text-xs font-mono uppercase outline-none bg-transparent flex-1" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", background: "var(--bs-surface-2)" }}>
              <option value="all">All Chapters ({wrong.length})</option>
              {chapters.map((c) => <option key={c} value={c}>{c} ({wrong.filter((w) => w.chapter === c).length})</option>)}
            </select>
            <button onClick={startRevision} disabled={filtered.length === 0 || loadingQ} className="px-6 py-2 font-black uppercase text-sm min-h-[44px] disabled:opacity-50" style={{ background: "#00FF9D", color: "black" }}>
              {loadingQ ? "Loading..." : `Start Revision (${filtered.length})`}
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse" style={{ background: "var(--bs-surface)" }} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="border p-16 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#00FF9D" }} />
              <p className="font-black uppercase text-lg mb-2">Nothing to revise!</p>
              <p className="font-mono text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>Keep practising — wrong questions will appear here automatically.</p>
              <button onClick={() => navigate("/class-select")} className="px-6 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Practice Now</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((w) => (
                <div key={w.question_id} className="border p-4 flex items-start gap-3" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ff4444" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono leading-relaxed line-clamp-2 mb-1" style={{ color: "var(--bs-text)" }}>{w.question_text || "Question text not available"}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs border px-2 py-0.5 font-black uppercase" style={{ borderColor: "rgba(0,255,157,0.3)", color: "#00FF9D" }}>{w.chapter}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{w.question_type}</span>
                      <span className="text-xs font-mono" style={{ color: w.consecutive_correct > 0 ? "#facc15" : "var(--bs-text-muted)" }}>
                        {w.consecutive_correct}/3 correct in a row
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "practice" && q) {
    const opts = [
      { key: "option1", label: "A", text: q.option1 },
      { key: "option2", label: "B", text: q.option2 },
      { key: "option3", label: "C", text: q.option3 },
      { key: "option4", label: "D", text: q.option4 },
    ].filter((o) => o.text);

    return (
      <div className="min-h-screen font-['Space_Grotesk']" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>
        <XPOverlays />
        <div className="sticky top-0 z-20 border-b px-4 py-3 flex items-center gap-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <RotateCcw className="w-5 h-5" style={{ color: "#ff4444" }} />
          <span className="font-black uppercase text-sm">Revision Mode</span>
          <span className="font-mono text-sm ml-auto" style={{ color: "var(--bs-text-muted)" }}>{current + 1} / {questions.length}</span>
          <span className="font-mono text-sm" style={{ color: "#00FF9D" }}>{sessionResults.correct} ✓</span>
          <button onClick={() => setScreen("list")} className="ml-2 text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Exit</button>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex gap-1.5 mb-6">
            {questions.map((_, i) => <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < current ? "#00FF9D" : i === current ? "#00FF9D66" : "rgba(255,255,255,0.1)" }} />)}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>{q.chapter}</span>
            <span className="text-xs border px-2 py-0.5 font-black uppercase" style={{ borderColor: "rgba(255,68,68,0.3)", color: "#ff4444" }}>Revision</span>
          </div>
          <div className="border p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <p className="text-lg font-bold leading-relaxed">{q.question}</p>
          </div>
          <div className="space-y-3 mb-6">
            {opts.map((o) => {
              const isSelected = selected === o.key;
              const isCorrect = o.key === q.correct;
              let bg = "var(--bs-surface)";
              let border = "var(--bs-border-subtle)";
              if (revealed) {
                if (isCorrect) { bg = "rgba(0,255,157,0.1)"; border = "#00FF9D"; }
                else if (isSelected && !isCorrect) { bg = "rgba(255,68,68,0.1)"; border = "#ff4444"; }
              } else if (isSelected) { bg = "rgba(0,255,157,0.08)"; border = "#00FF9D44"; }
              return (
                <button key={o.key} onClick={() => handleAnswer(o.key)} disabled={revealed} className="w-full text-left border p-4 flex items-start gap-4 transition-all min-h-[52px] disabled:cursor-default"
                  style={{ background: bg, borderColor: border }}>
                  <span className="w-7 h-7 border flex items-center justify-center shrink-0 font-black text-sm" style={{ borderColor: border, background: isSelected || (revealed && isCorrect) ? border : "transparent", color: isSelected || (revealed && isCorrect) ? (isCorrect ? "black" : "white") : "var(--bs-text-muted)" }}>{o.label}</span>
                  <span className="flex-1 text-sm font-mono leading-relaxed" style={{ color: "var(--bs-text)" }}>{o.text}</span>
                  {revealed && isCorrect && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#00FF9D" }} />}
                  {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ff4444" }} />}
                </button>
              );
            })}
          </div>
          {revealed && q.explanation && (
            <div className="border p-4 mb-4" style={{ background: "rgba(0,255,157,0.05)", borderColor: "rgba(0,255,157,0.2)" }}>
              <p className="text-sm font-mono leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>💡 {q.explanation}</p>
            </div>
          )}
          {revealed && (
            <button onClick={nextQuestion} className="w-full py-4 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>
              {current + 1 < questions.length ? "Next Question →" : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "done") {
    const accuracy = sessionResults.total > 0 ? Math.round((sessionResults.correct / sessionResults.total) * 100) : 0;
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className="border p-10" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: "#facc15" }} />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Revision Complete!</h2>
            <div className="text-5xl font-black mb-2" style={{ color: accuracy >= 70 ? "#00FF9D" : accuracy >= 40 ? "#facc15" : "#ff4444" }}>{accuracy}%</div>
            <p className="font-mono text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>{sessionResults.correct}/{sessionResults.total} correct</p>
            <div className="flex gap-3">
              <button onClick={() => setScreen("list")} className="flex-1 py-3 border font-black uppercase text-sm" style={{ borderColor: "var(--bs-border-subtle)" }}>Back to List</button>
              <button onClick={() => navigate("/dashboard")} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
