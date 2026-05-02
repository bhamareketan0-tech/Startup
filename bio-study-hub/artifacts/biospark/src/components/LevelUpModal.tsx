import { useEffect } from "react";

interface LevelUpModalProps {
  level: string;
  emoji: string;
  xp: number;
  totalXP?: number;
  onClose: () => void;
}

export function LevelUpModal({ level, emoji, xp, totalXP, onClose }: LevelUpModalProps) {
  const displayXP = totalXP ?? xp;

  useEffect(() => {
    let stopped = false;

    async function runConfetti() {
      try {
        const mod = await import("canvas-confetti");
        const confetti = mod.default as unknown as (opts: Record<string, unknown>) => void;
        if (stopped) return;
        const end = Date.now() + 1000;
        function frame() {
          if (stopped) return;
          confetti({
            particleCount: 6,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#00FF9D", "#00ccff", "#FFD700", "#ff6b6b"],
          });
          confetti({
            particleCount: 6,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#00FF9D", "#00ccff", "#FFD700", "#ff6b6b"],
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        }
        frame();
      } catch {}
    }

    runConfetti();
    return () => { stopped = true; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative border p-10 text-center max-w-sm mx-4"
        style={{
          background: "var(--bs-surface)",
          borderColor: "#00FF9D",
          boxShadow: "0 0 60px rgba(0,255,157,0.3), 0 0 120px rgba(0,255,157,0.1)",
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #00FF9D, #00ccff, #00FF9D)" }} />
        <div className="text-6xl mb-4 animate-bounce">{emoji}</div>
        <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#00FF9D" }}>Level Up!</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: "var(--bs-text)" }}>
          {level}
        </h2>
        <p className="text-sm font-mono mb-6" style={{ color: "var(--bs-text-muted)" }}>
          You've reached <strong style={{ color: "#00FF9D" }}>{displayXP.toLocaleString()} XP</strong>
        </p>
        <button
          onClick={onClose}
          className="px-8 py-2.5 font-black uppercase tracking-widest text-sm"
          style={{ background: "#00FF9D", color: "black" }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
