import { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getChapters, fetchChaptersFromAPI } from "@/lib/chaptersManager";
import { parseNEETQuestionBank, parseGeneralNEET, ParsedQuestion } from "@/lib/pdfParser";
import { api } from "@/lib/api";
import {
  Upload, FileText, CheckCircle, CheckCircle2, AlertCircle, Loader2,
  ChevronDown, ChevronUp, Plus, BookOpen, Zap, ClipboardPaste
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls = "block text-xs text-white/50 mb-1 font-medium";

const TYPE_LABELS: Record<string, string> = {
  paragraph: "Passage",
  pointer_notes: "Revision Notes",
  mcq: "MCQ",
  match: "Match the Column",
  assertion: "Assertion-Reason",
  statements: "No. of Correct Statements",
  truefalse: "True / False",
  fillblanks: "Fill in the Blanks",
};

const TYPE_COLORS: Record<string, string> = {
  paragraph: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  pointer_notes: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  mcq: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  match: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  assertion: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  statements: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  truefalse: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  fillblanks: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
};

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const itemsByY: Map<number, Array<{ x: number; str: string }>> = new Map();
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!itemsByY.has(y)) itemsByY.set(y, []);
      itemsByY.get(y)!.push({ x: (item as any).transform[4], str: (item as any).str });
    }

    const sortedYs = [...itemsByY.keys()].sort((a, b) => b - a);
    const lines = sortedYs.map((y) => {
      const items = itemsByY.get(y)!.sort((a, b) => a.x - b.x);
      return items.map((it) => it.str).join(" ").trim();
    });

    pages.push(lines.filter(Boolean).join("\n"));
  }

  return pages.join("\n");
}

interface QRowProps {
  q: ParsedQuestion;
  idx: number;
  selected: boolean;
  onToggle: () => void;
  onChange: (q: ParsedQuestion) => void;
}

function QRow({ q, idx, selected, onToggle, onChange }: QRowProps) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[q.type] ?? "text-white/50 bg-white/5 border-white/10";

  return (
    <div className={`border rounded-xl transition-all ${selected ? "border-[#00FF9D]/30 bg-[#00FF9D]/5" : "border-white/8 bg-white/3"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 accent-[#00FF9D] cursor-pointer"
        />
        <span className="text-white/30 text-xs w-6 shrink-0">#{idx + 1}</span>
        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md shrink-0 ${typeColor}`}>
          {TYPE_LABELS[q.type] ?? q.type}
        </span>
        <p className="text-sm text-white/80 flex-1 truncate">{q.question}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${
          q.difficulty === "easy" ? "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20" :
          q.difficulty === "hard" ? "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20" :
          "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20"
        }`}>
          {q.difficulty}
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/30 hover:text-white transition-colors ml-1"
        >
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
          {["mcq", "match", "assertion", "statements", "truefalse", "fillblanks"].includes(q.type) && (
            <div className="grid grid-cols-2 gap-2">
              {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => (
                <div key={opt}>
                  <label className={labelCls}>{String.fromCharCode(65 + i)})</label>
                  <input
                    value={q[opt]}
                    onChange={(e) => onChange({ ...q, [opt]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className={labelCls}>Correct Answer</label>
                <select
                  value={q.correct}
                  onChange={(e) => onChange({ ...q, correct: e.target.value })}
                  className={selectCls}
                >
                  <option value="option1">A) {q.option1?.slice(0, 40)}</option>
                  <option value="option2">B) {q.option2?.slice(0, 40)}</option>
                  <option value="option3">C) {q.option3?.slice(0, 40)}</option>
                  <option value="option4">D) {q.option4?.slice(0, 40)}</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className={labelCls}>Difficulty</label>
            <select
              value={q.difficulty}
              onChange={(e) => onChange({ ...q, difficulty: e.target.value })}
              className={selectCls}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuestionReviewProps {
  questions: ParsedQuestion[];
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
  setQuestions: React.Dispatch<React.SetStateAction<ParsedQuestion[]>>;
  saving: boolean;
  saveResult: { added: number; failed: number } | null;
  parsedFormat: "bioprep" | "general" | null;
  typeCounts: Record<string, number>;
  onToggleAll: () => void;
  onAddToWebsite: () => void;
  badge: string;
  badgeColor: string;
}

function QuestionReview({
  questions, selected, setSelected, setQuestions,
  saving, saveResult, parsedFormat, typeCounts,
  onToggleAll, onAddToWebsite, badge, badgeColor,
}: QuestionReviewProps) {
  return (
    <div className="bg-[#07111f] border border-white/8 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white text-sm font-semibold">
              Review & Add ({selected.size} of {questions.length} selected)
            </h3>
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${badgeColor}`}>
              {parsedFormat === "bioprep" ? "BioPrep Format" : parsedFormat === "general" ? "Standard NEET Format" : badge}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {Object.entries(typeCounts).map(([type, count]) => (
              <span key={type} className={`text-[10px] font-medium border px-2 py-0.5 rounded-md ${TYPE_COLORS[type] ?? ""}`}>
                {count} × {TYPE_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAll}
            className="text-xs text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:bg-white/5"
          >
            {selected.size === questions.length ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={onAddToWebsite}
            disabled={saving || selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FF9D] text-black text-sm font-bold hover:bg-[#00e5a0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
            ) : (
              <><Plus className="w-4 h-4" /> Add {selected.size} to Website</>
            )}
          </button>
        </div>
      </div>

      {saveResult && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
          saveResult.failed > 0 ? "bg-red-500/10 border border-red-500/20" : "bg-[#00FF9D]/10 border border-[#00FF9D]/20"
        }`}>
          {saveResult.failed > 0
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-[#00FF9D] shrink-0" />
          }
          <p className="text-sm text-white">
            {saveResult.added > 0 && <span className="text-[#00FF9D] font-semibold">{saveResult.added} questions added to website! </span>}
            {saveResult.failed > 0 && <span className="text-red-300">{saveResult.failed} failed — check database connection.</span>}
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
              if (next.has(i)) next.delete(i);
              else next.add(i);
              setSelected(next);
            }}
            onChange={(updated) => setQuestions((prev) => prev.map((x, j) => j === i ? updated : x))}
          />
        ))}
      </div>
    </div>
  );
}

function RegexImporter({ chapter, subunit, cls, questionType }: { chapter: string; subunit: string; cls: string; questionType: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ added: number; failed: number } | null>(null);
  const [parsedFormat, setParsedFormat] = useState<"bioprep" | "general" | null>(null);

  async function processFile(file: File) {
    if (!file.name.endsWith(".pdf")) { setParseError("Please upload a PDF file."); return; }
    setFileName(file.name);
    setParsing(true);
    setParseError(null);
    setQuestions([]);
    setSelected(new Set());
    setSaveResult(null);
    setParsedFormat(null);

    try {
      const text = await extractTextFromPDF(file);
      let result = parseNEETQuestionBank(text, chapter, subunit, cls);
      let format: "bioprep" | "general" = "bioprep";
      if (result.questions.length === 0) {
        result = parseGeneralNEET(text, chapter, subunit, cls);
        format = "general";
      }
      if (result.questions.length === 0) {
        setParseError(
          "No questions detected. The PDF may use an unsupported layout. " +
          "Try the AI Extract tab for better results with complex PDFs."
        );
      } else {
        const qs = result.questions.map((q) => ({
          ...q,
          chapter: chapter || q.chapter,
          subunit: subunit || result.subUnit || q.subunit,
          class: cls,
        }));
        setQuestions(qs);
        setSelected(new Set(qs.map((_, i) => i)));
        setParsedFormat(format);
      }
    } catch (err) {
      setParseError("Failed to read the PDF. " + (err instanceof Error ? err.message : ""));
    } finally {
      setParsing(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [chapter, subunit, cls]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  function toggleAll() {
    if (selected.size === questions.length) setSelected(new Set());
    else setSelected(new Set(questions.map((_, i) => i)));
  }

  async function addToWebsite() {
    const toAdd = questions.filter((_, i) => selected.has(i));
    if (toAdd.length === 0) return;
    if (!chapter) { alert("Please select a chapter first (Step 1)."); return; }
    if (!subunit) { alert("Please select a subtopic first (Step 1).\n\nQuestions need a subtopic to appear in the correct section on the website."); return; }
    setSaving(true);
    setSaveResult(null);
    let added = 0, failed = 0;
    const batch = toAdd.map((q) => ({
      question: q.question, option1: q.option1, option2: q.option2,
      option3: q.option3, option4: q.option4, correct: q.correct,
      type: questionType || q.type, difficulty: q.difficulty, explanation: q.explanation,
      subject: q.subject, chapter: chapter || q.chapter, subunit: subunit || q.subunit,
      class: cls || q.class, is_active: true, meta: q.meta,
    }));
    try {
      await api.post("/questions", batch);
      added = toAdd.length;
    } catch (err) {
      failed = toAdd.length;
      console.error("Insert error:", err);
    }
    setSaveResult({ added, failed });
    setSaving(false);
    if (added > 0) {
      setSelected(new Set());
      setQuestions((prev) => prev.filter((_, i) => !selected.has(i)));
    }
  }

  const typeCounts: Record<string, number> = {};
  for (const q of questions) typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1;

  return (
    <div className="space-y-4">
      <div className="bg-[#07111f] border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-white text-sm font-semibold">Upload PDF</h3>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            dragging ? "border-[#00FF9D] bg-[#00FF9D]/5" : "border-white/15 hover:border-white/30 hover:bg-white/3"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onFileChange} />
          {parsing ? (
            <>
              <Loader2 className="w-10 h-10 text-[#00FF9D] animate-spin" />
              <p className="text-white font-medium">Reading PDF & parsing questions…</p>
              <p className="text-white/40 text-sm">This takes just a few seconds</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#00FF9D]/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-[#00FF9D]" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Drop your PDF here or click to browse</p>
                <p className="text-white/40 text-sm mt-1">BioPrep format — same as the sample provided</p>
              </div>
              {fileName && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <FileText className="w-4 h-4 text-[#00FF9D]" />
                  <span className="text-white/70 text-sm">{fileName}</span>
                </div>
              )}
            </>
          )}
        </div>

        {parseError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{parseError}</p>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <QuestionReview
          questions={questions}
          selected={selected}
          setSelected={setSelected}
          setQuestions={setQuestions}
          saving={saving}
          saveResult={saveResult}
          parsedFormat={parsedFormat}
          typeCounts={typeCounts}
          onToggleAll={toggleAll}
          onAddToWebsite={addToWebsite}
          badge="Regex Parser"
          badgeColor="text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20"
        />
      )}
    </div>
  );
}

function TextImporter({ chapter, subunit, cls, questionType }: { chapter: string; subunit: string; cls: string; questionType: string }) {
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ added: number; failed: number } | null>(null);
  const [parsedFormat, setParsedFormat] = useState<"bioprep" | "general" | null>(null);

  function parseText() {
    if (!rawText.trim()) { setParseError("Please paste some text first."); return; }
    setParsing(true);
    setParseError(null);
    setQuestions([]);
    setSelected(new Set());
    setSaveResult(null);
    setParsedFormat(null);

    setTimeout(() => {
      try {
        let result = parseNEETQuestionBank(rawText, chapter, subunit, cls);
        let format: "bioprep" | "general" = "bioprep";
        if (result.questions.length === 0) {
          result = parseGeneralNEET(rawText, chapter, subunit, cls);
          format = "general";
        }
        if (result.questions.length === 0) {
          setParseError("No questions detected. Try formatting MCQs like:\n\n1. Question text\n(a) Option A  (b) Option B  (c) Option C  (d) Option D\nAns: (a)");
        } else {
          const qs = result.questions.map((q) => ({
            ...q,
            chapter: chapter || q.chapter,
            subunit: subunit || result.subUnit || q.subunit,
            class: cls,
          }));
          setQuestions(qs);
          setSelected(new Set(qs.map((_, i) => i)));
          setParsedFormat(format);
        }
      } catch (err) {
        setParseError("Parsing error: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setParsing(false);
      }
    }, 50);
  }
  async function autoParseWithAI() {
  try {
    if (!rawText.trim()) {
      setParseError("Paste text first");
      return;
    }

    setParsing(true);
    setParseError(null);

    const formatUrl = (import.meta.env.VITE_API_URL ?? "") + "/format";
    const res = await fetch(formatUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: rawText }),
    });

    const data = await res.json();

    if (!data.text) {
      setParseError("AI failed");
      return;
    }

    let result = parseNEETQuestionBank(data.text, chapter, subunit, cls);

    if (result.questions.length === 0) {
      result = parseGeneralNEET(data.text, chapter, subunit, cls);
    }

    if (result.questions.length === 0) {
      setParseError("Still failed after AI");
      return;
    }

    const qs = result.questions.map((q) => ({
      ...q,
      chapter: chapter || q.chapter,
      subunit: subunit || result.subUnit || q.subunit,
      class: cls,
    }));

    setQuestions(qs);
    setSelected(new Set(qs.map((_, i) => i)));

  } catch (err) {
    console.error(err);
    setParseError("AI parsing failed");
  } finally {
    setParsing(false);
  }
}
  function toggleAll() {
    if (selected.size === questions.length) setSelected(new Set());
    else setSelected(new Set(questions.map((_, i) => i)));
  }

  async function addToWebsite() {
    const toAdd = questions.filter((_, i) => selected.has(i));
    if (toAdd.length === 0) return;
    if (!chapter) { alert("Please select a chapter first (Step 1)."); return; }
    if (!subunit) { alert("Please select a subtopic first (Step 1).\n\nQuestions need a subtopic to appear in the correct section on the website."); return; }
    setSaving(true);
    setSaveResult(null);
    let added = 0, failed = 0;
    const batch = toAdd.map((q) => ({
      question: q.question, option1: q.option1, option2: q.option2,
      option3: q.option3, option4: q.option4, correct: q.correct,
      type: questionType || q.type, difficulty: q.difficulty, explanation: q.explanation,
      subject: q.subject, chapter: chapter || q.chapter, subunit: subunit || q.subunit,
      class: cls || q.class, is_active: true, meta: q.meta,
    }));
    try {
      await api.post("/questions", batch);
      added = toAdd.length;
    } catch (err) {
      failed = toAdd.length;
      console.error("Insert error:", err);
    }
    setSaveResult({ added, failed });
    setSaving(false);
    if (added > 0) {
      setSelected(new Set());
      setQuestions((prev) => prev.filter((_, i) => !selected.has(i)));
    }
  }

  const typeCounts: Record<string, number> = {};
  for (const q of questions) typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1;

  return (
    <div className="space-y-4">
      <div className="bg-[#00FF9D]/5 border border-[#00FF9D]/20 rounded-2xl px-5 py-4 flex items-start gap-3">
        <ClipboardPaste className="w-5 h-5 text-[#00FF9D] mt-0.5 shrink-0" />
        <div>
          <p className="text-white text-sm font-medium">Paste Text Importer</p>
          <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
            Paste MCQs, revision notes, or passages directly as plain text. Supports standard NEET MCQ format and BioPrep format. No file needed.
          </p>
        </div>
      </div>

      <div className="bg-[#07111f] border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Paste Your Text</h3>
          <span className="text-white/30 text-xs">{rawText.length} characters</span>
        </div>
        <textarea
          value={rawText}
          onChange={(e) => { setRawText(e.target.value); setParseError(null); }}
          placeholder={"Paste MCQs, notes, or passages here…\n\nExample MCQ format:\n1. Which organelle is called the powerhouse of the cell?\n(a) Nucleus  (b) Mitochondria  (c) Ribosome  (d) Golgi body\nAns: (b)\n\nExample notes:\n• Mitochondria produces ATP via oxidative phosphorylation\n• Double membrane-bound organelle"}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50 resize-y font-mono leading-relaxed"
          rows={14}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={parseText}
            disabled={parsing || !rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] text-sm font-semibold hover:bg-[#00FF9D]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {parsing ? "Parsing…" : "Parse Questions"}
          </button>
          <button
            onClick={autoParseWithAI}
            disabled={parsing || !rawText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-all disabled:opacity-50"
          >
            🤖 AI Auto Parse
          </button>
          {rawText && (
            <button
              onClick={() => { setRawText(""); setQuestions([]); setParseError(null); setSaveResult(null); }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {parseError && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <pre className="text-red-300 text-sm whitespace-pre-wrap font-sans">{parseError}</pre>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <QuestionReview
          questions={questions}
          selected={selected}
          setSelected={setSelected}
          setQuestions={setQuestions}
          saving={saving}
          saveResult={saveResult}
          parsedFormat={parsedFormat}
          typeCounts={typeCounts}
          onToggleAll={toggleAll}
          onAddToWebsite={addToWebsite}
          badge="Text Parser"
          badgeColor="text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20"
        />
      )}
    </div>
  );
}

export function AdminPDFImport() {
  const [activeTab, setActiveTab] = useState<"regex" | "text">("regex");

  const [chapter, setChapter] = useState("");
  const [subunit, setSubunit] = useState("");
  const [cls, setCls] = useState("11");
  const [questionType, setQuestionType] = useState("");
  const [, setChaptersLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchChaptersFromAPI("11").catch(() => {}),
      fetchChaptersFromAPI("12").catch(() => {}),
    ]).then(() => setChaptersLoaded(true));
  }, []);

  const chapters11 = getChapters("11");
  const chapters12 = getChapters("12");
  const allChapters = cls === "11" ? chapters11 : chapters12;
  const selectedChapter = allChapters.find((c) => c.id === chapter);
  const subunits: string[] = selectedChapter?.subunits ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#00FF9D]/5 border border-[#00FF9D]/20 rounded-2xl px-6 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00FF9D]/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-[#00FF9D]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm mb-0.5">Question Importer</h2>
          <p className="text-white/50 text-xs leading-relaxed">
            Select chapter, subtopic & type — then paste or upload questions to add them directly to the practice website.
          </p>
        </div>
      </div>

      {/* Chapter selector */}
      <div className="bg-[#07111f] border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-white text-sm font-semibold">Step 1 — Select Chapter, Subtopic & Question Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Class <span className="text-red-400">*</span></label>
            <select value={cls} onChange={(e) => { setCls(e.target.value); setChapter(""); setSubunit(""); }} className={selectCls}>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Chapter <span className="text-red-400">*</span></label>
            <select value={chapter} onChange={(e) => { setChapter(e.target.value); setSubunit(""); }} className={selectCls}>
              <option value="">— Select Chapter —</option>
              {allChapters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Subtopic</label>
            <select
              value={subunit}
              onChange={(e) => setSubunit(e.target.value)}
              className={selectCls}
              disabled={subunits.length === 0}
            >
              <option value="">— Select Subtopic —</option>
              {subunits.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {subunits.length === 0 && chapter && (
              <p className="text-white/30 text-xs mt-1">No subtopics defined for this chapter</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Question Type (override)</label>
            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className={selectCls}>
              <option value="">— Auto-detect from text —</option>
              <option value="mcq">MCQ</option>
              <option value="assertion">Assertion-Reason</option>
              <option value="match">Match the Column</option>
              <option value="statements">No. of Correct Statements</option>
              <option value="truefalse">True / False</option>
              <option value="fillblanks">Fill in the Blanks</option>
              <option value="paragraph">Passage</option>
              <option value="pointer_notes">Revision Notes</option>
            </select>
          </div>
        </div>
        {(!chapter || !subunit) && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <AlertCircle className="w-4 h-4 text-white/70 shrink-0" />
            <p className="text-white/70 text-xs">
              {!chapter
                ? "Select a chapter and subtopic before adding questions."
                : "Select a subtopic — questions need a subtopic to appear in the right section on the website."}
            </p>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("regex")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "regex"
              ? "bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
              : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/8"
          }`}
        >
          <Zap className="w-4 h-4" />
          PDF Parser (Free)
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "text"
              ? "bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
              : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/8"
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "text" ? (
        <TextImporter chapter={chapter} subunit={subunit} cls={cls} questionType={questionType} />
      ) : (
        <RegexImporter chapter={chapter} subunit={subunit} cls={cls} questionType={questionType} />
      )}
    </div>
  );
}
