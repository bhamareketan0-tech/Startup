import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import type { BgAnimName } from "@/lib/ThemeContext";

function readAccentRgb() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--bs-accent-hex").trim() || "#00D97E";
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 217, b: 126 };
}

type Runner = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => () => void;

/* ─────────────────────────────────────────────────────────────────────────────
   COSMOS — warp-speed hyperspace: stars fly outward from center as streaks
───────────────────────────────────────────────────────────────────────────── */
const runCosmos: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  type WarpStar = { angle: number; dist: number; speed: number; maxDist: number; width: number; bright: number };
  const N = 280;
  const mkStar = (): WarpStar => ({
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * 60 + 2,
    speed: Math.random() * 3.5 + 1.2,
    maxDist: Math.random() * 0.45 + 0.4,
    width: Math.random() * 1.5 + 0.4,
    bright: Math.random() * 0.5 + 0.5,
  });
  const stars: WarpStar[] = Array.from({ length: N }, mkStar);

  let raf = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };

  const draw = () => {
    const a = readAccentRgb();
    const cx = W / 2, cy = H / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      const prevDist = s.dist;
      s.dist += s.speed * (s.dist / 80);
      if (s.dist > maxR * s.maxDist + 10) {
        Object.assign(s, mkStar());
        continue;
      }

      const x1 = cx + Math.cos(s.angle) * prevDist;
      const y1 = cy + Math.sin(s.angle) * prevDist;
      const x2 = cx + Math.cos(s.angle) * s.dist;
      const y2 = cy + Math.sin(s.angle) * s.dist;

      const progress = s.dist / (maxR * s.maxDist);
      const alpha = Math.min(1, progress * 2.5) * s.bright;
      const lineW = s.width * (0.3 + progress * 1.8);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0)`);
      grad.addColorStop(1, `rgba(${a.r},${a.g},${a.b},${alpha.toFixed(2)})`);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineW;
      ctx.stroke();

      if (progress > 0.6) {
        const glow = ctx.createRadialGradient(x2, y2, 0, x2, y2, lineW * 3);
        glow.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(alpha * 0.6).toFixed(2)})`);
        glow.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
        ctx.beginPath(); ctx.arc(x2, y2, lineW * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
      }
    }

    const center = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    center.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.06)`);
    center.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
    ctx.fillStyle = center; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.fill();

    raf = requestAnimationFrame(draw);
  };
  resize();
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  draw();
  window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

/* ─────────────────────────────────────────────────────────────────────────────
   MATRIX — refined digital rain with glowing heads and gradient trails
───────────────────────────────────────────────────────────────────────────── */
const MATRIX_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01234567△◇○□※≠∞∑∫∂";
const runMatrix: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const SZ = 14;
  let cols = Math.max(1, Math.floor(W / SZ));

  type Col = { y: number; speed: number; chars: string[]; brightness: number[] };
  let columns: Col[] = Array.from({ length: cols }, () => {
    const len = Math.floor(Math.random() * 20 + 10);
    return {
      y: Math.random() * -(H / SZ) * 2,
      speed: Math.random() * 0.4 + 0.25,
      chars: Array.from({ length: len }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
      brightness: Array.from({ length: len }, (_, i) => i === 0 ? 1 : 1 - i / len),
    };
  });

  let raf = 0, frame = 0;

  const resize = () => {
    W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
    cols = Math.max(1, Math.floor(W / SZ));
    while (columns.length < cols) {
      const len = Math.floor(Math.random() * 20 + 10);
      columns.push({ y: Math.random() * -(H / SZ), speed: Math.random() * 0.4 + 0.25, chars: Array.from({ length: len }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]), brightness: Array.from({ length: len }, (_, i) => i === 0 ? 1 : 1 - i / len) });
    }
    columns = columns.slice(0, cols);
    ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fillRect(0, 0, W, H);
  };

  ctx.fillStyle = "rgba(0,0,0,1)"; ctx.fillRect(0, 0, W, H);

  const draw = () => {
    frame++;
    const a = readAccentRgb();
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${SZ - 1}px 'Courier New', monospace`;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      col.y += col.speed;

      if (Math.random() < 0.01) {
        col.chars[Math.floor(Math.random() * col.chars.length)] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      }

      for (let j = 0; j < col.chars.length; j++) {
        const cy = (col.y - j) * SZ;
        if (cy < -SZ || cy > H + SZ) continue;
        const br = col.brightness[j];
        if (j === 0) {
          ctx.fillStyle = `rgba(255,255,255,${(br * 0.95).toFixed(2)})`;
          ctx.shadowColor = `rgb(${a.r},${a.g},${a.b})`;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${(br * 0.85).toFixed(2)})`;
          ctx.shadowBlur = j < 3 ? 4 : 0;
          ctx.shadowColor = "transparent";
        }
        ctx.fillText(col.chars[j], i * SZ, cy);
      }
      ctx.shadowBlur = 0; ctx.shadowColor = "transparent";

      if (col.y * SZ > H + col.chars.length * SZ + 100 && Math.random() > 0.97) {
        col.y = -col.chars.length - Math.random() * 30;
        col.speed = Math.random() * 0.4 + 0.25;
      }
    }
    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

/* ─────────────────────────────────────────────────────────────────────────────
   AURORA — full-screen northern lights with flowing HSL color shifts
───────────────────────────────────────────────────────────────────────────── */
const runAurora: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let t = 0, raf = 0;

  type Band = { yFrac: number; amp: number; freq: number; speed: number; phase: number; thickness: number; hueShift: number };
  const bands: Band[] = [
    { yFrac: 0.3, amp: 0.08, freq: 1.1, speed: 0.00035, phase: 0,    thickness: 0.25, hueShift: 0   },
    { yFrac: 0.45, amp: 0.1, freq: 0.7, speed: 0.00025, phase: 1.5,  thickness: 0.3,  hueShift: 30  },
    { yFrac: 0.55, amp: 0.09, freq: 1.4, speed: 0.0004, phase: 3.1, thickness: 0.22, hueShift: -20  },
    { yFrac: 0.65, amp: 0.07, freq: 0.9, speed: 0.0002, phase: 4.7, thickness: 0.18, hueShift: 50  },
    { yFrac: 0.38, amp: 0.06, freq: 1.8, speed: 0.0005, phase: 2.3, thickness: 0.15, hueShift: -40 },
  ];

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    const hue = Math.round(Math.atan2(a.g - 128, a.r - 128) * 180 / Math.PI + 180);
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const band of bands) {
      const bh = hue + band.hueShift;
      const baseY = H * band.yFrac;
      const bHeight = H * band.thickness;

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        const nx = x / W;
        const wave =
          Math.sin(nx * band.freq * Math.PI * 2 + t * band.speed * Math.PI * 200 + band.phase) * 0.6 +
          Math.sin(nx * band.freq * 0.5 * Math.PI * 2 + t * band.speed * 0.7 * Math.PI * 200 + band.phase + 1) * 0.3 +
          Math.sin(nx * band.freq * 2.1 * Math.PI * 2 + t * band.speed * 1.3 * Math.PI * 200 + band.phase + 2.1) * 0.1;
        ctx.lineTo(x, baseY + wave * H * band.amp);
      }
      ctx.lineTo(W, H); ctx.closePath();

      const g = ctx.createLinearGradient(0, baseY - bHeight, 0, baseY + bHeight * 0.5);
      g.addColorStop(0, `hsla(${bh},100%,65%,0)`);
      g.addColorStop(0.3, `hsla(${bh},90%,60%,0.12)`);
      g.addColorStop(0.55, `hsla(${bh + 15},85%,55%,0.18)`);
      g.addColorStop(0.75, `hsla(${bh + 30},80%,50%,0.1)`);
      g.addColorStop(1, `hsla(${bh},100%,45%,0.02)`);
      ctx.fillStyle = g; ctx.fill();
    }

    const hGlow = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.55);
    hGlow.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0.04)`);
    hGlow.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
    ctx.fillStyle = hGlow; ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

/* ─────────────────────────────────────────────────────────────────────────────
   NEURAL — particle network with pulse waves flowing along connections
───────────────────────────────────────────────────────────────────────────── */
const runNeural: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const N = 55;
  type Node = { x: number; y: number; vx: number; vy: number; r: number; phase: number; speed: number };
  const nodes: Node[] = Array.from({ length: N }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1.5,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.012 + 0.004,
  }));

  type Pulse = { fromIdx: number; toIdx: number; progress: number; speed: number; alpha: number };
  const pulses: Pulse[] = [];
  const LINK_DIST = 200;
  let t = 0, raf = 0;
  let pulseTimer = 0;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) { n.vx = Math.abs(n.vx); n.x = 0; }
      if (n.x > W) { n.vx = -Math.abs(n.vx); n.x = W; }
      if (n.y < 0) { n.vy = Math.abs(n.vy); n.y = 0; }
      if (n.y > H) { n.vy = -Math.abs(n.vy); n.y = H; }
    }

    const links: { i: number; j: number; dist: number }[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) links.push({ i, j, dist });
      }
    }

    for (const { i, j, dist } of links) {
      const op = (1 - dist / LINK_DIST) * 0.12;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
      ctx.strokeStyle = `rgba(${a.r},${a.g},${a.b},${op.toFixed(3)})`;
      ctx.lineWidth = 0.6; ctx.stroke();
    }

    pulseTimer++;
    if (pulseTimer > 18 && links.length > 0) {
      pulseTimer = 0;
      const link = links[Math.floor(Math.random() * links.length)];
      pulses.push({ fromIdx: link.i, toIdx: link.j, progress: 0, speed: Math.random() * 0.025 + 0.02, alpha: 0.9 });
    }

    for (let p = pulses.length - 1; p >= 0; p--) {
      const pulse = pulses[p];
      pulse.progress += pulse.speed;
      if (pulse.progress >= 1) { pulses.splice(p, 1); continue; }
      const from = nodes[pulse.fromIdx], to = nodes[pulse.toIdx];
      const px = from.x + (to.x - from.x) * pulse.progress;
      const py = from.y + (to.y - from.y) * pulse.progress;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 6);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(pulse.alpha * (1 - pulse.progress)).toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }

    for (const n of nodes) {
      const pulse = Math.sin(t * n.speed + n.phase) * 0.3 + 0.7;
      const outerR = n.r * 4;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, outerR);
      g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${(0.65 * pulse).toFixed(2)})`);
      g.addColorStop(0.4, `rgba(${a.r},${a.g},${a.b},${(0.15 * pulse).toFixed(2)})`);
      g.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
      ctx.beginPath(); ctx.arc(n.x, n.y, outerR, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${(0.9 * pulse).toFixed(2)})`; ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
};

/* ─────────────────────────────────────────────────────────────────────────────
   VOID — deep space volumetric nebula with slow cinematic drift
───────────────────────────────────────────────────────────────────────────── */
const runVoid: Runner = (canvas, ctx) => {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  type Blob = { x: number; y: number; rx: number; ry: number; vx: number; vy: number; rot: number; vrot: number; op: number; ps: number; pp: number; hShift: number };
  const blobs: Blob[] = Array.from({ length: 7 }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    rx: Math.random() * 300 + 180, ry: Math.random() * 220 + 120,
    vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.1,
    rot: Math.random() * Math.PI * 2, vrot: (Math.random() - 0.5) * 0.0008,
    op: Math.random() * 0.07 + 0.04,
    ps: Math.random() * 0.002 + 0.0008, pp: Math.random() * Math.PI * 2,
    hShift: (i / 7) * 60 - 30,
  }));

  const stars: { x: number; y: number; r: number; op: number }[] = Array.from({ length: 80 }, () => ({
    x: Math.random() * 9999, y: Math.random() * 9999,
    r: Math.random() * 0.8 + 0.1, op: Math.random() * 0.3 + 0.05,
  }));

  let t = 0, raf = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const draw = () => {
    const a = readAccentRgb();
    const baseHue = Math.round(Math.atan2(a.g - 128, a.r - 128) * 180 / Math.PI + 180);
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const s of stars) {
      ctx.beginPath(); ctx.arc(s.x % W, s.y % H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${s.op.toFixed(2)})`; ctx.fill();
    }

    for (const b of blobs) {
      b.x += b.vx; b.y += b.vy; b.rot += b.vrot;
      if (b.x < -b.rx) b.x = W + b.rx; if (b.x > W + b.rx) b.x = -b.rx;
      if (b.y < -b.ry) b.y = H + b.ry; if (b.y > H + b.ry) b.y = -b.ry;
      const pulse = Math.sin(t * b.ps + b.pp) * 0.2 + 0.8;
      const hue = baseHue + b.hShift;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.scale(1, b.ry / b.rx);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.rx);
      g.addColorStop(0, `hsla(${hue},100%,65%,${(b.op * pulse * 1.4).toFixed(3)})`);
      g.addColorStop(0.35, `hsla(${hue + 20},90%,55%,${(b.op * pulse * 0.7).toFixed(3)})`);
      g.addColorStop(0.65, `hsla(${hue - 10},80%,45%,${(b.op * pulse * 0.25).toFixed(3)})`);
      g.addColorStop(1, `hsla(${hue},100%,40%,0)`);
      ctx.beginPath(); ctx.arc(0, 0, b.rx, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        willChange: "transform",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
