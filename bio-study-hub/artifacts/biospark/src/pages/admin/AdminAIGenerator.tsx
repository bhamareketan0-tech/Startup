import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { api } from "@/lib/api";
import {
  Upload, Zap, CheckCircle, Loader2, AlertCircle,
  Save, Sparkles, FileText, BookOpen, RotateCcw
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const inputCls  = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls  = "block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide";

// Study types only generated on round 1; question types generated every round
const AI_TYPES = [
  { id: "paragraph",     label: "Study Passage",      count: 1,  emoji: "📖", studyOnly: true  },
  { id: "pointer_notes", label: "Revision Notes",     count: 1,  emoji: "📝", studyOnly: true  },
  { id: "tricks",        label: "Tricks & Mnemonics",  count: 4,  emoji: "🧠", studyOnly: true  },
  { id: "mcq",           label: "Standard MCQ",       count: 25, emoji: "❓", studyOnly: false },
  { id: "assertion",     label: "Assertion-Reason",   count: 15, emoji: "⚖️", studyOnly: false },
  { id: "statements",    label: "Correct Statements", count: 12, emoji: "📋", studyOnly: false },
  { id: "truefalse",     label: "True / False",       count: 12, emoji: "✅", studyOnly: false },
  { id: "fillblanks",    label: "Fill in the Blanks", count: 15, emoji: "✏️", studyOnly: false },
  { id: "match",         label: "Match the Column",   count: 10, emoji: "↔️", studyOnly: false },
  { id: "diagram",       label: "Diagram Based",      count: 10, emoji: "🔬", studyOnly: false },
  { id: "table_based",   label: "Table Based",        count: 8,  emoji: "📊", studyOnly: false },
  { id: "pyq",           label: "PYQ Style",          count: 15, emoji: "🏆", studyOnly: false },
];

const ROUND_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Easy",         color: "#4ade80" },
  2: { label: "Medium",       color: "#00FF9D" },
  3: { label: "Hard",         color: "#facc15" },
  4: { label: "NCERT Exact",  color: "#60a5fa" },
  5: { label: "Process/Step", color: "#c084fc" },
  6: { label: "Comparison",   color: "#f97316" },
  7: { label: "PYQ Pattern",  color: "#f472b6" },
  8: { label: "Tricky/Mixed", color: "#fb7185" },
};

const ROUND_PRESETS = [
  { rounds: 1, label: "Quick",   sublabel: "~128 questions",  time: "~3 min"  },
  { rounds: 2, label: "Basic",   sublabel: "~256 questions",  time: "~6 min"  },
  { rounds: 4, label: "Good",    sublabel: "~500 questions",  time: "~12 min" },
  { rounds: 8, label: "Full 1K", sublabel: "~1000 questions", time: "~24 min" },
];

function calcExpected(rounds: number) {
  const studyBase = AI_TYPES.filter((t) => t.studyOnly).reduce((s, t) => s + t.count, 0);
  const qBase     = AI_TYPES.filter((t) => !t.studyOnly).reduce((s, t) => s + t.count, 0);
  return studyBase + qBase * rounds;
}

async function extractTextFromPDF(file: File): Promise<{ text: string; pages: number }> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const byY = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round((item as any).transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y)!.push({ x: (item as any).transform[4], str: (item as any).str });
    }
    const lines = [...byY.keys()].sort((a, b) => b - a).map((y) =>
      byY.get(y)!.sort((a, b) => a.x - b.x).map((it) => it.str).join(" ").trim()
    );
    parts.push(lines.filter(Boolean).join("\n"));
  }
  return { text: parts.join("\n\n"), pages: pdf.numPages };
}

export function AdminAIGenerator() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [extracting, setExtracting] = useState(false);

  const [cls, setCls] = useState<"11" | "12">("11");
  const [chapterId, setChapterId] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [subunit, setSubunit] = useState("");
  const [chapters, setChapters] = useState<{ id: string; name: string; subunits?: string[] }[]>([]);
  const [rounds, setRounds] = useState(4);

  const [generating, setGenerating] = useState(false);
  const cancelRef = useRef(false);
  const [cancelled, setCancelled] = useState(false);
  const [genError, setGenError] = useState("");

  // Progress per type (displayed as current round status)
  const [currentRound, setCurrentRound] = useState(0);
  const [currentType, setCurrentType] = useState("");
  const [typesDone, setTypesDone] = useState<Record<string, number>>({}); // type -> total count so far

  const [generated, setGenerated] = useState<Record<string, any[]>>({});
  const [activeTab, setActiveTab] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/chapters?class=${cls}&limit=50`)
      .then((res: any) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        setChapters(data.map((c: any) => ({ id: c.id || c._id, name: c.name, subunits: c.subunits || [] })));
        setChapterId(""); setChapterName(""); setSubunit("");
      })
      .catch(() => setChapters([]));
  }, [cls]);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) return alert("Please upload a PDF file.");
    setPdfFile(file);
    setExtracting(true);
    setPdfText("");
    try {
      const { text, pages } = await extractTextFromPDF(file);
      setPdfText(text);
      setPageCount(pages);
    } catch (err) {
      alert("Could not read PDF: " + String(err));
    } finally {
      setExtracting(false);
    }
  }

  function resetState() {
    setGenerated({});
    setSelected(new Set());
    setTypesDone({});
    setCurrentRound(0);
    setCurrentType("");
    setSavedCount(0);
    setCancelled(false);
    setActiveTab("");
  }

  async function generate() {
    if (!pdfText) return alert("Please upload a PDF first.");
    if (!chapterId) return alert("Please select a chapter.");

    cancelRef.current = false;
    setGenerating(true);
    resetState();

    const accumulated: Record<string, any[]> = {};
    const doneCount: Record<string, number> = {};

    for (let round = 1; round <= rounds; round++) {
      if (cancelRef.current) { setCancelled(true); break; }
      setCurrentRound(round);

      for (const typeInfo of AI_TYPES) {
        if (cancelRef.current) { setCancelled(true); break; }

        // Study types only on round 1
        if (round > 1 && typeInfo.studyOnly) continue;

        setCurrentType(typeInfo.id);

        try {
          const res = await (api.post("/admin/ai-generate-questions", {
            text: pdfText,
            chapter: chapterId,
            subunit: subunit || chapterName,
            cls,
            type: typeInfo.id,
            count: typeInfo.count,
            round,
          }) as Promise<{ questions: any[]; count: number }>);

          const qs = res.questions || [];
          if (!accumulated[typeInfo.id]) accumulated[typeInfo.id] = [];
          accumulated[typeInfo.id].push(...qs);
          doneCount[typeInfo.id] = accumulated[typeInfo.id].length;

          setGenerated({ ...accumulated });
          setTypesDone({ ...doneCount });

          if (!activeTab) setActiveTab(typeInfo.id);
        } catch {
          // continue on error
        }
      }
    }

    // Auto-select all
    const allKeys = new Set<string>();
    for (const [tid, qs] of Object.entries(accumulated)) {
      qs.forEach((_, i) => allKeys.add(`${tid}-${i}`));
    }
    setSelected(allKeys);
    setCurrentType("");
    setGenerating(false);
    if (!activeTab && Object.keys(accumulated).length > 0) setActiveTab(Object.keys(accumulated)[0]);
  }

  async function saveSelected() {
    setSaving(true);
    const toSave: any[] = [];
    for (const [tid, qs] of Object.entries(generated)) {
      qs.forEach((q, i) => { if (selected.has(`${tid}-${i}`)) toSave.push(q); });
    }
    if (toSave.length === 0) { setSaving(false); return; }
    try {
      for (let i = 0; i < toSave.length; i += 50) {
        await api.post("/questions", toSave.slice(i, i + 50));
      }
      setSavedCount((prev) => prev + toSave.length);
      setSelected(new Set());
    } catch (err) { alert("Save failed: " + String(err)); }
    finally { setSaving(false); }
  }

  const totalGenerated = Object.values(generated).reduce((s, qs) => s + qs.length, 0);
  const hasResults = totalGenerated > 0;
  const tabTypes = AI_TYPES.filter((t) => (generated[t.id]?.length ?? 0) > 0);
  const activeQs = generated[activeTab] || [];
  const expectedTotal = calcExpected(rounds);

  function toggleAll() {
    if (selected.size >= totalGenerated) { setSelected(new Set()); return; }
    const all = new Set<string>();
    for (const [tid, qs] of Object.entries(generated)) qs.forEach((_, i) => all.add(`${tid}-${i}`));
    setSelected(all);
  }

  function toggleTab(tid: string) {
    const qs = generated[tid] || [];
    const keys = qs.map((_, i) => `${tid}-${i}`);
    const allSel = keys.every((k) => selected.has(k));
    const next = new Set(selected);
    if (allSel) keys.forEach((k) => next.delete(k)); else keys.forEach((k) => next.add(k));
    setSelected(next);
  }

  function toggleQ(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  }

  return (
    <div className="flex gap-6 min-h-[80vh]">

      {/* ── LEFT CONFIG ─────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col gap-4">

        {/* PDF Upload */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-white text-sm font-bold uppercase tracking-wide">Upload Chapter PDF</span>
          </div>
          <div
            ref={dragRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add("border-[#00FF9D]/50"); }}
            onDragLeave={() => dragRef.current?.classList.remove("border-[#00FF9D]/50")}
            onDrop={(e) => { e.preventDefault(); dragRef.current?.classList.remove("border-[#00FF9D]/50"); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="border-2 border-dashed border-white/15 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[#00FF9D]/40 transition-colors"
          >
            {extracting ? (
              <><Loader2 className="w-8 h-8 text-[#00FF9D] animate-spin" /><span className="text-xs text-white/50">Extracting text…</span></>
            ) : pdfFile ? (
              <>
                <CheckCircle className="w-8 h-8 text-[#00FF9D]" />
                <span className="text-xs text-white font-bold text-center truncate w-full text-center">{pdfFile.name}</span>
                <span className="text-xs text-white/40">{pageCount} pages · {Math.round(pdfText.length / 1000)}k chars extracted</span>
                <button onClick={(e) => { e.stopPropagation(); setPdfFile(null); setPdfText(""); setPageCount(0); }} className="text-xs text-white/20 hover:text-red-400 mt-1">Remove</button>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-white/30" />
                <span className="text-xs text-white/50 text-center">Drop chapter PDF here<br/>or click to browse</span>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </div>

        {/* Chapter Config */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-white text-sm font-bold uppercase tracking-wide">Chapter Info</span>
          </div>
          <div>
            <label className={labelCls}>Class</label>
            <select value={cls} onChange={(e) => setCls(e.target.value as "11" | "12")} className={selectCls}>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Chapter</label>
            <select value={chapterId} onChange={(e) => { const ch = chapters.find((c) => c.id === e.target.value); setChapterId(e.target.value); setChapterName(ch?.name || ""); setSubunit(""); }} className={selectCls}>
              <option value="">Select chapter…</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {chapterId && (
            chapters.find((c) => c.id === chapterId)?.subunits?.length ? (
              <div>
                <label className={labelCls}>Subunit (optional)</label>
                <select value={subunit} onChange={(e) => setSubunit(e.target.value)} className={selectCls}>
                  <option value="">Whole chapter</option>
                  {chapters.find((c) => c.id === chapterId)?.subunits?.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Subunit / Topic (optional)</label>
                <input type="text" value={subunit} onChange={(e) => setSubunit(e.target.value)} placeholder="e.g. Cell Membrane" className={inputCls} />
              </div>
            )
          )}
        </div>

        {/* Rounds selector */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-white text-sm font-bold uppercase tracking-wide">Generation Rounds</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROUND_PRESETS.map((preset) => (
              <button
                key={preset.rounds}
                onClick={() => setRounds(preset.rounds)}
                className="flex flex-col items-center p-3 rounded-xl border transition-all"
                style={{
                  background: rounds === preset.rounds ? "#00FF9D15" : "transparent",
                  borderColor: rounds === preset.rounds ? "#00FF9D" : "rgba(255,255,255,0.1)",
                }}
              >
                <span className="text-base font-black" style={{ color: rounds === preset.rounds ? "#00FF9D" : "white" }}>{preset.label}</span>
                <span className="text-[10px] font-mono text-white/50">{preset.sublabel}</span>
                <span className="text-[10px] text-white/30">{preset.time}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 p-2 rounded-xl bg-white/3 border border-white/5 text-center">
            <span className="text-lg font-black text-[#00FF9D]">{expectedTotal}</span>
            <span className="text-xs text-white/40 ml-2">expected questions</span>
          </div>

          {/* Round breakdown */}
          <div className="mt-3 flex flex-col gap-1">
            {Array.from({ length: rounds }, (_, i) => i + 1).map((r) => (
              <div key={r} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: (ROUND_LABELS[r]?.color || "#00FF9D") + "25", color: ROUND_LABELS[r]?.color || "#00FF9D" }}>{r}</div>
                <span className="text-xs text-white/50">{ROUND_LABELS[r]?.label}</span>
                {generating && currentRound === r && <Loader2 className="w-3 h-3 ml-auto animate-spin text-[#00FF9D]" />}
                {generating && currentRound > r && <CheckCircle className="w-3 h-3 ml-auto text-[#00FF9D]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Generate / Cancel */}
        {!generating ? (
          <button
            onClick={generate}
            disabled={!pdfText || !chapterId || extracting}
            className="py-3 px-4 font-black uppercase text-sm rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
            style={{ background: "#00FF9D", color: "black" }}
          >
            <Zap className="w-4 h-4" />
            Generate ~{expectedTotal} Questions
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="bg-[#0d1b2a] border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/50">Round <span className="text-[#00FF9D] font-bold">{currentRound}</span>/{rounds}</span>
                <span className="text-xs font-mono text-[#00FF9D]">{totalGenerated} saved</span>
              </div>
              {currentType && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Loader2 className="w-3 h-3 animate-spin text-[#00FF9D]" />
                  <span className="text-xs text-white/40">{AI_TYPES.find((t) => t.id === currentType)?.emoji} {AI_TYPES.find((t) => t.id === currentType)?.label}…</span>
                </div>
              )}
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#00FF9D] transition-all" style={{ width: `${Math.min(100, (totalGenerated / Math.max(1, expectedTotal)) * 100)}%` }} />
              </div>
              <div className="text-[10px] text-white/20 text-right mt-0.5">{Math.round((totalGenerated / Math.max(1, expectedTotal)) * 100)}%</div>
            </div>
            <button onClick={() => { cancelRef.current = true; }} className="py-2 text-xs font-bold uppercase rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-all">
              Stop After Current Type
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT RESULTS ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {!hasResults && !generating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "#00FF9D15" }}>
              <Sparkles className="w-10 h-10 text-[#00FF9D]" />
            </div>
            <div>
              <h3 className="text-white text-xl font-black mb-2">AI Question Generator</h3>
              <p className="text-white/40 text-sm max-w-sm">Upload a chapter PDF → select chapter → choose rounds → click Generate.<br/>AI creates all 12 question types across multiple difficulty rounds.</p>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2 w-full max-w-lg">
              {ROUND_PRESETS.map((p) => (
                <div key={p.rounds} className="bg-white/3 border border-white/8 rounded-xl p-3 text-center cursor-pointer hover:border-[#00FF9D]/30" onClick={() => setRounds(p.rounds)}>
                  <div className="text-sm font-black text-white">{p.label}</div>
                  <div className="text-[10px] text-[#00FF9D] font-mono">{p.sublabel}</div>
                  <div className="text-[10px] text-white/30">{p.time}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-[#0d1b2a] border border-white/10 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-black text-[#00FF9D]">{totalGenerated}</div>
                <div className="text-[10px] text-white/40 uppercase">Generated</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-white">{selected.size}</div>
                <div className="text-[10px] text-white/40 uppercase">Selected</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-white/60">{currentRound || rounds}/{rounds}</div>
                <div className="text-[10px] text-white/40 uppercase">Rounds</div>
              </div>
              {savedCount > 0 && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-400">{savedCount}</div>
                    <div className="text-[10px] text-white/40 uppercase">Saved</div>
                  </div>
                </>
              )}
              {cancelled && <span className="text-xs text-yellow-400 font-bold">⚠ Cancelled early</span>}

              <div className="ml-auto flex items-center gap-2">
                <button onClick={toggleAll} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all font-bold uppercase">
                  {selected.size >= totalGenerated ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={saveSelected}
                  disabled={selected.size === 0 || saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-black uppercase disabled:opacity-40 transition-all"
                  style={{ background: "#00FF9D" }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save {selected.size}
                </button>
              </div>
            </div>

            {/* Type tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {AI_TYPES.map((t) => {
                const qs = generated[t.id] || [];
                const isLoading = generating && currentType === t.id;
                if (qs.length === 0 && !isLoading) return null;
                const selCount = qs.filter((_, i) => selected.has(`${t.id}-${i}`)).length;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all border"
                    style={{
                      background: activeTab === t.id ? "#00FF9D" : "transparent",
                      color: activeTab === t.id ? "black" : "rgba(255,255,255,0.5)",
                      borderColor: activeTab === t.id ? "#00FF9D" : "rgba(255,255,255,0.1)",
                    }}>
                    <span>{t.emoji}</span>
                    {t.label}
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    {qs.length > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeTab === t.id ? "bg-black/20 text-black" : "bg-white/10 text-white"}`}>
                        {selCount}/{qs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab && activeQs.length > 0 && (
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-white/30 font-mono">{activeQs.length} questions</span>
                <button onClick={() => toggleTab(activeTab)} className="text-xs px-2 py-0.5 rounded border border-white/10 text-white/30 hover:text-white transition-all">Toggle tab</button>
              </div>
            )}

            {/* Question list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ maxHeight: "calc(100vh - 400px)" }}>
              {activeQs.length === 0 && generating ? (
                <div className="flex items-center justify-center gap-2 py-12 text-white/30">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Generating…</span>
                </div>
              ) : activeQs.map((q, i) => {
                const key = `${activeTab}-${i}`;
                const isSel = selected.has(key);
                return (
                  <div key={key} onClick={() => toggleQ(key)} className="border rounded-xl p-3 cursor-pointer transition-all"
                    style={{ background: isSel ? "#00FF9D08" : "rgba(255,255,255,0.02)", borderColor: isSel ? "#00FF9D40" : "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${isSel ? "bg-[#00FF9D] border-[#00FF9D]" : "border-white/20"}`}>
                        {isSel && <CheckCircle className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activeTab === "paragraph" && q.meta?.content ? (
                          <p className="text-white/80 text-xs leading-relaxed line-clamp-4">{q.meta.content}</p>
                        ) : activeTab === "pointer_notes" && q.meta?.points ? (
                          <ul className="text-white/80 text-xs space-y-0.5">
                            {(q.meta.points as string[]).slice(0, 5).map((pt: string, pi: number) => (
                              <li key={pi} className="flex gap-1"><span className="text-[#00FF9D]">•</span><span>{pt}</span></li>
                            ))}
                            {q.meta.points.length > 5 && <li className="text-white/30">+{q.meta.points.length - 5} more…</li>}
                          </ul>
                        ) : activeTab === "tricks" ? (
                          <div>
                            <p className="text-white text-xs font-bold mb-1">{q.question}</p>
                            {q.explanation && <p className="text-white/50 text-xs">{q.explanation}</p>}
                          </div>
                        ) : (
                          <>
                            <p className="text-white text-xs mb-2 leading-relaxed">{q.question}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {(["option1","option2","option3","option4"] as const).map((opt) => q[opt] ? (
                                <div key={opt} className={`text-xs px-2 py-1 rounded-lg ${q.correct === opt ? "bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/20" : "bg-white/3 text-white/50"}`}>
                                  {opt.replace("option","")}. {q[opt]}
                                </div>
                              ) : null)}
                            </div>
                            {q.explanation && <p className="text-white/30 text-xs mt-1.5 line-clamp-1">💡 {q.explanation}</p>}
                          </>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono uppercase text-white/20">{q.difficulty}</span>
                          {q.meta?.year && <span className="text-[10px] font-mono text-[#00FF9D]/40">{q.meta.year}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom save bar */}
            {selected.size > 0 && (
              <div className="mt-4 p-4 bg-[#0d1b2a] border border-[#00FF9D]/20 rounded-2xl flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">{selected.size} questions selected</p>
                  <p className="text-white/40 text-xs">Chapter: {chapterName}{subunit ? ` → ${subunit}` : ""} · Class {cls}</p>
                </div>
                <button onClick={saveSelected} disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-black font-black uppercase disabled:opacity-40 transition-all"
                  style={{ background: "#00FF9D" }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : `Save ${selected.size} Questions`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
