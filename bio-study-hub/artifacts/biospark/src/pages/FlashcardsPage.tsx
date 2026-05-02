import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Layers } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  class: string;
  chapter: string;
  subunit: string;
}

interface ChapterGroup {
  chapter: string;
  cls: string;
  cards: Flashcard[];
}

function FlipCard({ card, flipped, onFlip }: { card: Flashcard; flipped: boolean; onFlip: () => void }) {
  return (
    <div onClick={onFlip} style={{ width: "100%", maxWidth: 540, aspectRatio: "3/2", cursor: "pointer", perspective: 1200, margin: "0 auto" }}>
      <div style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        {/* Front */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#111111", border: "1px solid #00FF9D33", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <span style={{ fontSize: 11, color: "#00FF9D", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Question</span>
          {card.frontImage && <img src={card.frontImage} alt="" style={{ maxHeight: 120, objectFit: "contain", marginBottom: 16, borderRadius: 8 }} />}
          <p style={{ color: "#fff", fontSize: 18, fontWeight: 600, textAlign: "center", lineHeight: 1.6 }}>{card.front}</p>
          <p style={{ color: "#ffffff30", fontSize: 12, marginTop: 20 }}>Tap to reveal answer</p>
        </div>
        {/* Back */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#0d1a12", border: "1px solid #00FF9D55", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <span style={{ fontSize: 11, color: "#00FF9D", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Answer</span>
          {card.backImage && <img src={card.backImage} alt="" style={{ maxHeight: 120, objectFit: "contain", marginBottom: 16, borderRadius: 8 }} />}
          <p style={{ color: "#00FF9D", fontSize: 18, fontWeight: 600, textAlign: "center", lineHeight: 1.6 }}>{card.back}</p>
        </div>
      </div>
    </div>
  );
}

function CardSession({ group, onBack }: { group: ChapterGroup; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [mastered, setMastered] = useState<Record<string, number>>({});
  const startX = useRef(0);

  const deck = group.cards.filter(c => !mastered[c.id] || mastered[c.id] < 3);
  const current = deck[index];
  const masteredCount = group.cards.filter(c => (mastered[c.id] || 0) >= 3).length;

  function handleKnow() {
    const m = { ...mastered };
    m[current.id] = (m[current.id] || 0) + 1;
    setMastered(m);
    setKnown(k => new Set([...k, current.id]));
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(i, deck.length - 2)), 50);
  }

  function handleUnknow() {
    setUnknown(u => new Set([...u, current.id]));
    setFlipped(false);
    setIndex(i => (i + 1) % deck.length);
  }

  function handleTouchStart(e: React.TouchEvent) { startX.current = e.touches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(diff) > 60) diff > 0 ? handleKnow() : handleUnknow();
  }

  if (deck.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#00FF9D", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Chapter Complete!</h2>
        <p style={{ color: "#ffffff60", marginBottom: 8 }}>You've mastered all {group.cards.length} flashcards in {group.chapter}</p>
        <button onClick={onBack} style={{ marginTop: 24, padding: "12px 24px", background: "#00FF9D", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Back to Chapters</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{group.chapter}</p>
          <p style={{ color: "#ffffff40", fontSize: 12 }}>{index + 1} / {deck.length} · {masteredCount} mastered</p>
        </div>
        <button onClick={() => { setIndex(0); setFlipped(false); setMastered({}); }} style={{ color: "#ffffff40", background: "none", border: "none", cursor: "pointer" }}>
          <RotateCcw size={16} />
        </button>
      </div>

      <div style={{ width: "100%", height: 6, background: "#ffffff10", borderRadius: 4, marginBottom: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(masteredCount / group.cards.length) * 100}%`, background: "#00FF9D", borderRadius: 4, transition: "width 0.4s" }} />
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped(f => !f)} />
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
        <button onClick={handleUnknow} style={{ flex: 1, maxWidth: 180, height: 52, background: "#ff444415", border: "1px solid #ff444433", borderRadius: 10, color: "#ff6b6b", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ChevronLeft size={18} /> Don't Know
        </button>
        <button onClick={handleKnow} style={{ flex: 1, maxWidth: 180, height: 52, background: "#00FF9D15", border: "1px solid #00FF9D33", borderRadius: 10, color: "#00FF9D", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Know It <ChevronRight size={18} />
        </button>
      </div>
      <p style={{ textAlign: "center", color: "#ffffff25", fontSize: 12, marginTop: 12 }}>Swipe right = know · Swipe left = don't know</p>
    </div>
  );
}

export function FlashcardsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ChapterGroup[]>([]);
  const [selected, setSelected] = useState<ChapterGroup | null>(null);
  const [filterClass, setFilterClass] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterClass !== "all") params.cls = filterClass;
    setLoading(true);
    api.get("/flashcards", params)
      .then((cards: any) => {
        const arr: Flashcard[] = cards || [];
        const map = new Map<string, ChapterGroup>();
        for (const c of arr) {
          const key = `${c.class}-${c.chapter}`;
          if (!map.has(key)) map.set(key, { chapter: c.chapter, cls: c.class, cards: [] });
          map.get(key)!.cards.push(c);
        }
        setGroups([...map.values()]);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [filterClass]);

  if (selected) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
        <CardSession group={selected} onBack={() => setSelected(null)} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'Space Grotesk', sans-serif", paddingTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffffff50", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Flashcards</h1>
            <p style={{ color: "#ffffff50", fontSize: 14 }}>Flip, swipe, master — chapter by chapter</p>
          </div>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
            style={{ height: 40, padding: "0 12px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
            <option value="all">All Classes</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: "#111111", borderRadius: 8, height: 120 }} />)}
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Layers size={48} style={{ color: "#ffffff15", margin: "0 auto 16px" }} />
            <h3 style={{ color: "#ffffff40", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Flashcards Coming Soon</h3>
            <p style={{ color: "#ffffff25", fontSize: 14 }}>Your teachers are creating flashcards for all chapters. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {groups.map(g => (
              <button key={`${g.cls}-${g.chapter}`} onClick={() => setSelected(g)}
                style={{ background: "#111111", border: "1px solid #ffffff15", borderRadius: 10, padding: "20px", textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#00FF9D44")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#ffffff15")}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ background: "#00FF9D15", color: "#00FF9D", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>Class {g.cls}</span>
                  <span style={{ color: "#ffffff30", fontSize: 12 }}>{g.cards.length} cards</span>
                </div>
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{g.chapter}</p>
                <div style={{ width: "100%", height: 3, background: "#ffffff10", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "0%", background: "#00FF9D", borderRadius: 4 }} />
                </div>
                <p style={{ color: "#ffffff30", fontSize: 12, marginTop: 6 }}>0 / {g.cards.length} mastered</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
