import { useEffect, useRef } from "react";
import { useTheme, BgAnimName } from "@/lib/ThemeContext";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 255, b: 135 };
}

function readAccentRgb() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--bs-accent-hex").trim();
  return hexToRgb(hex || "#00ff87");
}

// ─── COSMOS ────────────────────────────────────────────────────────────────
function runCosmos(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getAccent: () => { r: number; g: number; b: number }) {
  let W = canvas.width, H = canvas.height;
  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    radius: Math.random() * 1.4 + 0.2,
    opacity: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.12 + 0.02,
    tw: Math.random() * 0.018 + 0.004,
    twPhase: Math.random() * Math.PI * 2,
  }));
  const orbs = Array.from({ length: 7 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    radius: Math.random() * 80 + 30,
    opacity: Math.random() * 0.18 + 0.05,
    vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    ps: Math.random() * 0.006 + 0.002, pp: Math.random() * Math.PI * 2,
  }));
  const shoots = Array.from({ length: 3 }, () => ({ x: 0, y: 0, length: 0, angle: 0, speed: 0, opacity: 0, active: false, life: 0, maxLife: 0 }));
  let lastShoot = 0;

  function spawnShoot(s: typeof shoots[0]) {
    s.x = Math.random() * W * 0.7; s.y = Math.random() * H * 0.35;
    s.length = Math.random() * 140 + 60; s.angle = Math.PI / 5 + (Math.random() - 0.5) * 0.3;
    s.speed = Math.random() * 9 + 6; s.opacity = 1; s.active = true; s.life = 0;
    s.maxLife = Math.random() * 40 + 30;
  }

  let id = 0;
  function draw(now: number) {
    const { r, g, b } = getAccent();
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      s.twPhase += s.tw;
      const tw = 0.5 + 0.5 * Math.sin(s.twPhase);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${s.opacity * (0.35 + 0.65 * tw)})`; ctx.fill();
    }
    for (const o of orbs) {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.radius) o.x = W + o.radius; if (o.x > W + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = H + o.radius; if (o.y > H + o.radius) o.y = -o.radius;
      o.pp += o.ps; const p = 0.7 + 0.3 * Math.sin(o.pp);
      const gr = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius * p);
      gr.addColorStop(0, `rgba(${r},${g},${b},${o.opacity * p})`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.arc(o.x, o.y, o.radius * p, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
    }
    if (now - lastShoot > 4000) {
      const s = shoots.find(s => !s.active);
      if (s) { spawnShoot(s); lastShoot = now; }
    }
    for (const s of shoots) {
      if (!s.active) continue;
      s.x += Math.cos(s.angle) * s.speed; s.y += Math.sin(s.angle) * s.speed; s.life++;
      if (s.life >= s.maxLife) { s.active = false; continue; }
      const prog = s.life / s.maxLife; const al = (1 - prog) * 0.9;
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle);
      const lg = ctx.createLinearGradient(0, 0, -s.length, 0);
      lg.addColorStop(0, `rgba(${r},${g},${b},${al})`);
      lg.addColorStop(0.5, `rgba(${r},${g},${b},${al * 0.4})`);
      lg.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s.length, 0);
      ctx.strokeStyle = lg; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    id = requestAnimationFrame(draw);
  }
  id = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(id); };
}

// ─── AURORA ─────────────────────────────────────────────────────────────────
function runAurora(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getAccent: () => { r: number; g: number; b: number }) {
  let W = canvas.width, H = canvas.height;
  const bands = Array.from({ length: 6 }, (_, i) => ({
    yBase: H * (0.1 + i * 0.15),
    amp: 40 + Math.random() * 60,
    freq: 0.003 + Math.random() * 0.003,
    speed: 0.0004 + Math.random() * 0.0004,
    phase: Math.random() * Math.PI * 2,
    width: 60 + Math.random() * 80,
    opacity: 0.06 + Math.random() * 0.1,
    colorShift: Math.random() * 120,
  }));
  let t = 0, id = 0;

  function draw() {
    const { r, g, b } = getAccent();
    ctx.clearRect(0, 0, W, H);
    t += 1;
    for (const band of bands) {
      const points: { x: number; y: number }[] = [];
      for (let x = 0; x <= W; x += 6) {
        const y = band.yBase + Math.sin(x * band.freq + t * band.speed * 60 + band.phase) * band.amp;
        points.push({ x, y });
      }
      // Top edge
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (const p of points) ctx.lineTo(p.x, p.y - band.width / 2);
      ctx.lineTo(W, H); ctx.closePath();
      const cs = band.colorShift;
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, `rgba(${Math.min(255, r + cs)},${g},${Math.min(255, b + cs * 0.5)},0)`);
      gr.addColorStop(0.5, `rgba(${r},${g},${b},${band.opacity})`);
      gr.addColorStop(1, `rgba(${r},${Math.min(255, g + cs * 0.5)},${b},0)`);
      ctx.fillStyle = gr; ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (const p of points) ctx.lineTo(p.x, p.y + band.width / 2);
      ctx.lineTo(W, 0); ctx.closePath();
      const gr2 = ctx.createLinearGradient(0, 0, 0, H);
      gr2.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gr2.addColorStop(0.5, `rgba(${Math.min(255, r + cs * 0.3)},${Math.min(255, g + cs * 0.3)},${b},${band.opacity * 0.7})`);
      gr2.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr2; ctx.fill();
    }
    id = requestAnimationFrame(draw);
  }
  id = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(id);
}

// ─── MATRIX ─────────────────────────────────────────────────────────────────
function runMatrix(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getAccent: () => { r: number; g: number; b: number }) {
  let W = canvas.width, H = canvas.height;
  const fontSize = 14;
  const cols = Math.floor(W / fontSize);
  const drops: number[] = Array.from({ length: cols }, () => Math.random() * -50);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*ΔΩΨΦΣπβγδεζ";
  let id = 0;

  function draw() {
    const { r, g, b } = getAccent();
    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const y = drops[i] * fontSize;
      // Bright head
      ctx.fillStyle = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)},0.95)`;
      ctx.fillText(char, i * fontSize, y);
      // Tail
      ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y - fontSize * 2);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      else drops[i] += 0.5;
    }
    id = requestAnimationFrame(draw);
  }
  id = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(id);
}

// ─── NEURAL ─────────────────────────────────────────────────────────────────
function runNeural(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getAccent: () => { r: number; g: number; b: number }) {
  let W = canvas.width, H = canvas.height;
  const nodes = Array.from({ length: 80 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    radius: Math.random() * 2 + 1,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.02,
  }));
  let id = 0;

  function draw() {
    const { r, g, b } = getAccent();
    ctx.clearRect(0, 0, W, H);
    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    // Draw nodes
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.pulse += n.pulseSpeed;
      const glow = 0.5 + 0.5 * Math.sin(n.pulse);
      const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3);
      gr.addColorStop(0, `rgba(${r},${g},${b},${0.7 * glow})`);
      gr.addColorStop(0.4, `rgba(${r},${g},${b},${0.3 * glow})`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.85 * glow})`; ctx.fill();
    }
    id = requestAnimationFrame(draw);
  }
  id = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(id);
}

// ─── FIREFLIES ───────────────────────────────────────────────────────────────
function runFireflies(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, getAccent: () => { r: number; g: number; b: number }) {
  let W = canvas.width, H = canvas.height;
  const flies = Array.from({ length: 70 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
    radius: Math.random() * 3 + 1.5,
    glowRadius: Math.random() * 20 + 10,
    phase: Math.random() * Math.PI * 2,
    speed: 0.015 + Math.random() * 0.025,
    drift: Math.random() * 0.3,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.005 + Math.random() * 0.008,
  }));
  let id = 0;

  function draw() {
    const { r, g, b } = getAccent();
    ctx.clearRect(0, 0, W, H);
    for (const f of flies) {
      f.phase += f.speed;
      f.driftPhase += f.driftSpeed;
      f.x += f.vx + Math.sin(f.driftPhase) * f.drift;
      f.y += f.vy + Math.cos(f.driftPhase * 0.7) * f.drift;
      if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      if (f.y < 0) f.y = H; if (f.y > H) f.y = 0;

      const glow = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f.phase));
      // Outer glow
      const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowRadius);
      gr.addColorStop(0, `rgba(${r},${g},${b},${0.35 * glow})`);
      gr.addColorStop(0.4, `rgba(${r},${g},${b},${0.15 * glow})`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath(); ctx.arc(f.x, f.y, f.glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gr; ctx.fill();
      // Core
      ctx.beginPath(); ctx.arc(f.x, f.y, f.radius * glow, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(255, r + 100)},${Math.min(255, g + 100)},${Math.min(255, b + 80)},${0.9 * glow})`;
      ctx.fill();
    }
    id = requestAnimationFrame(draw);
  }
  id = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(id);
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const RUNNERS: Record<BgAnimName, typeof runCosmos> = {
  cosmos: runCosmos,
  aurora: runAurora,
  matrix: runMatrix,
  neural: runNeural,
  fireflies: runFireflies,
};

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { bgAnim } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // For matrix: need black bg cleared properly
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let accentRgb = readAccentRgb();
    const observer = new MutationObserver(() => { accentRgb = readAccentRgb(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    const cleanup = RUNNERS[bgAnim](canvas, ctx, () => accentRgb);

    function onResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    return () => {
      cleanup();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [bgAnim]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
