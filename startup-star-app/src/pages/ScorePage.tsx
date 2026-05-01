import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, SkipForward, Clock, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

interface ScoreState {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  score: number;
  timeTaken: number;
}

function ScoreRing({ score }: { score: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const color =
    score >= 75 ? "#00ffb3" :
    score >= 50 ? "#f59e0b" :
    "#ef4444";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 180;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = 74;
    const start = -Math.PI / 2;
    const target = (score / 100) * 2 * Math.PI;
    const duration = 1200;
    const startTime = performance.now();

    function draw(t: number) {
      if (!ctx) return;
      const elapsed = t - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const endAngle = start + target * ease;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 12;
      ctx.stroke();

      if (score > 0) {
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + "99");
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, endAngle);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      if (progress < 1) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }, [score, color]);

  return (
    <div className="relative inline-block">
      <canvas ref={canvasRef} style={{ width: 180, height: 180 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-black" style={{ color: "var(--bs-text)" }}>{score}%</div>
        <div className="text-[10px] font-mono uppercase tracking-widest mt-1" style={{ color: "var(--bs-text-muted)" }}>Score</div>
      </div>
    </div>
  );
}

function StatBar({ label, value, total, color, icon: Icon }: {
  label: string; value: number; total: number; color: string; icon: React.ElementType;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: "var(--bs-text-muted)" }}>{label}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-black w-6 text-right" style={{ color: "var(--bs-text)" }}>{value}</span>
    </div>
  );
}

export function ScorePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ScoreState | null;

  if (!state) {
    navigate("/home");
    return null;
  }

  const { correct, wrong, skipped, total, score, timeTaken } = state;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec < 10 ? "0" : ""}${sec}s`;
  };

  const getMessage = () => {
    if (score >= 90) return "Outstanding!";
    if (score >= 75) return "Great Job!";
    if (score >= 50) return "Good Effort!";
    if (score >= 25) return "Keep Going!";
    return "Keep Practicing!";
  };

  const scoreColor =
    score >= 75 ? "#00ffb3" :
    score >= 50 ? "#f59e0b" :
    "#ef4444";

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-['Space_Grotesk'] px-4 py-10"
      style={{ background: "transparent" }}
    >
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Soft glow matching score color */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] pointer-events-none opacity-20"
        style={{ background: scoreColor }}
      />

      <div className="relative z-10 w-full max-w-lg">

        {/* Top accent line */}
        <div className="h-0.5 w-full mb-8" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)` }} />

        {/* Score ring + message */}
        <div className="text-center mb-8">
          <ScoreRing score={score} />
          <h1
            className="text-3xl font-black uppercase tracking-tighter mt-4 mb-1"
            style={{ color: scoreColor }}
          >
            {getMessage()}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>
            Quiz completed — {total} question{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Card */}
        <div
          className="border p-6 mb-4"
          style={{ background: "var(--bs-surface)", borderColor: "var(--bs-border-subtle)" }}
        >
          {/* Stat bars */}
          <div className="space-y-4 mb-6">
            <StatBar label="Correct" value={correct} total={total} color="#00ffb3" icon={CheckCircle} />
            <StatBar label="Wrong" value={wrong} total={total} color="#ef4444" icon={XCircle} />
            <StatBar label="Skipped" value={skipped} total={total} color="rgba(255,255,255,0.3)" icon={SkipForward} />
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: "var(--bs-border-subtle)" }} />

          {/* Accuracy + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border p-4 text-center" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: "var(--bs-text-muted)" }}>Accuracy</div>
              <div className="text-2xl font-black" style={{ color: accuracy >= 50 ? "#00ffb3" : accuracy >= 25 ? "#f59e0b" : "#ef4444" }}>
                {accuracy}%
              </div>
            </div>
            <div className="border p-4 text-center" style={{ background: "var(--bs-surface-2)", borderColor: "var(--bs-border-subtle)" }}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-3 h-3" style={{ color: "var(--bs-text-muted)" }} />
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-text-muted)" }}>Time</span>
              </div>
              <div className="text-2xl font-black" style={{ color: "var(--bs-text)" }}>{formatTime(timeTaken)}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 border text-sm font-black uppercase tracking-widest transition-colors"
            style={{ borderColor: "var(--bs-border-strong)", color: "var(--bs-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bs-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--bs-text-muted)")}
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>

          <div className="relative group flex-1">
            <div
              className="absolute inset-0 transform -skew-x-12 translate-x-1.5 translate-y-1.5 opacity-25 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"
              style={{ background: scoreColor }}
            />
            <button
              onClick={() => navigate("/home")}
              className="relative w-full flex items-center justify-center gap-2 py-3.5 font-black uppercase tracking-widest text-sm transform -skew-x-12"
              style={{ background: scoreColor, color: "black" }}
            >
              <span className="transform skew-x-12 inline-flex items-center gap-2">
                Home <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-0.5 w-full mt-8" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)` }} />
      </div>
    </div>
  );
}
