import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { fetchChaptersFromAPI } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";
import { FileText, Zap, CheckCircle, AlertCircle, Loader2, Eye, BookOpen, StickyNote } from "lucide-react";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls = "block text-xs text-white/50 mb-1 font-medium uppercase tracking-wider";

const ANS_MAP: Record<string, string> = { A: "option1", B: "option2", C: "option3", D: "option4" };

const TYPE_MAP: Record<string, string> = {
  "STANDARD MCQ": "mcq",
  "ASSERTION REASON": "assertion",
  "NO. OF CORRECT STATEMENTS": "statements",
  "TRUE / FALSE": "truefalse",
  "MATCH THE COLUMN": "match",
  "FILL IN THE BLANKS": "fillblanks",
  "CASE STUDY": "case_study",
  "DIAGRAM BASED": "diagram",
  "SEQUENCE": "sequence",
  "PREVIOUS YEAR": "pyq",
  "PREVIOUS YEAR QUESTIONS": "pyq",
  "PREVIOUS YEAR (PYQ)": "pyq",
};

const NOTE_TYPES = new Set(["PARAGRAPH STUDY", "POINTER NOTES STUDY", "TRICKS & MNEMONICS", "MNEMONICS"]);

const AR_OPTIONS = {
  option1: "Both A & R are true — R is the correct explanation of A",
  option2: "Both A & R are true — R is NOT the correct explanation of A",
  option3: "A is true, R is false",
  option4: "A is false, R is true",
};

interface ParsedQuestion {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  type: string;
  difficulty: string;
  explanation: string;
}

interface ParsedNote {
  title: string;
  content: string;
}

interface ParseResult {
  questions: ParsedQuestion[];
  notes: ParsedNote[];
  detectedChapter: string;
  detectedSubunit: string;
}

function extractAnswerLetter(ansLine: string): string {
  const m = ansLine.match(/Ans\s*:\s*([A-D])/i);
  return m ? m[1].toUpperCase() : "";
}

function parseTypeBlock(typeName: string, blockText: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const qType = Object.entries(TYPE_MAP).find(([k]) =>
    typeName.toUpperCase().includes(k)
  )?.[1] ?? "mcq";

  const raw = blockText.replace(/^---+\s*/gm, "---\n").trim();
  const qBlocks = raw.split(/^---$/m).map((b) => b.trim()).filter(Boolean);

  for (const block of qBlocks) {
    if (!block.match(/^Q\s*\d+/im) && !block.match(/Ans\s*:/i)) continue;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const ansIdx = lines.findLastIndex((l) => /^Ans\s*:/i.test(l));
    if (ansIdx === -1) continue;

    const ansLetter = extractAnswerLetter(lines[ansIdx]);
    if (!ansLetter) continue;
    const correct = ANS_MAP[ansLetter] || "option1";

    if (qType === "assertion") {
      const assertionLine = lines.find((l) => /^Assertion\s*:/i.test(l)) || "";
      const reasonLine = lines.find((l) => /^Reason\s*:/i.test(l)) || "";
      if (!assertionLine && !reasonLine) continue;
      questions.push({
        question: `${assertionLine}\n${reasonLine}`.trim(),
        ...AR_OPTIONS,
        correct,
        type: "assertion",
        difficulty: "medium",
        explanation: "",
      });
      continue;
    }

    const optionLines: string[] = [];
    const questionLines: string[] = [];
    let inOptions = false;

    for (let i = 0; i < ansIdx; i++) {
      const l = lines[i];
      if (/^[A-D]\)/i.test(l)) {
        inOptions = true;
        optionLines.push(l.replace(/^[A-D]\)\s*/i, "").trim());
      } else if (!inOptions) {
        if (!/^Q\s*\d+\.?\s*$/i.test(l)) {
          questionLines.push(l.startsWith("Q") && /^Q\s*\d+\./i.test(l) ? l.replace(/^Q\s*\d+\.\s*/i, "").trim() : l);
        }
      }
    }

    const question = questionLines.filter(Boolean).join("\n").trim();
    if (!question) continue;

    questions.push({
      question,
      option1: optionLines[0] || "",
      option2: optionLines[1] || "",
      option3: optionLines[2] || "",
      option4: optionLines[3] || "",
      correct,
      type: qType,
      difficulty: "medium",
      explanation: "",
    });
  }

  return questions;
}

function parseNoteBlock(typeName: string, blockText: string): ParsedNote {
  const clean = blockText
    .replace(/^-{5,}\s*/gm, "")
    .replace(/^TYPE\s+\d+\s*—\s*.+$/im, "")
    .trim();

  return {
    title: typeName
      .replace(/^TYPE\s+\d+\s*—\s*/i, "")
      .replace(/_/g, " ")
      .trim(),
    content: clean,
  };
}

function parseFullText(rawText: string): ParseResult {
  const questions: ParsedQuestion[] = [];
  const notes: ParsedNote[] = [];

  let detectedChapter = "";
  let detectedSubunit = "";

  const headerLines = rawText.split("\n").slice(0, 10);
  for (const l of headerLines) {
    const t = l.trim();
    if (t.includes("·") || t.includes("Chapter")) {
      const parts = t.split(/·|Chapter\s*\d+\s*/);
      const candidate = parts[parts.length - 1]?.trim();
      if (candidate && candidate.length > 3) detectedChapter = candidate;
    }
    if (/SUBTOPIC\s*:/i.test(t)) {
      detectedSubunit = t.replace(/SUBTOPIC\s*:\s*/i, "").trim();
    }
  }

  const sectionRegex = /^-{10,}\s*\n(TYPE\s+\d+\s*—\s*[^\n]+)\s*\n-{10,}/gim;
  const matches = [...rawText.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const typeName = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? rawText.length) : rawText.length;
    const blockText = rawText.slice(start, end).trim();

    const upperType = typeName.replace(/^TYPE\s+\d+\s*—\s*/i, "").trim().toUpperCase();

    if (NOTE_TYPES.has(upperType)) {
      notes.push(parseNoteBlock(typeName, blockText));
    } else {
      const qs = parseTypeBlock(upperType, blockText);
      questions.push(...qs);
    }
  }

  return { questions, notes, detectedChapter, detectedSubunit };
}

export function AdminBulkImport() {
  const [rawText, setRawText] = useState("");
  const [cls, setCls] = useState("11");
  const [chapterId, setChapterId] = useState("");
  const [subunit, setSubunit] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [tab, setTab] = useState<"questions" | "notes">("questions");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ questions?: number; notes?: number; errors?: string[] } | null>(null);

  useEffect(() => {
    fetchChaptersFromAPI(cls).then(setChapters);
  }, [cls]);

  const selectedChapter = chapters.find((c) => c.id === chapterId);

  function handleParse() {
    if (!rawText.trim()) return;
    const p = parseFullText(rawText);

    if (!chapterId && p.detectedChapter) {
      const found = chapters.find((c) =>
        c.name.toLowerCase().includes(p.detectedChapter.toLowerCase()) ||
        p.detectedChapter.toLowerCase().includes(c.name.toLowerCase().split(" ").slice(0, 3).join(" "))
      );
      if (found) setChapterId(found.id);
    }
    if (!subunit && p.detectedSubunit) {
      setSubunit(p.detectedSubunit);
    }
    setParsed(p);
    setResult(null);
  }

  async function handleImport() {
    if (!parsed || !chapterId) return;
    setImporting(true);
    setResult(null);
    const errors: string[] = [];
    let qCount = 0;
    let nCount = 0;

    if (parsed.questions.length > 0) {
      try {
        const payload = parsed.questions.map((q) => ({
          ...q,
          class: cls,
          chapter: chapterId,
          subunit: subunit || parsed.detectedSubunit || "",
          subject: "Biology",
          is_active: true,
        }));
        const res = await api.post("/questions", payload) as { count?: number };
        qCount = res?.count ?? parsed.questions.length;
      } catch (e: unknown) {
        errors.push(`Questions: ${String(e)}`);
      }
    }

    if (parsed.notes.length > 0) {
      for (let i = 0; i < parsed.notes.length; i++) {
        try {
          await api.post("/short-notes", {
            ...parsed.notes[i],
            class: cls,
            chapter: chapterId,
            subunit: subunit || parsed.detectedSubunit || "",
            order: i,
            published: true,
          });
          nCount++;
        } catch (e: unknown) {
          errors.push(`Note "${parsed.notes[i].title}": ${String(e)}`);
        }
      }
    }

    setResult({ questions: qCount, notes: nCount, errors });
    setImporting(false);
  }

  const typeGroups = parsed
    ? parsed.questions.reduce<Record<string, ParsedQuestion[]>>((acc, q) => {
        (acc[q.type] = acc[q.type] || []).push(q);
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Bulk Text Import</h2>
        <p className="text-white/50 text-sm mt-1">Paste your formatted chapter text — questions and notes are extracted automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Input */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#00FF9D] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" /> Paste Your Text
            </h3>
            <textarea
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setParsed(null); setResult(null); }}
              placeholder={`=====================================\nChapter 14 · Breathing & Exchange of Gases\nSUBTOPIC: INTRODUCTION\n=====================================\n\n-----------------------------------------\nTYPE 4 — STANDARD MCQ\n-----------------------------------------\n\nQ1. Question text\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nAns: B\n\n---\n\nQ2. Next question...`}
              rows={18}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00FF9D]/50 resize-none"
            />
            <button
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-40"
              style={{ background: "#00FF9D", color: "#000" }}
            >
              <Zap className="w-4 h-4" /> Parse Text
            </button>
          </div>
        </div>

        {/* RIGHT: Mapping */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#00FF9D] uppercase tracking-wider">Map to Chapter</h3>

            <div>
              <label className={labelCls}>Class</label>
              <select value={cls} onChange={(e) => { setCls(e.target.value); setChapterId(""); }} className={selectCls}>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Chapter</label>
              <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className={selectCls}>
                <option value="">— Select Chapter —</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Subunit / Topic</label>
              {selectedChapter ? (
                <select value={subunit} onChange={(e) => setSubunit(e.target.value)} className={selectCls}>
                  <option value="">— Select Subunit —</option>
                  {selectedChapter.subunits.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input value={subunit} onChange={(e) => setSubunit(e.target.value)} placeholder="e.g. Introduction" className={inputCls} />
              )}
            </div>

            {parsed && (
              <div className="rounded-xl border border-white/10 p-4 space-y-2">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Detected from text</p>
                {parsed.detectedChapter && (
                  <p className="text-xs text-white/70">📗 Chapter: <span className="text-white font-mono">{parsed.detectedChapter}</span></p>
                )}
                {parsed.detectedSubunit && (
                  <p className="text-xs text-white/70">📌 Subtopic: <span className="text-white font-mono">{parsed.detectedSubunit}</span></p>
                )}
                <div className="flex gap-3 pt-1">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#00FF9D]">{parsed.questions.length}</div>
                    <div className="text-xs text-white/50 uppercase">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-400">{parsed.notes.length}</div>
                    <div className="text-xs text-white/50 uppercase">Note Sections</div>
                  </div>
                </div>
              </div>
            )}

            {parsed && (
              <button
                onClick={handleImport}
                disabled={importing || !chapterId || (parsed.questions.length === 0 && parsed.notes.length === 0)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all disabled:opacity-40"
                style={{ background: importing ? "#333" : "#00FF9D", color: "#000" }}
              >
                {importing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Import {parsed.questions.length} Questions + {parsed.notes.length} Notes</>
                )}
              </button>
            )}

            {result && (
              <div className={`rounded-xl border p-4 ${result.errors?.length ? "border-red-500/30 bg-red-500/5" : "border-[#00FF9D]/30 bg-[#00FF9D]/5"}`}>
                {result.errors?.length ? (
                  <>
                    <p className="text-red-400 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Some errors occurred</p>
                    {result.errors.map((e, i) => <p key={i} className="text-red-300 text-xs mt-1">{e}</p>)}
                  </>
                ) : (
                  <p className="text-[#00FF9D] font-bold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Done! {result.questions} questions + {result.notes} notes saved.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      {parsed && (parsed.questions.length > 0 || parsed.notes.length > 0) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-4 h-4 text-[#00FF9D]" />
            <h3 className="text-sm font-bold text-[#00FF9D] uppercase tracking-wider">Preview</h3>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setTab("questions")}
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase transition-all ${tab === "questions" ? "bg-[#00FF9D] text-black" : "bg-white/10 text-white/60"}`}
              >
                <BookOpen className="w-3 h-3 inline mr-1" />{parsed.questions.length} Questions
              </button>
              <button
                onClick={() => setTab("notes")}
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase transition-all ${tab === "notes" ? "bg-blue-400 text-black" : "bg-white/10 text-white/60"}`}
              >
                <StickyNote className="w-3 h-3 inline mr-1" />{parsed.notes.length} Notes
              </button>
            </div>
          </div>

          {tab === "questions" && (
            <div className="space-y-4">
              {Object.entries(typeGroups).map(([type, qs]) => (
                <div key={type}>
                  <p className="text-xs font-bold text-[#00FF9D]/70 uppercase tracking-wider mb-2">
                    {type.replace(/_/g, " ")} — {qs.length} questions
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {qs.slice(0, 5).map((q, i) => (
                      <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-3">
                        <p className="text-white text-xs font-medium mb-2 leading-relaxed">{q.question.slice(0, 200)}{q.question.length > 200 ? "…" : ""}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {[q.option1, q.option2, q.option3, q.option4].map((opt, oi) => {
                            const key = `option${oi + 1}`;
                            return opt ? (
                              <span key={oi} className={`text-xs px-2 py-0.5 rounded ${q.correct === key ? "bg-[#00FF9D]/20 text-[#00FF9D] font-bold" : "text-white/50"}`}>
                                {String.fromCharCode(65 + oi)}) {opt.slice(0, 60)}{opt.length > 60 ? "…" : ""}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                    {qs.length > 5 && (
                      <p className="text-white/30 text-xs text-center py-2">…and {qs.length - 5} more</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {parsed.notes.map((n, i) => (
                <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-4">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">{n.title}</p>
                  <p className="text-white/70 text-xs font-mono whitespace-pre-wrap leading-relaxed">{n.content.slice(0, 400)}{n.content.length > 400 ? "…" : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
