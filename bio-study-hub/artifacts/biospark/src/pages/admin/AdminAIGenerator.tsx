import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { api } from "@/lib/api";
import {
  Upload, Zap, CheckCircle, Loader2, AlertCircle,
  Save, Sparkles, FileText, ChevronDown, BookOpen,
  RefreshCw, Trash2, Eye
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const selectCls = "w-full bg-[#0d1b2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF9D]/50";
const labelCls = "block text-xs text-white/50 mb-1 font-medium uppercase tracking-wide";

const AI_TYPES = [
  { id: "paragraph",     label: "Study Passage",      count: 1,  emoji: "📖", description: "1 comprehensive passage" },
  { id: "pointer_notes", label: "Revision Notes",     count: 1,  emoji: "📝", description: "12–15 bullet points" },
  { id: "tricks",        label: "Tricks & Mnemonics",  count: 4,  emoji: "🧠", description: "4 memory tricks" },
  { id: "mcq",           label: "Standard MCQ",       count: 25, emoji: "❓", description: "25 questions" },
  { id: "assertion",     label: "Assertion-Reason",   count: 15, emoji: "⚖️", description: "15 questions" },
  { id: "statements",    label: "Correct Statements", count: 12, emoji: "📋", description: "12 questions" },
  { id: "truefalse",     label: "True / False",       count: 12, emoji: "✅", description: "12 questions" },
  { id: "fillblanks",    label: "Fill in the Blanks", count: 15, emoji: "✏️", description: "15 questions" },
  { id: "match",         label: "Match the Column",   count: 10, emoji: "↔️", description: "10 questions" },
  { id: "diagram",       label: "Diagram Based",      count: 10, emoji: "🔬", description: "10 questions" },
  { id: "table_based",   label: "Table Based",        count: 8,  emoji: "📊", description: "8 questions" },
  { id: "pyq",           label: "PYQ Style",          count: 15, emoji: "🏆", description: "15 prev. year style" },
];

const TOTAL_EXPECTED = AI_TYPES.reduce((s, t) => s + t.count, 0);

type ProgressStatus = "pending" | "loading" | "done" | "error";
interface TypeProgress { type: string; status: ProgressStatus; count: number; error?: string; }

async function extractTextFromPDF(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const pages: string[] = [];
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
    pages.push(lines.filter(Boolean).join("\n"));
  }
  return pages.join("\n\n");
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

  const [generating, setGenerating] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const cancelRef = useRef(false);
  const [progress, setProgress] = useState<TypeProgress[]>([]);
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
    if (!file.name.endsWith(".pdf")) return alert("Please upload a PDF file.");
    setPdfFile(file);
    setExtracting(true);
    setPdfText("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(pdf.numPages);
      const text = await extractTextFromPDF(file);
      setPdfText(text);
    } catch (err) {
      alert("Could not read PDF: " + String(err));
    } finally {
      setExtracting(false);
    }
  }

  async function generate() {
    if (!pdfText) return alert("Please upload a PDF first.");
    if (!chapterId) return alert("Please select a chapter.");
    cancelRef.current = false;
    setCancelRequested(false);
    setGenerating(true);
    setGenerated({});
    setSavedCount(0);
    setSelected(new Set());
    setProgress(AI_TYPES.map((t) => ({ type: t.id, status: "pending", count: 0 })));

    const newGenerated: Record<string, any[]> = {};

    for (const typeInfo of AI_TYPES) {
      if (cancelRef.current) break;

      setProgress((prev) =>
        prev.map((p) => (p.type === typeInfo.id ? { ...p, status: "loading" } : p))
      );

      try {
        const res = await (api.post("/admin/ai-generate-questions", {
          text: pdfText,
          chapter: chapterId,
          subunit: subunit || chapterName,
          cls,
          type: typeInfo.id,
          count: typeInfo.count,
        }) as Promise<{ questions: any[]; count: number }>);

        const qs = res.questions || [];
        newGenerated[typeInfo.id] = qs;
        setGenerated({ ...newGenerated });

        setProgress((prev) =>
          prev.map((p) => (p.type === typeInfo.id ? { ...p, status: "done", count: qs.length } : p))
        );

        if (!activeTab) setActiveTab(typeInfo.id);
      } catch (err: any) {
        setProgress((prev) =>
          prev.map((p) =>
            p.type === typeInfo.id ? { ...p, status: "error", count: 0, error: String(err) } : p
          )
        );
        newGenerated[typeInfo.id] = [];
        setGenerated({ ...newGenerated });
      }
    }

    // Auto-select all questions
    const allKeys = new Set<string>();
    for (const [tid, qs] of Object.entries(newGenerated)) {
      qs.forEach((_, i) => allKeys.add(`${tid}-${i}`));
    }
    setSelected(allKeys);
    if (!activeTab) setActiveTab(Object.keys(newGenerated)[0] || "");
    setGenerating(false);
  }

  function cancel() {
    cancelRef.current = true;
    setCancelRequested(true);
  }

  async function saveSelected() {
    setSaving(true);
    const toSave: any[] = [];
    for (const [tid, qs] of Object.entries(generated)) {
      qs.forEach((q, i) => {
        if (selected.has(`${tid}-${i}`)) toSave.push(q);
      });
    }
    if (toSave.length === 0) { setSaving(false); return; }

    try {
      for (let i = 0; i < toSave.length; i += 50) {
        await api.post("/questions", toSave.slice(i, i + 50));
      }
      setSavedCount(toSave.length);
      setSelected(new Set());
    } catch (err) {
      alert("Save failed: " + String(err));
    } finally {
      setSaving(false);
    }
  }

  const totalGenerated = Object.values(generated).reduce((s, qs) => s + qs.length, 0);
  const doneCount = progress.filter((p) => p.status === "done").length;
  const hasResults = totalGenerated > 0;

  const tabTypes = AI_TYPES.filter((t) => (generated[t.id]?.length ?? 0) > 0);

  function toggleAll() {
    if (selected.size === totalGenerated) {
      setSelected(new Set());
    } else {
      const all = new Set<string>();
      for (const [tid, qs] of Object.entries(generated)) {
        qs.forEach((_, i) => all.add(`${tid}-${i}`));
      }
      setSelected(all);
    }
  }

  function toggleTab(tid: string) {
    const qs = generated[tid] || [];
    const tabKeys = qs.map((_, i) => `${tid}-${i}`);
    const allSelected = tabKeys.every((k) => selected.has(k));
    const next = new Set(selected);
    if (allSelected) tabKeys.forEach((k) => next.delete(k));
    else tabKeys.forEach((k) => next.add(k));
    setSelected(next);
  }

  function toggleQ(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  }

  const activeQs = generated[activeTab] || [];

  return (
    <div className="flex gap-6 h-full min-h-[80vh]">

      {/* ── LEFT: Config ─────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col gap-4">

        {/* PDF Upload */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-white text-sm font-bold uppercase tracking-wide">Upload PDF</span>
          </div>

          <div
            ref={dragRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add("border-[#00FF9D]"); }}
            onDragLeave={() => dragRef.current?.classList.remove("border-[#00FF9D]")}
            onDrop={(e) => { e.preventDefault(); dragRef.current?.classList.remove("border-[#00FF9D]"); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="border-2 border-dashed border-white/15 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[#00FF9D]/40 transition-colors"
          >
            {extracting ? (
              <><Loader2 className="w-8 h-8 text-[#00FF9D] animate-spin" /><span className="text-xs text-white/50">Extracting text…</span></>
            ) : pdfFile ? (
              <>
                <CheckCircle className="w-8 h-8 text-[#00FF9D]" />
                <span className="text-xs text-white font-bold text-center truncate w-full text-center">{pdfFile.name}</span>
                <span className="text-xs text-white/40">{pageCount} pages · {Math.round(pdfText.length / 1000)}k chars</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-white/30" />
                <span className="text-xs text-white/50 text-center">Drop chapter PDF here<br />or click to browse</span>
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
            <select
              value={chapterId}
              onChange={(e) => {
                const ch = chapters.find((c) => c.id === e.target.value);
                setChapterId(e.target.value);
                setChapterName(ch?.name || "");
                setSubunit("");
              }}
              className={selectCls}
            >
              <option value="">Select chapter…</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {chapterId && chapters.find((c) => c.id === chapterId)?.subunits?.length ? (
            <div>
              <label className={labelCls}>Subunit (optional)</label>
              <select value={subunit} onChange={(e) => setSubunit(e.target.value)} className={selectCls}>
                <option value="">Whole chapter</option>
                {chapters.find((c) => c.id === chapterId)?.subunits?.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : chapterId ? (
            <div>
              <label className={labelCls}>Subunit / Topic (optional)</label>
              <input type="text" value={subunit} onChange={(e) => setSubunit(e.target.value)} placeholder="e.g. Cell Membrane" className={inputCls} />
            </div>
          ) : null}
        </div>

        {/* Types preview */}
        <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-white text-sm font-bold uppercase tracking-wide">Will Generate</span>
            <span className="ml-auto text-xs font-mono text-[#00FF9D]">~{TOTAL_EXPECTED} items</span>
          </div>
          <div className="flex flex-col gap-1">
            {AI_TYPES.map((t) => {
              const p = progress.find((pp) => pp.type === t.id);
              return (
                <div key={t.id} className="flex items-center gap-2 py-0.5">
                  <span className="text-base w-5">{t.emoji}</span>
                  <span className="text-xs text-white/70 flex-1">{t.label}</span>
                  <span className="text-xs font-mono text-white/30">{t.description}</span>
                  {p && p.status === "loading" && <Loader2 className="w-3 h-3 text-[#00FF9D] animate-spin shrink-0" />}
                  {p && p.status === "done" && <CheckCircle className="w-3 h-3 text-[#00FF9D] shrink-0" />}
                  {p && p.status === "error" && <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        {!generating ? (
          <button
            onClick={generate}
            disabled={!pdfText || !chapterId || extracting}
            className="py-3 px-4 font-black uppercase text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            style={{ background: "#00FF9D", color: "black" }}
          >
            <Zap className="w-4 h-4" />
            Generate All 12 Types
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="bg-[#0d1b2a] border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Generating… {doneCount}/{AI_TYPES.length}</span>
                <span className="text-xs font-mono text-[#00FF9D]">{totalGenerated} items</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#00FF9D] transition-all" style={{ width: `${(doneCount / AI_TYPES.length) * 100}%` }} />
              </div>
            </div>
            <button onClick={cancel} className="py-2 text-xs font-bold uppercase rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all">
              {cancelRequested ? "Finishing current…" : "Cancel"}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Results ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {!hasResults && !generating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "#00FF9D20" }}>
              <Sparkles className="w-10 h-10 text-[#00FF9D]" />
            </div>
            <div>
              <h3 className="text-white text-lg font-black mb-1">AI Question Generator</h3>
              <p className="text-white/40 text-sm max-w-sm">Upload a chapter PDF, select chapter info, then click Generate. AI will create all 12 question types automatically and save them to your database.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {AI_TYPES.slice(3).map((t) => (
                <div key={t.id} className="bg-white/3 border border-white/8 rounded-xl px-3 py-2 text-center">
                  <div className="text-lg mb-0.5">{t.emoji}</div>
                  <div className="text-xs text-white/50">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-4 p-4 bg-[#0d1b2a] border border-white/10 rounded-2xl">
              <div>
                <div className="text-2xl font-black text-[#00FF9D]">{totalGenerated}</div>
                <div className="text-xs text-white/40 uppercase">Generated</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white">{selected.size}</div>
                <div className="text-xs text-white/40 uppercase">Selected</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-black" style={{ color: "#00FF9D" }}>{doneCount}</div>
                <div className="text-xs text-white/40 uppercase">Types Done</div>
              </div>
              {savedCount > 0 && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <div className="text-2xl font-black text-green-400">{savedCount}</div>
                    <div className="text-xs text-white/40 uppercase">Saved to DB</div>
                  </div>
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button onClick={toggleAll} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all font-bold uppercase">
                  {selected.size === totalGenerated ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={saveSelected}
                  disabled={selected.size === 0 || saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-black uppercase disabled:opacity-40 transition-all"
                  style={{ background: "#00FF9D" }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save {selected.size} to DB
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {AI_TYPES.map((t) => {
                const qs = generated[t.id] || [];
                if (qs.length === 0 && progress.find((p) => p.type === t.id)?.status !== "loading") return null;
                const p = progress.find((pp) => pp.type === t.id);
                const selCount = qs.filter((_, i) => selected.has(`${t.id}-${i}`)).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all border"
                    style={{
                      background: activeTab === t.id ? "#00FF9D" : "transparent",
                      color: activeTab === t.id ? "black" : "rgba(255,255,255,0.5)",
                      borderColor: activeTab === t.id ? "#00FF9D" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                    {p?.status === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {qs.length > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeTab === t.id ? "bg-black/20 text-black" : "bg-white/10 text-white"}`}>
                        {selCount}/{qs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active tab header */}
            {activeTab && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-white/40 font-mono uppercase">{activeQs.length} items in this type</span>
                <button onClick={() => toggleTab(activeTab)} className="text-xs px-2 py-0.5 rounded border border-white/10 text-white/40 hover:text-white transition-all">
                  Toggle All in Tab
                </button>
              </div>
            )}

            {/* Question list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ maxHeight: "calc(100vh - 380px)" }}>
              {activeQs.length === 0 && progress.find((p) => p.type === activeTab)?.status === "loading" ? (
                <div className="flex items-center justify-center gap-2 py-12 text-white/40">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Generating {AI_TYPES.find((t) => t.id === activeTab)?.label}…</span>
                </div>
              ) : activeQs.map((q, i) => {
                const key = `${activeTab}-${i}`;
                const isSelected = selected.has(key);
                const isStudy = ["paragraph", "pointer_notes", "tricks"].includes(activeTab);
                return (
                  <div
                    key={key}
                    onClick={() => toggleQ(key)}
                    className="border rounded-xl p-3 cursor-pointer transition-all"
                    style={{
                      background: isSelected ? "#00FF9D08" : "rgba(255,255,255,0.02)",
                      borderColor: isSelected ? "#00FF9D40" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${isSelected ? "bg-[#00FF9D] border-[#00FF9D]" : "border-white/20"}`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-black" />}
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
                              {["option1","option2","option3","option4"].map((opt) => q[opt] ? (
                                <div key={opt} className={`text-xs px-2 py-1 rounded-lg ${q.correct === opt ? "bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/20" : "bg-white/3 text-white/50"}`}>
                                  {opt.replace("option", "")}. {q[opt]}
                                </div>
                              ) : null)}
                            </div>
                            {q.explanation && (
                              <p className="text-white/30 text-xs mt-1.5 line-clamp-2">💡 {q.explanation}</p>
                            )}
                          </>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
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
                  <p className="text-white/40 text-xs">Will be saved to chapter "{chapterName}" in Class {cls}</p>
                </div>
                <button
                  onClick={saveSelected}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-black font-black uppercase disabled:opacity-40 transition-all"
                  style={{ background: "#00FF9D" }}
                >
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
