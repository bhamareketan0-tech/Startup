import { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import { getChapters } from "@/lib/chaptersManager";
import { api } from "@/lib/api";
import {
  Plus, Edit, Trash2, Search, X, Check, AlertCircle,
  ChevronLeft, ChevronRight, PlusCircle, MinusCircle,
  ArrowRight, Zap, Eye
} from "lucide-react";

const QUESTION_TYPES = [
  { id: "video",        label: "Video",                     isStudy: true  },
  { id: "paragraph",    label: "Paragraph",                 isStudy: true  },
  { id: "pointer_notes",label: "Pointer Notes",             isStudy: true  },
  { id: "tricks",       label: "Tricks & Mnemonics",        isStudy: true  },
  { id: "mcq",          label: "Standard MCQ",              isStudy: false },
  { id: "assertion",    label: "Assertion Reason",          isStudy: false },
  { id: "statements",   label: "No. of Correct Statements", isStudy: false },
  { id: "truefalse",    label: "True / False",              isStudy: false },
  { id: "fillblanks",   label: "Fill in the Blanks",        isStudy: false },
  { id: "match",        label: "Match the Column",          isStudy: false },
  { id: "diagram",      label: "Diagram Based",             isStudy: false },
  { id: "table_based",  label: "Table Based",               isStudy: false },
  { id: "pyq",          label: "Prev Year Questions",       isStudy: false },
];

const DIFFICULTIES = ["easy", "medium", "hard"];

const DIFF_COLORS: Record<string, string> = {
  easy: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  medium: "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20",
  hard: "text-[#ff4444] bg-[#ff4444]/10 border-[#ff4444]/20",
};

const PAGE_SIZE = 20;

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls = "block text-xs text-white/50 mb-1 font-medium";
const textareaCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-[#00FF9D]/50";

const emptyQuestion: Partial<Question> = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct: "option1",
  subject: "Biology",
  chapter: "",
  subunit: "",
  type: "mcq",
  explanation: "",
  class: "11",
  difficulty: "medium",
  is_active: true,
  meta: null,
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function DynamicList({
  items,
  onChange,
  placeholder,
  label,
  maxItems,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label: string;
  maxItems?: number;
}) {
  const max = maxItems ?? 10;
  return (
    <div className="col-span-2">
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-white/30 text-xs font-mono mt-2.5 w-5 shrink-0">{i + 1}.</span>
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-red-400/60 hover:text-red-400 mt-1.5"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
        {items.length < max && (
          <button
            type="button"
            onClick={() => onChange([...items, ""])}
            className="flex items-center gap-1.5 text-xs text-[#00FF9D]/70 hover:text-[#00FF9D] transition-colors mt-1"
          >
            <PlusCircle className="w-4 h-4" /> Add item
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Question type-specific form sections ─────────────────────────────────────

function ParagraphForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const highlights = ((editingQ.meta as Record<string, unknown>)?.highlights as string[]) || [];
  const setMeta = (meta: Record<string, unknown>) => setEditingQ({ ...editingQ, meta });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Paragraph Body *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={6} placeholder="Enter the full paragraph content here..." className={textareaCls} />
      </div>
      <DynamicList
        label="Highlighted Keywords / Phrases (bold + accent)"
        items={highlights}
        onChange={(items) => setMeta({ ...((editingQ.meta as Record<string, unknown>) || {}), highlights: items })}
        placeholder="Enter keyword or phrase to highlight"
        maxItems={20}
      />
      <div className="col-span-2">
        <label className={labelCls}>Notes / Tags (optional)</label>
        <input value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })}
          placeholder="Internal notes (not shown to student)" className={inputCls} />
      </div>
    </>
  );
}

function PointerNotesForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const bullets = ((editingQ.meta as Record<string, unknown>)?.bullets as string[]) || [];
  const setMeta = (meta: Record<string, unknown>) => setEditingQ({ ...editingQ, meta });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Topic / Title *</label>
        <input value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          placeholder="e.g. Cell Theory — Key Points" className={inputCls} />
      </div>
      <DynamicList
        label="Bullet Points (tip: use 'Term: explanation' format for auto-highlighting)"
        items={bullets}
        onChange={(items) => setMeta({ ...((editingQ.meta as Record<string, unknown>) || {}), bullets: items })}
        placeholder="e.g. Mitochondria: powerhouse of the cell"
        maxItems={10}
      />
      <div className="col-span-2">
        <label className={labelCls}>Notes (optional)</label>
        <input value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })}
          placeholder="Internal notes" className={inputCls} />
      </div>
    </>
  );
}

function AssertionForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Statement (A) — Assertion *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={3} placeholder="Enter the assertion statement..." className={textareaCls} />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Statement (R) — Reason *</label>
        <textarea value={(meta.statementR as string) || ""} onChange={(e) => setMeta({ ...meta, statementR: e.target.value })}
          rows={3} placeholder="Enter the reason statement..." className={textareaCls} />
        <p className="text-xs text-white/30 mt-1">Statement A in main question field; Statement R in meta.</p>
      </div>
      <div><label className={labelCls}>Option A</label><input value={editingQ.option1 || ""} onChange={(e) => setEditingQ({ ...editingQ, option1: e.target.value })} className={inputCls} placeholder="Both A and R are true, and R is the correct explanation of A" /></div>
      <div><label className={labelCls}>Option B</label><input value={editingQ.option2 || ""} onChange={(e) => setEditingQ({ ...editingQ, option2: e.target.value })} className={inputCls} placeholder="Both A and R are true, but R is NOT the correct explanation of A" /></div>
      <div><label className={labelCls}>Option C</label><input value={editingQ.option3 || ""} onChange={(e) => setEditingQ({ ...editingQ, option3: e.target.value })} className={inputCls} placeholder="A is true but R is false" /></div>
      <div><label className={labelCls}>Option D</label><input value={editingQ.option4 || ""} onChange={(e) => setEditingQ({ ...editingQ, option4: e.target.value })} className={inputCls} placeholder="A is false but R is true" /></div>
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option A</option><option value="option2">Option B</option>
          <option value="option3">Option C</option><option value="option4">Option D</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} /></div>
    </>
  );
}

function StatementsForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const stmts = (meta.statements as string[]) || [];
  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Introductory Question Text (optional)</label>
        <input value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          placeholder="e.g. Consider the following statements about Mitosis:" className={inputCls} />
      </div>
      <DynamicList label="Statements *" items={stmts} onChange={(items) => setMeta({ ...meta, statements: items })} placeholder="Enter a statement..." maxItems={8} />
      <div><label className={labelCls}>Option A (number correct)</label><input value={editingQ.option1 || ""} onChange={(e) => setEditingQ({ ...editingQ, option1: e.target.value })} className={inputCls} placeholder="Only one" /></div>
      <div><label className={labelCls}>Option B</label><input value={editingQ.option2 || ""} onChange={(e) => setEditingQ({ ...editingQ, option2: e.target.value })} className={inputCls} placeholder="Only two" /></div>
      <div><label className={labelCls}>Option C</label><input value={editingQ.option3 || ""} onChange={(e) => setEditingQ({ ...editingQ, option3: e.target.value })} className={inputCls} placeholder="All three" /></div>
      <div><label className={labelCls}>Option D</label><input value={editingQ.option4 || ""} onChange={(e) => setEditingQ({ ...editingQ, option4: e.target.value })} className={inputCls} placeholder="None" /></div>
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option A</option><option value="option2">Option B</option>
          <option value="option3">Option C</option><option value="option4">Option D</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} /></div>
    </>
  );
}

function TrueFalseForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Statement *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={3} placeholder="Enter the statement to judge as True or False..." className={textareaCls} />
      </div>
      <div><label className={labelCls}>Option 1 (typically True)</label><input value={editingQ.option1 || "True"} onChange={(e) => setEditingQ({ ...editingQ, option1: e.target.value })} className={inputCls} /></div>
      <div><label className={labelCls}>Option 2 (typically False)</label><input value={editingQ.option2 || "False"} onChange={(e) => setEditingQ({ ...editingQ, option2: e.target.value })} className={inputCls} /></div>
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option 1 (True)</option><option value="option2">Option 2 (False)</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} /></div>
    </>
  );
}

function FillBlanksForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Sentence with Blank *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={3} placeholder="Use _____ to mark the blank, e.g. The powerhouse of the cell is _____." className={textareaCls} />
        <p className="text-xs text-white/30 mt-1">Use underscore(s) to mark the blank position.</p>
      </div>
      <div><label className={labelCls}>Choice A *</label><input value={editingQ.option1 || ""} onChange={(e) => setEditingQ({ ...editingQ, option1: e.target.value })} className={inputCls} placeholder="Word or phrase" /></div>
      <div><label className={labelCls}>Choice B *</label><input value={editingQ.option2 || ""} onChange={(e) => setEditingQ({ ...editingQ, option2: e.target.value })} className={inputCls} placeholder="Word or phrase" /></div>
      <div><label className={labelCls}>Choice C *</label><input value={editingQ.option3 || ""} onChange={(e) => setEditingQ({ ...editingQ, option3: e.target.value })} className={inputCls} placeholder="Word or phrase" /></div>
      <div><label className={labelCls}>Choice D *</label><input value={editingQ.option4 || ""} onChange={(e) => setEditingQ({ ...editingQ, option4: e.target.value })} className={inputCls} placeholder="Word or phrase" /></div>
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Choice A</option><option value="option2">Choice B</option>
          <option value="option3">Choice C</option><option value="option4">Choice D</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} /></div>
    </>
  );
}

function MatchForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const colLeft = (meta.colLeft as string[]) || ["", "", "", ""];
  const colRight = (meta.colRight as string[]) || ["", "", "", ""];
  const n = colLeft.length;
  const correctMapping = (meta.correctMapping as number[]) || Array.from({ length: n }, (_, i) => i);
  const leftLabels = ["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, n);

  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });

  function updateLeft(i: number, v: string) { const arr = [...colLeft]; arr[i] = v; setMeta({ ...meta, colLeft: arr, colRight, correctMapping }); }
  function updateRight(i: number, v: string) { const arr = [...colRight]; arr[i] = v; setMeta({ ...meta, colLeft, colRight: arr, correctMapping }); }

  function addRow() {
    if (n >= 8) return;
    setMeta({ ...meta, colLeft: [...colLeft, ""], colRight: [...colRight, ""], correctMapping: [...correctMapping, n] });
  }

  function removeRow() {
    if (n <= 2) return;
    setMeta({ ...meta, colLeft: colLeft.slice(0, -1), colRight: colRight.slice(0, -1), correctMapping: correctMapping.slice(0, -1).map(v => Math.min(v, n - 2)) });
  }

  function setMapping(leftIdx: number, rightIdx: number) {
    const nm = [...correctMapping]; nm[leftIdx] = rightIdx;
    setMeta({ ...meta, colLeft, colRight, correctMapping: nm });
  }

  function buildComboString(mapping: number[]): string {
    return leftLabels.map((lbl, i) => `${lbl}-${mapping[i] + 1}`).join(", ");
  }

  function generateWrongMappings(correct: number[]): number[][] {
    const wrongs: number[][] = [];
    const correctStr = correct.join(",");
    for (let shift = 1; shift <= n + 2; shift++) {
      if (wrongs.length === 3) break;
      const candidate = correct.map(v => (v + shift) % n);
      const cstr = candidate.join(",");
      if (cstr !== correctStr && !wrongs.some(w => w.join(",") === cstr)) wrongs.push(candidate);
    }
    if (wrongs.length < 3) {
      const rev = [...correct].reverse();
      const rs = rev.join(",");
      if (rs !== correctStr && !wrongs.some(w => w.join(",") === rs)) wrongs.push(rev);
    }
    if (wrongs.length < 3 && n >= 2) {
      const sw = [...correct]; [sw[0], sw[1]] = [sw[1], sw[0]];
      const ss = sw.join(",");
      if (ss !== correctStr && !wrongs.some(w => w.join(",") === ss)) wrongs.push(sw);
    }
    while (wrongs.length < 3) wrongs.push(wrongs[wrongs.length - 1] || correct.map(v => (v + 1) % n));
    return wrongs.slice(0, 3);
  }

  function generateCombos() {
    const correct = correctMapping.map(v => Math.min(v, n - 1));
    const [w1, w2, w3] = generateWrongMappings(correct);
    setEditingQ({
      ...editingQ,
      option1: buildComboString(correct),
      option2: buildComboString(w1),
      option3: buildComboString(w2),
      option4: buildComboString(w3),
      correct: "option1",
      meta: { ...meta, colLeft, colRight, correctMapping: correct },
    });
  }

  const hasItems = colLeft.some(s => s.trim()) && colRight.some(s => s.trim());

  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Question / Instructions</label>
        <input value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })} className={inputCls} placeholder="e.g. Match Column I with Column II and select the correct option" />
      </div>

      {/* Row controls */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-3">
          <label className={labelCls}>Column Pairs <span className="text-white/25">({n} rows — min 2, max 8)</span></label>
          <div className="flex gap-2">
            <button type="button" onClick={removeRow} disabled={n <= 2}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/20 disabled:opacity-30 transition-colors">
              <MinusCircle className="w-3 h-3" /> Remove Row
            </button>
            <button type="button" onClick={addRow} disabled={n >= 8}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] rounded text-xs hover:bg-[#00FF9D]/20 disabled:opacity-30 transition-colors">
              <PlusCircle className="w-3 h-3" /> Add Row
            </button>
          </div>
        </div>
        {/* Dual-column entry table */}
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-white/10">
            <div className="px-4 py-2 bg-[#00FF9D]/8 border-r border-white/10">
              <span className="text-[#00FF9D] text-xs font-black uppercase tracking-wider">Column I</span>
            </div>
            <div className="px-4 py-2 bg-[#00FF9D]/8">
              <span className="text-[#00FF9D] text-xs font-black uppercase tracking-wider">Column II</span>
            </div>
          </div>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="grid grid-cols-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2 px-3 py-2.5 border-r border-white/10 bg-[#00FF9D]/3">
                <span className="text-[#00FF9D] font-black text-xs w-5 shrink-0 text-center">({leftLabels[i]})</span>
                <input value={colLeft[i]} onChange={(e) => updateLeft(i, e.target.value)} placeholder={`Column I item ${i + 1}`}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20 border-b border-transparent focus:border-[#00FF9D]/40 pb-0.5" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#00FF9D]/3">
                <span className="text-[#00FF9D] font-black text-xs w-5 shrink-0 text-center">({i + 1})</span>
                <input value={colRight[i]} onChange={(e) => updateRight(i, e.target.value)} placeholder={`Column II item ${i + 1}`}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-white/20 border-b border-transparent focus:border-[#00FF9D]/40 pb-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correct mapping builder */}
      <div className="col-span-2">
        <label className={labelCls}>Correct Answer Mapping <span className="text-white/25">(select which Column II item each Column I item matches)</span></label>
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-white/3 border-b border-white/10">
            <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Visual Pairing — Correct Match</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 bg-[#00FF9D]/8 border border-[#00FF9D]/20 rounded px-2 py-1.5 min-w-0">
                  <span className="text-[#00FF9D] font-black text-xs shrink-0">({leftLabels[i]})</span>
                  <span className="text-white/60 text-xs truncate">{colLeft[i] || `Item ${leftLabels[i]}`}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/25 shrink-0" />
                <select value={correctMapping[i] ?? i} onChange={(e) => setMapping(i, Number(e.target.value))}
                  className="flex-1 bg-[#0d1b2a] border border-[#00FF9D]/30 rounded px-2 py-1.5 text-[#00FF9D] text-xs focus:outline-none focus:border-[#00FF9D]/60 min-w-0">
                  {Array.from({ length: n }, (_, j) => (
                    <option key={j} value={j}>({j + 1}) {colRight[j] || `Item ${j + 1}`}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-generate button */}
      <div className="col-span-2">
        <button type="button" onClick={generateCombos} disabled={!hasItems}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00FF9D]/12 border border-[#00FF9D]/30 text-[#00FF9D] rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#00FF9D]/22 transition-colors disabled:opacity-30">
          <Zap className="w-4 h-4" /> Auto-Generate 4 Combo Options from Mapping
        </button>
        <p className="text-white/25 text-xs mt-1 text-center">Correct pairing → Option A. 3 wrong permutations auto-calculated.</p>
      </div>

      {/* Editable combo options */}
      <div className="col-span-2">
        <label className={labelCls}>Combo Options <span className="text-white/25">(auto-filled above, or enter manually)</span></label>
        <div className="grid grid-cols-2 gap-2">
          {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => {
            const isCorrect = editingQ.correct === opt;
            return (
              <div key={opt} className={`border rounded-xl p-2.5 transition-colors ${isCorrect ? "border-[#00FF9D]/40 bg-[#00FF9D]/8" : "border-white/10 bg-white/3"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <button type="button" onClick={() => setEditingQ({ ...editingQ, correct: opt })}
                    title="Set as correct answer"
                    className={`w-6 h-6 text-xs font-black rounded flex items-center justify-center shrink-0 transition-colors ${isCorrect ? "bg-[#00FF9D] text-black" : "bg-white/10 text-white/40 hover:bg-white/20"}`}>
                    {["A", "B", "C", "D"][i]}
                  </button>
                  <span className={`text-xs ${isCorrect ? "text-[#00FF9D]/80" : "text-white/30"}`}>
                    {isCorrect ? "✓ Correct answer" : "Wrong option"}
                  </span>
                </div>
                <input value={editingQ[opt as keyof Question] as string || ""}
                  onChange={(e) => setEditingQ({ ...editingQ, [opt]: e.target.value })}
                  placeholder="e.g. A-1, B-2, C-3, D-4"
                  className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-white/20 border-b border-white/10 focus:border-[#00FF9D]/30 pb-0.5" />
              </div>
            );
          })}
        </div>
        <p className="text-white/25 text-xs mt-1">Click the letter badge (A/B/C/D) to set it as the correct answer.</p>
      </div>

      {/* Live preview */}
      {hasItems && (
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-white/30" />
            <span className={labelCls + " !mb-0"}>Live Preview — Student View</span>
          </div>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
            {editingQ.question && (
              <div className="px-4 py-2.5 border-b border-white/10 bg-white/3">
                <p className="text-white/75 text-sm">{editingQ.question}</p>
              </div>
            )}
            <div className="grid grid-cols-2 divide-x divide-white/10">
              <div className="p-3">
                <p className="text-[#00FF9D] text-xs font-black uppercase tracking-wider mb-2">Column I</p>
                {colLeft.map((item, i) => item && (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-[#00FF9D] text-xs font-bold shrink-0">({leftLabels[i]})</span>
                    <span className="text-white/70 text-xs leading-snug">{item}</span>
                  </div>
                ))}
              </div>
              <div className="p-3">
                <p className="text-[#00FF9D] text-xs font-black uppercase tracking-wider mb-2">Column II</p>
                {colRight.map((item, i) => item && (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-[#00FF9D] text-xs font-bold shrink-0">({i + 1})</span>
                    <span className="text-white/70 text-xs leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {(editingQ.option1 || editingQ.option2 || editingQ.option3 || editingQ.option4) && (
              <div className="border-t border-white/10 p-3 grid grid-cols-2 gap-2">
                {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => {
                  const val = editingQ[opt as keyof Question] as string;
                  if (!val) return null;
                  const isCorrect = editingQ.correct === opt;
                  return (
                    <div key={opt} className={`px-3 py-1.5 rounded text-xs border ${isCorrect ? "bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D]" : "bg-white/3 border-white/10 text-white/50"}`}>
                      <span className="font-bold">{["A", "B", "C", "D"][i]}.</span> {val}{isCorrect && " ✓"}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="col-span-2">
        <label className={labelCls}>Explanation</label>
        <textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} placeholder="Explain the correct matching..." />
      </div>
    </>
  );
}

function StandardMCQForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Question *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={3} className={textareaCls} />
      </div>
      {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => (
        <div key={opt}>
          <label className={labelCls}>Option {String.fromCharCode(65 + i)} *</label>
          <input value={editingQ[opt as keyof Question] as string || ""} onChange={(e) => setEditingQ({ ...editingQ, [opt]: e.target.value })} className={inputCls} />
        </div>
      ))}
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option A</option><option value="option2">Option B</option>
          <option value="option3">Option C</option><option value="option4">Option D</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} /></div>
    </>
  );
}

function ImageMCQForm({ editingQ, setEditingQ, typeLabel }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void; typeLabel: string }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const imageUrl = (meta.imageUrl as string) || "";

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEditingQ({ ...editingQ, meta: { ...meta, imageUrl: base64 } });
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>{typeLabel} Image *</label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-xs text-white/50 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#00FF9D]/20 file:text-[#00FF9D] file:cursor-pointer hover:file:bg-[#00FF9D]/30 cursor-pointer"
          />
          <p className="text-xs text-white/30">— or paste an image URL below —</p>
          <input
            value={imageUrl.startsWith("data:") ? "" : imageUrl}
            onChange={(e) => setEditingQ({ ...editingQ, meta: { ...meta, imageUrl: e.target.value } })}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
        {imageUrl && (
          <div className="mt-3 border border-white/10 rounded-xl overflow-hidden bg-black/30 relative">
            <img src={imageUrl} alt="Preview" className="max-h-48 w-full object-contain" />
            <button
              type="button"
              onClick={() => setEditingQ({ ...editingQ, meta: { ...meta, imageUrl: "" } })}
              className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Question Text * <span className="text-white/30">(e.g. "Identify the labelled part X")</span></label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={3} className={textareaCls} placeholder="Enter the question about the diagram/table..." />
      </div>
      {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => (
        <div key={opt}>
          <label className={labelCls}>Option {String.fromCharCode(65 + i)} *</label>
          <input value={editingQ[opt as keyof Question] as string || ""} onChange={(e) => setEditingQ({ ...editingQ, [opt]: e.target.value })} className={inputCls} />
        </div>
      ))}
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option A</option><option value="option2">Option B</option>
          <option value="option3">Option C</option><option value="option4">Option D</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Explanation</label>
        <textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={2} className={textareaCls} />
      </div>
    </>
  );
}

function VideoForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Topic / Title *</label>
        <input value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          placeholder="e.g. Mitosis — Stage-by-Stage Explanation" className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>YouTube / Video URL *</label>
        <input value={(meta.videoUrl as string) || ""} onChange={(e) => setMeta({ ...meta, videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." className={inputCls} />
        <p className="text-xs text-white/30 mt-1">Paste a YouTube link or direct embed URL. Supports youtu.be short links too.</p>
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Notes / Summary (shown below video)</label>
        <textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })}
          rows={3} placeholder="Key points covered in this video..." className={textareaCls} />
      </div>
    </>
  );
}

function TricksForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const tricks = (meta.tricks as string[]) || [];
  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Topic / What to Remember *</label>
        <input value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          placeholder="e.g. Order of Mitosis Phases" className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Acronym / Short Form (optional)</label>
        <input value={(meta.acronym as string) || ""} onChange={(e) => setMeta({ ...meta, acronym: e.target.value })}
          placeholder="e.g. PMAT — Prophase, Metaphase, Anaphase, Telophase" className={inputCls} />
      </div>
      <DynamicList
        label="Tricks / Mnemonics (each line = one trick)"
        items={tricks}
        onChange={(items) => setMeta({ ...meta, tricks: items })}
        placeholder="e.g. 💡 Remember: Prophase looks like 'P for Prepare' — cell prepares to divide"
        maxItems={10}
      />
    </>
  );
}

function PYQForm({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  const meta = (editingQ.meta as Record<string, unknown>) || {};
  const setMeta = (next: Record<string, unknown>) => setEditingQ({ ...editingQ, meta: next });
  return (
    <>
      <div>
        <label className={labelCls}>NEET Year *</label>
        <input value={(meta.year as string) || ""} onChange={(e) => setMeta({ ...meta, year: e.target.value })}
          placeholder="e.g. 2023" className={inputCls} />
        <p className="text-xs text-white/30 mt-1">Displayed as a "NEET 2023" badge on the question.</p>
      </div>
      <div>
        <label className={labelCls}>Exam (optional)</label>
        <input value={(meta.exam as string) || ""} onChange={(e) => setMeta({ ...meta, exam: e.target.value })}
          placeholder="e.g. NEET UG or AIIMS" className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Question *</label>
        <textarea value={editingQ.question || ""} onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
          rows={4} placeholder="Paste the original PYQ question text..." className={textareaCls} />
      </div>
      <div><label className={labelCls}>Option A *</label><input value={editingQ.option1 || ""} onChange={(e) => setEditingQ({ ...editingQ, option1: e.target.value })} className={inputCls} /></div>
      <div><label className={labelCls}>Option B *</label><input value={editingQ.option2 || ""} onChange={(e) => setEditingQ({ ...editingQ, option2: e.target.value })} className={inputCls} /></div>
      <div><label className={labelCls}>Option C *</label><input value={editingQ.option3 || ""} onChange={(e) => setEditingQ({ ...editingQ, option3: e.target.value })} className={inputCls} /></div>
      <div><label className={labelCls}>Option D *</label><input value={editingQ.option4 || ""} onChange={(e) => setEditingQ({ ...editingQ, option4: e.target.value })} className={inputCls} /></div>
      <div>
        <label className={labelCls}>Correct Answer *</label>
        <select value={editingQ.correct || "option1"} onChange={(e) => setEditingQ({ ...editingQ, correct: e.target.value })} className={selectCls}>
          <option value="option1">Option A</option><option value="option2">Option B</option>
          <option value="option3">Option C</option><option value="option4">Option D</option>
        </select>
      </div>
      <div className="col-span-2"><label className={labelCls}>Explanation</label><textarea value={editingQ.explanation || ""} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })} rows={3} className={textareaCls} placeholder="Official explanation or solution..." /></div>
    </>
  );
}

function QuestionFormFields({ editingQ, setEditingQ }: { editingQ: Partial<Question>; setEditingQ: (q: Partial<Question>) => void }) {
  switch (editingQ.type) {
    case "video":        return <VideoForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "paragraph":    return <ParagraphForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "pointer_notes":return <PointerNotesForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "tricks":       return <TricksForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "assertion":    return <AssertionForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "statements":   return <StatementsForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "truefalse":    return <TrueFalseForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "fillblanks":   return <FillBlanksForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "match":        return <MatchForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    case "diagram":      return <ImageMCQForm editingQ={editingQ} setEditingQ={setEditingQ} typeLabel="Diagram" />;
    case "table_based":  return <ImageMCQForm editingQ={editingQ} setEditingQ={setEditingQ} typeLabel="Table" />;
    case "pyq":          return <PYQForm editingQ={editingQ} setEditingQ={setEditingQ} />;
    default:             return <StandardMCQForm editingQ={editingQ} setEditingQ={setEditingQ} />;
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AdminQuestions({ onAddQuestion }: { onAddQuestion?: (fn: () => void) => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterType, setFilterType] = useState("");

  const [editingQ, setEditingQ] = useState<Partial<Question> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [page, filterClass, filterDifficulty, filterType, search]);

  useEffect(() => {
    if (onAddQuestion) {
      onAddQuestion(() => startNew());
    }
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        page: String(page + 1),
      };
      if (filterClass) params.class = filterClass;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterType) params.type = filterType;
      if (search) params.search = search;
      const res = await api.get("/questions", params);
      setQuestions(res.data || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError("Failed to load questions: " + String(e));
    }
    setLoading(false);
  }

  function startNew() {
    setEditingQ({ ...emptyQuestion });
    setIsNew(true);
    setError("");
    setShowModal(true);
  }

  function startEdit(q: Question) {
    setEditingQ({ ...q });
    setIsNew(false);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingQ(null);
  }

  async function saveQuestion() {
    if (!editingQ) return;
    if (!editingQ.question?.trim()) { setError("Question text is required."); return; }
    if (!editingQ.chapter) { setError("Please select a chapter."); return; }
    if (!editingQ.subunit) { setError("Please select a subunit."); return; }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await api.post("/questions", editingQ);
      } else {
        await api.put(`/questions/${editingQ.id}`, editingQ);
      }
      closeModal();
      fetchQuestions();
    } catch (e) {
      setError("Save failed: " + String(e));
    }
    setSaving(false);
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question permanently?")) return;
    try {
      await api.del(`/questions/${id}`);
      fetchQuestions();
    } catch (e) {
      setError("Delete failed: " + String(e));
    }
  }

  const filteredQuestions = questions;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Questions</h1>
          <p className="text-white/40 text-sm mt-1">{total} questions total</p>
        </div>
        <button onClick={startNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full bg-[#0d1b2a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00FF9D]/50" />
        </div>
        <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(0); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00FF9D]/50">
          <option value="">All Classes</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
          <option value="dropper">Dropper</option>
        </select>
        <select value={filterDifficulty} onChange={(e) => { setFilterDifficulty(e.target.value); setPage(0); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00FF9D]/50">
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
          className="bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#00FF9D]/50">
          <option value="">All Types</option>
          {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {(filterClass || filterDifficulty || filterType || search) && (
          <button onClick={() => { setFilterClass(""); setFilterDifficulty(""); setFilterType(""); setSearch(""); setPage(0); }}
            className="px-3 py-2 border border-white/10 rounded-xl text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#00FF9D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-white/30 font-medium text-xs">Question</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Chapter / Subunit</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Class</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Type</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Difficulty</th>
                <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Status</th>
                <th className="text-right px-5 py-3 text-white/30 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-white/80 max-w-xs">
                    <p className="line-clamp-2 text-xs">{q.question}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-white/70">{q.chapter || "—"}</div>
                    {q.subunit && <div className="text-white/35 mt-0.5">{q.subunit}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] rounded text-xs border border-[#00FF9D]/20">{q.class}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs capitalize">{q.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs border capitalize ${DIFF_COLORS[q.difficulty] || "text-white/50 bg-white/5 border-white/10"}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs border ${q.is_active ? "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                      {q.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(q)}
                        className="p-1.5 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] rounded-lg hover:bg-[#00FF9D]/20 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteQuestion(q.id)}
                        className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-white/30">No questions found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-white/30 text-xs">
          {total === 0
            ? "No questions found"
            : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total.toLocaleString()} questions`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-xs">Page {page + 1} of {Math.max(1, totalPages)}</span>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}
            className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
            className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && editingQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#0a1628] border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">{isNew ? "Add New Question" : "Edit Question"}</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-white/50 hover:text-white" /></button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Top meta row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Question Type *</label>
                  <select value={editingQ.type || "mcq"} onChange={(e) => setEditingQ({ ...editingQ, type: e.target.value, meta: null })}
                    className={selectCls}>
                    {QUESTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Class *</label>
                  <select value={editingQ.class || "11"} onChange={(e) => setEditingQ({ ...editingQ, class: e.target.value, chapter: "", subunit: "" })} className={selectCls}>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="dropper">Dropper</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select value={editingQ.difficulty || "medium"} onChange={(e) => setEditingQ({ ...editingQ, difficulty: e.target.value })} className={selectCls}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {(() => {
                const chapterList = getChapters(editingQ.class || "11");
                const selectedChapter = chapterList.find((c) => c.id === editingQ.chapter);
                const subunitList = selectedChapter?.subunits ?? [];
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Chapter *</label>
                      <select
                        value={editingQ.chapter || ""}
                        onChange={(e) => setEditingQ({ ...editingQ, chapter: e.target.value, subunit: "" })}
                        className={selectCls}
                      >
                        <option value="">— Select Chapter —</option>
                        {chapterList.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Subunit *</label>
                      <select
                        value={editingQ.subunit || ""}
                        onChange={(e) => setEditingQ({ ...editingQ, subunit: e.target.value })}
                        disabled={!editingQ.chapter}
                        className={selectCls + ((!editingQ.chapter) ? " opacity-50 cursor-not-allowed" : "")}
                      >
                        <option value="">— Select Subunit —</option>
                        {subunitList.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Subject</label>
                      <input value={editingQ.subject || "Biology"} onChange={(e) => setEditingQ({ ...editingQ, subject: e.target.value })} className={inputCls} />
                    </div>
                  </div>
                );
              })()}

              {/* Type-specific fields */}
              <div className="grid grid-cols-2 gap-4">
                <QuestionFormFields editingQ={editingQ} setEditingQ={setEditingQ} />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="is_active" checked={editingQ.is_active ?? true}
                  onChange={(e) => setEditingQ({ ...editingQ, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#00FF9D]" />
                <label htmlFor="is_active" className="text-xs text-white/50 cursor-pointer">Active (visible to students)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-white/10">
              <button onClick={saveQuestion} disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00FF9D] to-[#00FF9D] text-black font-semibold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : isNew ? "Add Question" : "Save Changes"}
              </button>
              <button onClick={closeModal} className="px-5 py-2 border border-white/20 text-white rounded-xl text-sm hover:bg-white/5 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
