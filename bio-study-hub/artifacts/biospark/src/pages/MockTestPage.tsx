import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle,
  AlertCircle, BookOpen, Zap, RotateCcw, Flag, List, X, ArrowLeft,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  type: string;
  difficulty: string;
  chapter: string;
  class: string;
  explanation?: string;
}

type Phase = "setup" | "test" | "review";
type AnswerMap = Record<number, string>;
type FlagSet = Set<number>;

const CONFIGS = [
  { questions: 30, minutes: 30, label: "Quick Test", desc: "30 Q · 30 min" },
  { questions: 60, minutes: 60, label: "Half Mock", desc: "60 Q · 60 min" },
  { questions: 90, minutes: 90, label: "Full NEET", desc: "90 Q · 90 min" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}

export function MockTestPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [phase, setPhase] = useState<Phase>("setup");
  const [cls, setCls] = useState<"11" | "12">(profile?.class === "12" ? "12" : "11");
  const [configIdx, setConfigIdx] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<FlagSet>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cfg = CONFIGS[configIdx];

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  async function startTest() {
    setLoading(true);
    try {
      const res = await api.get("/questions", { class: cls, is_active: true, limit: 500 });
      const all = ((res as { questions?: Question[] }).questions || (res as Question[])) as Question[];
      const mcqOnly = all.filter((q) => ["mcq", "assertion", "statements", "truefalse", "fillblanks", "match"].includes(q.type));
      const picked = shuffle(mcqOnly).slice(0, cfg.questions);
      if (picked.length < 5) {
        alert("Not enough questions in the database for this class. Please add more questions first.");
        setLoading(false);
        return;
      }
      setQuestions(picked);
      setCurrent(0);
      setAnswers({});
      setFlagged(new Set());
      setTimeLeft(cfg.minutes * 60);
      setTimeTaken(0);
      startTimeRef.current = Date.now();
      setPhase("test");
      setSubmitted(false);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch {
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAutoSubmit() {
    setSubmitted(true);
    setPhase("review");
    stopTimer();
  }

  function handleSubmit() {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered !== 1 ? "s" : ""}. Submit anyway?`)) return;
    }
    setTimeTaken(Math.floor((Date.now() - startTimeRef.current) / 1000));
    stopTimer();
    setPhase("review");
    setSubmitted(true);
  }

  function answer(opt: string) {
    setAnswers((prev) => ({ ...prev, [current]: opt }));
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  }

  function goToResults() {
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const wrong = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
    const skipped = questions.length - correct - wrong;
    const score = Math.round((correct / questions.length) * 100);
    navigate("/score", { state: { correct, wrong, skipped, total: questions.length, score, timeTaken } });
  }

  const q = questions[current];
  const opts = q ? [
    { key: "option1", label: "A" },
    { key: "option2", label: "B" },
    { key: "option3", label: "C" },
    { key: "option4", label: "D" },
  ] : [];

  const answered = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const remaining = questions.length - answered;
  const pct = questions.length > 0 ? (answered / questions.length) * 100 : 0;
  const timerDanger = timeLeft < 300;
  const timerWarn = timeLeft < 600;

  // ---- SETUP PHASE ----
  if (phase === "setup") {
    return (
      <div className="min-h-screen font-['Space_Grotesk'] pt-24 pb-20 px-4 relative flex items-center justify-center" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[160px] opacity-15 pointer-events-none"
          style={{ background: "#00FF9D" }} />

        <div className="relative z-10 w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 border px-4 py-2 mb-6 transform -skew-x-12"
              style={{ background: "var(--bs-surface)", borderColor: "#00FF9D" }}>
              <Clock className="w-4 h-4 transform skew-x-12" style={{ color: "#00FF9D" }} />
              <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color: "#00FF9D" }}>Mock Exam</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3" style={{ color: "var(--bs-text)" }}>
              Mock <span style={{ color: "#00FF9D" }}>Test</span>
            </h1>
            <p className="text-sm font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
              NEET-style timed test with randomised questions from your class
            </p>
          </div>

          {/* Config card */}
          <div className="border p-8 space-y-8" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>

            {/* Class selector */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--bs-text-muted)" }}>Select Class</p>
              <div className="grid grid-cols-2 gap-3">
                {(["11", "12"] as const).map((c) => (
                  <button key={c} onClick={() => setCls(c)}
                    className="p-5 border font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-all"
                    style={{
                      background: cls === c ? "#00FF9D" : "var(--bs-surface-2)",
                      color: cls === c ? "black" : "var(--bs-text-muted)",
                      borderColor: cls === c ? "#00FF9D" : "var(--bs-border-subtle)",
                    }}>
                    <span className="transform skew-x-12 inline-block">Class {c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test type */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--bs-text-muted)" }}>Test Type</p>
              <div className="grid grid-cols-3 gap-3">
                {CONFIGS.map((c, i) => (
                  <button key={c.label} onClick={() => setConfigIdx(i)}
                    className="p-5 border flex flex-col items-center gap-1 transition-all transform -skew-x-12"
                    style={{
                      background: configIdx === i ? "color-mix(in srgb, #00FF9D 12%, var(--bs-surface-2))" : "var(--bs-surface-2)",
                      borderColor: configIdx === i ? "#00FF9D" : "var(--bs-border-subtle)",
                    }}>
                    <span className="transform skew-x-12 font-black uppercase text-sm" style={{ color: configIdx === i ? "#00FF9D" : "var(--bs-text)" }}>{c.label}</span>
                    <span className="transform skew-x-12 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="border p-4 space-y-2" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "var(--bs-text-muted)" }}>Rules</p>
              {[
                `${cfg.questions} questions randomly selected from all chapters`,
                `${cfg.minutes} minute countdown timer — auto-submits when time runs out`,
                "Flag questions to revisit them during the test",
                "Review all answers with explanations after submission",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#00FF9D" }} />
                  <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{rule}</span>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button onClick={startTest} disabled={loading}
              className="w-full relative group"
            >
              <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-30 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: "#00FF9D" }} />
              <div className="relative flex items-center justify-center gap-3 py-5 font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-colors"
                style={{ background: loading ? "rgba(245,158,11,0.5)" : "#00FF9D", color: "black" }}>
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full transform skew-x-12" /><span className="transform skew-x-12">Loading Questions…</span></>
                ) : (
                  <><Zap className="w-6 h-6 transform skew-x-12" /><span className="transform skew-x-12">Start {cfg.label}</span><ChevronRight className="w-6 h-6 transform skew-x-12" strokeWidth={3} /></>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- TEST PHASE ----
  if (phase === "test" && q) {
    const myAnswer = answers[current];
    const isFlagged = flagged.has(current);

    return (
      <div className="min-h-screen font-['Space_Grotesk'] flex flex-col" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>

        {/* Top bar */}
        <div className="sticky top-0 z-50 border-b px-4 py-3 flex items-center gap-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: "var(--bs-accent-hex)" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>
                Class {cls} · {cfg.label}
              </span>
            </div>
            <div className="h-4 w-px hidden sm:block" style={{ background: "var(--bs-border-subtle)" }} />
            <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-xs" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, background: "var(--bs-accent-hex)" }} />
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color: "var(--bs-text-muted)" }}>{answered}/{questions.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 border px-3 py-1.5 font-black text-sm tabular-nums`}
              style={{
                borderColor: timerDanger ? "#ef4444" : timerWarn ? "#00FF9D" : "var(--bs-border-subtle)",
                color: timerDanger ? "#ef4444" : timerWarn ? "#00FF9D" : "var(--bs-accent-hex)",
                background: timerDanger ? "rgba(239,68,68,0.1)" : "var(--bs-surface-2)",
              }}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowNav(!showNav)} className="p-2 border transition-colors"
              style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={handleSubmit}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border font-black uppercase text-xs tracking-widest transition-all"
              style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
              Submit
            </button>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Main content */}
          <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
            <div className="space-y-6">
              {/* Q header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm border px-3 py-1 transform -skew-x-12"
                    style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
                    <span className="transform skew-x-12 inline-block">Q {current + 1} / {questions.length}</span>
                  </span>
                  <span className="text-xs font-mono uppercase border px-2 py-0.5" style={{
                    color: q.difficulty === "hard" ? "#ef4444" : q.difficulty === "easy" ? "#00FF9D" : "#00FF9D",
                    borderColor: q.difficulty === "hard" ? "#ef4444" : q.difficulty === "easy" ? "#00FF9D" : "#00FF9D",
                  }}>{q.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleFlag}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase tracking-widest transition-all`}
                    style={{
                      borderColor: isFlagged ? "#00FF9D" : "var(--bs-border-subtle)",
                      color: isFlagged ? "#00FF9D" : "var(--bs-text-muted)",
                      background: isFlagged ? "rgba(245,158,11,0.1)" : "transparent",
                    }}>
                    <Flag className="w-3.5 h-3.5" />
                    {isFlagged ? "Flagged" : "Flag"}
                  </button>
                </div>
              </div>

              {/* Chapter label */}
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-accent-hex)" }}>{q.chapter}</div>

              {/* Question */}
              <div className="border-l-4 pl-5 py-2" style={{ borderColor: "var(--bs-accent-hex)" }}>
                <p className="text-base md:text-lg leading-relaxed font-medium" style={{ color: "var(--bs-text)" }}>{q.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {opts.map(({ key, label }) => {
                  const val = q[key as keyof Question] as string;
                  const isSelected = myAnswer === key;
                  return (
                    <button key={key} onClick={() => answer(key)}
                      className="w-full flex items-center gap-4 border p-4 text-left transition-all hover:scale-[1.005]"
                      style={{
                        background: isSelected ? "color-mix(in srgb, var(--bs-accent-hex) 12%, var(--bs-surface))" : "var(--bs-surface)",
                        borderColor: isSelected ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)",
                      }}>
                      <span className="w-8 h-8 border flex items-center justify-center font-black text-sm shrink-0 transform -skew-x-12 transition-all"
                        style={{
                          background: isSelected ? "var(--bs-accent-hex)" : "var(--bs-surface-2)",
                          borderColor: isSelected ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)",
                          color: isSelected ? "black" : "var(--bs-text-muted)",
                        }}>
                        <span className="transform skew-x-12">{label}</span>
                      </span>
                      <span className="text-sm leading-snug" style={{ color: "var(--bs-text)" }}>{val}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
                  className="flex items-center gap-2 px-5 py-3 border font-black uppercase tracking-widest text-sm transition-all disabled:opacity-30"
                  style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="flex-1" />
                {myAnswer && current < questions.length - 1 && (
                  <button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                    className="flex items-center gap-2 px-5 py-3 font-black uppercase tracking-widest text-sm transition-all"
                    style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                    Next <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                )}
                {current === questions.length - 1 ? (
                  <button onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-3 font-black uppercase tracking-widest text-sm border"
                    style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                    Submit Test
                  </button>
                ) : !myAnswer ? (
                  <button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                    className="flex items-center gap-2 px-5 py-3 border font-black uppercase tracking-widest text-sm"
                    style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
                    Skip <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Question navigator panel */}
          {showNav && (
            <div className="w-72 border-l flex flex-col shrink-0" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <span className="font-black uppercase text-sm tracking-tight" style={{ color: "var(--bs-text)" }}>Navigator</span>
                <button onClick={() => setShowNav(false)} className="p-1" style={{ color: "var(--bs-text-muted)" }}><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 border-b space-y-2 text-xs font-mono" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded-sm" style={{ background: "var(--bs-accent-hex)", borderColor: "var(--bs-accent-hex)" }} /> Answered ({answered})</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded-sm" style={{ background: "rgba(245,158,11,0.3)", borderColor: "#00FF9D" }} /> Flagged ({flaggedCount})</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 border rounded-sm" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }} /> Unanswered ({remaining})</div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((_, i) => {
                    const isAnswered = answers[i] !== undefined;
                    const isFl = flagged.has(i);
                    const isCur = i === current;
                    return (
                      <button key={i} onClick={() => { setCurrent(i); setShowNav(false); }}
                        className="w-full aspect-square border text-xs font-black flex items-center justify-center transition-all hover:scale-105"
                        style={{
                          background: isCur ? "var(--bs-accent-hex)" : isFl ? "rgba(245,158,11,0.3)" : isAnswered ? "color-mix(in srgb, var(--bs-accent-hex) 20%, var(--bs-surface-2))" : "var(--bs-surface-2)",
                          borderColor: isCur ? "var(--bs-accent-hex)" : isFl ? "#00FF9D" : isAnswered ? "var(--bs-accent-hex)" : "var(--bs-border-subtle)",
                          color: isCur ? "black" : "var(--bs-text-muted)",
                        }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <button onClick={handleSubmit} className="w-full py-3 font-black uppercase tracking-widest text-sm border transition-all"
                  style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                  Submit Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- REVIEW PHASE ----
  if (phase === "review") {
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const wrong = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
    const skipped = questions.length - correct - wrong;
    const score = Math.round((correct / questions.length) * 100);
    const scoreColor = score >= 75 ? "#00FF9D" : score >= 50 ? "#00FF9D" : "#ef4444";

    return (
      <div className="min-h-screen font-['Space_Grotesk'] pt-0 relative" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[160px] opacity-15 pointer-events-none"
          style={{ background: scoreColor }} />

        {/* Sticky result header */}
        <div className="sticky top-0 z-50 border-b px-4 py-4 flex items-center justify-between gap-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black" style={{ color: scoreColor }}>{score}%</div>
            <div className="text-xs font-mono flex gap-4" style={{ color: "var(--bs-text-muted)" }}>
              <span style={{ color: "#00FF9D" }}>✓ {correct}</span>
              <span style={{ color: "#ef4444" }}>✗ {wrong}</span>
              <span>Skip {skipped}</span>
              <span>⏱ {formatTime(timeTaken)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPhase("setup")}
              className="flex items-center gap-2 px-4 py-2 border text-xs font-black uppercase tracking-widest transition-all"
              style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
              <RotateCcw className="w-3.5 h-3.5" /> New Test
            </button>
            <button onClick={goToResults}
              className="flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-widest"
              style={{ background: scoreColor, color: "black" }}>
              Full Results <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6" style={{ color: "var(--bs-text)" }}>
            Answer Review — {questions.length} Questions
          </h2>

          {questions.map((q, i) => {
            const myAns = answers[i];
            const isCorrect = myAns === q.correct;
            const isSkipped = myAns === undefined;
            const borderColor = isSkipped ? "var(--bs-border-subtle)" : isCorrect ? "#00FF9D" : "#ef4444";

            return (
              <div key={i} className="border overflow-hidden" style={{ background: "var(--bs-surface)", borderColor }}>
                <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--bs-border-subtle)", background: isCorrect ? "rgba(0,255,179,0.04)" : isSkipped ? "transparent" : "rgba(239,68,68,0.04)" }}>
                  <span className="font-black text-xs border px-2 py-0.5 shrink-0 transform -skew-x-12"
                    style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
                    <span className="transform skew-x-12 inline-block">Q{i + 1}</span>
                  </span>
                  {isSkipped
                    ? <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "var(--bs-text-muted)" }} />
                    : isCorrect
                    ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#00FF9D" }} />
                    : <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />}
                  <span className="text-xs font-mono truncate flex-1" style={{ color: "var(--bs-text-muted)" }}>{q.chapter}</span>
                  <span className="text-xs font-black shrink-0"
                    style={{ color: isSkipped ? "var(--bs-text-muted)" : isCorrect ? "#00FF9D" : "#ef4444" }}>
                    {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--bs-text)" }}>{q.question}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(["option1", "option2", "option3", "option4"] as const).map((opt, oi) => {
                      const label = ["A", "B", "C", "D"][oi];
                      const isCorrectOpt = opt === q.correct;
                      const isMyOpt = opt === myAns;
                      return (
                        <div key={opt} className="flex items-center gap-2 border px-3 py-2 text-xs"
                          style={{
                            background: isCorrectOpt ? "rgba(0,255,179,0.08)" : isMyOpt && !isCorrectOpt ? "rgba(239,68,68,0.08)" : "var(--bs-surface-2)",
                            borderColor: isCorrectOpt ? "#00FF9D" : isMyOpt && !isCorrectOpt ? "#ef4444" : "var(--bs-border-subtle)",
                          }}>
                          <span className="font-black shrink-0 w-4" style={{ color: isCorrectOpt ? "#00FF9D" : "var(--bs-text-muted)" }}>{label}</span>
                          <span style={{ color: isCorrectOpt ? "#00FF9D" : "var(--bs-text-muted)" }}>{q[opt]}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="border-l-4 pl-3 mt-3" style={{ borderColor: "var(--bs-accent-hex)" }}>
                      <p className="text-xs font-mono leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>
                        <strong style={{ color: "var(--bs-accent-hex)" }}>Explanation: </strong>{q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-3 pt-4">
            <button onClick={() => setPhase("setup")}
              className="flex-1 flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm"
              style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
              <RotateCcw className="w-4 h-4" /> New Test
            </button>
            <button onClick={goToResults}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black uppercase tracking-widest text-sm"
              style={{ background: scoreColor, color: "black" }}>
              Score Card <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
