import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit, Trash2, X, Check, ChevronRight, Layers, List,
  ChevronUp, ChevronDown, RotateCcw, Save, AlertTriangle,
  GripVertical, BookOpen
} from "lucide-react";
import { getChapters, saveChapters, resetChapters, hasOverride, slugify } from "@/lib/chaptersManager";
import type { Chapter } from "@/lib/chaptersManager";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#aaff00]/50 focus:bg-white/8 transition-colors";
const accentBtn = "flex items-center gap-1.5 px-3 py-1.5 bg-[#aaff00] text-black text-xs font-black uppercase tracking-wider rounded hover:bg-[#c8ff40] transition-colors disabled:opacity-40";
const ghostBtn = "flex items-center gap-1 px-3 py-1.5 border border-white/15 text-white/60 text-xs rounded hover:text-white hover:border-white/30 transition-colors";
const dangerBtn = "flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/25 transition-colors";

type EditingChapter = { index: number | null; name: string; subject: string };
type EditingSubunit = { index: number | null; value: string };

function slugifyNew(name: string, existing: Chapter[]): string {
  let base = slugify(name);
  if (!existing.find((c) => c.id === base)) return base;
  let i = 2;
  while (existing.find((c) => c.id === `${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function AdminChapters() {
  const [cls, setCls] = useState<"11" | "12">("11");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const [editingChapter, setEditingChapter] = useState<EditingChapter | null>(null);
  const [editingSubunit, setEditingSubunit] = useState<EditingSubunit | null>(null);
  const [newSubunit, setNewSubunit] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");

  const isOverridden = hasOverride(cls);

  useEffect(() => {
    const data = getChapters(cls);
    setChapters(data);
    setSelectedIdx(null);
    setIsDirty(false);
    setSaveStatus("idle");
    setEditingChapter(null);
    setEditingSubunit(null);
    setShowNewChapter(false);
    setNewChapterName("");
  }, [cls]);

  const persist = useCallback((next: Chapter[]) => {
    setChapters(next);
    setIsDirty(true);
    setSaveStatus("idle");
  }, []);

  function handleSave() {
    try {
      saveChapters(cls, chapters);
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  function handleReset() {
    resetChapters(cls);
    const fresh = getChapters(cls);
    setChapters(fresh);
    setSelectedIdx(null);
    setIsDirty(false);
    setSaveStatus("idle");
    setShowResetConfirm(false);
  }

  function addChapter() {
    if (!newChapterName.trim()) return;
    const newCh: Chapter = {
      id: slugifyNew(newChapterName, chapters),
      name: newChapterName.trim(),
      subject: "Biology",
      class: cls,
      subunits: [],
    };
    const next = [...chapters, newCh];
    persist(next);
    setSelectedIdx(next.length - 1);
    setShowNewChapter(false);
    setNewChapterName("");
  }

  function deleteChapter(idx: number) {
    if (!confirm(`Delete chapter "${chapters[idx].name}" and all its subunits?`)) return;
    const next = chapters.filter((_, i) => i !== idx);
    persist(next);
    if (selectedIdx === idx) setSelectedIdx(null);
    else if (selectedIdx !== null && selectedIdx > idx) setSelectedIdx(selectedIdx - 1);
  }

  function saveChapterEdit() {
    if (!editingChapter || !editingChapter.name.trim()) return;
    const next = chapters.map((c, i) =>
      i === editingChapter.index ? { ...c, name: editingChapter.name.trim() } : c
    );
    persist(next);
    setEditingChapter(null);
  }

  function moveChapter(idx: number, dir: -1 | 1) {
    const next = [...chapters];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
    setSelectedIdx(target);
  }

  const selected = selectedIdx !== null ? chapters[selectedIdx] : null;

  function addSubunit() {
    if (!newSubunit.trim() || selectedIdx === null) return;
    const next = chapters.map((c, i) =>
      i === selectedIdx ? { ...c, subunits: [...c.subunits, newSubunit.trim()] } : c
    );
    persist(next);
    setNewSubunit("");
  }

  function deleteSubunit(sIdx: number) {
    if (selectedIdx === null) return;
    const next = chapters.map((c, i) =>
      i === selectedIdx ? { ...c, subunits: c.subunits.filter((_, j) => j !== sIdx) } : c
    );
    persist(next);
  }

  function saveSubunitEdit() {
    if (!editingSubunit || !editingSubunit.value.trim() || selectedIdx === null) return;
    const next = chapters.map((c, i) => {
      if (i !== selectedIdx) return c;
      const subs = c.subunits.map((s, j) =>
        j === editingSubunit.index ? editingSubunit.value.trim() : s
      );
      return { ...c, subunits: subs };
    });
    persist(next);
    setEditingSubunit(null);
  }

  function moveSubunit(sIdx: number, dir: -1 | 1) {
    if (selectedIdx === null) return;
    const next = chapters.map((c, i) => {
      if (i !== selectedIdx) return c;
      const subs = [...c.subunits];
      const t = sIdx + dir;
      if (t < 0 || t >= subs.length) return c;
      [subs[sIdx], subs[t]] = [subs[t], subs[sIdx]];
      return { ...c, subunits: subs };
    });
    persist(next);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Chapters & Subunits</h1>
          <p className="text-white/40 text-sm mt-1">
            {isOverridden ? (
              <span className="text-[#aaff00]/70">Custom curriculum active — overrides installed</span>
            ) : (
              "Showing default curriculum from chapters.ts"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button onClick={handleSave} className={accentBtn}>
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          )}
          {saveStatus === "saved" && (
            <span className="text-[#aaff00] text-xs font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {isOverridden && (
            <button onClick={() => setShowResetConfirm(true)} className={dangerBtn}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          )}
        </div>
      </div>

      {/* Reset confirm */}
      {showResetConfirm && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-white text-sm font-bold">Reset all Class {cls} chapters to defaults?</p>
              <p className="text-white/50 text-xs mt-0.5">All custom chapter/subunit names will be lost.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors">Yes, Reset</button>
            <button onClick={() => setShowResetConfirm(false)} className={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Class switcher */}
      <div className="flex gap-2">
        {(["11", "12"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCls(c)}
            className={`px-5 py-2 text-sm font-black uppercase tracking-widest border transition-all ${
              cls === c
                ? "bg-[#aaff00] text-black border-[#aaff00]"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            Class {c}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Chapters panel */}
        <div className="col-span-2 bg-[#0a1628] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#aaff00]" />
              <span className="text-white font-bold text-sm">Chapters</span>
              <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">{chapters.length}</span>
            </div>
            <button
              onClick={() => { setShowNewChapter(true); setNewChapterName(""); }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#aaff00]/15 border border-[#aaff00]/25 text-[#aaff00] rounded text-xs font-bold hover:bg-[#aaff00]/25 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {/* New chapter form */}
          {showNewChapter && (
            <div className="px-3 py-3 border-b border-white/10 bg-[#aaff00]/5 space-y-2">
              <label className="text-xs text-[#aaff00]/80 font-bold uppercase tracking-wider block">New Chapter Name</label>
              <input
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChapter()}
                placeholder="e.g. Reproduction in Organisms"
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={addChapter} disabled={!newChapterName.trim()} className={accentBtn}>
                  <Check className="w-3 h-3" /> Add Chapter
                </button>
                <button onClick={() => setShowNewChapter(false)} className={ghostBtn}><X className="w-3 h-3" /></button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 divide-y divide-white/5">
            {chapters.length === 0 && (
              <div className="text-center py-12 text-white/25 text-sm">No chapters for Class {cls}</div>
            )}
            {chapters.map((ch, idx) => {
              const isSelected = selectedIdx === idx;
              const isEditing = editingChapter?.index === idx;
              return (
                <div key={ch.id} className={`transition-colors ${isSelected ? "bg-[#aaff00]/8" : "hover:bg-white/3"}`}>
                  {isEditing ? (
                    <div className="px-3 py-2.5 bg-[#aaff00]/5 space-y-2">
                      <input
                        value={editingChapter.name}
                        onChange={(e) => setEditingChapter({ ...editingChapter, name: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") saveChapterEdit(); if (e.key === "Escape") setEditingChapter(null); }}
                        className={inputCls}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={saveChapterEdit} className={accentBtn}><Check className="w-3 h-3" /> Save</button>
                        <button onClick={() => setEditingChapter(null)} className={ghostBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer group"
                      onClick={() => setSelectedIdx(idx)}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-white/15 shrink-0" />
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "rotate-90 text-[#aaff00]" : "text-white/20"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isSelected ? "text-[#aaff00] font-semibold" : "text-white/75"}`}>
                          {ch.name}
                        </p>
                        <p className="text-white/25 text-xs">{ch.subunits.length} subunit{ch.subunits.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveChapter(idx, -1); }}
                          disabled={idx === 0}
                          className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveChapter(idx, 1); }}
                          disabled={idx === chapters.length - 1}
                          className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingChapter({ index: idx, name: ch.name, subject: ch.subject }); }}
                          className="p-1 text-white/30 hover:text-[#aaff00] transition-colors"
                          title="Rename"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteChapter(idx); }}
                          className="p-1 text-white/30 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Subunits panel */}
        <div className="col-span-3 bg-[#0a1628] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-3">
              <BookOpen className="w-10 h-10 text-white/10" />
              <p className="text-white/25 text-sm">Select a chapter to manage its subunits</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-[#aaff00]" />
                  <div>
                    <span className="text-white font-bold text-sm">{selected.name}</span>
                    <span className="text-white/30 text-xs ml-2">— Subunits</span>
                  </div>
                  <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">{selected.subunits.length}</span>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-white/5">
                {selected.subunits.length === 0 && (
                  <div className="text-center py-10 text-white/25 text-sm">No subunits yet — add one below</div>
                )}
                {selected.subunits.map((sub, sIdx) => {
                  const isEditing = editingSubunit?.index === sIdx;
                  return (
                    <div key={sIdx} className="group hover:bg-white/3 transition-colors">
                      {isEditing ? (
                        <div className="px-4 py-2.5 flex items-center gap-2 bg-[#aaff00]/5">
                          <span className="text-[#aaff00]/50 font-mono text-xs w-5 shrink-0">{sIdx + 1}.</span>
                          <input
                            value={editingSubunit.value}
                            onChange={(e) => setEditingSubunit({ ...editingSubunit, value: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") saveSubunitEdit(); if (e.key === "Escape") setEditingSubunit(null); }}
                            className="flex-1 bg-white/5 border border-[#aaff00]/30 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#aaff00]/60"
                            autoFocus
                          />
                          <button onClick={saveSubunitEdit} className="p-1.5 bg-[#aaff00] text-black rounded hover:bg-[#c8ff40] transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingSubunit(null)} className="p-1.5 border border-white/15 text-white/50 rounded hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 flex items-center gap-3">
                          <GripVertical className="w-3.5 h-3.5 text-white/15 shrink-0" />
                          <span className="text-[#aaff00]/50 font-mono text-xs w-5 shrink-0">{sIdx + 1}.</span>
                          <span className="text-sm text-white/80 flex-1">{sub}</span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveSubunit(sIdx, -1)}
                              disabled={sIdx === 0}
                              className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveSubunit(sIdx, 1)}
                              disabled={sIdx === selected.subunits.length - 1}
                              className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSubunit({ index: sIdx, value: sub })}
                              className="p-1 text-white/30 hover:text-[#aaff00] transition-colors"
                              title="Rename"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSubunit(sIdx)}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add subunit */}
              <div className="px-4 py-3 border-t border-white/10 bg-white/3">
                <label className="text-xs text-white/40 font-bold uppercase tracking-wider block mb-2">Add New Subunit</label>
                <div className="flex gap-2">
                  <input
                    value={newSubunit}
                    onChange={(e) => setNewSubunit(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubunit()}
                    placeholder="e.g. Mechanism of Breathing"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#aaff00]/50 transition-colors"
                  />
                  <button
                    onClick={addSubunit}
                    disabled={!newSubunit.trim()}
                    className={accentBtn}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#aaff00]/10 border border-[#aaff00]/25 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#aaff00] rounded-full animate-pulse" />
            <span className="text-[#aaff00] text-sm font-bold">Unsaved changes</span>
            <span className="text-white/50 text-xs">— Click "Save Changes" to apply and persist</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className={accentBtn}>
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
            <button
              onClick={() => { const d = getChapters(cls); setChapters(d); setIsDirty(false); setSelectedIdx(null); }}
              className={ghostBtn}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
