import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { getChapters, fetchChaptersFromAPI } from "@/lib/chaptersManager";
import { getSubunitAnim, getChapterAnim, type AnimFrame } from "@/data/animationContent";

// ─── Visual Components ────────────────────────────────────────────────────────

function LungsVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes flow-r { 0%{opacity:0;transform:translateX(-30px)} 60%{opacity:1} 100%{opacity:0;transform:translateX(30px)} }
        @keyframes flow-l { 0%{opacity:0;transform:translateX(30px)} 60%{opacity:1} 100%{opacity:0;transform:translateX(-30px)} }
        @keyframes pulse-glow { 0%,100%{filter:drop-shadow(0 0 4px #00FF9D)} 50%{filter:drop-shadow(0 0 16px #00FF9D)} }
        .lung { transform-origin: 200px 180px; animation: breathe 3s ease-in-out infinite; animation-play-state: ${playing ? "running" : "paused"}; }
        .o2 { animation: flow-r 2.5s ease-in-out infinite; animation-play-state: ${playing ? "running" : "paused"}; }
        .co2 { animation: flow-l 2.5s ease-in-out infinite 1.2s; animation-play-state: ${playing ? "running" : "paused"}; }
        .glow { animation: pulse-glow 2s ease-in-out infinite; animation-play-state: ${playing ? "running" : "paused"}; }
      `}</style>
      {/* Trachea */}
      <rect x="192" y="40" width="16" height="60" rx="8" fill="#4ade80" opacity="0.7"/>
      {/* Left lung */}
      <g className="lung">
        <path d="M195 100 Q130 110 110 150 Q90 190 100 240 Q110 270 140 270 Q170 260 185 240 Q195 210 195 100Z" fill="#00FF9D" opacity="0.25"/>
        <path d="M195 100 Q130 110 110 150 Q90 190 100 240 Q110 270 140 270 Q170 260 185 240 Q195 210 195 100Z" fill="none" stroke="#00FF9D" strokeWidth="2" className="glow"/>
        {/* Bronchioles left */}
        <path d="M192 120 Q160 130 150 160" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.7"/>
        <path d="M192 130 Q155 145 148 180" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.6"/>
        <path d="M192 140 Q158 165 155 200" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.5"/>
      </g>
      {/* Right lung */}
      <g className="lung">
        <path d="M205 100 Q270 110 290 150 Q310 190 300 240 Q290 270 260 270 Q230 260 215 240 Q205 210 205 100Z" fill="#00FF9D" opacity="0.25"/>
        <path d="M205 100 Q270 110 290 150 Q310 190 300 240 Q290 270 260 270 Q230 260 215 240 Q205 210 205 100Z" fill="none" stroke="#00FF9D" strokeWidth="2" className="glow"/>
        {/* Bronchioles right */}
        <path d="M208 120 Q240 130 250 160" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.7"/>
        <path d="M208 130 Q245 145 252 180" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.6"/>
        <path d="M208 140 Q242 165 245 200" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.5"/>
      </g>
      {/* Diaphragm */}
      <path d="M80 275 Q200 295 320 275" fill="none" stroke="#00FF9D" strokeWidth="3" opacity="0.5"/>
      {/* O2 molecules flowing in */}
      <g className="o2">
        <circle cx="60" cy="80" r="10" fill="#00FF9D" opacity="0.9"/>
        <text x="60" y="84" textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">O₂</text>
      </g>
      <g className="o2" style={{ animationDelay: "0.8s" }}>
        <circle cx="60" cy="110" r="10" fill="#00FF9D" opacity="0.9"/>
        <text x="60" y="114" textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">O₂</text>
      </g>
      {/* CO2 molecules flowing out */}
      <g className="co2">
        <circle cx="340" cy="80" r="10" fill="#f87171" opacity="0.9"/>
        <text x="340" y="84" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
      </g>
      <g className="co2" style={{ animationDelay: "1.8s" }}>
        <circle cx="340" cy="110" r="10" fill="#f87171" opacity="0.9"/>
        <text x="340" y="114" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
      </g>
      {/* Labels */}
      <text x="45" y="60" fontSize="11" fill="#00FF9D" fontWeight="bold" opacity="0.8">INHALE</text>
      <text x="310" y="60" fontSize="11" fill="#f87171" fontWeight="bold" opacity="0.8">EXHALE</text>
      <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#ffffff" fontWeight="bold" opacity="0.9">Human Respiratory System</text>
    </svg>
  );
}

function FlowVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <style>{`
        @keyframes move-right { 0%{transform:translateX(0)} 100%{transform:translateX(260px)} }
        @keyframes move-left  { 0%{transform:translateX(0)} 100%{transform:translateX(-260px)} }
        @keyframes fade-loop  { 0%,100%{opacity:0} 20%,80%{opacity:1} }
        .p1 { animation: move-right 3s linear infinite, fade-loop 3s linear infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .p2 { animation: move-right 3s linear infinite 1s, fade-loop 3s linear infinite 1s; animation-play-state:${playing ? "running" : "paused"}; }
        .p3 { animation: move-right 3s linear infinite 2s, fade-loop 3s linear infinite 2s; animation-play-state:${playing ? "running" : "paused"}; }
        .q1 { animation: move-left 3s linear infinite, fade-loop 3s linear infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .q2 { animation: move-left 3s linear infinite 1s, fade-loop 3s linear infinite 1s; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* Left box: Atmosphere / Lungs */}
      <rect x="10" y="100" width="100" height="100" rx="8" fill="#1a1a2e" stroke="#00FF9D" strokeWidth="2"/>
      <text x="60" y="130" textAnchor="middle" fontSize="11" fill="#00FF9D" fontWeight="bold">LUNGS</text>
      <text x="60" y="148" textAnchor="middle" fontSize="9" fill="#aaa">pO₂ = 104</text>
      <text x="60" y="163" textAnchor="middle" fontSize="9" fill="#f87171">pCO₂ = 40</text>
      {/* Right box: Tissues */}
      <rect x="290" y="100" width="100" height="100" rx="8" fill="#1a1a2e" stroke="#818cf8" strokeWidth="2"/>
      <text x="340" y="130" textAnchor="middle" fontSize="11" fill="#818cf8" fontWeight="bold">TISSUES</text>
      <text x="340" y="148" textAnchor="middle" fontSize="9" fill="#aaa">pO₂ = 40</text>
      <text x="340" y="163" textAnchor="middle" fontSize="9" fill="#f87171">pCO₂ = 45</text>
      {/* O2 particles moving right */}
      <g className="p1" transform="translate(110,130)"><circle r="9" fill="#00FF9D"/><text textAnchor="middle" y="4" fontSize="8" fill="#000" fontWeight="bold">O₂</text></g>
      <g className="p2" transform="translate(110,150)"><circle r="9" fill="#00FF9D"/><text textAnchor="middle" y="4" fontSize="8" fill="#000" fontWeight="bold">O₂</text></g>
      <g className="p3" transform="translate(110,170)"><circle r="9" fill="#00FF9D"/><text textAnchor="middle" y="4" fontSize="8" fill="#000" fontWeight="bold">O₂</text></g>
      {/* CO2 particles moving left */}
      <g className="q1" transform="translate(290,135)"><circle r="9" fill="#f87171"/><text textAnchor="middle" y="4" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text></g>
      <g className="q2" transform="translate(290,165)"><circle r="9" fill="#f87171"/><text textAnchor="middle" y="4" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text></g>
      {/* Arrows */}
      <path d="M112 145 L285 145" fill="none" stroke="#00FF9D" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4"/>
      <polygon points="285,141 293,145 285,149" fill="#00FF9D" opacity="0.6"/>
      <path d="M285 165 L112 165" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4"/>
      <polygon points="112,161 104,165 112,169" fill="#f87171" opacity="0.6"/>
      <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Gas Exchange by Diffusion</text>
      <text x="200" y="250" textAnchor="middle" fontSize="10" fill="#aaa">O₂ flows to tissues · CO₂ flows to lungs</text>
    </svg>
  );
}

function CycleVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes counter { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        .orbit { transform-origin:200px 160px; animation:rotate 8s linear infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .orbit-rev { transform-origin:200px 160px; animation:counter 6s linear infinite; animation-play-state:${playing ? "running" : "paused"}; }
        @keyframes pulse2 { 0%,100%{opacity:0.7;r:30} 50%{opacity:1;r:35} }
        .core { animation:pulse2 2s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      <circle cx="200" cy="160" r="55" fill="#1a2a1a" stroke="#00FF9D" strokeWidth="2" strokeDasharray="10,5"/>
      <circle className="core" cx="200" cy="160" r="30" fill="#00FF9D" opacity="0.2"/>
      <circle cx="200" cy="160" r="30" fill="none" stroke="#00FF9D" strokeWidth="2"/>
      <text x="200" y="155" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">Cycle</text>
      <text x="200" y="168" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">Center</text>
      {/* Orbiting molecules */}
      {[0,1,2,3].map(i => (
        <g key={i} className="orbit" style={{ animationDelay: `${i * 2}s` }}>
          <circle cx="200" cy="105" r="16" fill="#1a1a2e" stroke="#4ade80" strokeWidth="1.5"/>
          <text x="200" y="109" textAnchor="middle" fontSize="8" fill="#4ade80" fontWeight="bold">ATP</text>
        </g>
      ))}
      <g className="orbit-rev">
        <circle cx="200" cy="215" r="14" fill="#1a1a2e" stroke="#f87171" strokeWidth="1.5"/>
        <text x="200" y="219" textAnchor="middle" fontSize="7" fill="#f87171" fontWeight="bold">CO₂</text>
      </g>
      <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Metabolic Cycle</text>
    </svg>
  );
}

function DNAVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes dna-rotate { 0%{transform:scaleX(1)} 25%{transform:scaleX(0.1)} 50%{transform:scaleX(-1)} 75%{transform:scaleX(0.1)} 100%{transform:scaleX(1)} }
        @keyframes base-color { 0%,100%{fill:#00FF9D} 50%{fill:#818cf8} }
        .dna-strand { animation:dna-rotate 3s ease-in-out infinite; transform-origin:200px 160px; animation-play-state:${playing ? "running" : "paused"}; }
        .base { animation:base-color 3s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* DNA double helix represented */}
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <ellipse
            className="dna-strand"
            cx="200" cy={50 + i * 22}
            rx="60" ry="8"
            fill="none" stroke={i % 2 === 0 ? "#00FF9D" : "#818cf8"} strokeWidth="3"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
          <line
            x1="140" y1={50 + i * 22}
            x2="260" y2={50 + i * 22}
            stroke="#ffffff" strokeWidth="1.5" opacity="0.3"
          />
          <circle cx="140" cy={50 + i * 22} r="5" className="base" style={{ animationDelay: `${i * 0.1}s` }}/>
          <circle cx="260" cy={50 + i * 22} r="5" fill="#f472b6"/>
        </g>
      ))}
      <text x="200" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">DNA Double Helix</text>
      <text x="130" y="300" textAnchor="middle" fontSize="10" fill="#00FF9D">5' → 3'</text>
      <text x="270" y="300" textAnchor="middle" fontSize="10" fill="#818cf8">3' → 5'</text>
    </svg>
  );
}

function BrainVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes neural { 0%,100%{stroke-dashoffset:200} 50%{stroke-dashoffset:0} }
        @keyframes glow-med { 0%,100%{fill:rgba(0,255,157,0.15)} 50%{fill:rgba(0,255,157,0.4)} }
        .nerve { stroke-dasharray:200; animation:neural 2s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .medulla { animation:glow-med 2s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* Brain outline */}
      <ellipse cx="200" cy="140" rx="120" ry="95" fill="#1a1a2e" stroke="#818cf8" strokeWidth="2"/>
      {/* Cerebrum fold */}
      <path d="M120 120 Q160 100 200 120 Q240 100 280 120" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6"/>
      <path d="M125 145 Q165 125 200 145 Q235 125 275 145" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6"/>
      {/* Medulla oblongata - highlighted */}
      <ellipse className="medulla" cx="200" cy="220" rx="40" ry="18" stroke="#00FF9D" strokeWidth="2"/>
      <text x="200" y="224" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">Medulla</text>
      {/* Pons */}
      <rect x="170" y="195" width="60" height="18" rx="5" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="200" y="207" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="bold">Pons</text>
      {/* Neural signals */}
      <path className="nerve" d="M200 238 L200 290" fill="none" stroke="#00FF9D" strokeWidth="2.5"/>
      <path className="nerve" d="M200 290 L150 310" fill="none" stroke="#00FF9D" strokeWidth="2" style={{ animationDelay: "0.3s" }}/>
      <path className="nerve" d="M200 290 L250 310" fill="none" stroke="#00FF9D" strokeWidth="2" style={{ animationDelay: "0.6s" }}/>
      {/* Labels */}
      <text x="200" y="15" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Respiratory Control Centre</text>
      <text x="155" y="315" fontSize="9" fill="#00FF9D">Left Lung</text>
      <text x="238" y="315" fontSize="9" fill="#00FF9D">Right Lung</text>
      <text x="200" y="165" textAnchor="middle" fontSize="9" fill="#a78bfa" opacity="0.8">Cerebrum</text>
    </svg>
  );
}

function MoleculesVisual({ playing }: { playing: boolean }) {
  const mols = [
    { cx: 80, cy: 100, r: 22, color: "#00FF9D", label: "O₂", delay: "0s" },
    { cx: 200, cy: 80, r: 20, color: "#f87171", label: "CO₂", delay: "0.5s" },
    { cx: 310, cy: 120, r: 18, color: "#60a5fa", label: "H₂O", delay: "1s" },
    { cx: 120, cy: 220, r: 22, color: "#c084fc", label: "HCO₃", delay: "1.5s" },
    { cx: 280, cy: 210, r: 20, color: "#f59e0b", label: "Hb", delay: "0.3s" },
    { cx: 200, cy: 180, r: 25, color: "#4ade80", label: "ATP", delay: "0.8s" },
  ];
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes float-mol { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes bond { 0%,100%{opacity:0.2} 50%{opacity:0.7} }
        .mol { animation:float-mol 3s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .bond { animation:bond 2s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* Bond lines */}
      <line className="bond" x1="80" y1="100" x2="200" y2="80" stroke="#ffffff" strokeWidth="1"/>
      <line className="bond" x1="200" y1="80" x2="310" y2="120" stroke="#ffffff" strokeWidth="1" style={{ animationDelay: "0.5s" }}/>
      <line className="bond" x1="80" y1="100" x2="120" y2="220" stroke="#ffffff" strokeWidth="1" style={{ animationDelay: "1s" }}/>
      <line className="bond" x1="200" y1="180" x2="120" y2="220" stroke="#ffffff" strokeWidth="1" style={{ animationDelay: "0.3s" }}/>
      <line className="bond" x1="200" y1="180" x2="280" y2="210" stroke="#ffffff" strokeWidth="1" style={{ animationDelay: "0.7s" }}/>
      {mols.map((m, i) => (
        <g key={i} className="mol" style={{ animationDelay: m.delay, transformOrigin: `${m.cx}px ${m.cy}px` }}>
          <circle cx={m.cx} cy={m.cy} r={m.r} fill={m.color} opacity="0.85"/>
          <circle cx={m.cx} cy={m.cy} r={m.r} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3"/>
          <text x={m.cx} y={m.cy + 4} textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">{m.label}</text>
        </g>
      ))}
      <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Biological Molecules</text>
    </svg>
  );
}

function CompareVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <style>{`
        @keyframes slide-in-l { 0%{transform:translateX(-20px);opacity:0} 100%{transform:translateX(0);opacity:1} }
        @keyframes slide-in-r { 0%{transform:translateX(20px);opacity:0} 100%{transform:translateX(0);opacity:1} }
        @keyframes blink-bar { 0%,100%{height:0} 100%{height:80px} }
        .left-card { animation:slide-in-l 0.8s ease forwards; animation-play-state:${playing ? "running" : "paused"}; }
        .right-card { animation:slide-in-r 0.8s ease 0.3s forwards; opacity:0; animation-play-state:${playing ? "running" : "paused"}; }
        @keyframes bar-grow { from{height:0} to{height:var(--bh)} }
        .bar1 { --bh:80px; animation:bar-grow 1.5s ease forwards; animation-play-state:${playing ? "running" : "paused"}; }
        .bar2 { --bh:50px; animation:bar-grow 1.5s ease 0.3s forwards; animation-play-state:${playing ? "running" : "paused"}; }
        .bar3 { --bh:65px; animation:bar-grow 1.5s ease 0.6s forwards; animation-play-state:${playing ? "running" : "paused"}; }
        .bar4 { --bh:90px; animation:bar-grow 1.5s ease 0.9s forwards; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* Left panel */}
      <g className="left-card">
        <rect x="15" y="60" width="165" height="210" rx="8" fill="#0d1a0d" stroke="#00FF9D" strokeWidth="1.5"/>
        <rect x="15" y="60" width="165" height="36" rx="8" fill="#00FF9D" opacity="0.2"/>
        <text x="97" y="83" textAnchor="middle" fontSize="12" fill="#00FF9D" fontWeight="bold">Panel A</text>
        {["Feature 1", "Feature 2", "Feature 3", "Feature 4"].map((f, i) => (
          <g key={i}>
            <circle cx="35" cy={115 + i * 38} r="5" fill="#00FF9D" opacity="0.8"/>
            <text x="48" y={119 + i * 38} fontSize="10" fill="#ccc">{f}</text>
            <rect x="140" y={106 + i * 38} width="28" height="18" rx="3" fill="#00FF9D" opacity="0.3"/>
            <text x="154" y={119 + i * 38} textAnchor="middle" fontSize="9" fill="#00FF9D">✓</text>
          </g>
        ))}
      </g>
      {/* Divider */}
      <line x1="200" y1="50" x2="200" y2="280" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,4" opacity="0.3"/>
      <text x="200" y="42" textAnchor="middle" fontSize="11" fill="#aaa">VS</text>
      {/* Right panel */}
      <g className="right-card">
        <rect x="220" y="60" width="165" height="210" rx="8" fill="#1a0d0d" stroke="#818cf8" strokeWidth="1.5"/>
        <rect x="220" y="60" width="165" height="36" rx="8" fill="#818cf8" opacity="0.2"/>
        <text x="302" y="83" textAnchor="middle" fontSize="12" fill="#818cf8" fontWeight="bold">Panel B</text>
        {["Feature 1", "Feature 2", "Feature 3", "Feature 4"].map((f, i) => (
          <g key={i}>
            <circle cx="240" cy={115 + i * 38} r="5" fill="#818cf8" opacity="0.8"/>
            <text x="253" y={119 + i * 38} fontSize="10" fill="#ccc">{f}</text>
            <rect x="345" y={106 + i * 38} width="28" height="18" rx="3" fill="#818cf8" opacity="0.3"/>
            <text x="359" y={119 + i * 38} textAnchor="middle" fontSize="9" fill="#818cf8">{i % 2 === 0 ? "✓" : "✗"}</text>
          </g>
        ))}
      </g>
      <text x="200" y="20" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Comparison</text>
    </svg>
  );
}

function HeartVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 15%{transform:scale(1.08)} 30%{transform:scale(0.97)} 45%{transform:scale(1.05)} 60%{transform:scale(1)} }
        @keyframes blood-flow { 0%{opacity:0;stroke-dashoffset:200} 40%{opacity:1} 100%{opacity:0;stroke-dashoffset:0} }
        .heart { transform-origin:200px 155px; animation:heartbeat 1s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .artery { stroke-dasharray:200; animation:blood-flow 2s linear infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .vein   { stroke-dasharray:200; animation:blood-flow 2s linear infinite 1s; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      <g className="heart">
        {/* Heart shape */}
        <path d="M200 220 Q120 180 110 140 Q100 100 140 95 Q170 90 200 120 Q230 90 260 95 Q300 100 290 140 Q280 180 200 220Z"
          fill="#f87171" opacity="0.6" stroke="#ef4444" strokeWidth="2.5"/>
        {/* Chambers */}
        <line x1="200" y1="120" x2="200" y2="210" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
        <path d="M200 165 Q145 165 145 185" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.5"/>
        <text x="162" y="140" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">RA</text>
        <text x="238" y="140" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">LA</text>
        <text x="162" y="195" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">RV</text>
        <text x="238" y="195" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">LV</text>
      </g>
      {/* Arteries (red - oxygenated) */}
      <path className="artery" d="M200 100 Q200 60 200 40" fill="none" stroke="#f87171" strokeWidth="4"/>
      <path className="artery" d="M220 105 Q280 80 310 100" fill="none" stroke="#f87171" strokeWidth="3" style={{ animationDelay: "0.3s" }}/>
      {/* Veins (blue - deoxygenated) */}
      <path className="vein" d="M180 105 Q120 80 90 100" fill="none" stroke="#60a5fa" strokeWidth="3"/>
      <path className="vein" d="M185 220 Q140 270 130 290" fill="none" stroke="#60a5fa" strokeWidth="3" style={{ animationDelay: "0.5s" }}/>
      <text x="200" y="25" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Human Heart</text>
      <text x="200" y="300" textAnchor="middle" fontSize="9" fill="#aaa">RA/LA = Atria · RV/LV = Ventricles</text>
    </svg>
  );
}

function CellVisual({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes cell-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes organelle-glow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .cell-body { transform-origin:200px 160px; animation:cell-pulse 3s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .organelle { animation:organelle-glow 2s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      <g className="cell-body">
        {/* Cell membrane */}
        <ellipse cx="200" cy="160" rx="170" ry="130" fill="#0d1a1a" stroke="#00FF9D" strokeWidth="2.5"/>
        {/* Nucleus */}
        <ellipse className="organelle" cx="195" cy="150" rx="45" ry="35" fill="#1a1a3a" stroke="#818cf8" strokeWidth="2"/>
        <ellipse cx="195" cy="150" rx="15" ry="12" fill="#818cf8" opacity="0.6"/>
        <text x="195" y="154" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">N</text>
        <text x="248" y="128" fontSize="8" fill="#818cf8">Nucleus</text>
        {/* Mitochondria */}
        <ellipse className="organelle" cx="100" cy="130" rx="25" ry="12" fill="#1a2a1a" stroke="#00FF9D" strokeWidth="1.5" style={{ animationDelay: "0.5s" }}/>
        <path d="M95 130 Q100 122 105 130 Q100 138 95 130" fill="none" stroke="#00FF9D" strokeWidth="1" opacity="0.7"/>
        <text x="100" y="156" textAnchor="middle" fontSize="7" fill="#00FF9D">Mito</text>
        {/* ER */}
        <path className="organelle" d="M240 100 Q270 110 275 130 Q280 150 260 155 Q240 160 235 145 Q230 130 240 100" fill="none" stroke="#f59e0b" strokeWidth="1.5" style={{ animationDelay: "1s" }}/>
        <text x="272" y="175" fontSize="7" fill="#f59e0b">ER</text>
        {/* Ribosome dots */}
        {[120, 145, 168].map((y, i) => (
          <circle key={i} cx={290 + i * 5} cy={y} r="3" fill="#c084fc" className="organelle" style={{ animationDelay: `${i * 0.3}s` }}/>
        ))}
        <text x="308" y="200" fontSize="7" fill="#c084fc">Ribosomes</text>
        {/* Golgi */}
        {[0,1,2].map(i => (
          <path key={i} className="organelle" d={`M130 ${200 + i * 8} Q160 ${195 + i * 8} 180 ${200 + i * 8}`} fill="none" stroke="#f472b6" strokeWidth="2" style={{ animationDelay: `${i * 0.3}s` }}/>
        ))}
        <text x="155" y="240" textAnchor="middle" fontSize="7" fill="#f472b6">Golgi</text>
      </g>
      <text x="200" y="20" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Eukaryotic Cell</text>
    </svg>
  );
}

function GenericVisual({ playing, chapterColor }: { playing: boolean; chapterColor: string }) {
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-15px) rotate(5deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-10px) rotate(-5deg)} }
        @keyframes dot-pulse { 0%,100%{r:3} 50%{r:5} }
        .f1 { animation:float1 4s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
        .f2 { animation:float2 3.5s ease-in-out infinite 0.5s; animation-play-state:${playing ? "running" : "paused"}; }
        .f3 { animation:float1 5s ease-in-out infinite 1s; animation-play-state:${playing ? "running" : "paused"}; }
        .dp { animation:dot-pulse 1.5s ease-in-out infinite; animation-play-state:${playing ? "running" : "paused"}; }
      `}</style>
      {/* Central icon */}
      <circle cx="200" cy="155" r="70" fill="#0d1a0d" stroke={chapterColor} strokeWidth="2" opacity="0.5"/>
      <circle cx="200" cy="155" r="50" fill={chapterColor} opacity="0.15"/>
      <text x="200" y="148" textAnchor="middle" fontSize="32">🧬</text>
      <text x="200" y="175" textAnchor="middle" fontSize="11" fill={chapterColor} fontWeight="bold">BIOLOGY</text>
      {/* Orbiting dots */}
      {[0,1,2,3,4].map(i => {
        const angle = (i / 5) * Math.PI * 2;
        const cx = 200 + Math.cos(angle) * 100;
        const cy = 155 + Math.sin(angle) * 80;
        return (
          <circle key={i} className="dp" cx={cx} cy={cy} r="4" fill={chapterColor} opacity="0.7"
            style={{ animationDelay: `${i * 0.3}s` }}/>
        );
      })}
      {/* Floating elements */}
      <g className="f1" style={{ transformOrigin: "80px 100px" }}>
        <rect x="60" y="85" width="40" height="30" rx="6" fill="#1a1a2e" stroke={chapterColor} strokeWidth="1.5" opacity="0.8"/>
        <text x="80" y="104" textAnchor="middle" fontSize="9" fill={chapterColor}>NCERT</text>
      </g>
      <g className="f2" style={{ transformOrigin: "310px 120px" }}>
        <rect x="290" y="105" width="40" height="30" rx="6" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8"/>
        <text x="310" y="124" textAnchor="middle" fontSize="9" fill="#f59e0b">NEET</text>
      </g>
      <g className="f3" style={{ transformOrigin: "200px 240px" }}>
        <rect x="170" y="228" width="60" height="24" rx="6" fill="#1a1a2e" stroke="#818cf8" strokeWidth="1.5" opacity="0.8"/>
        <text x="200" y="244" textAnchor="middle" fontSize="9" fill="#818cf8">BIOLOGY</text>
      </g>
      <text x="200" y="28" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Chapter Overview</text>
    </svg>
  );
}

function VisualRenderer({ type, playing, color }: { type: AnimFrame["visual"]; playing: boolean; color: string }) {
  switch (type) {
    case "lungs":    return <LungsVisual playing={playing} />;
    case "flow":     return <FlowVisual playing={playing} />;
    case "cycle":    return <CycleVisual playing={playing} />;
    case "dna":      return <DNAVisual playing={playing} />;
    case "brain":    return <BrainVisual playing={playing} />;
    case "molecules":return <MoleculesVisual playing={playing} />;
    case "compare":  return <CompareVisual playing={playing} />;
    case "heart":    return <HeartVisual playing={playing} />;
    case "cell":     return <CellVisual playing={playing} />;
    default:         return <GenericVisual playing={playing} chapterColor={color} />;
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function AnimationPage() {
  const { cls, chapterId, subunit: subunitParam } = useParams<{ cls: string; chapterId: string; subunit: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState(() => getChapters(cls || "11"));
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [pointsVisible, setPointsVisible] = useState(0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchChaptersFromAPI(cls || "11").then(setChapters);
  }, [cls]);

  const subunit = subunitParam ? decodeURIComponent(subunitParam) : "";
  const chapter = chapters.find(c => c.id === chapterId);
  const chapterName = chapter?.name || chapterId || "";
  const chapterAnim = getChapterAnim(chapterId || "");
  const accentColor = chapterAnim?.color || "#00FF9D";

  const animData = getSubunitAnim(chapterId || "", subunit, chapterName);
  const frames = animData.frames;
  const frame = frames[frameIdx] ?? frames[0];

  // Start points animation
  useEffect(() => {
    setPointsVisible(0);
    if (timerRef.current) clearInterval(timerRef.current);
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      setPointsVisible(count);
      if (count >= (frame?.keyPoints?.length ?? 0)) clearInterval(timerRef.current!);
    }, 600);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [frameIdx, frame?.keyPoints?.length]);

  // Speech synthesis
  const speak = useCallback((text: string) => {
    if (!audioOn) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 1;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const eng = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith("en-IN"))
      || voices.find(v => v.lang.startsWith("en"));
    if (eng) utt.voice = eng;
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [audioOn]);

  useEffect(() => {
    if (playing && frame) {
      speak(frame.narration);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => { window.speechSynthesis.cancel(); };
  }, [playing, frameIdx, speak, frame]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const goNext = () => {
    window.speechSynthesis.cancel();
    setFrameIdx(i => Math.min(i + 1, frames.length - 1));
  };
  const goPrev = () => {
    window.speechSynthesis.cancel();
    setFrameIdx(i => Math.max(i - 1, 0));
  };
  const togglePlay = () => setPlaying(p => !p);
  const toggleAudio = () => {
    setAudioOn(a => {
      if (a) window.speechSynthesis.cancel();
      return !a;
    });
  };

  if (!chapter || !frame) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bs-bg)" }}>
        <p style={{ color: "var(--bs-text)" }}>Animation not found</p>
      </div>
    );
  }

  const progress = ((frameIdx + 1) / frames.length) * 100;

  return (
    <div
      className="min-h-screen font-['Space_Grotesk'] flex flex-col"
      style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}
    >
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", zIndex: 0,
      }}/>
      {/* Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 blur-[120px] pointer-events-none" style={{
        background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, zIndex: 0,
      }}/>

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-4 px-4 pt-5 pb-3 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
        <button
          onClick={() => { window.speechSynthesis.cancel(); navigate(`/subunits/${cls}/${chapterId}`); }}
          className="flex items-center gap-2 font-mono uppercase tracking-wide text-sm transition-colors"
          style={{ color: "var(--bs-text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
            {chapterAnim?.icon} {chapter.name}
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight leading-tight truncate" style={{ color: "var(--bs-text)" }}>
            {subunit}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>
            {frameIdx + 1} / {frames.length}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative z-10 h-1 w-full" style={{ background: "var(--bs-surface)" }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: accentColor }}/>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Animation visual */}
        <div
          className="lg:w-1/2 flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: "var(--bs-border-subtle)", minHeight: "280px", maxHeight: "420px" }}
        >
          <div className="w-full max-w-sm aspect-[4/3]">
            <VisualRenderer type={frame.visual} playing={playing} color={accentColor} />
          </div>
        </div>

        {/* Content panel */}
        <div className="lg:w-1/2 flex flex-col p-5 overflow-y-auto">
          {/* Frame title */}
          <div
            className="inline-block border-l-4 pl-3 mb-4"
            style={{ borderLeftColor: accentColor }}
          >
            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>
              {frame.title}
            </h2>
          </div>

          {/* Narration */}
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--bs-text-muted)" }}>
            {frame.narration}
          </p>

          {/* Key points */}
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Key Points
            </div>
            <ul className="space-y-2">
              {frame.keyPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm transition-all duration-500"
                  style={{
                    opacity: i < pointsVisible ? 1 : 0,
                    transform: i < pointsVisible ? "translateX(0)" : "translateX(-12px)",
                  }}
                >
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center text-xs font-black border mt-0.5"
                    style={{ color: accentColor, borderColor: accentColor, background: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}>
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--bs-text)" }}>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-4 border-t gap-4"
        style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface)" }}
      >
        {/* Prev */}
        <button
          onClick={goPrev}
          disabled={frameIdx === 0}
          className="flex items-center gap-2 px-4 py-2 border font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
          style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface-2)", color: "var(--bs-text)" }}
        >
          <SkipBack className="w-4 h-4" />
          Prev
        </button>

        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className="w-9 h-9 flex items-center justify-center border transition-all"
            style={{
              borderColor: audioOn ? accentColor : "var(--bs-border-subtle)",
              color: audioOn ? accentColor : "var(--bs-text-muted)",
              background: audioOn ? `color-mix(in srgb, ${accentColor} 12%, transparent)` : "var(--bs-surface-2)",
            }}
            title={audioOn ? "Mute narration" : "Enable narration"}
          >
            {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-6 py-2.5 font-black uppercase tracking-wider text-sm border-2 transition-all"
            style={{
              borderColor: accentColor,
              background: playing ? accentColor : `color-mix(in srgb, ${accentColor} 15%, transparent)`,
              color: playing ? "#000" : accentColor,
            }}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          disabled={frameIdx === frames.length - 1}
          className="flex items-center gap-2 px-4 py-2 border font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
          style={{ borderColor: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}
        >
          Next
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* ── Subunit navigator ── */}
      {chapter.subunits.length > 1 && (
        <div className="relative z-10 px-4 py-3 border-t overflow-x-auto" style={{ borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex gap-2 min-w-max">
            {chapter.subunits.map((su, i) => {
              const isActive = su === subunit;
              return (
                <button
                  key={su}
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setPlaying(false);
                    setFrameIdx(0);
                    navigate(`/animations/${cls}/${chapterId}/${encodeURIComponent(su)}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wide border whitespace-nowrap transition-all"
                  style={{
                    borderColor: isActive ? accentColor : "var(--bs-border-subtle)",
                    background: isActive ? `color-mix(in srgb, ${accentColor} 18%, transparent)` : "var(--bs-surface)",
                    color: isActive ? accentColor : "var(--bs-text-muted)",
                  }}
                >
                  <span style={{ color: isActive ? accentColor : "var(--bs-text-muted)" }}>{i + 1}.</span>
                  {su}
                  {isActive && <ChevronRight className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
