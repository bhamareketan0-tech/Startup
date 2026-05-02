import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { Question } from "@/lib/types";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, Sliders, Play, RotateCcw, Trophy } from "lucide-react";
import { fetchChaptersFromAPI } from "@/lib/chaptersManager";

type Screen = "build" | "test" | "result";
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const PRACTICE_TYPES = [
  { id: "mcq", label: "Standard MCQ" },
  { id: "assertion", label: "Assertion Reason" },
  { id: "statements", label: "No. of Correct Statements" },
  { id: "truefalse", label: "True / False" },
  { id: "fillblanks", label: "Fill in the Blanks" },
  { id: "match", label: "Match the Column" },
  { id: "diagram", label: "Diagram Based" },
  { id: "table_based", label: "Table Based" },
  { id: "pyq", label: "Prev Year Questions" },
];

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

function formatTime(s: number) {
  if (s === 0) return "No Limit";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function CustomQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [screen, setScreen] = useState<Screen>("build");
  const [step, setStep] = useState<Step>(1);

  const [selectedClass, setSelectedClass] = useState<string>("11");
  const [chapters11, setChapters11] = useState<{ id: string; name: string }[]>([]);
  const [chapters12, setChapters12] = useState<{ id: string; name: string }[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(PRACTICE_TYPES.map((t) => t.id));
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimitSec, setTimeLimitSec] = useState(1800);
  const [noTimeLimit, setNoTimeLimit] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<{ score: number; correct: number; wrong: number; skipped: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const displayChapters = selectedClass === "11" ? chapters11 : chapters12;

  useEffect(() => {
    fetchChaptersFromAPI("11").then((chs) => setChapters11(chs.map((c) => ({ id: c.id, name: c.name })))).catch(() => {});
    fetchChaptersFromAPI("12").then((chs) => setChapters12(chs.map((c) => ({ id: c.id, name: c.name })))).catch(() => {});
  }, []);

  useEffect(() => {
    if (screen !== "test" || noTimeLimit) return;
    setTimeLeft(timeLimitSec);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); submitAll(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const toggleChapter = (id: string) => {
    setSelectedChapters((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };
  const toggleType = (id: string) => {
    setSelectedTypes((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const buildQuiz = async () => {
    if (selectedChapters.length === 0 || selectedTypes.length === 0) return;
    setLoadingQ(true);
    try {
      const r = await api.post("/custom-quiz/questions", {
        class: selectedClass,
        chapters: selectedChapters,
        types: selectedTypes,
        difficulty,
        count: questionCount,
      }) as { questions: Question[] };
      setQuestions(r.questions || []);
      setCurrent(0);
      setAnswers({});
      setRevealed(false);
      setSelected(null);
      setScreen("test");
    } catch {
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoadingQ(false);
    }
  };

  const handleAnswer = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const q = questions[current];
    setAnswers((prev) => ({ ...prev, [q.id]: opt }));
    const isCorrect = opt === q.correct;
    api.post("/question-attempts", {
      question_id: q.id, question_text: q.question, chapter: q.chapter,
      subunit: q.subunit, class: q.class, question_type: q.type,
      difficulty: q.difficulty, is_correct: isCorrect,
      user_answer: opt, correct_answer: q.correct,
    }).catch(() => {});
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) { submitAll(); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
    setRevealed(false);
  };

  const submitAll = () => {
    clearInterval(timerRef.current);
    let correct = 0, wrong = 0, skipped = 0;
    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans) { skipped++; continue; }
      if (ans === q.correct) correct++; else wrong++;
    }
    const score = correct * 4 - wrong;
    setResult({ score, correct, wrong, skipped });
    setScreen("result");
    api.post("/attempts", {
      chapter: selectedChapters.join(","),
      subunit: "",
      class: selectedClass,
      score,
      correct,
      wrong,
      skipped,
      total: questions.length,
      time_taken: timeLimitSec - timeLeft,
    }).catch(() => {});
  };

  // Build screen
  if (screen === "build") {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 mb-8 font-mono uppercase text-sm" style={{ color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 flex items-center justify-center transform -skew-x-12" style={{ background: "#00FF9D" }}>
              <Sliders className="w-6 h-6 text-black transform skew-x-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Custom Quiz</h1>
              <p className="font-mono text-sm" style={{ color: "var(--bs-text-muted)" }}>Build your perfect quiz in a few steps</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <button onClick={() => setStep(s as Step)} className="w-8 h-8 border flex items-center justify-center text-sm font-black transition-all"
                  style={{ background: step === s ? "#00FF9D" : step > s ? "rgba(0,255,157,0.2)" : "var(--bs-surface)", borderColor: step >= s ? "#00FF9D" : "var(--bs-border-subtle)", color: step === s ? "black" : step > s ? "#00FF9D" : "var(--bs-text-muted)" }}>
                  {s > step - 1 && step > s ? "✓" : s}
                </button>
                {s < 5 && <div className="w-6 h-0.5" style={{ background: step > s ? "#00FF9D44" : "var(--bs-border-subtle)" }} />}
              </div>
            ))}
          </div>

          <div className="border p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            {step === 1 && (
              <div>
                <h2 className="font-black uppercase text-base mb-4">Step 1: Select Class</h2>
                <div className="grid grid-cols-3 gap-3">
                  {["11", "12", "dropper"].map((cls) => (
                    <button key={cls} onClick={() => { setSelectedClass(cls === "dropper" ? "11" : cls); setSelectedChapters([]); }}
                      className="py-4 border font-black uppercase text-sm transition-all"
                      style={{ background: selectedClass === (cls === "dropper" ? "11" : cls) ? "rgba(0,255,157,0.1)" : "var(--bs-surface-2)", borderColor: selectedClass === (cls === "dropper" ? "11" : cls) ? "#00FF9D" : "var(--bs-border-subtle)", color: selectedClass === (cls === "dropper" ? "11" : cls) ? "#00FF9D" : "var(--bs-text-muted)" }}>
                      {cls === "dropper" ? "Dropper" : `Class ${cls}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black uppercase text-base">Step 2: Select Chapters</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedChapters(displayChapters.map((c) => c.id))} className="text-xs font-mono uppercase px-3 py-1 border" style={{ borderColor: "#00FF9D44", color: "#00FF9D" }}>All</button>
                    <button onClick={() => setSelectedChapters([])} className="text-xs font-mono uppercase px-3 py-1 border" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>None</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {displayChapters.map((ch) => {
                    const sel = selectedChapters.includes(ch.id);
                    return (
                      <button key={ch.id} onClick={() => toggleChapter(ch.id)} className="flex items-center gap-3 p-3 border text-left min-h-[44px] transition-all"
                        style={{ background: sel ? "rgba(0,255,157,0.08)" : "var(--bs-surface-2)", borderColor: sel ? "#00FF9D" : "var(--bs-border-subtle)" }}>
                        <div className="w-4 h-4 border flex items-center justify-center shrink-0" style={{ borderColor: sel ? "#00FF9D" : "var(--bs-border-subtle)", background: sel ? "#00FF9D" : "transparent" }}>
                          {sel && <span className="text-black text-[10px]">✓</span>}
                        </div>
                        <span className="text-xs font-mono" style={{ color: "var(--bs-text)" }}>{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{selectedChapters.length} chapters selected</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black uppercase text-base">Step 3: Question Types</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedTypes(PRACTICE_TYPES.map((t) => t.id))} className="text-xs font-mono uppercase px-3 py-1 border" style={{ borderColor: "#00FF9D44", color: "#00FF9D" }}>All</button>
                    <button onClick={() => setSelectedTypes([])} className="text-xs font-mono uppercase px-3 py-1 border" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>None</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRACTICE_TYPES.map((t) => {
                    const sel = selectedTypes.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggleType(t.id)} className="flex items-center gap-2 p-3 border text-left min-h-[44px] transition-all"
                        style={{ background: sel ? "rgba(0,255,157,0.08)" : "var(--bs-surface-2)", borderColor: sel ? "#00FF9D" : "var(--bs-border-subtle)" }}>
                        <div className="w-4 h-4 border flex items-center justify-center shrink-0" style={{ borderColor: sel ? "#00FF9D" : "var(--bs-border-subtle)", background: sel ? "#00FF9D" : "transparent" }}>
                          {sel && <span className="text-black text-[10px]">✓</span>}
                        </div>
                        <span className="text-xs font-mono" style={{ color: "var(--bs-text)" }}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="font-black uppercase text-base mb-4">Step 4: Difficulty</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DIFFICULTIES.map((d) => {
                    const color = d === "easy" ? "#00FF9D" : d === "medium" ? "#facc15" : d === "hard" ? "#ff4444" : "#00FF9D";
                    return (
                      <button key={d} onClick={() => setDifficulty(d)} className="py-4 border font-black uppercase text-sm transition-all"
                        style={{ background: difficulty === d ? `${color}18` : "var(--bs-surface-2)", borderColor: difficulty === d ? color : "var(--bs-border-subtle)", color: difficulty === d ? color : "var(--bs-text-muted)" }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-black uppercase text-base mb-2">Step 5: Number of Questions</h2>
                  <div className="flex items-center gap-4">
                    <input type="range" min={10} max={100} step={5} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="flex-1 h-2 rounded-full outline-none cursor-pointer" style={{ accentColor: "#00FF9D" }} />
                    <span className="font-black text-2xl w-16 text-right" style={{ color: "#00FF9D" }}>{questionCount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "var(--bs-text-muted)" }}><span>10</span><span>100</span></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-black uppercase text-base">Time Limit</h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={noTimeLimit} onChange={(e) => setNoTimeLimit(e.target.checked)} className="w-4 h-4" style={{ accentColor: "#00FF9D" }} />
                      <span className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>No limit</span>
                    </label>
                  </div>
                  {!noTimeLimit && (
                    <>
                      <div className="flex items-center gap-4">
                        <input type="range" min={600} max={10800} step={600} value={timeLimitSec} onChange={(e) => setTimeLimitSec(Number(e.target.value))} className="flex-1 h-2 rounded-full outline-none cursor-pointer" style={{ accentColor: "#00FF9D" }} />
                        <span className="font-black text-xl w-20 text-right" style={{ color: "#00FF9D" }}>{formatTime(timeLimitSec)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "var(--bs-text-muted)" }}><span>10 min</span><span>3 hr</span></div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedChapters.length > 0 && (
            <div className="border p-4 mb-4 text-sm font-mono" style={{ background: "rgba(0,255,157,0.05)", borderColor: "rgba(0,255,157,0.2)", color: "var(--bs-text-muted)" }}>
              📋 Quiz: <strong style={{ color: "var(--bs-text)" }}>{questionCount} questions</strong> from <strong style={{ color: "var(--bs-text)" }}>{selectedChapters.length} chapters</strong> covering <strong style={{ color: "var(--bs-text)" }}>{selectedTypes.length} types</strong> · <strong style={{ color: "var(--bs-text)" }}>{difficulty}</strong> difficulty · {noTimeLimit ? "No time limit" : formatTime(timeLimitSec)}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && <button onClick={() => setStep((s) => (s - 1) as Step)} className="px-6 py-3 border font-black uppercase text-sm" style={{ borderColor: "var(--bs-border-subtle)" }}><ArrowLeft className="w-4 h-4 inline mr-1" />Back</button>}
            {step < 5 ? (
              <button onClick={() => setStep((s) => (s + 1) as Step)} disabled={step === 2 && selectedChapters.length === 0} className="flex-1 py-3 font-black uppercase text-sm disabled:opacity-50" style={{ background: "#00FF9D", color: "black" }}>
                Next <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            ) : (
              <button onClick={buildQuiz} disabled={loadingQ || selectedChapters.length === 0 || selectedTypes.length === 0} className="flex-1 py-3 font-black uppercase text-sm disabled:opacity-50" style={{ background: "#00FF9D", color: "black" }}>
                {loadingQ ? "Loading..." : <><Play className="w-4 h-4 inline mr-1" />Start Quiz</>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active test
  if (screen === "test" && questions.length > 0) {
    const q = questions[current];
    const opts = [
      { key: "option1", label: "A", text: q.option1 },
      { key: "option2", label: "B", text: q.option2 },
      { key: "option3", label: "C", text: q.option3 },
      { key: "option4", label: "D", text: q.option4 },
    ].filter((o) => o.text);
    const isUrgent = !noTimeLimit && timeLeft <= 60;
    const answered = Object.keys(answers).length;

    return (
      <div className="min-h-screen font-['Space_Grotesk']" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>
        <div className="sticky top-0 z-20 border-b px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <Sliders className="w-5 h-5 shrink-0" style={{ color: "#00FF9D" }} />
          <span className="font-black uppercase text-sm">Custom Quiz</span>
          {!noTimeLimit && (
            <div className="flex items-center gap-1 border px-3 py-1" style={{ borderColor: isUrgent ? "#ff4444" : "var(--bs-border-subtle)", background: isUrgent ? "rgba(255,68,68,0.1)" : "transparent" }}>
              <Clock className="w-4 h-4" style={{ color: isUrgent ? "#ff4444" : "var(--bs-text-muted)" }} />
              <span className="font-black text-sm tabular-nums" style={{ color: isUrgent ? "#ff4444" : "var(--bs-text)" }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <span className="font-mono text-sm ml-auto" style={{ color: "var(--bs-text-muted)" }}>{answered}/{questions.length}</span>
          <button onClick={submitAll} className="px-4 py-2 font-black uppercase text-xs" style={{ background: "#00FF9D", color: "black" }}>Submit All</button>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex gap-1.5 mb-6">
            {questions.map((_, i) => <div key={i} className="flex-1 h-1 rounded-full cursor-pointer transition-all" style={{ background: i === current ? "#00FF9D" : answers[questions[i].id] ? "rgba(0,255,157,0.4)" : "rgba(255,255,255,0.1)" }} onClick={() => { setCurrent(i); setRevealed(!!answers[questions[i].id]); setSelected(answers[questions[i].id] || null); }} />)}
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Q{current + 1}/{questions.length} · {q.chapter}</span>
            <span className="text-xs border px-2 py-0.5 font-black uppercase" style={{ borderColor: "rgba(0,255,157,0.3)", color: "#00FF9D" }}>{q.type}</span>
          </div>
          <div className="border p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <p className="text-lg font-bold leading-relaxed">{q.question}</p>
          </div>
          <div className="space-y-3 mb-6">
            {opts.map((o) => {
              const isSelected = selected === o.key;
              const isCorrect = o.key === q.correct;
              let bg = "var(--bs-surface)", border = "var(--bs-border-subtle)";
              if (revealed) {
                if (isCorrect) { bg = "rgba(0,255,157,0.1)"; border = "#00FF9D"; }
                else if (isSelected) { bg = "rgba(255,68,68,0.1)"; border = "#ff4444"; }
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
              <p className="text-sm font-mono" style={{ color: "var(--bs-text-muted)" }}>💡 {q.explanation}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setCurrent((c) => Math.max(0, c - 1)); setRevealed(!!answers[questions[Math.max(0, current - 1)]?.id]); setSelected(answers[questions[Math.max(0, current - 1)]?.id] || null); }} disabled={current === 0} className="flex-1 py-3 border font-black uppercase text-sm disabled:opacity-30" style={{ borderColor: "var(--bs-border-subtle)" }}>← Prev</button>
            {current < questions.length - 1
              ? <button onClick={nextQuestion} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Next →</button>
              : <button onClick={submitAll} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>Submit All</button>}
          </div>
        </div>
      </div>
    );
  }

  // Result
  if (screen === "result" && result) {
    const accuracy = questions.length > 0 ? Math.round((result.correct / questions.length) * 100) : 0;
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 font-['Space_Grotesk']" style={{ background: "transparent", color: "var(--bs-text)" }}>
        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className="border p-10" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: "#facc15" }} />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Quiz Complete!</h2>
            <div className="text-5xl font-black mb-1" style={{ color: result.score > 0 ? "#00FF9D" : "#ff4444" }}>{result.score > 0 ? "+" : ""}{result.score}</div>
            <p className="font-mono text-sm mb-6" style={{ color: "var(--bs-text-muted)" }}>NEET Score · {accuracy}% accuracy</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border p-3" style={{ background: "rgba(0,255,157,0.06)", borderColor: "rgba(0,255,157,0.2)" }}>
                <div className="text-xl font-black" style={{ color: "#00FF9D" }}>{result.correct}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Correct</div>
              </div>
              <div className="border p-3" style={{ background: "rgba(255,68,68,0.06)", borderColor: "rgba(255,68,68,0.2)" }}>
                <div className="text-xl font-black" style={{ color: "#ff4444" }}>{result.wrong}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Wrong</div>
              </div>
              <div className="border p-3" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
                <div className="text-xl font-black">{result.skipped}</div>
                <div className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>Skipped</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setScreen("build"); setStep(1); setAnswers({}); }} className="flex-1 py-3 border font-black uppercase text-sm flex items-center justify-center gap-2" style={{ borderColor: "var(--bs-border-subtle)" }}>
                <RotateCcw className="w-4 h-4" /> New Quiz
              </button>
              <button onClick={() => navigate("/performance")} className="flex-1 py-3 font-black uppercase text-sm" style={{ background: "#00FF9D", color: "black" }}>View Stats</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
