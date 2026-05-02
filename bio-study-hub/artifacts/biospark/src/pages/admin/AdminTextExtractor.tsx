import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { fetchChaptersFromAPI } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";
import {
  Sparkles, ChevronDown, ChevronUp, Plus, AlertCircle, Loader2, CheckCircle, Zap,
} from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

async function wakeUpBackend(): Promise<boolean> {
  const healthUrl = API_ORIGIN ? `${API_ORIGIN}/healthz` : "/healthz";
  for (let attempt = 0; attempt < 4; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(healthUrl, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return true;
    } catch {
      clearTimeout(timer);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 8000));
    }
  }
  return false;
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls = "block text-xs text-white/50 mb-1 font-medium";

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  assertion: "Assertion-Reason",
  match: "Match the Column",
  statements: "Statements",
  truefalse: "True/False",
  fillblanks: "Fill in the Blanks",
  table_based: "Table Based",
};

const TYPE_COLORS: Record<string, string> = {
  mcq: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  assertion: "text-[#ff4444] bg-[#ff4444]/10 border-[#ff4444]/20",
  match: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  statements: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  truefalse: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  fillblanks: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  table_based: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
};

interface ExtractedQuestion {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  type: string;
  difficulty: string;
  explanation: string;
  subject: string;
  chapter: string;
  subunit: string;
  class: string;
  is_active: boolean;
}

function QRow({ q, idx, selected, onToggle, onChange }: {
  q: ExtractedQuestion;
  idx: number;
  selected: boolean;
  onToggle: () => void;
  onChange: (q: ExtractedQuestion) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[q.type] ?? "text-white/50 bg-white/5 border-white/10";

  return (
    <div className={`border rounded-xl transition-all ${selected ? "border-[#00FF9D]/30 bg-[#00FF9D]/5" : "border-white/8 bg-white/3"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input type="checkbox" checked={selected} onChange={onToggle} className="w-4 h-4 accent-[#00FF9D] cursor-pointer shrink-0" />
        <span className="text-white/30 text-xs w-6 shrink-0">#{idx + 1}</span>
        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md shrink-0 ${typeColor}`}>
          {TYPE_LABELS[q.type] ?? q.type}
        </span>
        <p className="text-sm text-white/80 flex-1 truncate">{q.question}</p>
        <button onClick={() => setExpanded(!expanded)} className="text-white/30 hover:text-white transition-colors ml-1 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">
          <div>
            <label className={labelCls}>Question</label>
            <textarea
              value={q.question}
              onChange={(e) => onChange({ ...q, question: e.target.value })}
              className={`${inputCls} resize-y min-h-[80px]`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => (
              <div key={opt}>
                <label className={labelCls}>{String.fromCharCode(65 + i)})</label>
                <input value={q[opt]} onChange={(e) => onChange({ ...q, [opt]: e.target.value })} className={inputCls} />
              </div>
            ))}
            <div className="col-span-2">
              <label className={labelCls}>Correct Answer</label>
              <select value={q.correct} onChange={(e) => onChange({ ...q, correct: e.target.value })} className={selectCls}>
                <option value="option1">A) {q.option1?.slice(0, 60)}</option>
                <option value="option2">B) {q.option2?.slice(0, 60)}</option>
                <option value="option3">C) {q.option3?.slice(0, 60)}</option>
                <option value="option4">D) {q.option4?.slice(0, 60)}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={q.type} onChange={(e) => onChange({ ...q, type: e.target.value })} className={selectCls}>
                {Object.entries(TYPE_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select value={q.difficulty} onChange={(e) => onChange({ ...q, difficulty: e.target.value })} className={selectCls}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Explanation (optional)</label>
            <input value={q.explanation} onChange={(e) => onChange({ ...q, explanation: e.target.value })} className={inputCls} placeholder="Leave blank if none" />
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminTextExtractor() {
  const [cls, setCls] = useState<"11" | "12">("11");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapter, setChapter] = useState("");
  const [subunit, setSubunit] = useState("");
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ added: number; failed: number } | null>(null);

  useEffect(() => {
    fetchChaptersFromAPI(cls).then((chs) => {
      setChapters(chs);
      setChapter("");
      setSubunit("");
    });
  }, [cls]);

  const selectedChapter = chapters.find((c) => c.name === chapter);
  const subunits = selectedChapter?.subunits ?? [];

  async function handleExtract() {
    if (!rawText.trim()) { setExtractError("Please paste some question text first."); return; }
    if (!chapter) { setExtractError("Please select a chapter first."); return; }
    setExtracting(true);
    setExtractError(null);
    setExtractStatus("Connecting to backend server…");
    setQuestions([]);
    setSelected(new Set());
    setSaveResult(null);

    try {
      const alive = await wakeUpBackend();
      if (!alive) {
        setExtractError("Backend server didn't respond. Please wait 30 seconds and try again (free server wakes up slowly).");
        return;
      }

      setExtractStatus("Sending to Gemini AI — this may take a few seconds…");

      const res = await api.post("/pdf-extract", {
        text: rawText,
        chapter,
        subunit,
        class: cls,
      }) as { questions: ExtractedQuestion[]; count: number };

      if (!res.questions || res.questions.length === 0) {
        setExtractError("Gemini couldn't extract any questions. Check that the text contains MCQs or supported question types.");
        return;
      }
      setQuestions(res.questions);
      setSelected(new Set(res.questions.map((_, i) => i)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractError(msg || "Extraction failed. Check your Gemini API key in Credentials.");
    } finally {
      setExtracting(false);
      setExtractStatus(null);
    }
  }

  async function addToWebsite() {
    const toAdd = questions.filter((_, i) => selected.has(i));
    if (toAdd.length === 0) return;
    if (!chapter) { alert("Select a chapter first."); return; }

    const selectedSet = new Set(selected);
    setSaving(true);
    setSaveResult(null);
    try {
      await api.post("/questions", toAdd);
      setSaveResult({ added: toAdd.length, failed: 0 });
      setSelected(new Set());
      setQuestions((prev) => prev.filter((_, i) => !selectedSet.has(i)));
    } catch {
      setSaveResult({ added: 0, failed: toAdd.length });
    } finally {
      setSaving(false);
    }
  }

  function toggleAll() {
    if (selected.size === questions.length) setSelected(new Set());
    else setSelected(new Set(questions.map((_, i) => i)));
  }

  const typeCounts: Record<string, number> = {};
  for (const q of questions) typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Question Extractor</h1>
        <p className="text-white/40 text-sm mt-1">
          Paste any raw question text — Gemini AI reads it, extracts every question, and prepares them to add to MongoDB
        </p>
      </div>

      {/* Step 1 */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-[#00FF9D] text-black text-[10px] font-black flex items-center justify-center shrink-0">1</div>
          <h3 className="text-white font-semibold text-sm">Select Chapter & Class</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Class</label>
            <select value={cls} onChange={(e) => setCls(e.target.value as "11" | "12")} className={selectCls}>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Chapter <span className="text-red-400">*</span></label>
            <select value={chapter} onChange={(e) => { setChapter(e.target.value); setSubunit(""); }} className={selectCls}>
              <option value="">— Select Chapter —</option>
              {chapters.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Subtopic (optional)</label>
            <select value={subunit} onChange={(e) => setSubunit(e.target.value)} className={selectCls} disabled={!chapter}>
              <option value="">— Select Subtopic —</option>
              {subunits.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#00FF9D] text-black text-[10px] font-black flex items-center justify-center shrink-0">2</div>
            <div>
              <h3 className="text-white font-semibold text-sm">Paste Question Text</h3>
              <p className="text-white/30 text-xs mt-0.5">Any format works — Gemini understands all common MCQ layouts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rawText.trim() && (
              <span className="text-white/30 text-xs">{rawText.length.toLocaleString()} chars</span>
            )}
            <button
              onClick={() => { setRawText(""); setQuestions([]); setExtractError(null); setSaveResult(null); }}
              className="text-xs text-white/30 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5"
            >
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"Paste questions here in any format. For example:\n\n1. The powerhouse of the cell is?\n   (a) Nucleus  (b) Mitochondria  (c) Ribosome  (d) Golgi body\nAnswer: (b)\n\n2. DNA replication is...\n..."}
          className="w-full bg-[#060f1c] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50 resize-y min-h-[220px] font-mono leading-relaxed placeholder:text-white/20"
        />

        <button
          onClick={handleExtract}
          disabled={extracting || !rawText.trim()}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {extracting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <span>{extractStatus ?? "Working…"}</span>
            </>
          ) : (
            <><Sparkles className="w-5 h-5" /> Extract Questions with Gemini AI</>
          )}
        </button>

        {extracting && extractStatus?.startsWith("Connecting") && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <Zap className="w-4 h-4 text-white/70 shrink-0" />
            <p className="text-white/70 text-xs">
              Backend server may be waking up from sleep — this can take up to 30 seconds on first use.
            </p>
          </div>
        )}

        {extractError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{extractError}</p>
          </div>
        )}
      </div>

      {/* Step 3 - Review */}
      {questions.length > 0 && (
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#00FF9D] text-black text-[10px] font-black flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Review & Save ({selected.size} of {questions.length} selected)
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <span key={type} className={`text-[10px] font-medium border px-2 py-0.5 rounded-md ${TYPE_COLORS[type] ?? ""}`}>
                      {count} × {TYPE_LABELS[type] ?? type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="text-xs text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5"
              >
                {selected.size === questions.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={addToWebsite}
                disabled={saving || selected.size === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00FF9D] text-black text-sm font-bold hover:bg-[#00e5a0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Saving…" : `Add ${selected.size} to Website`}
              </button>
            </div>
          </div>

          {saveResult && (
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              saveResult.failed > 0
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-[#00FF9D]/10 border border-[#00FF9D]/20"
            }`}>
              {saveResult.failed > 0
                ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                : <CheckCircle className="w-4 h-4 text-[#00FF9D] shrink-0" />
              }
              <p className="text-sm text-white">
                {saveResult.added > 0 && (
                  <span className="text-[#00FF9D] font-semibold">{saveResult.added} questions added to website! </span>
                )}
                {saveResult.failed > 0 && (
                  <span className="text-red-300">{saveResult.failed} failed — check database connection.</span>
                )}
              </p>
            </div>
          )}

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {questions.map((q, i) => (
              <QRow
                key={i}
                q={q}
                idx={i}
                selected={selected.has(i)}
                onToggle={() => {
                  const next = new Set(selected);
                  if (next.has(i)) next.delete(i); else next.add(i);
                  setSelected(next);
                }}
                onChange={(updated) => setQuestions((prev) => prev.map((x, j) => j === i ? updated : x))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
