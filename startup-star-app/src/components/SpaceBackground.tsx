import { useEffect, useRef } from "react";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 0, g: 255, b: 157 };
}

function readAccentRgb() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--bs-accent-hex").trim();
  return hexToRgb(hex || "#00FF9D");
}

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
  let t = 0;
  let raf = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function draw() {
    const acc = getAccent();
    ctx.clearRect(0, 0, W, H);
    t++;
    for (const s of stars) {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      const osc = Math.sin(t * s.tw + s.twPhase) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${acc.r},${acc.g},${acc.b},${(s.opacity * osc).toFixed(2)})`;
      ctx.fill();
    }
    for (const o of orbs) {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.radius) o.x = W + o.radius;
      if (o.x > W + o.radius) o.x = -o.radius;
      if (o.y < -o.radius) o.y = H + o.radius;
      if (o.y > H + o.radius) o.y = -o.radius;
      const pulse = Math.sin(t * o.ps + o.pp) * 0.3 + 0.7;
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius);
      grad.addColorStop(0, `rgba(${acc.r},${acc.g},${acc.b},${(o.opacity * pulse).toFixed(2)})`);
      grad.addColorStop(1, `rgba(${acc.r},${acc.g},${acc.b},0)`);
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    return runCosmos(canvas, ctx, readAccentRgb);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: "transparent" }}
    />
  );
}
