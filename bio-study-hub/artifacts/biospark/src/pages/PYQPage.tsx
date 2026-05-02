import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, Filter, ChevronRight, Award, BookOpen, Calendar } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation?: string;
  chapter: string;
  difficulty: string;
  pyqYear?: number;
  examName?: string;
}

type Mode = "browse" | "attempt";
type FilterMode = "chapter" | "year";

function QuestionCard({ q, index, answered, onAnswer }: { q: Question; index: number; answered?: number; onAnswer: (idx: number) => void }) {
  const isCorrect = answered === q.correct;
  const tried = answered !== undefined;
  return (
    <div style={{ background: "#111111", border: `1px solid ${tried ? (isCorrect ? "#00FF9D33" : "#ff444433") : "#ffffff15"}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <span style={{ background: "#00FF9D15", color: "#00FF9D", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>NEET {q.pyqYear}</span>
        {q.examName && <span style={{ background: "#6366F115", color: "#818CF8", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>{q.examName}</span>}
        <span style={{ background: "#ffffff08", color: "#ffffff50", fontSize: 11, padding: "3px 8px", borderRadius: 6 }}>{q.chapter}</span>
      </div>
      <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}><strong style={{ color: "#ffffff80" }}>Q{index + 1}.</strong> {q.text}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "#ffffff08"; let border = "#ffffff15"; let color = "#ffffffcc";
          if (tried) {
            if (i === q.correct) { bg = "#00FF9D15"; border = "#00FF9D55"; color = "#00FF9D"; }
            else if (i === answered) { bg = "#ff444415"; border = "#ff444455"; color = "#ff6b6b"; }
          }
          return (
            <button key={i} onClick={() => !tried && onAnswer(i)}
              style={{ textAlign: "left", padding: "12px 16px", background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 14, cursor: tried ? "default" : "pointer", transition: "all 0.15s", lineHeight: 1.5 }}>
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
            </button>
          );
        })}
      </div>
      {tried && q.explanation && (
        <div style={{ marginTop: 16, background: "#00FF9D08", border: "1px solid #00FF9D22", borderRadius: 8, padding: "12px 16px" }}>
          <p style={{ color: "#00FF9D", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Explanation</p>
          <p style={{ color: "#ffffffaa", fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function PYQPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("chapter");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<Mode>("browse");

  const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { pyq: "true" };
    if (filterYear !== "all") params.year = filterYear;
    if (filterChapter !== "all") params.chapter = filterChapter;
    if (filterDiff !== "all") params.difficulty = filterDiff;
    api.get("/questions", params)
      .then((d: any) => setQuestions((d || []).filter((q: Question) => q.pyqYear)))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [filterYear, filterChapter, filterDiff]);

  const chapters = [...new Set(questions.map(q => q.chapter))].sort();
  const attempted = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(([qid, ans]) => {
    const q = questions.find(q => q.id === qid);
    return q && ans === q.correct;
  }).length;

  function handleAnswer(questionId: string, optIdx: number) {
    setAnswers(a => ({ ...a, [questionId]: optIdx }));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Previous Year Questions</h1>
              <p style={{ color: "#ffffff50", fontSize: 14 }}>NEET 2010–2024 — {questions.length} questions</p>
            </div>
            {attempted > 0 && (
              <div style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <p style={{ color: "#00FF9D", fontSize: 20, fontWeight: 800 }}>{correct}/{attempted}</p>
                <p style={{ color: "#ffffff50", fontSize: 12 }}>Correct so far</p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 4, background: "#ffffff08", borderRadius: 8, padding: 4, width: "fit-content", marginBottom: 20 }}>
            {(["chapter", "year"] as FilterMode[]).map(m => (
              <button key={m} onClick={() => setFilterMode(m)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filterMode === m ? "#00FF9D" : "transparent", color: filterMode === m ? "#000" : "#ffffff60", transition: "all 0.15s" }}>
                {m === "chapter" ? <><BookOpen size={13} style={{ display: "inline", marginRight: 6 }} />Chapter-wise</> : <><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Year-wise</>}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filterMode === "year" && (
              <select value={filterYear} onChange={e => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="all">All Years</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            {filterMode === "chapter" && chapters.length > 0 && (
              <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)}
                style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
                <option value="all">All Chapters</option>
                {chapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
              style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: "#111111", borderRadius: 10, height: 160 }} />)}
          </div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Award size={48} style={{ color: "#ffffff15", margin: "0 auto 16px" }} />
            <h3 style={{ color: "#ffffff40", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No PYQ Found</h3>
            <p style={{ color: "#ffffff25", fontSize: 14 }}>Try changing the filters or ask your admin to tag questions as PYQ.</p>
          </div>
        ) : (
          questions.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i} answered={answers[q.id]} onAnswer={(idx) => handleAnswer(q.id, idx)} />
          ))
        )}
      </div>
    </div>
  );
}
