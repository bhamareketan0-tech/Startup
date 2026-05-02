import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import type { BgAnimName } from "@/lib/ThemeContext";

function readAccentRgb() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--bs-accent-hex").trim() || "#00FF9D";
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 255, b: 157 };
}

function readBgHex() {
  return getComputedStyle(document.documentElement).getPropertyValue("--bs-bg").trim() || "#000000";
}

type Runner = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => () => void;

const runCosmos: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const stars = Array.from({ length: 140 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.3 + 0.2,
    op: Math.random() * 0.6 + 0.15,
    sp: Math.random() * 0.1 + 0.015,
    tw: Math.random() * 0.015 + 0.003,
    ph: Math.random() * Math.PI * 2,
  }));
  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    radius: Math.random() * 100 + 40,
    op: Math.random() * 0.13 + 0.04,
    vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
    ps: Math.random() * 0.005 + 0.002, pp: Math.random() * Math.PI * 2,
  }));
  let t = 0, raf = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const s of stars) {
      s.y += s.sp;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      const osc = Math.sin(t * s.tw + s.ph) * 0.28 + 0.72;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${(s.op * osc).toFixed(2)})`;
      ctx.fill();
    }
    for (const o of orbs) {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.radius) o.x = W + o.radius;
      if (o.x > W + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = H + o.radius;
      if (o.y > H + o.radius) o.y = -o.radius;
      const pulse = Math.sin(t * o.ps + o.pp) * 0.28 + 0.72;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(o.op * pulse).toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.beginPath(); ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01234567891011";
const runMatrix: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const SZ = 13;
  let cols = Math.max(1, Math.floor(W / SZ));
  let drops = Array.from({ length: cols }, () => Math.random() * -(H / SZ) * 2);
  let speeds = Array.from({ length: cols }, () => Math.random() * 0.5 + 0.35);
  let raf = 0, frame = 0;
  const resize = () => {
    W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
    cols = Math.max(1, Math.floor(W / SZ));
    drops = Array.from({ length: cols }, (_, i) => drops[i] ?? Math.random() * -(H / SZ));
    speeds = Array.from({ length: cols }, (_, i) => speeds[i] ?? Math.random() * 0.5 + 0.35);
    ctx.fillStyle = readBgHex(); ctx.fillRect(0, 0, W, H);
  };
  ctx.fillStyle = readBgHex(); ctx.fillRect(0, 0, W, H);
  const draw = () => {
    frame++;
    const a = readAccentRgb();
    ctx.fillStyle = `rgba(0,0,0,0.045)`;
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${SZ}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      if (frame % 3 !== 0 && speeds[i] < 0.5) continue;
      const x = i * SZ, y = drops[i] * SZ;
      if (y > 0 && y < H + SZ) {
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},0.92)`;
        ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], x, y);
      }
      drops[i] += speeds[i];
      if (drops[i] * SZ > H + SZ * 8 && Math.random() > 0.974) {
        drops[i] = -Math.random() * 25;
      }
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

const runAurora: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let t = 0, raf = 0;
  const LAYERS = [
    { amp: 0.12, freq: 1.2, speed: 0.0008, phase: 0, yFrac: 0.55, op: 0.22, wFrac: 0.28 },
    { amp: 0.09, freq: 0.8, speed: 0.0006, phase: 1.8, yFrac: 0.68, op: 0.18, wFrac: 0.22 },
    { amp: 0.07, freq: 1.6, speed: 0.001,  phase: 3.2, yFrac: 0.75, op: 0.14, wFrac: 0.18 },
    { amp: 0.11, freq: 0.6, speed: 0.0005, phase: 5.0, yFrac: 0.62, op: 0.20, wFrac: 0.25 },
  ];
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const L of LAYERS) {
      const baseY = H * L.yFrac;
      const waveH = H * L.wFrac;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        const wave = Math.sin((x / W) * L.freq * Math.PI * 2 + t * L.speed * Math.PI * 2 + L.phase)
                   + Math.sin((x / W) * L.freq * 0.5 * Math.PI * 2 + t * L.speed * 0.7 * Math.PI * 2 + L.phase + 1);
        ctx.lineTo(x, baseY + wave * H * L.amp);
      }
      ctx.lineTo(W, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, baseY - waveH, 0, H);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0)`);
      g.addColorStop(0.35, `rgba(${a.r},${a.g},${a.b},${L.op.toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0.04)`);
      ctx.fillStyle = g; ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

const runNeural: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const N = 28;
  const nodes = Array.from({ length: N }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2.5 + 1.5,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.01 + 0.005,
  }));
  const LINK_DIST = 180;
  let t = 0, raf = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const op = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${op.toFixed(2)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const pulse = Math.sin(t * n.speed + n.phase) * 0.35 + 0.65;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.5);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(0.75 * pulse).toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${(0.9 * pulse).toFixed(2)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

const runVoid: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const blobs = Array.from({ length: 5 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 200 + 150,
    vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
    op: Math.random() * 0.09 + 0.04,
    ps: Math.random() * 0.003 + 0.001, pp: Math.random() * Math.PI * 2,
  }));
  let t = 0, raf = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const b of blobs) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
      const pulse = Math.sin(t * b.ps + b.pp) * 0.25 + 0.75;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(b.op * pulse).toFixed(2)})`);
      g.addColorStop(0.6, `rgba(${a.r},${a.g},${a.b},${(b.op * 0.3 * pulse).toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

const RUNNERS: Record<BgAnimName, Runner> = {
  cosmos: runCosmos,
  matrix: runMatrix,
  aurora: runAurora,
  neural: runNeural,
  void: runVoid,
};

export function SpaceBackground() {
  const { bgAnim } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const runner = RUNNERS[bgAnim] || runCosmos;
    return runner(canvas, ctx);
  }, [bgAnim]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, willChange: "transform", contain: "strict" }}
    />
  );
}
