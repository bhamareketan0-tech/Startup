import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Question } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  ChevronRight, ChevronLeft, Clock, CheckCircle, XCircle,
  AlertCircle, ArrowLeft, BookOpen, List, Play, Lightbulb,
  Trophy, RotateCcw, Target, Bookmark, BookmarkCheck, FileText, X as XIcon,
} from "lucide-react";
import { XPPopup, XPPopupManager } from "@/components/XPPopup";
import { LevelUpModal } from "@/components/LevelUpModal";
import { BadgeQueueManager } from "@/components/BadgeUnlockPopup";

const LEVEL_EMOJIS: Record<string, string> = {
  Beginner: "🌱", Novice: "📖", Apprentice: "🔬",
  Scholar: "🧪", Expert: "⚡", Master: "🏆", Champion: "👑",
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

const QUESTION_TYPES = [
  { id: "video",        label: "Video",                    isStudy: true  },
  { id: "paragraph",    label: "Paragraph",                isStudy: true  },
  { id: "pointer_notes",label: "Pointer Notes",            isStudy: true  },
  { id: "tricks",       label: "Tricks & Mnemonics",       isStudy: true  },
  { id: "mcq",          label: "Standard MCQ",             isStudy: false },
  { id: "assertion",    label: "Assertion Reason",         isStudy: false },
  { id: "statements",   label: "No. of Correct Statements",isStudy: false },
  { id: "truefalse",    label: "True / False",             isStudy: false },
  { id: "fillblanks",   label: "Fill in the Blanks",       isStudy: false },
  { id: "match",        label: "Match the Column",         isStudy: false },
  { id: "diagram",      label: "Diagram Based",            isStudy: false },
  { id: "table_based",  label: "Table Based",              isStudy: false },
  { id: "pyq",          label: "Prev Year Questions",      isStudy: false },
];

const TIMER_DURATION = 30 * 60;
const AUTOSAVE_INTERVAL = 30000;

function HighlightedText({ text, highlights }: { text: string; highlights: string[] }) {
  const filtered = (highlights || []).map((h) => h.trim()).filter((h) => h.length > 0);
  if (filtered.length === 0) return <span>{text}</span>;
  const escaped = filtered.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = filtered.some((h) => h.toLowerCase() === part.toLowerCase());
        return isHighlight
          ? <strong key={i} style={{ color: "var(--bs-accent-hex)", fontWeight: "bold" }}>{part}</strong>
          : <span key={i}>{part}</span>;
      })}
    </>
  );
}

function VideoRenderer({ q }: { q: Question }) {
  const videoUrl = (q.meta?.videoUrl as string) || "";
  const thumbnailUrl = (q.meta?.thumbnail as string) || "";
  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    return url;
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Play className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
        <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "var(--bs-accent-hex)" }}>
          Video Explanation
        </span>
      </div>
      <div className="border border-l-4 p-6 mb-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <h3 className="text-xl font-black mb-4" style={{ color: "var(--bs-text)" }}>{q.question}</h3>
        {videoUrl ? (
          <div className="relative w-full overflow-hidden border" style={{ paddingTop: "56.25%", borderColor: "var(--bs-border-subtle)" }}>
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={q.question}
            />
          </div>
        ) : thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Video thumbnail" className="w-full max-h-72 object-cover border" style={{ borderColor: "var(--bs-border-subtle)" }} />
        ) : (
          <div className="flex items-center justify-center h-48 border" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2" style={{ color: "var(--bs-border-strong)" }} />
              <p className="text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>No video URL configured</p>
            </div>
          </div>
        )}
      </div>
      {q.explanation && (
        <div className="border p-4" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}>
          <p className="text-xs font-black uppercase tracking-widest mb-2 font-mono" style={{ color: "var(--bs-accent-hex)" }}>Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ParagraphRenderer({ q }: { q: Question }) {
  const highlights = (q.meta?.highlights as string[]) || [];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
        <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "var(--bs-accent-hex)" }}>Study Material — Paragraph</span>
      </div>
      <div className="border border-l-4 p-8 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <p className="text-lg leading-[1.9] tracking-wide" style={{ color: "var(--bs-text)" }}>
          <HighlightedText text={q.question} highlights={highlights} />
        </p>
      </div>
      {highlights.length > 0 && (
        <div className="border p-4 mb-4" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}>
          <p className="text-xs font-black uppercase tracking-widest mb-2 font-mono" style={{ color: "var(--bs-accent-hex)" }}>Key Terms</p>
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <span key={i} className="px-3 py-1 border text-sm font-bold" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 30%, transparent)`, color: "var(--bs-accent-hex)" }}>{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PointerNotesRenderer({ q }: { q: Question }) {
  const bullets = (q.meta?.bullets as string[]) || [];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <List className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
        <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "var(--bs-accent-hex)" }}>Study Material — Pointer Notes</span>
      </div>
      <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <h3 className="text-xl font-black mb-6 leading-snug" style={{ color: "var(--bs-text)" }}>{q.question}</h3>
        {bullets.length > 0 ? (
          <ul className="space-y-4">
            {bullets.map((bullet, i) => {
              const colonIdx = bullet.indexOf(":");
              const hasKey = colonIdx > 0 && colonIdx < 40;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 flex-shrink-0 text-xs font-black flex items-center justify-center mt-0.5" style={{ background: "var(--bs-accent-hex)", color: "black" }}>{i + 1}</span>
                  <span className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>
                    {hasKey ? <><strong style={{ color: "var(--bs-accent-hex)" }}>{bullet.slice(0, colonIdx)}</strong>{bullet.slice(colonIdx)}</> : bullet}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm font-mono italic" style={{ color: "var(--bs-text-muted)" }}>No bullet points added.</p>
        )}
      </div>
    </div>
  );
}

function TricksRenderer({ q }: { q: Question }) {
  const tricks = (q.meta?.tricks as string[]) || [];
  const acronym = (q.meta?.acronym as string) || "";
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5" style={{ color: "var(--bs-accent-hex)" }} />
        <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "var(--bs-accent-hex)" }}>Tricks & Mnemonics</span>
      </div>
      <div className="border border-l-4 p-6 mb-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <h3 className="text-xl font-black mb-4" style={{ color: "var(--bs-text)" }}>{q.question}</h3>
        {acronym && (
          <div className="border p-4 mb-4" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 8%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 25%, transparent)` }}>
            <p className="text-xs font-black uppercase tracking-widest mb-2 font-mono" style={{ color: "var(--bs-accent-hex)" }}>Acronym / Short Form</p>
            <p className="text-2xl font-black tracking-widest" style={{ color: "var(--bs-text)" }}>{acronym}</p>
          </div>
        )}
        {tricks.length > 0 ? (
          <ul className="space-y-3">
            {tricks.map((trick, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">💡</span>
                <span className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>{trick}</span>
              </li>
            ))}
          </ul>
        ) : q.explanation ? (
          <p className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.explanation}</p>
        ) : (
          <p className="text-sm font-mono italic" style={{ color: "var(--bs-text-muted)" }}>No tricks added yet.</p>
        )}
      </div>
    </div>
  );
}

function OptionButton({ letter, value, isSelected, isCorrect, isWrong, submitted, onClick }: {
  letter: string; value: string; isSelected: boolean; isCorrect: boolean; isWrong: boolean; submitted: boolean; onClick: () => void;
}) {
  const buttonStyle = isCorrect
    ? { background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 50%, transparent)`, color: "var(--bs-text)" }
    : isWrong
      ? { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.4)", color: "var(--bs-text)" }
      : isSelected
        ? { background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 30%, transparent)`, color: "var(--bs-text)" }
        : { background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" };
  const badgeStyle = isCorrect
    ? { background: "var(--bs-accent-hex)", color: "black" }
    : isWrong
      ? { background: "#ef4444", color: "white" }
      : isSelected
        ? { background: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)`, color: "var(--bs-accent-hex)", border: `1px solid color-mix(in srgb, var(--bs-accent-hex) 50%, transparent)` }
        : { background: "var(--bs-surface-2)", color: "var(--bs-text-muted)" };
  return (
    <button onClick={onClick} disabled={submitted} className="w-full flex items-start gap-4 p-4 border text-left transition-all" style={buttonStyle}>
      <span className="w-7 h-7 flex items-center justify-center text-sm font-black shrink-0" style={badgeStyle}>{letter}</span>
      <span className="flex-1 text-sm leading-relaxed">{value}</span>
      {isCorrect && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--bs-accent-hex)" }} />}
      {isWrong && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
    </button>
  );
}

function MCQRenderer({ q, currentIndex, answers, submitted, onAnswer, yearTag }: {
  q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void; yearTag?: string;
}) {
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  return (
    <div>
      {yearTag && (
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 border text-xs font-black uppercase tracking-widest" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 8%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 25%, transparent)`, color: "var(--bs-accent-hex)" }}>
            NEET {yearTag}
          </span>
          {(q.meta?.exam as string) && (
            <span className="px-2 py-1 border text-xs font-mono uppercase" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}>
              {q.meta?.exam as string}
            </span>
          )}
        </div>
      )}
      <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
      </div>
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function AssertionRenderer({ q, currentIndex, answers, submitted, onAnswer }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void }) {
  const statementR = (q.meta?.statementR as string) || "";
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  return (
    <div>
      <div className="space-y-3 mb-6">
        <div className="border border-l-4 p-5" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
          <span className="text-xs font-black uppercase tracking-widest font-mono block mb-2" style={{ color: "var(--bs-accent-hex)" }}>Statement (A) — Assertion</span>
          <p className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
        </div>
        <div className="border border-l-4 p-5" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
          <span className="text-xs font-black uppercase tracking-widest font-mono block mb-2" style={{ color: "var(--bs-accent-hex)" }}>Statement (R) — Reason</span>
          <p className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>{statementR || q.question}</p>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function StatementsRenderer({ q, currentIndex, answers, submitted, onAnswer }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void }) {
  const stmts = (q.meta?.statements as string[]) || [];
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  return (
    <div>
      {stmts.length > 0 && (
        <div className="border border-l-4 p-6 mb-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
          <p className="text-xs font-black uppercase tracking-widest font-mono mb-4" style={{ color: "var(--bs-accent-hex)" }}>Consider the following statements:</p>
          <ol className="space-y-3">
            {stmts.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-black text-sm shrink-0 font-mono" style={{ color: "var(--bs-accent-hex)" }}>{i + 1}.</span>
                <span className="text-base leading-relaxed" style={{ color: "var(--bs-text)" }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {stmts.length === 0 && (
        <div className="border border-l-4 p-6 mb-4" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
          <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
        </div>
      )}
      <div className="border px-5 py-3 mb-5" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}>
        <p className="font-bold text-sm" style={{ color: "var(--bs-text)" }}>How many of the above statements are correct?</p>
      </div>
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function TrueFalseRenderer({ q, currentIndex, answers, submitted, onAnswer }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void }) {
  const allOptions = [
    { key: "option1", value: q.option1 || "Both statements are true" },
    { key: "option2", value: q.option2 || "Both statements are false" },
    { key: "option3", value: q.option3 || "First is true, second is false" },
    { key: "option4", value: q.option4 || "First is false, second is true" },
  ];
  const hasAll4 = q.option3 && q.option4;
  const opts = hasAll4 ? allOptions : allOptions.slice(0, 2);
  return (
    <div>
      <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
      </div>
      <div className="space-y-3 mb-6">
        {opts.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function FillBlanksRenderer({ q, currentIndex, answers, submitted, onAnswer }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void }) {
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  const displayText = q.question.includes("_") ? q.question : q.question + " _____";
  return (
    <div>
      <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>
          {displayText.split(/(_+)/).map((part, i) =>
            /^_+$/.test(part) ? (
              <span key={i} className="inline-block border-b-2 min-w-[80px] mx-1 font-bold text-center" style={{ borderColor: "var(--bs-accent-hex)", color: "var(--bs-accent-hex)" }}>
                {answers[currentIndex] ? (q[answers[currentIndex] as keyof Question] as string) : "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}
              </span>
            ) : <span key={i}>{part}</span>
          )}
        </p>
      </div>
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function MatchColumnRenderer({ q, currentIndex, answers, submitted, onAnswer }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void }) {
  const colLeft = (q.meta?.colLeft as string[]) || [];
  const colRight = (q.meta?.colRight as string[]) || [];
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  return (
    <div>
      {colLeft.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-l-4 p-5" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
            <p className="text-xs font-black uppercase tracking-widest font-mono mb-4" style={{ color: "var(--bs-accent-hex)" }}>Column I</p>
            <ol className="space-y-3">
              {colLeft.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-black text-sm shrink-0" style={{ color: "var(--bs-accent-hex)" }}>({String.fromCharCode(65 + i)})</span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--bs-text)" }}>{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-l-4 p-5" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
            <p className="text-xs font-black uppercase tracking-widest font-mono mb-4" style={{ color: "var(--bs-accent-hex)" }}>Column II</p>
            <ol className="space-y-3">
              {colRight.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-black text-sm shrink-0" style={{ color: "var(--bs-accent-hex)" }}>({i + 1})</span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--bs-text)" }}>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      {colLeft.length === 0 && (
        <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
          <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
        </div>
      )}
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function ImageMCQRenderer({ q, currentIndex, answers, submitted, onAnswer, typeLabel }: { q: Question; currentIndex: number; answers: Record<number, string>; submitted: boolean; onAnswer: (key: string) => void; typeLabel: string }) {
  const imageUrl = (q.meta?.imageUrl as string) || "";
  const tableData = q.meta?.tableData as { headers: string[]; rows: string[][] } | undefined;
  const options = ["option1", "option2", "option3", "option4"].map((key) => ({ key, value: q[key as keyof Question] as string }));
  return (
    <div>
      {imageUrl && (
        <div className="border mb-5 overflow-hidden" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "var(--bs-border-subtle)", background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)` }}>
            <span className="text-xs font-black uppercase tracking-widest font-mono" style={{ color: "var(--bs-accent-hex)" }}>{typeLabel}</span>
          </div>
          <img src={imageUrl} alt={typeLabel} className="w-full max-h-72 object-contain p-3" style={{ background: "#fff" }} />
        </div>
      )}
      {tableData && (
        <div className="overflow-x-auto mb-5 border" style={{ borderColor: "var(--bs-border-subtle)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)` }}>
                {tableData.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2 text-left font-black uppercase tracking-wide text-xs border-b border-r last:border-r-0" style={{ color: "var(--bs-accent-hex)", borderColor: "var(--bs-border-subtle)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "var(--bs-surface)" : `color-mix(in srgb, var(--bs-accent-hex) 3%, var(--bs-surface))` }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 border-b border-r last:border-r-0" style={{ color: "var(--bs-text)", borderColor: "var(--bs-border-subtle)" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="border border-l-4 p-6 mb-6" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)", borderLeftColor: "var(--bs-accent-hex)" }}>
        <p className="text-lg leading-relaxed" style={{ color: "var(--bs-text)" }}>{q.question}</p>
      </div>
      <div className="space-y-3 mb-6">
        {options.map((opt, i) => (
          <OptionButton key={opt.key} letter={["A","B","C","D"][i]} value={opt.value || ""} isSelected={answers[currentIndex] === opt.key} isCorrect={submitted && opt.key === q.correct} isWrong={submitted && answers[currentIndex] === opt.key && opt.key !== q.correct} submitted={submitted} onClick={() => !submitted && onAnswer(opt.key)} />
        ))}
      </div>
    </div>
  );
}

function CompletionScreen({
  correct, wrong, skipped, total, timeTaken, subunit, chapterId, cls, onRetry, onChapterTest,
}: {
  correct: number; wrong: number; skipped: number; total: number; timeTaken: number;
  subunit: string; chapterId: string; cls: string;
  onRetry: () => void; onChapterTest: () => void;
}) {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const accuracy = total - skipped > 0 ? Math.round((correct / (total - skipped)) * 100) : 0;
  const minutes = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto flex items-center justify-center mb-4 transform -skew-x-12"
            style={{ background: score >= 70 ? "var(--bs-accent-hex)" : score >= 40 ? "#f59e0b" : "#ef4444" }}
          >
            <Trophy className="w-10 h-10 transform skew-x-12 text-black" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-1" style={{ color: "var(--bs-text)" }}>
            {score >= 70 ? "Excellent!" : score >= 40 ? "Good Effort!" : "Keep Practicing!"}
          </h2>
          <p className="font-mono uppercase tracking-wide text-sm" style={{ color: "var(--bs-text-muted)" }}>{subunit}</p>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-black mb-1" style={{ color: score >= 70 ? "var(--bs-accent-hex)" : score >= 40 ? "#f59e0b" : "#ef4444" }}>
            {score}%
          </div>
          <p className="font-mono uppercase tracking-widest text-xs" style={{ color: "var(--bs-text-muted)" }}>Score</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Correct", value: correct, color: "var(--bs-accent-hex)" },
            { label: "Wrong", value: wrong, color: "#ef4444" },
            { label: "Skipped", value: skipped, color: "#f59e0b" },
            { label: "Accuracy", value: `${accuracy}%`, color: "var(--bs-text)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border p-3 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="text-xl font-black" style={{ color }}>{value}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: "var(--bs-text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="border p-3 mb-6 text-center" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
          <p className="text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
            Time taken: <span style={{ color: "var(--bs-text)" }}>{minutes}m {secs}s</span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onChapterTest}
            className="w-full py-3 font-black uppercase tracking-widest text-sm transform -skew-x-12 relative"
            style={{ background: "var(--bs-accent-hex)", color: "black" }}
          >
            <span className="transform skew-x-12 inline-flex items-center gap-2">
              <Target className="w-4 h-4" />
              Start Chapter Mock Test
            </span>
          </button>
          <button
            onClick={onRetry}
            className="w-full py-3 border font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export function PracticePage() {
  const { cls, chapterId, subunit } = useParams<{ cls: string; chapterId: string; subunit: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState("mcq");
  const [mobileStep, setMobileStep] = useState<"type" | "question">("type");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completionStats, setCompletionStats] = useState({ correct: 0, wrong: 0, skipped: 0, total: 0, timeTaken: 0 });
  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [notePopupId, setNotePopupId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [xpEvents, setXpEvents] = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: string; emoji: string; xp: number; totalXP: number } | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<Array<{ id: string; name: string; emoji: string; description: string }>>([]);

  const toggleBookmark = async (q: Question) => {
    if (!user) return;
    const id = q.id;
    setBookmarkedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
    await api.post("/bookmarks", {
      question_id: id,
      question_text: q.question,
      chapter: q.chapter || chapterId,
      subunit: q.subunit || decodedSubunit,
      class: q.class || cls,
      question_type: q.type,
      difficulty: q.difficulty,
    }).catch(() => {});
  };

  const openNote = (q: Question) => {
    setNotePopupId(q.id);
    setNoteDraft(savedNotes[q.id] || "");
  };

  const saveNote = async (q: Question) => {
    if (!user) return;
    const text = noteDraft;
    setSavedNotes((prev) => ({ ...prev, [q.id]: text }));
    setNotePopupId(null);
    await api.put(`/notes/${q.id}`, {
      note_text: text,
      question_text: q.question,
      chapter: q.chapter || chapterId,
      subunit: q.subunit || decodedSubunit,
      class: q.class || cls,
    }).catch(() => {});
  };

  const decodedSubunit = subunit ? decodeURIComponent(subunit) : "";
  const currentTypeObj = QUESTION_TYPES.find((t) => t.id === selectedType);
  const isStudyType = currentTypeObj?.isStudy ?? false;

  async function fetchQuestions(typeId: string) {
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setCompleted(false);
    setTimeLeft(TIMER_DURATION);

    try {
      let excludeParam = "";
      if (user && !isStudyType) {
        try {
          const seenRes = await fetch(
            `${API_BASE}/seen-questions?chapter=${chapterId}&subunit=${encodeURIComponent(decodedSubunit)}&class=${cls}&type=${typeId}`,
            { credentials: "include" }
          );
          if (seenRes.ok) {
            const seenData = await seenRes.json() as { seen_ids: string[] };
            if (seenData.seen_ids?.length > 0) excludeParam = seenData.seen_ids.join(",");
          }
        } catch {}
      }

      const params: Record<string, string | number | boolean> = {
        class: cls || "",
        chapter: chapterId || "",
        subunit: decodedSubunit,
        type: typeId,
        is_active: true,
        limit: 200,
      };
      if (excludeParam) params.exclude = excludeParam;

      const res = await api.get("/questions", params);
      const fetched = (res.data || []) as Question[];

      if (fetched.length === 0 && excludeParam) {
        const res2 = await api.get("/questions", { class: cls || "", chapter: chapterId || "", subunit: decodedSubunit, type: typeId, is_active: true, limit: 200 });
        setQuestions((res2.data || []) as Question[]);
      } else {
        setQuestions(fetched);
      }
    } catch {
      setQuestions([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchQuestions(selectedType);
  }, [cls, chapterId, subunit, selectedType]);

  useEffect(() => {
    if (isStudyType || submitted || questions.length === 0 || completed) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, questions.length, isStudyType, completed]);

  useEffect(() => {
    if (submitted || isStudyType) return;
    autosaveRef.current = setInterval(() => {
      if (user && questions.length > 0) {
        const done = Object.keys(answers).length;
        if (done > 0) {
          localStorage.setItem(
            `biospark_progress_${cls}_${chapterId}_${encodeURIComponent(decodedSubunit)}_${selectedType}`,
            JSON.stringify({ answers, currentIndex, timeLeft, savedAt: Date.now() })
          );
        }
      }
    }, AUTOSAVE_INTERVAL);
    return () => { if (autosaveRef.current) clearInterval(autosaveRef.current); };
  }, [answers, currentIndex, timeLeft, submitted, isStudyType, questions.length]);

  const handleTimerEnd = useCallback(() => { if (!submitted) handleSubmit(); }, [submitted, questions, answers]);

  async function handleSubmit() {
    setSubmitted(true);
    setCompleted(true);
    const timeTaken = TIMER_DURATION - timeLeft;
    let correct = 0, wrong = 0, skipped = 0;
    const total = questions.length;
    questions.forEach((q, i) => {
      if (!answers[i]) skipped++;
      else if (answers[i] === q.correct) correct++;
      else wrong++;
    });
    const score = Math.round((correct / total) * 100) || 0;
    setCompletionStats({ correct, wrong, skipped, total, timeTaken });

    localStorage.removeItem(`biospark_progress_${cls}_${chapterId}_${encodeURIComponent(decodedSubunit)}_${selectedType}`);

    if (user) {
      await api.post("/attempts", { user_id: user.id, chapter: chapterId, subunit: decodedSubunit, class: cls, score, correct, wrong, skipped, total, time_taken: timeTaken }).catch(() => null);
      const questionIds = questions.map((q) => q.id).filter(Boolean);
      if (questionIds.length > 0) {
        await fetch(`${API_BASE}/seen-questions/mark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ chapter: chapterId, subunit: decodedSubunit, class: cls, type: selectedType, question_ids: questionIds }),
        }).catch(() => null);
      }
      if (user) {
        try {
          type QAResult = { xpResult?: { xpAwarded: number; totalXP: number; leveledUp: boolean; newLevel: string }; newBadges?: Array<{ id: string; name: string; emoji: string; description: string }> };
          const qaCalls = questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return api.post("/question-attempts", {
              question_id: q.id,
              question_text: q.question,
              chapter: q.chapter || chapterId,
              subunit: q.subunit || decodedSubunit,
              class: q.class || cls,
              question_type: q.type,
              difficulty: q.difficulty,
              is_correct: isCorrect,
              user_answer: answers[i] || "",
              correct_answer: q.correct,
            }).catch(() => null) as Promise<QAResult | null>;
          });
          const results = await Promise.all(qaCalls);
          let totalEarned = 0;
          let leveledUp = false;
          let newLevel = "";
          let latestTotalXP = 0;
          const allNewBadges: Array<{ id: string; name: string; emoji: string; description: string }> = [];
          for (const r of results) {
            if (!r?.xpResult) continue;
            totalEarned += r.xpResult.xpAwarded;
            if (r.xpResult.leveledUp) { leveledUp = true; newLevel = r.xpResult.newLevel; latestTotalXP = r.xpResult.totalXP; }
            if (r.newBadges?.length) allNewBadges.push(...r.newBadges);
          }
          if (totalEarned > 0) {
            setXpEvents((prev) => [...prev, { id: Date.now().toString(), amount: totalEarned }]);
            if (leveledUp) {
              setLevelUpInfo({ level: newLevel, emoji: LEVEL_EMOJIS[newLevel] || "🌱", xp: totalEarned, totalXP: latestTotalXP });
            }
            refreshProfile().catch(() => {});
          }
          if (allNewBadges.length > 0) setBadgeQueue((prev) => [...prev, ...allNewBadges]);
        } catch {}
      }
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const currentQ = questions[currentIndex];
  const currentTypeName = currentTypeObj?.label ?? selectedType;

  function renderQuestionContent() {
    if (!currentQ) return null;
    const commonProps = { q: currentQ, currentIndex, answers, submitted, onAnswer: (key: string) => setAnswers({ ...answers, [currentIndex]: key }) };
    switch (currentQ.type) {
      case "video":        return <VideoRenderer q={currentQ} />;
      case "paragraph":    return <ParagraphRenderer q={currentQ} />;
      case "pointer_notes":return <PointerNotesRenderer q={currentQ} />;
      case "tricks":       return <TricksRenderer q={currentQ} />;
      case "assertion":    return <AssertionRenderer {...commonProps} />;
      case "statements":   return <StatementsRenderer {...commonProps} />;
      case "truefalse":    return <TrueFalseRenderer {...commonProps} />;
      case "fillblanks":   return <FillBlanksRenderer {...commonProps} />;
      case "match":        return <MatchColumnRenderer {...commonProps} />;
      case "diagram":      return <ImageMCQRenderer {...commonProps} typeLabel="Diagram" />;
      case "table_based":  return <ImageMCQRenderer {...commonProps} typeLabel="Table" />;
      case "pyq":          return <MCQRenderer {...commonProps} yearTag={(currentQ.meta?.year as string) || ""} />;
      default:             return <MCQRenderer {...commonProps} />;
    }
  }

  const SidebarTypeList = () => (
    <div className="space-y-1">
      {QUESTION_TYPES.map((type, idx) => (
        <button
          key={type.id}
          onClick={() => { setSelectedType(type.id); setCurrentIndex(0); setAnswers({}); setSubmitted(false); setCompleted(false); }}
          className="w-full text-left px-3 py-2 text-xs transition-all font-mono uppercase tracking-wide border-l-2"
          style={selectedType === type.id
            ? { borderLeftColor: "var(--bs-accent-hex)", color: "var(--bs-accent-hex)", background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)` }
            : { borderLeftColor: "transparent", color: "var(--bs-text-muted)" }
          }
        >
          <span style={{ color: "var(--bs-border-strong)" }} className="mr-2">{idx + 1}.</span>
          {type.label}
          {type.isStudy && (
            <span className="ml-1 text-[9px] opacity-60" style={{ color: "var(--bs-accent-hex)" }}>STUDY</span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative font-['Space_Grotesk']" style={{ background: "transparent" }}>
      <XPPopupManager events={xpEvents} onRemove={(id) => setXpEvents((prev) => prev.filter((e) => e.id !== id))} />
      {levelUpInfo && <LevelUpModal level={levelUpInfo.level} emoji={levelUpInfo.emoji} xp={levelUpInfo.xp} totalXP={levelUpInfo.totalXP} onClose={() => setLevelUpInfo(null)} />}
      <BadgeQueueManager badges={badgeQueue} onRemove={(id) => setBadgeQueue((prev) => prev.filter((b) => b.id !== id))} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

      {/* ── MOBILE STEP 1: Type Selector ── */}
      <div className={`md:hidden relative z-10 flex flex-col min-h-screen ${mobileStep !== "type" ? "hidden" : ""}`}>
        <div className="sticky top-0 z-20 border-b px-5 py-4" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide mb-2" style={{ color: "var(--bs-text-muted)" }}>
            <ArrowLeft className="w-4 h-4" />Back
          </button>
          <h2 className="font-black text-base uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>{decodedSubunit}</h2>
          <p className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>{cls === "dropper" ? "Dropper" : `Class ${cls}`}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-xs mb-4 font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Choose Question Type</p>
          <div className="space-y-2">
            {QUESTION_TYPES.map((type, idx) => (
              <button
                key={type.id}
                onClick={() => { setSelectedType(type.id); setCurrentIndex(0); setAnswers({}); setSubmitted(false); setCompleted(false); setMobileStep("question"); }}
                className="w-full flex items-center justify-between px-5 py-4 border-l-4 transition-all"
                style={selectedType === type.id
                  ? { borderLeftColor: "var(--bs-accent-hex)", background: `color-mix(in srgb, var(--bs-accent-hex) 12%, var(--bs-surface))`, color: "var(--bs-accent-hex)" }
                  : { borderLeftColor: "transparent", background: "var(--bs-surface)", color: "var(--bs-text)", borderColor: "var(--bs-border-subtle)" }
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono w-5" style={{ color: "var(--bs-border-strong)" }}>{idx + 1}.</span>
                  <div>
                    <div className="font-black text-sm uppercase tracking-wide">{type.label}</div>
                    {type.isStudy && <div className="text-[10px] font-mono uppercase" style={{ color: "var(--bs-accent-hex)", opacity: 0.7 }}>Study</div>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE STEP 2: Question View ── */}
      <div className={`md:hidden relative z-10 flex flex-col min-h-screen ${mobileStep !== "question" ? "hidden" : ""}`}>
        <div className="sticky top-0 z-20 border-b" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => setMobileStep("type")} className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
              <ArrowLeft className="w-4 h-4" />Types
            </button>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--bs-accent-hex)" }}>{currentTypeName}</p>
              <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{currentIndex + 1} / {questions.length || 0}</p>
            </div>
            {!isStudyType
              ? <span className="text-sm font-black font-mono" style={{ color: timeLeft < 300 ? "#ef4444" : "var(--bs-accent-hex)" }}>{formatTime(timeLeft)}</span>
              : <BookOpen className="w-4 h-4" style={{ color: "var(--bs-accent-hex)" }} />
            }
          </div>
          <div className="h-0.5 w-full" style={{ background: "var(--bs-border-subtle)" }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: "var(--bs-accent-hex)" }} />
          </div>
        </div>

        {completed && !isStudyType ? (
          <CompletionScreen
            {...completionStats}
            subunit={decodedSubunit}
            chapterId={chapterId || ""}
            cls={cls || ""}
            onRetry={() => { fetchQuestions(selectedType); setMobileStep("question"); }}
            onChapterTest={() => navigate(`/mock-test?class=${cls}&chapter=${chapterId}`)}
          />
        ) : (
          <>
            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: "var(--bs-accent-hex) transparent transparent transparent" }} />
                    <p className="font-mono uppercase text-xs" style={{ color: "var(--bs-text-muted)" }}>Loading...</p>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--bs-border-strong)" }} />
                    <p className="font-black uppercase text-sm mb-1" style={{ color: "var(--bs-text)" }}>No content yet</p>
                    <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>No {currentTypeName} for this subunit</p>
                    <button onClick={() => setMobileStep("type")} className="mt-4 px-4 py-2 border text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>Choose Another Type</button>
                  </div>
                </div>
              ) : currentQ ? (
                <div>
                  {!isStudyType && currentQ.difficulty && (
                    <div className="mb-3">
                      <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-widest border ${currentQ.difficulty === "easy" ? "bg-[#00FF9D]/10 border-[#00FF9D]/20 text-[#00FF9D]" : currentQ.difficulty === "hard" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-white/70"}`}>
                        {currentQ.difficulty}
                      </span>
                    </div>
                  )}
                  {user && !isStudyType && (
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => toggleBookmark(currentQ)} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase min-h-[36px] transition-all" style={{ borderColor: bookmarkedIds.has(currentQ.id) ? "#00FF9D" : "var(--bs-border-subtle)", color: bookmarkedIds.has(currentQ.id) ? "#00FF9D" : "var(--bs-text-muted)", background: bookmarkedIds.has(currentQ.id) ? "rgba(0,255,157,0.08)" : "transparent" }}>
                        {bookmarkedIds.has(currentQ.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        {bookmarkedIds.has(currentQ.id) ? "Saved" : "Bookmark"}
                      </button>
                      <button onClick={() => openNote(currentQ)} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase min-h-[36px] transition-all" style={{ borderColor: savedNotes[currentQ.id] ? "#00FF9D" : "var(--bs-border-subtle)", color: savedNotes[currentQ.id] ? "#00FF9D" : "var(--bs-text-muted)", background: savedNotes[currentQ.id] ? "rgba(0,255,157,0.08)" : "transparent" }}>
                        <FileText className="w-3.5 h-3.5" />{savedNotes[currentQ.id] ? "Edit Note" : "Add Note"}
                      </button>
                    </div>
                  )}
                  {notePopupId === currentQ.id && (
                    <div className="border mb-4 p-4" style={{ background: "var(--bs-surface-2)", borderColor: "#00FF9D44" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase" style={{ color: "#00FF9D" }}>My Note</span>
                        <button onClick={() => setNotePopupId(null)} className="p-1" style={{ color: "var(--bs-text-muted)" }}><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                      <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Write your note here..." className="w-full border p-2 text-sm font-mono bg-transparent outline-none resize-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", minHeight: "80px" }} autoFocus />
                      <button onClick={() => saveNote(currentQ)} className="mt-2 px-4 py-1.5 text-xs font-black uppercase" style={{ background: "#00FF9D", color: "black" }}>Save Note</button>
                    </div>
                  )}
                  {renderQuestionContent()}
                  {!isStudyType && submitted && currentQ.explanation && (
                    <div className="border border-l-4 p-4 mt-4" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)`, borderLeftColor: "var(--bs-accent-hex)" }}>
                      <h4 className="font-black text-xs uppercase tracking-widest mb-2" style={{ color: "var(--bs-accent-hex)" }}>Explanation</h4>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-0 border-t px-4 py-4 flex gap-3" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
              <button
                onClick={() => currentIndex === 0 ? setMobileStep("type") : setCurrentIndex(currentIndex - 1)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border text-xs font-black uppercase tracking-widest"
                style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                {currentIndex === 0 ? "Types" : "Prev"}
              </button>
              <button
                onClick={() => {
                  if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
                  else if (!isStudyType && !submitted) handleSubmit();
                }}
                disabled={questions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-widest disabled:opacity-40"
                style={{ background: "var(--bs-accent-hex)", color: "black" }}
              >
                {currentIndex < questions.length - 1 ? <><span>Next</span><ChevronRight className="w-4 h-4" /></> : isStudyType ? <><span>Done</span><CheckCircle className="w-4 h-4" /></> : <><span>Submit</span><CheckCircle className="w-4 h-4" /></>}
              </button>
              {!isStudyType && (
                <button
                  onClick={handleSubmit}
                  disabled={questions.length === 0}
                  className="px-4 py-3.5 border text-xs font-black uppercase tracking-widest disabled:opacity-30"
                  style={{ borderColor: "var(--bs-accent-hex)", color: "var(--bs-accent-hex)" }}
                >
                  End
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── DESKTOP Layout ── */}
      <div className="hidden md:flex relative z-10 pt-20 h-screen">
        {/* Sidebar */}
        <div className="w-72 border-r flex flex-col" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm transition-colors mb-3 font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
              <ArrowLeft className="w-4 h-4" />Back
            </button>
            <h2 className="font-black text-sm truncate uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>{decodedSubunit}</h2>
            <p className="text-xs font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>{cls === "dropper" ? "Dropper" : `Class ${cls}`}</p>
          </div>

          {!isStudyType && (
            <div className="p-4 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" style={{ color: "var(--bs-secondary-hex)" }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Time Remaining</span>
              </div>
              <div className="text-2xl font-black font-mono" style={{ color: timeLeft < 300 ? "#ef4444" : "var(--bs-accent-hex)" }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          {isStudyType && (
            <div className="p-4 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: "var(--bs-accent-hex)" }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-accent-hex)" }}>Study Mode</span>
              </div>
              <p className="text-xs mt-1 font-mono" style={{ color: "var(--bs-text-muted)" }}>Read carefully and absorb the material</p>
            </div>
          )}

          <div className="p-4 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
            <div className="flex justify-between text-xs mb-2 font-mono uppercase" style={{ color: "var(--bs-text-muted)" }}>
              <span>Progress</span>
              <span>{currentIndex + 1}/{questions.length || 0}</span>
            </div>
            <div className="h-1.5 overflow-hidden" style={{ background: "var(--bs-border-subtle)" }}>
              <div className="h-full transition-all" style={{ width: `${progress}%`, background: "var(--bs-accent-hex)" }} />
            </div>
            {!isStudyType && (
              <div className="grid grid-cols-3 gap-1 mt-3 text-center text-xs">
                <div className="border p-1" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)` }}>
                  <div className="font-black" style={{ color: "var(--bs-accent-hex)" }}>{questions.filter((_, i) => answers[i] !== undefined).length}</div>
                  <div className="font-mono uppercase text-[10px]" style={{ color: "var(--bs-text-muted)" }}>Done</div>
                </div>
                <div className="border p-1" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <div className="font-black" style={{ color: "var(--bs-text-muted)" }}>{questions.filter((_, i) => answers[i] === undefined).length}</div>
                  <div className="font-mono uppercase text-[10px]" style={{ color: "var(--bs-text-muted)" }}>Left</div>
                </div>
                <div className="border p-1" style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}>
                  <div className="font-black" style={{ color: "var(--bs-text)" }}>{questions.length}</div>
                  <div className="font-mono uppercase text-[10px]" style={{ color: "var(--bs-text-muted)" }}>Total</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-xs mb-3 font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Question Type</p>
            <SidebarTypeList />
          </div>

          {!isStudyType && (
            <div className="p-4 border-t" style={{ borderColor: "var(--bs-border-subtle)" }}>
              <div className="relative group">
                <div className="absolute inset-0 transform -skew-x-12 translate-x-1 translate-y-1 opacity-30 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                <button onClick={handleSubmit} disabled={questions.length === 0} className="relative w-full py-2.5 font-black uppercase tracking-widest text-sm hover:opacity-90 transition-colors disabled:opacity-50 transform -skew-x-12" style={{ background: "var(--bs-accent-hex)", color: "black" }}>
                  <span className="transform skew-x-12 inline-block">Submit Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {completed && !isStudyType ? (
            <CompletionScreen
              {...completionStats}
              subunit={decodedSubunit}
              chapterId={chapterId || ""}
              cls={cls || ""}
              onRetry={() => fetchQuestions(selectedType)}
              onChapterTest={() => navigate(`/mock-test?class=${cls}&chapter=${chapterId}`)}
            />
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "var(--bs-accent-hex) transparent transparent transparent" }} />
                <p className="font-mono uppercase tracking-widest text-sm" style={{ color: "var(--bs-text-muted)" }}>Loading...</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--bs-border-strong)" }} />
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter" style={{ color: "var(--bs-text)" }}>No content available</h3>
                <p className="text-sm mb-6 font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>
                  No {currentTypeName} found for this subunit yet.
                </p>
                <button onClick={() => navigate(-1)} className="px-6 py-2.5 border text-sm font-black uppercase tracking-widest" style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}>
                  Go Back
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="inline-flex items-center gap-2 border px-3 py-1 transform -skew-x-12"
                    style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 10%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 30%, transparent)` }}
                  >
                    <span className="text-xs font-black uppercase tracking-widest transform skew-x-12" style={{ color: "var(--bs-accent-hex)" }}>
                      {isStudyType ? `Item ${currentIndex + 1} of ${questions.length}` : `Q ${currentIndex + 1} of ${questions.length}`}
                    </span>
                  </div>
                  {!isStudyType && currentQ.difficulty && (
                    <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest border ${currentQ.difficulty === "easy" ? "bg-[#00FF9D]/10 border-[#00FF9D]/20 text-[#00FF9D]" : currentQ.difficulty === "hard" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-white/70"}`}>
                      {currentQ.difficulty}
                    </span>
                  )}
                  {user && !isStudyType && (
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => toggleBookmark(currentQ)} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase min-h-[36px] transition-all" style={{ borderColor: bookmarkedIds.has(currentQ.id) ? "#00FF9D" : "var(--bs-border-subtle)", color: bookmarkedIds.has(currentQ.id) ? "#00FF9D" : "var(--bs-text-muted)", background: bookmarkedIds.has(currentQ.id) ? "rgba(0,255,157,0.08)" : "transparent" }} title={bookmarkedIds.has(currentQ.id) ? "Remove bookmark" : "Bookmark this question"}>
                        {bookmarkedIds.has(currentQ.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        {bookmarkedIds.has(currentQ.id) ? "Saved" : "Save"}
                      </button>
                      <button onClick={() => openNote(currentQ)} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-black uppercase min-h-[36px] transition-all" style={{ borderColor: savedNotes[currentQ.id] ? "#00FF9D" : "var(--bs-border-subtle)", color: savedNotes[currentQ.id] ? "#00FF9D" : "var(--bs-text-muted)", background: savedNotes[currentQ.id] ? "rgba(0,255,157,0.08)" : "transparent" }} title="Add/edit note">
                        <FileText className="w-3.5 h-3.5" />{savedNotes[currentQ.id] ? "Note ✓" : "Note"}
                      </button>
                    </div>
                  )}
                </div>

                {notePopupId === currentQ.id && (
                  <div className="border mb-4 p-4" style={{ background: "var(--bs-surface-2)", borderColor: "#00FF9D44" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase" style={{ color: "#00FF9D" }}>My Note for this Question</span>
                      <button onClick={() => setNotePopupId(null)} className="p-1" style={{ color: "var(--bs-text-muted)" }}><XIcon className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Write your revision note here..." className="w-full border p-2 text-sm font-mono bg-transparent outline-none resize-none" style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text)", minHeight: "80px" }} autoFocus />
                    <button onClick={() => saveNote(currentQ)} className="mt-2 px-4 py-1.5 text-xs font-black uppercase" style={{ background: "#00FF9D", color: "black" }}>Save Note</button>
                  </div>
                )}

                {renderQuestionContent()}

                {!isStudyType && submitted && currentQ.explanation && (
                  <div className="border border-l-4 p-4 mb-6" style={{ background: `color-mix(in srgb, var(--bs-accent-hex) 5%, transparent)`, borderColor: `color-mix(in srgb, var(--bs-accent-hex) 20%, transparent)`, borderLeftColor: "var(--bs-accent-hex)" }}>
                    <h4 className="font-black text-sm mb-2 uppercase tracking-widest" style={{ color: "var(--bs-accent-hex)" }}>Explanation</h4>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--bs-text-muted)" }}>{currentQ.explanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-2.5 border transition-colors disabled:opacity-30 text-sm font-black uppercase tracking-widest"
                    style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text)" }}
                  >
                    <ChevronLeft className="w-4 h-4" />Previous
                  </button>

                  <div className="flex items-center gap-3">
                    {!isStudyType && (
                      <button
                        onClick={() => { setAnswers({ ...answers, [currentIndex]: "" }); }}
                        className="px-4 py-2.5 border text-sm font-black uppercase tracking-widest flex items-center gap-1"
                        style={{ borderColor: "var(--bs-border-subtle)", color: "var(--bs-text-muted)" }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />Retry
                      </button>
                    )}
                    <div className="relative group">
                      <div className="absolute inset-0 transform -skew-x-12 translate-x-1.5 translate-y-1.5 opacity-30 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" style={{ background: "var(--bs-accent-hex)" }} />
                      <button
                        onClick={() => {
                          if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
                          else if (!isStudyType && !submitted) handleSubmit();
                          else navigate(-1);
                        }}
                        className="relative flex items-center gap-2 px-5 py-2.5 font-black uppercase tracking-widest text-sm transform -skew-x-12"
                        style={{ background: "var(--bs-accent-hex)", color: "black" }}
                      >
                        <span className="transform skew-x-12 inline-flex items-center gap-2">
                          {currentIndex < questions.length - 1 ? <><span>Next</span><ChevronRight className="w-4 h-4" /></>
                            : isStudyType ? <><span>Done</span><CheckCircle className="w-4 h-4" /></>
                            : <><span>Submit</span><CheckCircle className="w-4 h-4" /></>}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
