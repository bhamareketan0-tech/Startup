import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fetchChaptersFromAPI } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";
import {
  Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle,
  AlertCircle, BookOpen, Zap, RotateCcw, Flag, List, X,
  Share2, Download, Trophy, Target, Timer, ArrowLeft,
  Shuffle, Layers, Star, TrendingUp, Home, RefreshCw,
} from "lucide-react";
import { XPPopupManager } from "@/components/XPPopup";
import { LevelUpModal } from "@/components/LevelUpModal";
import { BadgeQueueManager } from "@/components/BadgeUnlockPopup";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

// ─── Types ────────────────────────────────────────────────────────────────────
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
  meta?: Record<string, unknown>;
}

type Phase = "cls" | "chapter" | "type" | "rules" | "test" | "result" | "review";
type AnswerMap = Record<number, string>;

interface TestConfig {
  label: string;
  questions: number;
  minutes: number;
  desc: string;
  icon: string;
}

const TEST_CONFIGS: TestConfig[] = [
  { label: "Quick Test",  questions: 30, minutes: 30,  desc: "30 Q · 30 min · Fast revision",    icon: "⚡" },
  { label: "Half Mock",   questions: 60, minutes: 60,  desc: "60 Q · 60 min · Mid-level prep",   icon: "📋" },
  { label: "Full NEET",   questions: 90, minutes: 90,  desc: "90 Q · 90 min · Exact NEET format",icon: "🏆" },
  { label: "PYQ Only",    questions: 0,  minutes: 0,   desc: "Previous Year Questions",           icon: "📅" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const ACCENT = "#00FF9D";
const BG       = "var(--bs-bg)";
const SURF     = "var(--bs-surface)";
const SURF2    = "var(--bs-surface-2)";
const BORDER   = "var(--bs-border-subtle)";
const TXT      = "var(--bs-text)";
const MUTED    = "var(--bs-text-muted)";
const RED      = "#ef4444";
const YELLOW   = "#fbbf24";

const GRID_STYLE = {
  backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
  backgroundSize: "40px 40px",
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function SkewBadge({ children, color = ACCENT }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="inline-flex items-center gap-2 border px-4 py-2 mb-6 transform -skew-x-12"
      style={{ background: SURF, borderColor: color }}>
      <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 mb-8 text-sm font-black uppercase tracking-widest transition-colors"
      style={{ color: MUTED }}
      onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MockTestPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  // Setup state
  const [phase, setPhase]             = useState<Phase>("cls");
  const [cls, setCls]                 = useState<string>(profile?.class === "12" ? "12" : "11");
  const [chapterMode, setChapterMode] = useState<"random" | "all" | string>("all");
  const [configIdx, setConfigIdx]     = useState<number>(0);
  const [pyqYearFrom, setPyqYearFrom] = useState("2019");
  const [pyqYearTo, setPyqYearTo]     = useState("2024");
  const [chapters, setChapters]       = useState<Chapter[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Test state
  const [loading, setLoading]         = useState(false);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState<AnswerMap>({});
  const [flagged, setFlagged]         = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft]       = useState(0);
  const [timeTaken, setTimeTaken]     = useState(0);
  const [showNav, setShowNav]         = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const [xpEvents, setXpEvents]       = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: string; emoji: string; xp: number; totalXP: number } | null>(null);
  const [badgeQueue, setBadgeQueue]   = useState<Array<{ id: string; name: string; emoji: string; description: string }>>([]);

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef  = useRef<number>(0);
  const autoSubRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = TEST_CONFIGS[configIdx];
  const isPYQ = cfg.label === "PYQ Only";

  // Derived
  const answered      = Object.keys(answers).length;
  const liveCorrect   = questions.filter((q, i) => answers[i] === q.correct).length;
  const liveWrong     = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
  const liveMarks     = liveCorrect * 4 - liveWrong * 1;
  const maxMarks      = questions.length * 4;
  const timerDanger   = timeLeft < 300 && timeLeft > 0;
  const pct           = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => () => {
    clearTimers();
  }, []);

  function clearTimers() {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    if (autoSubRef.current)  clearInterval(autoSubRef.current);
  }

  // ── Load chapters & counts ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "chapter") return;
    setLoadingChapters(true);
    fetchChaptersFromAPI(cls).then(chs => {
      setChapters(chs);
      return api.get("/questions/counts", { class: cls });
    }).then((res: unknown) => {
      const data = res as Record<string, unknown>;
      if (data?.byChapter) setChapterCounts(data.byChapter as Record<string, number>);
    }).catch(console.error).finally(() => setLoadingChapters(false));
  }, [phase, cls]);

  // ── Auto-save to localStorage ──────────────────────────────────────────────
  function startAutoSave() {
    autoSaveRef.current = setInterval(() => {
      localStorage.setItem("neetaspire_mock_save", JSON.stringify({ answers, current, timeLeft }));
    }, 30000);
  }

  // ── Timer ─────────────────────────────────────────────────────────────────
  function startTimer(totalSec: number) {
    setTimeLeft(totalSec);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerAutoSubmitCountdown();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function triggerAutoSubmitCountdown() {
    setAutoSubmitCountdown(10);
    autoSubRef.current = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(autoSubRef.current!);
          setAutoSubmitCountdown(null);
          finalSubmit();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function finalSubmit() {
    clearTimers();
    setTimeTaken(Math.floor((Date.now() - startTimeRef.current) / 1000));
    localStorage.removeItem("neetaspire_mock_save");
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    try {
      const xpRes = await api.post("/xp/award", { reason: "mock_test_done", correctCount: correct }) as { xpResult?: { xpAwarded: number; leveledUp: boolean; newLevel: string }; newBadges?: Array<{ id: string; name: string; emoji: string; description: string }> };
      if (xpRes.xpResult && xpRes.xpResult.xpAwarded > 0) {
        setXpEvents((prev) => [...prev, { id: Date.now().toString(), amount: xpRes.xpResult!.xpAwarded }]);
        if (xpRes.xpResult.leveledUp) {
          const lvl = xpRes.xpResult.newLevel;
          const totalXP = (xpRes.xpResult as unknown as { totalXP: number }).totalXP || xpRes.xpResult.xpAwarded;
          setLevelUpInfo({ level: lvl, emoji: LEVEL_EMOJIS[lvl] || "🌱", xp: xpRes.xpResult.xpAwarded, totalXP });
        }
        refreshProfile().catch(() => {});
      }
      if (xpRes.newBadges && xpRes.newBadges.length > 0) {
        setBadgeQueue((prev) => [...prev, ...xpRes.newBadges!]);
      }
    } catch {}
    void correct;
    setPhase("result");
  }

  function handleManualSubmit() {
    const unanswered = questions.length - answered;
    if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question${unanswered !== 1 ? "s" : ""}. Submit anyway?`)) return;
    finalSubmit();
  }

  // ── Start test ─────────────────────────────────────────────────────────────
  async function startTest() {
    setLoading(true);
    try {
      const params: Record<string, string> = { is_active: "true", limit: "500" };

      if (isPYQ) {
        params.type = "pyq";
      } else {
        params.type = ["mcq", "assertion", "statements", "truefalse", "fillblanks", "match", "diagram", "table_based", "pyq"].join(",");
      }

      if (chapterMode !== "random" && chapterMode !== "all") {
        params.chapter = chapterMode;
      }

      // For dropper, fetch 11+12 if "all"
      let rawQuestions: Question[] = [];
      if (cls === "dropper") {
        const [r11, r12] = await Promise.all([
          api.get("/questions", { ...params, class: "11" }),
          api.get("/questions", { ...params, class: "12" }),
        ]);
        const q11 = ((r11 as { questions?: Question[] }).questions || (r11 as Question[])) as Question[];
        const q12 = ((r12 as { questions?: Question[] }).questions || (r12 as Question[])) as Question[];
        rawQuestions = [...q11, ...q12];
      } else {
        params.class = cls;
        const res = await api.get("/questions", params);
        rawQuestions = ((res as { questions?: Question[] }).questions || (res as Question[])) as Question[];
      }

      // Filter PYQ by year range
      let pool = rawQuestions;
      if (isPYQ) {
        const from = parseInt(pyqYearFrom, 10);
        const to = parseInt(pyqYearTo, 10);
        pool = pool.filter(q => {
          const y = parseInt((q.meta?.year as string) || "0", 10);
          return y >= from && y <= to;
        });
      }

      // MCQ-compatible only for non-PYQ
      if (!isPYQ) {
        pool = pool.filter(q => ["mcq", "assertion", "statements", "truefalse", "fillblanks", "match", "diagram", "table_based", "pyq"].includes(q.type));
      }

      const count = isPYQ ? Math.min(90, pool.length) : cfg.questions;
      const picked = shuffle(pool).slice(0, count);

      if (picked.length < 5) {
        alert("Not enough questions for this selection. Please add more questions or choose a different chapter/class.");
        setLoading(false);
        return;
      }

      setQuestions(picked);
      setCurrent(0);
      setAnswers({});
      setFlagged(new Set());
      setTimeTaken(0);
      setAutoSubmitCountdown(null);

      const minutes = isPYQ ? picked.length : cfg.minutes;
      startTimer(minutes * 60);
      startAutoSave();
      setPhase("test");
    } catch {
      alert("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function answer(opt: string) {
    setAnswers(prev => ({ ...prev, [current]: opt }));
  }

  function toggleFlag() {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  }

  function resetToSetup() {
    clearTimers();
    setPhase("cls");
    setQuestions([]);
    setAnswers({});
    setFlagged(new Set());
    setAutoSubmitCountdown(null);
  }

  // ── Result computations ────────────────────────────────────────────────────
  const correct    = questions.filter((q, i) => answers[i] === q.correct).length;
  const wrong      = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
  const skipped    = questions.length - correct - wrong;
  const finalScore = questions.length > 0 ? correct * 4 - wrong : 0;
  const finalMax   = questions.length * 4;
  const accuracy   = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const mockRank   = Math.max(1, Math.floor(Math.random() * 200) + 1); // placeholder NEETAspire rank

  // Chapter-wise breakdown
  const chapterBreakdown = (() => {
    const map: Record<string, { correct: number; wrong: number; total: number }> = {};
    questions.forEach((q, i) => {
      const ch = q.chapter || "Unknown";
      if (!map[ch]) map[ch] = { correct: 0, wrong: 0, total: 0 };
      map[ch].total++;
      if (answers[i] === q.correct) map[ch].correct++;
      else if (answers[i] !== undefined) map[ch].wrong++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  })();

  const q = questions[current];
  const opts = q ? [
    { key: "option1", label: "A" },
    { key: "option2", label: "B" },
    { key: "option3", label: "C" },
    { key: "option4", label: "D" },
  ] : [];

  // ── Score card canvas share ────────────────────────────────────────────────
  const scoreCardRef = useRef<HTMLDivElement>(null);

  async function downloadScoreCard() {
    try {
      const { default: html2canvas } = await import("html2canvas");
      if (!scoreCardRef.current) return;
      const canvas = await html2canvas(scoreCardRef.current, { backgroundColor: "#000000", scale: 2 });
      const link = document.createElement("a");
      link.download = `neetaspire-score-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      alert("Download failed. Please screenshot the score card manually.");
    }
  }

  function shareToWhatsApp() {
    const text = `🧬 *NEETAspire NEET Score*\n\n✅ Score: ${finalScore}/${finalMax}\n🎯 Accuracy: ${accuracy}%\n🏆 NEETAspire Rank: #${mockRank}\n⏱ Time: ${formatTime(timeTaken)}\n\nStudy smarter with NEETAspire! 🚀`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 1 — CLASS SELECT
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "cls") {
    const classes = [
      { id: "11", label: "Class 11", desc: "Foundation Biology — Botany, Zoology, Cell Biology" },
      { id: "12", label: "Class 12", desc: "Advanced Biology — Genetics, Evolution, Biotechnology" },
      { id: "dropper", label: "Dropper", desc: "Full NEET Syllabus — All Class 11 & 12 topics", tag: "NEET Repeater" },
    ];
    return (
      <div className="min-h-screen font-['Space_Grotesk'] relative overflow-hidden flex items-center justify-center"
        style={{ background: "transparent", color: TXT }}>
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 blur-[120px] pointer-events-none opacity-10"
          style={{ background: ACCENT }} />

        <div className="relative z-10 w-full max-w-4xl px-4 pt-28 pb-16">
          <div className="text-center mb-12">
            <SkewBadge><Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />Mock Exam</SkewBadge>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3" style={{ color: TXT }}>
              Mock <span style={{ color: ACCENT }}>Test</span>
            </h1>
            <p className="font-mono uppercase tracking-wide text-sm" style={{ color: MUTED }}>
              NEET-style timed test · +4 correct · −1 wrong
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {classes.map(({ id, label, desc, tag }) => (
              <button key={id} onClick={() => { setCls(id); setPhase("chapter"); }}
                className="group border border-l-4 p-8 text-left transition-all relative overflow-hidden"
                style={{ background: SURF, borderColor: BORDER, borderLeftColor: ACCENT }}>
                <div className="absolute top-0 left-0 w-1 h-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                  style={{ background: ACCENT }} />
                <div className="w-14 h-14 border flex items-center justify-center mb-6 transform -skew-x-12"
                  style={{ background: SURF2, borderColor: BORDER }}>
                  <BookOpen className="w-7 h-7 transform skew-x-12" style={{ color: ACCENT }} />
                </div>
                <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter" style={{ color: TXT }}>{label}</h2>
                {tag && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border mb-3"
                    style={{ background: `rgba(0,255,157,0.1)`, borderColor: `rgba(0,255,157,0.3)`, color: ACCENT }}>
                    {tag}
                  </span>
                )}
                <p className="font-mono text-sm mb-6 uppercase tracking-wide" style={{ color: MUTED }}>{desc}</p>
                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm" style={{ color: ACCENT }}>
                  Select <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 2 — CHAPTER SELECT
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "chapter") {
    return (
      <div className="min-h-screen font-['Space_Grotesk'] relative pt-24 pb-16 px-4"
        style={{ background: "transparent", color: TXT }}>
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <BackBtn onClick={() => setPhase("cls")} />

          <div className="text-center mb-10">
            <SkewBadge>
              Class {cls === "dropper" ? "Dropper" : cls} · Select Chapter
            </SkewBadge>
            <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: TXT }}>
              Choose <span style={{ color: ACCENT }}>Chapter</span>
            </h2>
          </div>

          {loadingChapters ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Random */}
              <button onClick={() => { setChapterMode("random"); setPhase("type"); }}
                className="w-full flex items-center gap-5 border p-5 text-left transition-all group"
                style={{ background: SURF, borderColor: BORDER }}
                onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                <div className="w-12 h-12 border flex items-center justify-center shrink-0 transform -skew-x-12"
                  style={{ background: SURF2, borderColor: BORDER }}>
                  <Shuffle className="w-5 h-5 transform skew-x-12" style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg uppercase tracking-tight" style={{ color: TXT }}>🎲 Random</p>
                  <p className="font-mono text-sm" style={{ color: MUTED }}>Mix questions from any chapter randomly</p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: ACCENT }} />
              </button>

              {/* All chapters */}
              <button onClick={() => { setChapterMode("all"); setPhase("type"); }}
                className="w-full flex items-center gap-5 border p-5 text-left transition-all group"
                style={{ background: SURF, borderColor: BORDER }}
                onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                <div className="w-12 h-12 border flex items-center justify-center shrink-0 transform -skew-x-12"
                  style={{ background: SURF2, borderColor: BORDER }}>
                  <Layers className="w-5 h-5 transform skew-x-12" style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg uppercase tracking-tight" style={{ color: TXT }}>📚 All Chapters</p>
                  <p className="font-mono text-sm" style={{ color: MUTED }}>Questions from all chapters mixed together</p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: ACCENT }} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>or pick a chapter</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>

              {/* Individual chapters */}
              {chapters.map(ch => {
                const count = chapterCounts[ch.id] || 0;
                return (
                  <button key={ch.id} onClick={() => { setChapterMode(ch.id); setPhase("type"); }}
                    className="w-full flex items-center gap-5 border p-4 text-left transition-all group"
                    style={{ background: SURF, borderColor: BORDER }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: TXT }}>{ch.name}</p>
                    </div>
                    <span className="text-xs font-black border px-2 py-0.5 shrink-0"
                      style={{ color: ACCENT, borderColor: `rgba(0,255,157,0.3)`, background: `rgba(0,255,157,0.06)` }}>
                      {count} Q
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: MUTED }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 3 — TEST TYPE
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "type") {
    return (
      <div className="min-h-screen font-['Space_Grotesk'] relative pt-24 pb-16 px-4"
        style={{ background: "transparent", color: TXT }}>
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <BackBtn onClick={() => setPhase("chapter")} />

          <div className="text-center mb-10">
            <SkewBadge>Select Test Type</SkewBadge>
            <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: TXT }}>
              Test <span style={{ color: ACCENT }}>Format</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {TEST_CONFIGS.map((tc, i) => {
              const isSelected = configIdx === i;
              return (
                <button key={tc.label} onClick={() => setConfigIdx(i)}
                  className="border p-7 text-left transition-all relative group"
                  style={{
                    background: isSelected ? `rgba(0,255,157,0.07)` : SURF,
                    borderColor: isSelected ? ACCENT : BORDER,
                  }}>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5" style={{ color: ACCENT }} />
                    </div>
                  )}
                  <div className="text-3xl mb-4">{tc.icon}</div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: isSelected ? ACCENT : TXT }}>{tc.label}</h3>
                  <p className="font-mono text-sm mb-4" style={{ color: MUTED }}>{tc.desc}</p>
                  {tc.label !== "PYQ Only" && (
                    <div className="flex gap-3 text-xs font-black">
                      <span className="border px-2 py-0.5" style={{ color: ACCENT, borderColor: `rgba(0,255,157,0.3)` }}>+4 correct</span>
                      <span className="border px-2 py-0.5" style={{ color: RED, borderColor: `rgba(239,68,68,0.3)` }}>−1 wrong</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* PYQ year range */}
          {isPYQ && (
            <div className="mt-6 border p-6" style={{ background: SURF, borderColor: ACCENT }}>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Select Year Range</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: MUTED }}>From Year</label>
                  <select value={pyqYearFrom} onChange={e => setPyqYearFrom(e.target.value)}
                    className="w-full border px-4 py-3 text-sm font-bold focus:outline-none"
                    style={{ background: SURF2, borderColor: BORDER, color: TXT }}>
                    {Array.from({ length: 14 }, (_, i) => 2011 + i).map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: MUTED }}>To Year</label>
                  <select value={pyqYearTo} onChange={e => setPyqYearTo(e.target.value)}
                    className="w-full border px-4 py-3 text-sm font-bold focus:outline-none"
                    style={{ background: SURF2, borderColor: BORDER, color: TXT }}>
                    {Array.from({ length: 14 }, (_, i) => 2011 + i).map(y => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setPhase("rules")}
            className="mt-8 w-full relative group">
            <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-20 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: ACCENT }} />
            <div className="relative flex items-center justify-center gap-3 py-5 font-black uppercase tracking-widest text-xl transform -skew-x-12"
              style={{ background: ACCENT, color: "black" }}>
              <span className="transform skew-x-12">Continue</span>
              <ChevronRight className="w-6 h-6 transform skew-x-12" strokeWidth={3} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 4 — RULES + START
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "rules") {
    const totalQ = isPYQ ? "Up to 90" : cfg.questions;
    const totalMin = isPYQ ? totalQ : cfg.minutes;
    const rules = [
      `${totalQ} questions · ${totalMin} minute timer`,
      "Each correct answer: +4 marks",
      "Each wrong answer: −1 mark",
      "Unattempted questions: 0 marks",
      "Timer auto-submits when time runs out",
      "Flag questions to revisit anytime",
      "All questions are MCQ format",
      "Results shown immediately after submission",
      "Progress auto-saved every 30 seconds",
    ];
    return (
      <div className="min-h-screen font-['Space_Grotesk'] relative pt-24 pb-16 px-4 flex items-center justify-center"
        style={{ background: "transparent", color: TXT }}>
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[160px] opacity-8 pointer-events-none"
          style={{ background: ACCENT }} />

        <div className="relative z-10 w-full max-w-2xl">
          <BackBtn onClick={() => setPhase("type")} />

          <div className="text-center mb-10">
            <SkewBadge>Rules & Instructions</SkewBadge>
            <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: TXT }}>
              Ready to <span style={{ color: ACCENT }}>Begin?</span>
            </h2>
            <p className="font-mono text-sm mt-2" style={{ color: MUTED }}>
              Class {cls === "dropper" ? "Dropper" : cls} · {chapterMode === "all" ? "All Chapters" : chapterMode === "random" ? "Random" : chapterMode} · {cfg.label}
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {[
              { icon: <Target className="w-4 h-4" />, text: `${totalQ} Questions` },
              { icon: <Timer className="w-4 h-4" />, text: `${totalMin} Minutes` },
              { icon: <Star className="w-4 h-4" />,  text: `${isPYQ ? "~" : ""}${typeof totalQ === "number" ? totalQ * 4 : "360"} Max Marks` },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 border px-4 py-2"
                style={{ background: SURF, borderColor: `rgba(0,255,157,0.3)`, color: ACCENT }}>
                {icon}
                <span className="text-sm font-black uppercase tracking-wider">{text}</span>
              </div>
            ))}
          </div>

          {/* Rules list */}
          <div className="border p-6 space-y-3 mb-8" style={{ background: SURF, borderColor: BORDER }}>
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                <span className="text-sm font-mono" style={{ color: MUTED }}>{rule}</span>
              </div>
            ))}
          </div>

          {/* Scoring quick ref */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Correct", val: "+4", color: ACCENT },
              { label: "Wrong",   val: "−1", color: RED },
              { label: "Skip",    val:  "0", color: MUTED },
            ].map(({ label, val, color }) => (
              <div key={label} className="border p-4 text-center" style={{ background: SURF, borderColor: BORDER }}>
                <div className="text-2xl font-black mb-1" style={{ color }}>{val}</div>
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Start button */}
          <button onClick={startTest} disabled={loading} className="w-full relative group">
            <div className="absolute inset-0 transform -skew-x-12 translate-x-2 translate-y-2 opacity-25 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" style={{ background: ACCENT }} />
            <div className="relative flex items-center justify-center gap-3 py-5 font-black uppercase tracking-widest text-xl transform -skew-x-12 transition-opacity"
              style={{ background: ACCENT, color: "black", opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <><div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full transform skew-x-12" />
                  <span className="transform skew-x-12">Loading…</span></>
              ) : (
                <><Zap className="w-6 h-6 transform skew-x-12" />
                  <span className="transform skew-x-12">Start {cfg.label}</span>
                  <ChevronRight className="w-6 h-6 transform skew-x-12" strokeWidth={3} /></>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 5 — ACTIVE TEST
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "test" && q) {
    const myAnswer  = answers[current];
    const isFlagged = flagged.has(current);
    const pyqYear   = q.meta?.year as string | undefined;

    return (
      <div className="min-h-screen font-['Space_Grotesk'] flex flex-col" style={{ background: BG, color: TXT }}>

        {/* Auto-submit countdown overlay */}
        {autoSubmitCountdown !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="border p-8 text-center max-w-sm w-full mx-4" style={{ background: SURF, borderColor: RED }}>
              <div className="text-5xl font-black mb-2" style={{ color: RED }}>{autoSubmitCountdown}</div>
              <p className="font-black text-lg uppercase tracking-tight mb-1" style={{ color: TXT }}>Time's Up!</p>
              <p className="font-mono text-sm mb-6" style={{ color: MUTED }}>Auto-submitting in {autoSubmitCountdown} seconds…</p>
              <button onClick={finalSubmit}
                className="w-full py-3 font-black uppercase tracking-widest text-sm"
                style={{ background: ACCENT, color: "black" }}>
                Submit Now
              </button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="sticky top-0 z-50 border-b px-4 py-3 flex items-center gap-4 flex-wrap"
          style={{ background: SURF, borderColor: BORDER }}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>
              Class {cls === "dropper" ? "D" : cls} · {cfg.label}
            </span>
            <div className="hidden sm:block h-4 w-px" style={{ background: BORDER }} />
            <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, background: ACCENT }} />
            </div>
            <span className="text-xs font-mono shrink-0" style={{ color: MUTED }}>{answered}/{questions.length}</span>
          </div>

          {/* Live marks */}
          <div className="hidden sm:flex items-center gap-1 border px-3 py-1.5 text-sm font-black"
            style={{ borderColor: `rgba(0,255,157,0.3)`, color: ACCENT, background: `rgba(0,255,157,0.05)` }}>
            <TrendingUp className="w-3.5 h-3.5" />
            {liveMarks}/{maxMarks}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 border px-3 py-1.5 font-black text-sm tabular-nums"
            style={{
              borderColor: timerDanger ? RED : `rgba(0,255,157,0.3)`,
              color:       timerDanger ? RED : ACCENT,
              background:  timerDanger ? "rgba(239,68,68,0.1)" : `rgba(0,255,157,0.05)`,
            }}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>

          <button onClick={() => setShowNav(!showNav)} className="p-2 border transition-colors"
            style={{ borderColor: BORDER, color: MUTED }}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={handleManualSubmit}
            className="hidden sm:flex items-center gap-2 px-4 py-2 border font-black uppercase text-xs tracking-widest"
            style={{ borderColor: RED, color: RED, background: "rgba(239,68,68,0.08)" }}>
            Submit
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main question area */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Q header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm border px-3 py-1 transform -skew-x-12"
                    style={{ background: SURF, borderColor: BORDER, color: MUTED }}>
                    <span className="transform skew-x-12 inline-block">Q {current + 1} / {questions.length}</span>
                  </span>
                  {pyqYear && (
                    <span className="text-xs font-black border px-2 py-0.5"
                      style={{ color: ACCENT, borderColor: `rgba(0,255,157,0.4)`, background: `rgba(0,255,157,0.08)` }}>
                      NEET {pyqYear}
                    </span>
                  )}
                  <span className="text-xs font-mono uppercase border px-2 py-0.5"
                    style={{
                      color: q.difficulty === "hard" ? RED : ACCENT,
                      borderColor: q.difficulty === "hard" ? `rgba(239,68,68,0.3)` : `rgba(0,255,157,0.3)`,
                    }}>
                    {q.difficulty}
                  </span>
                </div>
                <button onClick={toggleFlag}
                  className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    borderColor: isFlagged ? YELLOW : BORDER,
                    color: isFlagged ? YELLOW : MUTED,
                    background: isFlagged ? "rgba(251,191,36,0.08)" : "transparent",
                  }}>
                  <Flag className="w-3.5 h-3.5" />
                  {isFlagged ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Chapter */}
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: ACCENT }}>{q.chapter}</div>

              {/* Question text */}
              <div className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p className="text-base md:text-lg leading-relaxed font-medium" style={{ color: TXT }}>{q.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {opts.map(({ key, label }) => {
                  const val = q[key as keyof Question] as string;
                  const isSelected = myAnswer === key;
                  return (
                    <button key={key} onClick={() => answer(key)}
                      className="w-full flex items-center gap-4 border p-4 text-left transition-all active:scale-[0.99]"
                      style={{
                        background: isSelected ? `rgba(0,255,157,0.08)` : SURF,
                        borderColor: isSelected ? ACCENT : BORDER,
                      }}>
                      <span className="w-8 h-8 border flex items-center justify-center font-black text-sm shrink-0 transform -skew-x-12"
                        style={{
                          background: isSelected ? ACCENT : SURF2,
                          borderColor: isSelected ? ACCENT : BORDER,
                          color: isSelected ? "black" : MUTED,
                        }}>
                        <span className="transform skew-x-12">{label}</span>
                      </span>
                      <span className="text-sm leading-snug" style={{ color: TXT }}>{val}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                  className="flex items-center gap-2 px-5 py-3 border font-black uppercase tracking-widest text-sm transition-all disabled:opacity-30"
                  style={{ borderColor: BORDER, color: MUTED }}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="flex-1" />
                {current === questions.length - 1 ? (
                  <button onClick={handleManualSubmit}
                    className="flex items-center gap-2 px-5 py-3 font-black uppercase tracking-widest text-sm border"
                    style={{ borderColor: RED, color: RED, background: "rgba(239,68,68,0.08)" }}>
                    Submit Test
                  </button>
                ) : (
                  <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                    className="flex items-center gap-2 px-5 py-3 font-black uppercase tracking-widest text-sm transition-all"
                    style={{ background: myAnswer ? ACCENT : SURF, color: myAnswer ? "black" : MUTED, borderColor: BORDER, border: myAnswer ? "none" : "1px solid" } as React.CSSProperties}>
                    {myAnswer ? "Next" : "Skip"} <ChevronRight className="w-4 h-4" strokeWidth={myAnswer ? 3 : 2} />
                  </button>
                )}
              </div>

              {/* Mobile submit */}
              <button onClick={handleManualSubmit} className="sm:hidden w-full py-3 border font-black uppercase tracking-widest text-sm"
                style={{ borderColor: RED, color: RED, background: "rgba(239,68,68,0.08)" }}>
                Submit Test
              </button>
            </div>
          </div>

          {/* Question navigator panel */}
          {showNav && (
            <div className="w-64 md:w-72 border-l flex flex-col shrink-0 fixed right-0 top-0 bottom-0 z-40 md:relative md:z-auto"
              style={{ background: SURF, borderColor: BORDER }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: BORDER }}>
                <span className="font-black uppercase text-sm tracking-tight" style={{ color: TXT }}>Navigator</span>
                <button onClick={() => setShowNav(false)} style={{ color: MUTED }}><X className="w-4 h-4" /></button>
              </div>
              {/* Legend */}
              <div className="p-3 border-b space-y-1.5 text-xs font-mono" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm" style={{ background: ACCENT }} />
                  <span style={{ color: MUTED }}>Answered ({answered})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm border-2 relative" style={{ background: SURF2, borderColor: BORDER }}>
                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full" style={{ background: YELLOW }} />
                  </div>
                  <span style={{ color: MUTED }}>Flagged ({flagged.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-sm" style={{ background: SURF2, border: `1px solid ${BORDER}` }} />
                  <span style={{ color: MUTED }}>Unanswered</span>
                </div>
              </div>
              {/* Grid */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((_, i) => {
                    const isAns = answers[i] !== undefined;
                    const isFl  = flagged.has(i);
                    const isCur = i === current;
                    return (
                      <button key={i} onClick={() => { setCurrent(i); setShowNav(false); }}
                        className="w-full aspect-square text-xs font-black flex items-center justify-center transition-all hover:scale-105 relative"
                        style={{
                          background: isCur ? ACCENT : isAns ? `rgba(0,255,157,0.15)` : SURF2,
                          border: `1px solid ${isCur ? ACCENT : isAns ? `rgba(0,255,157,0.5)` : BORDER}`,
                          color: isCur ? "black" : MUTED,
                          borderRadius: "2px",
                        }}>
                        {i + 1}
                        {isFl && !isCur && (
                          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full" style={{ background: YELLOW }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-3 border-t" style={{ borderColor: BORDER }}>
                {/* Live score in navigator */}
                <div className="mb-3 text-center border py-2" style={{ borderColor: `rgba(0,255,157,0.2)`, background: `rgba(0,255,157,0.04)` }}>
                  <div className="text-lg font-black" style={{ color: ACCENT }}>{liveMarks}</div>
                  <div className="text-xs font-mono" style={{ color: MUTED }}>marks so far</div>
                </div>
                <button onClick={handleManualSubmit} className="w-full py-3 font-black uppercase tracking-widest text-sm border"
                  style={{ borderColor: RED, color: RED, background: "rgba(239,68,68,0.08)" }}>
                  Submit Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 6 — RESULT
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "result") {
    const scoreColor = accuracy >= 60 ? ACCENT : RED;

    return (
      <div className="min-h-screen font-['Space_Grotesk'] pt-0 pb-16 relative"
        style={{ background: BG, color: TXT }}>
        <XPPopupManager events={xpEvents} onRemove={(id) => setXpEvents((p) => p.filter((e) => e.id !== id))} />
        {levelUpInfo && <LevelUpModal level={levelUpInfo.level} emoji={levelUpInfo.emoji} xp={levelUpInfo.xp} totalXP={levelUpInfo.totalXP} onClose={() => setLevelUpInfo(null)} />}
        <BadgeQueueManager badges={badgeQueue} onRemove={(id) => setBadgeQueue((p) => p.filter((b) => b.id !== id))} />
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[200px] opacity-8 pointer-events-none"
          style={{ background: scoreColor }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8">

          {/* ── Score Card (downloadable) ── */}
          <div ref={scoreCardRef} className="border mb-8 overflow-hidden"
            style={{ background: BG, borderColor: `rgba(0,255,157,0.3)` }}>
            {/* Card header */}
            <div className="px-6 py-5 border-b flex items-center justify-between"
              style={{ background: SURF, borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center transform -skew-x-12"
                  style={{ background: ACCENT }}>
                  <Zap className="w-4 h-4 transform skew-x-12" style={{ color: "black" }} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>NEETAspire</p>
                  <p className="text-xs font-mono" style={{ color: MUTED }}>
                    {cls === "dropper" ? "Dropper" : `Class ${cls}`} · {cfg.label} · {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tabular-nums" style={{ color: scoreColor }}>{finalScore}</p>
                <p className="text-xs font-mono" style={{ color: MUTED }}>/ {finalMax}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y" style={{ borderColor: BORDER }}>
              {[
                { label: "Correct",    val: correct,         color: ACCENT },
                { label: "Wrong",      val: wrong,           color: RED },
                { label: "Skipped",    val: skipped,         color: MUTED },
                { label: "Accuracy",   val: `${accuracy}%`,  color: accuracy >= 60 ? ACCENT : RED },
              ].map(({ label, val, color }) => (
                <div key={label} className="px-5 py-5 text-center" style={{ borderColor: BORDER }}>
                  <div className="text-2xl font-black mb-1" style={{ color }}>{val}</div>
                  <div className="text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Rank + Time row */}
            <div className="grid grid-cols-2 border-t" style={{ borderColor: BORDER }}>
              <div className="px-5 py-4 border-r flex items-center gap-3" style={{ borderColor: BORDER }}>
                <Trophy className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />
                <div>
                  <p className="text-sm font-black" style={{ color: TXT }}>NEETAspire Rank #{mockRank}</p>
                  <p className="text-xs font-mono" style={{ color: MUTED }}>among all students this week</p>
                </div>
              </div>
              <div className="px-5 py-4 flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0" style={{ color: MUTED }} />
                <div>
                  <p className="text-sm font-black" style={{ color: TXT }}>{formatTime(timeTaken)}</p>
                  <p className="text-xs font-mono" style={{ color: MUTED }}>time taken</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mb-8">
            <button onClick={downloadScoreCard}
              className="flex-1 flex items-center justify-center gap-2 py-3 border font-black uppercase tracking-widest text-sm transition-all hover:opacity-80"
              style={{ borderColor: `rgba(0,255,157,0.3)`, color: ACCENT, background: `rgba(0,255,157,0.06)` }}>
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={shareToWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 border font-black uppercase tracking-widest text-sm transition-all hover:opacity-80"
              style={{ borderColor: `rgba(37,211,102,0.4)`, color: "#25D366", background: "rgba(37,211,102,0.06)" }}>
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>
          </div>

          {/* Chapter-wise breakdown */}
          {chapterBreakdown.length > 0 && (
            <div className="border mb-8" style={{ background: SURF, borderColor: BORDER }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: BORDER }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>Chapter-wise Performance</p>
              </div>
              <div className="divide-y" style={{ borderColor: BORDER }}>
                {chapterBreakdown.map(([ch, stat]) => {
                  const acc = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={ch} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: TXT }}>{ch}</p>
                        <p className="text-xs font-mono" style={{ color: MUTED }}>{stat.total} Q · {stat.correct} correct · {stat.wrong} wrong</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-black" style={{ color: acc >= 60 ? ACCENT : RED }}>{acc}%</span>
                      </div>
                      {/* Mini bar */}
                      <div className="w-20 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: SURF2 }}>
                        <div className="h-full rounded-full" style={{ width: `${acc}%`, background: acc >= 60 ? ACCENT : RED }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Post-test actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPhase("review")}
              className="flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm transition-all"
              style={{ background: `rgba(0,255,157,0.08)`, borderColor: `rgba(0,255,157,0.3)`, color: ACCENT }}>
              <BookOpen className="w-4 h-4" /> Review Answers
            </button>
            <button onClick={resetToSetup}
              className="flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm transition-all"
              style={{ background: SURF, borderColor: BORDER, color: MUTED }}>
              <RefreshCw className="w-4 h-4" /> New Test
            </button>
            <button onClick={() => setPhase("rules")}
              className="flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm transition-all"
              style={{ background: SURF, borderColor: BORDER, color: MUTED }}>
              <RotateCcw className="w-4 h-4" /> Reattempt
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm transition-all"
              style={{ background: SURF, borderColor: BORDER, color: MUTED }}>
              <Home className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCREEN 7 — REVIEW ALL ANSWERS
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "review") {
    const scoreColor = accuracy >= 60 ? ACCENT : RED;
    return (
      <div className="min-h-screen font-['Space_Grotesk'] pt-0 relative" style={{ background: BG, color: TXT }}>
        <div className="fixed inset-0 pointer-events-none" style={GRID_STYLE} />

        {/* Sticky header */}
        <div className="sticky top-0 z-50 border-b px-4 py-4 flex items-center justify-between gap-4"
          style={{ background: SURF, borderColor: BORDER }}>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black" style={{ color: scoreColor }}>{finalScore}/{finalMax}</div>
            <div className="text-xs font-mono flex gap-4" style={{ color: MUTED }}>
              <span style={{ color: ACCENT }}>✓ {correct}</span>
              <span style={{ color: RED }}>✗ {wrong}</span>
              <span>Skip {skipped}</span>
              <span>⏱ {formatTime(timeTaken)}</span>
            </div>
          </div>
          <button onClick={() => setPhase("result")}
            className="flex items-center gap-2 px-4 py-2 border text-xs font-black uppercase tracking-widest transition-all"
            style={{ borderColor: BORDER, color: MUTED }}>
            <ChevronLeft className="w-3.5 h-3.5" /> Results
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6" style={{ color: TXT }}>
            Answer Review — {questions.length} Questions
          </h2>

          {questions.map((q, i) => {
            const myAns    = answers[i];
            const isCorrect = myAns === q.correct;
            const isSkipped = myAns === undefined;
            const borderC  = isSkipped ? BORDER : isCorrect ? ACCENT : RED;
            const pyqYear  = q.meta?.year as string | undefined;

            return (
              <div key={i} className="border overflow-hidden" style={{ background: SURF, borderColor: borderC }}>
                <div className="flex items-center gap-3 px-5 py-3 border-b"
                  style={{ borderColor: BORDER, background: isCorrect ? "rgba(0,255,157,0.03)" : isSkipped ? "transparent" : "rgba(239,68,68,0.03)" }}>
                  <span className="font-black text-xs border px-2 py-0.5 shrink-0 transform -skew-x-12"
                    style={{ background: SURF2, borderColor: BORDER, color: MUTED }}>
                    <span className="transform skew-x-12 inline-block">Q{i + 1}</span>
                  </span>
                  {pyqYear && (
                    <span className="text-xs font-black border px-2 py-0.5 shrink-0"
                      style={{ color: ACCENT, borderColor: `rgba(0,255,157,0.3)` }}>
                      NEET {pyqYear}
                    </span>
                  )}
                  {isSkipped
                    ? <AlertCircle className="w-4 h-4 shrink-0" style={{ color: MUTED }} />
                    : isCorrect
                    ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
                    : <XCircle className="w-4 h-4 shrink-0" style={{ color: RED }} />}
                  <span className="text-xs font-mono truncate flex-1" style={{ color: MUTED }}>{q.chapter}</span>
                  <span className="text-xs font-black shrink-0"
                    style={{ color: isSkipped ? MUTED : isCorrect ? ACCENT : RED }}>
                    {isSkipped ? "Skipped" : isCorrect ? `+4` : `−1`}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: TXT }}>{q.question}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(["option1", "option2", "option3", "option4"] as const).map((opt, oi) => {
                      const label     = ["A", "B", "C", "D"][oi];
                      const isCorrectOpt = opt === q.correct;
                      const isMyOpt   = opt === myAns;
                      return (
                        <div key={opt} className="flex items-center gap-2 border px-3 py-2 text-xs"
                          style={{
                            background: isCorrectOpt ? "rgba(0,255,157,0.08)" : isMyOpt && !isCorrectOpt ? "rgba(239,68,68,0.08)" : SURF2,
                            borderColor: isCorrectOpt ? ACCENT : isMyOpt && !isCorrectOpt ? RED : BORDER,
                          }}>
                          <span className="font-black shrink-0 w-4" style={{ color: isCorrectOpt ? ACCENT : MUTED }}>{label}</span>
                          <span style={{ color: isCorrectOpt ? ACCENT : MUTED }}>{q[opt]}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="border-l-4 pl-3 mt-3" style={{ borderColor: ACCENT }}>
                      <p className="text-xs font-mono leading-relaxed" style={{ color: MUTED }}>
                        <strong style={{ color: ACCENT }}>Explanation: </strong>{q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-3 pt-4">
            <button onClick={resetToSetup}
              className="flex-1 flex items-center justify-center gap-2 py-4 border font-black uppercase tracking-widest text-sm"
              style={{ borderColor: BORDER, color: MUTED }}>
              <RotateCcw className="w-4 h-4" /> New Test
            </button>
            <button onClick={() => setPhase("result")}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black uppercase tracking-widest text-sm"
              style={{ background: ACCENT, color: "black" }}>
              Score Card <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
