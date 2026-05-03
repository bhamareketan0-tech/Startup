import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { getChapters, fetchChaptersFromAPI } from "@/lib/chaptersManager";
import { getSubunitAnim, getChapterAnim, type AnimFrame } from "@/data/animationContent";

// ─── Visual Components ────────────────────────────────────────────────────────

function BreathingInVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes diaphragm-in { 0%,100%{d:path("M60 260 Q200 270 340 260")} 50%{d:path("M60 260 Q200 290 340 260")} }
        @keyframes ribs-expand { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.09)} }
        @keyframes lung-fill { 0%,100%{transform:scale(1);opacity:0.25} 50%{transform:scale(1.12);opacity:0.45} }
        @keyframes air-in { 0%{opacity:0;transform:translateY(-30px)} 60%{opacity:1} 100%{opacity:0;transform:translateY(20px)} }
        @keyframes arrow-blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .ribcage { transform-origin:200px 180px; animation:ribs-expand 3s ease-in-out infinite; animation-play-state:${ps}; }
        .left-lung { transform-origin:145px 185px; animation:lung-fill 3s ease-in-out infinite; animation-play-state:${ps}; }
        .right-lung { transform-origin:255px 185px; animation:lung-fill 3s ease-in-out infinite 0.1s; animation-play-state:${ps}; }
        .air-particle { animation:air-in 2.5s ease-in-out infinite; animation-play-state:${ps}; }
        .arr { animation:arrow-blink 1.5s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <defs>
        <linearGradient id="lungGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#00FF9D" stopOpacity="0.15"/>
        </linearGradient>
      </defs>
      <text x="200" y="22" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">INSPIRATION (Breathing In)</text>
      {/* Trachea */}
      <rect x="192" y="38" width="16" height="55" rx="7" fill="#4ade80" opacity="0.8"/>
      <text x="200" y="33" textAnchor="middle" fontSize="9" fill="#4ade80">Trachea</text>
      {/* Bronchi */}
      <path d="M192 90 Q160 100 148 118" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      <path d="M208 90 Q240 100 252 118" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      {/* Ribcage */}
      <g className="ribcage">
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <path d={`M110 ${115 + i*25} Q80 ${125 + i*25} 82 ${145 + i*25} Q84 ${160 + i*25} 108 ${157 + i*25}`} fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
            <path d={`M290 ${115 + i*25} Q320 ${125 + i*25} 318 ${145 + i*25} Q316 ${160 + i*25} 292 ${157 + i*25}`} fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          </g>
        ))}
      </g>
      {/* Left lung */}
      <g className="left-lung">
        <path d="M148 118 Q90 130 85 180 Q82 220 95 250 Q110 270 140 268 Q168 264 183 240 Q192 215 192 118Z" fill="url(#lungGrad)"/>
        <path d="M148 118 Q90 130 85 180 Q82 220 95 250 Q110 270 140 268 Q168 264 183 240 Q192 215 192 118Z" fill="none" stroke="#00FF9D" strokeWidth="2" opacity="0.8"/>
      </g>
      {/* Right lung */}
      <g className="right-lung">
        <path d="M252 118 Q310 130 315 180 Q318 220 305 250 Q290 270 260 268 Q232 264 217 240 Q208 215 208 118Z" fill="url(#lungGrad)"/>
        <path d="M252 118 Q310 130 315 180 Q318 220 305 250 Q290 270 260 268 Q232 264 217 240 Q208 215 208 118Z" fill="none" stroke="#00FF9D" strokeWidth="2" opacity="0.8"/>
      </g>
      {/* Diaphragm — moves down on inspiration */}
      <path d="M70 270 Q200 255 330 270" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
      <text x="200" y="315" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">Diaphragm contracts → moves DOWN ↓</text>
      {/* Air particles flowing in */}
      {[0,0.6,1.2].map((delay, i) => (
        <g key={i} className="air-particle" style={{ animationDelay: `${delay}s` }}>
          <circle cx={195 + (i-1)*8} cy={50 + i*5} r="6" fill="#00FF9D" opacity="0.85"/>
          <text x={195 + (i-1)*8} y={54 + i*5} textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
        </g>
      ))}
      {/* Arrows showing expansion */}
      <g className="arr">
        <line x1="68" y1="180" x2="48" y2="180" stroke="#60a5fa" strokeWidth="2"/>
        <polygon points="48,177 40,180 48,183" fill="#60a5fa"/>
        <line x1="332" y1="180" x2="352" y2="180" stroke="#60a5fa" strokeWidth="2"/>
        <polygon points="352,177 360,180 352,183" fill="#60a5fa"/>
      </g>
      <text x="34" y="195" textAnchor="middle" fontSize="8" fill="#60a5fa">Chest</text>
      <text x="34" y="205" textAnchor="middle" fontSize="8" fill="#60a5fa">expands</text>
      <text x="360" y="195" textAnchor="middle" fontSize="8" fill="#60a5fa">→</text>
      <text x="200" y="296" textAnchor="middle" fontSize="10" fill="#94a3b8">Volume ↑ → Pressure ↓ → Air flows IN</text>
    </svg>
  );
}

function BreathingOutVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes lung-deflate { 0%,100%{transform:scale(1.08);opacity:0.4} 50%{transform:scale(0.92);opacity:0.2} }
        @keyframes diaphragm-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes air-out { 0%{opacity:0;transform:translateY(10px)} 40%{opacity:1} 100%{opacity:0;transform:translateY(-35px)} }
        .ld { transform-origin:145px 185px; animation:lung-deflate 3s ease-in-out infinite; animation-play-state:${ps}; }
        .rd { transform-origin:255px 185px; animation:lung-deflate 3s ease-in-out infinite 0.1s; animation-play-state:${ps}; }
        .dia-up { transform-origin:200px 270px; animation:diaphragm-up 3s ease-in-out infinite; animation-play-state:${ps}; }
        .ao { animation:air-out 2.5s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <defs>
        <linearGradient id="lungDeflate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <text x="200" y="22" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">EXPIRATION (Breathing Out)</text>
      <rect x="192" y="38" width="16" height="55" rx="7" fill="#4ade80" opacity="0.8"/>
      <path d="M192 90 Q160 100 148 118" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      <path d="M208 90 Q240 100 252 118" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      {/* Ribcage smaller */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <path d={`M118 ${115 + i*25} Q90 ${125 + i*25} 91 ${145 + i*25} Q92 ${160 + i*25} 116 ${157 + i*25}`} fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          <path d={`M282 ${115 + i*25} Q310 ${125 + i*25} 309 ${145 + i*25} Q308 ${160 + i*25} 284 ${157 + i*25}`} fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
        </g>
      ))}
      <g className="ld">
        <path d="M148 118 Q90 130 85 180 Q82 220 95 250 Q110 270 140 268 Q168 264 183 240 Q192 215 192 118Z" fill="url(#lungDeflate)"/>
        <path d="M148 118 Q90 130 85 180 Q82 220 95 250 Q110 270 140 268 Q168 264 183 240 Q192 215 192 118Z" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.7"/>
      </g>
      <g className="rd">
        <path d="M252 118 Q310 130 315 180 Q318 220 305 250 Q290 270 260 268 Q232 264 217 240 Q208 215 208 118Z" fill="url(#lungDeflate)"/>
        <path d="M252 118 Q310 130 315 180 Q318 220 305 250 Q290 270 260 268 Q232 264 217 240 Q208 215 208 118Z" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.7"/>
      </g>
      <g className="dia-up">
        <path d="M70 270 Q200 285 330 270" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
      </g>
      <text x="200" y="315" textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="bold">Diaphragm relaxes → moves UP ↑</text>
      {/* CO2 out */}
      {[0,0.7,1.4].map((delay, i) => (
        <g key={i} className="ao" style={{ animationDelay: `${delay}s` }}>
          <circle cx={192 + (i-1)*10} cy={45} r="7" fill="#f87171" opacity="0.9"/>
          <text x={192 + (i-1)*10} y={49} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
        </g>
      ))}
      <text x="200" y="296" textAnchor="middle" fontSize="10" fill="#94a3b8">Volume ↓ → Pressure ↑ → Air forced OUT</text>
    </svg>
  );
}

function AlveolusVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes alv-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes o2-cross { 0%{opacity:0;transform:translate(0,0)} 50%{opacity:1} 100%{opacity:0;transform:translate(60px,20px)} }
        @keyframes co2-cross { 0%{opacity:0;transform:translate(0,0)} 50%{opacity:1} 100%{opacity:0;transform:translate(-60px,-20px)} }
        @keyframes blood-flow-r { 0%{transform:translateX(-60px);opacity:0} 50%{opacity:1} 100%{transform:translateX(60px);opacity:0} }
        @keyframes blood-flow-b { 0%{transform:translateX(60px);opacity:0} 50%{opacity:1} 100%{transform:translateX(-60px);opacity:0} }
        .alv { transform-origin:200px 130px; animation:alv-pulse 3s ease-in-out infinite; animation-play-state:${ps}; }
        .o2m { animation:o2-cross 2.8s ease-in-out infinite; animation-play-state:${ps}; }
        .co2m { animation:co2-cross 2.8s ease-in-out infinite 0.5s; animation-play-state:${ps}; }
        .rbc { animation:blood-flow-r 3s linear infinite; animation-play-state:${ps}; }
        .dbc { animation:blood-flow-b 3s linear infinite 1.5s; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Alveolus — Gas Exchange Site</text>
      {/* Alveolus */}
      <g className="alv">
        <ellipse cx="200" cy="130" rx="90" ry="80" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="2.5"/>
        <text x="200" y="82" textAnchor="middle" fontSize="10" fill="#00FF9D" fontWeight="bold">ALVEOLUS</text>
        <text x="200" y="94" textAnchor="middle" fontSize="8" fill="#4ade80">Air space</text>
        {/* Air molecules inside */}
        <circle cx="170" cy="115" r="8" fill="#00FF9D" opacity="0.7"/>
        <text x="170" y="119" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
        <circle cx="200" cy="125" r="8" fill="#00FF9D" opacity="0.7"/>
        <text x="200" y="129" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
        <circle cx="230" cy="112" r="9" fill="#f87171" opacity="0.5"/>
        <text x="230" y="116" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
      </g>
      {/* Alveolar membrane label */}
      <text x="116" y="148" textAnchor="middle" fontSize="8" fill="#f59e0b">Thin wall</text>
      <text x="116" y="158" textAnchor="middle" fontSize="8" fill="#f59e0b">(0.5 µm)</text>
      <line x1="130" y1="152" x2="148" y2="152" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Capillary — runs below alveolus */}
      <rect x="80" y="218" width="240" height="44" rx="22" fill="#1a0d0d" stroke="#ef4444" strokeWidth="2.5"/>
      <text x="200" y="237" textAnchor="middle" fontSize="10" fill="#f87171" fontWeight="bold">PULMONARY CAPILLARY</text>
      <text x="200" y="253" textAnchor="middle" fontSize="8" fill="#94a3b8">Deoxygenated blood in → Oxygenated blood out</text>
      {/* RBC moving */}
      <g className="rbc" style={{ transformOrigin: "200px 232px" }}>
        <ellipse cx="160" cy="232" rx="14" ry="9" fill="#ef4444" opacity="0.9"/>
        <text x="160" y="236" textAnchor="middle" fontSize="7" fill="#fff">RBC</text>
      </g>
      {/* O2 crossing from alveolus to capillary */}
      <g className="o2m" style={{ transformOrigin: "155px 195px" }}>
        <circle cx="155" cy="195" r="7" fill="#00FF9D" opacity="0.95"/>
        <text x="155" y="199" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
      </g>
      <g className="o2m" style={{ transformOrigin: "200px 200px", animationDelay: "1s" }}>
        <circle cx="200" cy="200" r="7" fill="#00FF9D" opacity="0.95"/>
        <text x="200" y="204" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
      </g>
      {/* CO2 crossing from capillary to alveolus */}
      <g className="co2m" style={{ transformOrigin: "245px 200px" }}>
        <circle cx="245" cy="200" r="8" fill="#f87171" opacity="0.95"/>
        <text x="245" y="204" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
      </g>
      {/* Arrows */}
      <path d="M175 210 L175 218" stroke="#00FF9D" strokeWidth="2" markerEnd="url(#arrowG)"/>
      <path d="M225 218 L225 210" stroke="#f87171" strokeWidth="2"/>
      <polygon points="225,206 222,212 228,212" fill="#f87171"/>
      {/* Partial pressures */}
      <text x="80" y="300" fontSize="9" fill="#00FF9D">Alveolar: pO₂ = 104 mmHg</text>
      <text x="80" y="313" fontSize="9" fill="#f87171">Alveolar: pCO₂ = 40 mmHg</text>
      <text x="240" y="300" fontSize="9" fill="#60a5fa">Blood in: pO₂ = 40 mmHg</text>
      <text x="240" y="313" fontSize="9" fill="#f87171">Blood in: pCO₂ = 45 mmHg</text>
    </svg>
  );
}

function LungVolumesVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  const bars = [
    { label: "TV", val: 500, max: 1200, color: "#00FF9D", desc: "500 mL", y: 260 },
    { label: "IRV", val: 3000, max: 4000, color: "#60a5fa", desc: "3000 mL", y: 260 },
    { label: "ERV", val: 1100, max: 2000, color: "#f59e0b", desc: "1100 mL", y: 260 },
    { label: "RV", val: 1200, max: 2000, color: "#f87171", desc: "1200 mL", y: 260 },
  ];
  const maxH = 160;
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes bar-rise-0 { 0%{height:0;y:260} to{height:${(500/1200)*maxH}px;y:${260 - (500/1200)*maxH}px} }
        @keyframes bar-rise-1 { 0%{height:0;y:260} to{height:${(3000/4000)*maxH}px;y:${260 - (3000/4000)*maxH}px} }
        @keyframes bar-rise-2 { 0%{height:0;y:260} to{height:${(1100/2000)*maxH}px;y:${260 - (1100/2000)*maxH}px} }
        @keyframes bar-rise-3 { 0%{height:0;y:260} to{height:${(1200/2000)*maxH}px;y:${260 - (1200/2000)*maxH}px} }
        .b0 { animation:bar-rise-0 1.5s ease forwards; animation-play-state:${ps}; }
        .b1 { animation:bar-rise-1 1.5s ease 0.3s forwards; animation-play-state:${ps}; }
        .b2 { animation:bar-rise-2 1.5s ease 0.6s forwards; animation-play-state:${ps}; }
        .b3 { animation:bar-rise-3 1.5s ease 0.9s forwards; animation-play-state:${ps}; }
        @keyframes spirometer { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-30px)} 75%{transform:translateY(10px)} }
        .wave { animation:spirometer 4s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Pulmonary Volumes (Spirometry)</text>
      {/* Axes */}
      <line x1="60" y1="90" x2="60" y2="268" stroke="#475569" strokeWidth="2"/>
      <line x1="58" y1="268" x2="375" y2="268" stroke="#475569" strokeWidth="2"/>
      <text x="30" y="95" textAnchor="middle" fontSize="9" fill="#94a3b8" transform="rotate(-90,30,175)">Volume (mL)</text>
      {/* Y-axis labels */}
      {[0,1000,2000,3000,4000].map((v, i) => (
        <g key={i}>
          <line x1="55" y1={268 - (v/4000)*maxH} x2="65" y2={268 - (v/4000)*maxH} stroke="#475569" strokeWidth="1"/>
          <text x="52" y={268 - (v/4000)*maxH + 4} textAnchor="end" fontSize="8" fill="#94a3b8">{v}</text>
        </g>
      ))}
      {/* Bars */}
      {bars.map((b, i) => {
        const bh = (b.val / (i === 1 ? 4000 : 2000)) * maxH;
        const bx = 90 + i * 72;
        return (
          <g key={i}>
            <rect className={`b${i}`} x={bx} y={260} width="50" height="0" fill={b.color} opacity="0.85" rx="3"/>
            <text x={bx + 25} y={280} textAnchor="middle" fontSize="11" fill={b.color} fontWeight="bold">{b.label}</text>
            <text x={bx + 25} y={293} textAnchor="middle" fontSize="9" fill="#94a3b8">{b.desc}</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x="60" y="305" width="280" height="28" rx="4" fill="#0d1a0d" stroke="#1e3a2e" strokeWidth="1"/>
      <text x="200" y="316" textAnchor="middle" fontSize="8" fill="#00FF9D">TV=Tidal  IRV=Insp.Reserve  ERV=Exp.Reserve  RV=Residual</text>
      <text x="200" y="328" textAnchor="middle" fontSize="8" fill="#94a3b8">Vital Capacity = TV+IRV+ERV = 4600 mL  |  TLC = 5800 mL</text>
      {/* Spirometer wave sketch */}
      <g className="wave" style={{ transformOrigin: "200px 150px" }}>
        <path d="M65 165 Q90 135 115 165 Q140 195 165 145 Q190 95 215 145 Q240 195 265 165 Q290 135 315 165" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.5" strokeDasharray="4,3"/>
      </g>
      <text x="200" y="88" textAnchor="middle" fontSize="8" fill="#818cf8" opacity="0.7">Spirometer trace</text>
    </svg>
  );
}

function PartialPressureVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes flow-right { 0%{opacity:0;transform:translateX(-20px)} 60%{opacity:1} 100%{opacity:0;transform:translateX(20px)} }
        @keyframes flow-left  { 0%{opacity:0;transform:translateX(20px)} 60%{opacity:1} 100%{opacity:0;transform:translateX(-20px)} }
        .fr { animation:flow-right 2.5s ease-in-out infinite; animation-play-state:${ps}; }
        .fl { animation:flow-left 2.5s ease-in-out infinite 0.5s; animation-play-state:${ps}; }
        @keyframes highlight-row { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .hr { animation:highlight-row 2s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Partial Pressures of Gases (mmHg)</text>
      {/* Table */}
      {[
        { site: "Atmosphere", po2: "159", pco2: "0.3", color: "#94a3b8" },
        { site: "Alveolar air", po2: "104", pco2: "40", color: "#00FF9D" },
        { site: "Deoxygenated blood", po2: "40", pco2: "45", color: "#60a5fa" },
        { site: "Oxygenated blood", po2: "95", pco2: "40", color: "#f87171" },
        { site: "Tissue cells", po2: "20", pco2: "60", color: "#f59e0b" },
      ].map((row, i) => (
        <g key={i} className={i === 1 || i === 4 ? "hr" : ""}>
          <rect x="20" y={50 + i * 42} width="360" height="36" rx="4"
            fill={i % 2 === 0 ? "#0d1a0d" : "#111827"} stroke={row.color} strokeWidth="1" opacity="0.9"/>
          <text x="30" y={73 + i * 42} fontSize="10" fill={row.color} fontWeight="bold">{row.site}</text>
          <rect x="252" y={54 + i * 42} width="54" height="28" rx="3" fill="#00FF9D" opacity="0.18"/>
          <text x="279" y={73 + i * 42} textAnchor="middle" fontSize="13" fill="#00FF9D" fontWeight="bold">{row.po2}</text>
          <rect x="316" y={54 + i * 42} width="54" height="28" rx="3" fill="#f87171" opacity="0.18"/>
          <text x="343" y={73 + i * 42} textAnchor="middle" fontSize="13" fill="#f87171" fontWeight="bold">{row.pco2}</text>
        </g>
      ))}
      {/* Column headers */}
      <text x="279" y="46" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">pO₂</text>
      <text x="343" y="46" textAnchor="middle" fontSize="9" fill="#f87171" fontWeight="bold">pCO₂</text>
      {/* Flowing molecules */}
      <g className="fr">
        <circle cx="130" cy="305" r="7" fill="#00FF9D" opacity="0.9"/>
        <text x="130" y="309" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
      </g>
      <g className="fl">
        <circle cx="270" cy="305" r="8" fill="#f87171" opacity="0.9"/>
        <text x="270" y="309" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CO₂</text>
      </g>
      <text x="200" y="330" textAnchor="middle" fontSize="9" fill="#94a3b8">Gases always diffuse HIGH → LOW pressure</text>
    </svg>
  );
}

function HaemoglobinVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes hb-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes o2-bind { 0%{opacity:0;transform:translate(-40px,-30px) scale(0.5)} 70%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:1} }
        @keyframes o2-release { 0%{opacity:1;transform:translate(0,0)} 50%{opacity:1;transform:translate(35px,25px) scale(1.1)} 100%{opacity:0;transform:translate(70px,50px) scale(0.5)} }
        .hb { transform-origin:200px 165px; animation:hb-pulse 2.5s ease-in-out infinite; animation-play-state:${ps}; }
        .bind { animation:o2-bind 3s ease-in-out infinite; animation-play-state:${ps}; }
        .release { animation:o2-release 3s ease-in-out infinite 1.5s; animation-play-state:${ps}; }
        @keyframes iron-glow { 0%,100%{fill:#f59e0b;r:9} 50%{fill:#fbbf24;r:11} }
        .iron { animation:iron-glow 2s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Haemoglobin — Oxygen Transport</text>
      {/* Hb tetramer */}
      <g className="hb">
        {/* 4 subunits */}
        {[
          { cx: 155, cy: 140, label: "α1" },
          { cx: 245, cy: 140, label: "α2" },
          { cx: 155, cy: 195, label: "β1" },
          { cx: 245, cy: 195, label: "β2" },
        ].map((s, i) => (
          <g key={i}>
            <ellipse cx={s.cx} cy={s.cy} rx="38" ry="28" fill="#1a1030" stroke="#818cf8" strokeWidth="2"/>
            <text x={s.cx} y={s.cy + 4} textAnchor="middle" fontSize="10" fill="#c4b5fd" fontWeight="bold">{s.label}</text>
            {/* Haem group with Fe */}
            <circle cx={s.cx + (i % 2 === 0 ? -18 : 18)} cy={s.cy - 8} r="10" fill="#2a1a00" stroke="#f59e0b" strokeWidth="1.5"/>
            <circle className="iron" cx={s.cx + (i % 2 === 0 ? -18 : 18)} cy={s.cy - 8} r="5"/>
            <text x={s.cx + (i % 2 === 0 ? -18 : 18)} y={s.cy - 4} textAnchor="middle" fontSize="6" fill="#000" fontWeight="bold">Fe</text>
          </g>
        ))}
        {/* Central cavity */}
        <circle cx="200" cy="167" r="14" fill="#0d0d1a" stroke="#4c1d95" strokeWidth="1.5" strokeDasharray="3,2"/>
        <text x="200" y="171" textAnchor="middle" fontSize="7" fill="#7c3aed">2,3-BPG</text>
      </g>
      {/* O2 binding in lungs */}
      <g className="bind">
        <circle cx="100" cy="120" r="9" fill="#00FF9D" opacity="0.95"/>
        <text x="100" y="124" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
      </g>
      {/* O2 releasing in tissues */}
      <g className="release">
        <circle cx="300" cy="210" r="9" fill="#00FF9D" opacity="0.95"/>
        <text x="300" y="214" textAnchor="middle" fontSize="7" fill="#000" fontWeight="bold">O₂</text>
      </g>
      {/* Labels */}
      <rect x="20" y="260" width="160" height="40" rx="4" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="1" opacity="0.8"/>
      <text x="100" y="276" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">In LUNGS (high pO₂)</text>
      <text x="100" y="291" textAnchor="middle" fontSize="8" fill="#4ade80">Hb + 4O₂ → HbO₂</text>
      <rect x="220" y="260" width="160" height="40" rx="4" fill="#1a0d0d" stroke="#f87171" strokeWidth="1" opacity="0.8"/>
      <text x="300" y="276" textAnchor="middle" fontSize="9" fill="#f87171" fontWeight="bold">In TISSUES (low pO₂)</text>
      <text x="300" y="291" textAnchor="middle" fontSize="8" fill="#fca5a5">HbO₂ → Hb + 4O₂</text>
      <text x="200" y="325" textAnchor="middle" fontSize="8" fill="#94a3b8">Each Hb carries 4 O₂ molecules | 1 RBC has ~280 million Hb</text>
    </svg>
  );
}

function CO2TransportVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes react-pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes arrow-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .rp { animation:react-pulse 2s ease-in-out infinite; animation-play-state:${ps}; }
        .ap { animation:arrow-pulse 1.5s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">CO₂ Transport in Blood</text>
      {/* 3 pathways */}
      {/* Path 1 - dissolved */}
      <rect x="20" y="40" width="360" height="70" rx="6" fill="#111827" stroke="#60a5fa" strokeWidth="1.5" className="rp"/>
      <text x="30" y="58" fontSize="10" fill="#60a5fa" fontWeight="bold">① Dissolved in plasma — 7%</text>
      <text x="30" y="76" fontSize="9" fill="#94a3b8">CO₂ directly dissolves in blood plasma</text>
      <circle cx="340" cy="68" r="18" fill="#1a2a4a" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="340" y="65" textAnchor="middle" fontSize="7" fill="#f87171" fontWeight="bold">CO₂</text>
      <text x="340" y="76" textAnchor="middle" fontSize="7" fill="#94a3b8">plasma</text>
      {/* Path 2 - carbamino */}
      <rect x="20" y="122" width="360" height="80" rx="6" fill="#111827" stroke="#c084fc" strokeWidth="1.5" className="rp" style={{ animationDelay: "0.4s" }}/>
      <text x="30" y="140" fontSize="10" fill="#c084fc" fontWeight="bold">② Carbaminohaemoglobin — 23%</text>
      <text x="30" y="158" fontSize="9" fill="#94a3b8">CO₂ + Hb-NH₂  ⇌  Hb-NH-COOH</text>
      <text x="30" y="174" fontSize="9" fill="#94a3b8">CO₂ binds directly to globin protein chains</text>
      {/* Path 3 - bicarbonate */}
      <rect x="20" y="214" width="360" height="90" rx="6" fill="#111827" stroke="#00FF9D" strokeWidth="2" className="rp" style={{ animationDelay: "0.8s" }}/>
      <text x="30" y="232" fontSize="10" fill="#00FF9D" fontWeight="bold">③ As Bicarbonate ions (HCO₃⁻) — 70%</text>
      <text x="30" y="250" fontSize="9" fill="#94a3b8">CO₂ + H₂O  ⇌  H₂CO₃  ⇌  H⁺ + HCO₃⁻</text>
      <text x="30" y="266" fontSize="9" fill="#4ade80">Catalysed by Carbonic Anhydrase in RBCs</text>
      <text x="30" y="282" fontSize="9" fill="#94a3b8">HCO₃⁻ moves to plasma (Chloride shift)</text>
      {/* Percentage bars */}
      <rect x="330" y="222" width="42" height="72" rx="3" fill="#0d2a1a" stroke="#1e3a2e" strokeWidth="1"/>
      <rect x="333" y={222 + 72 - 50} width="36" height="50" rx="2" fill="#00FF9D" opacity="0.7"/>
      <text x="351" y="302" textAnchor="middle" fontSize="8" fill="#00FF9D">70%</text>
    </svg>
  );
}

function RegulationVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes nerve-signal { 0%{stroke-dashoffset:300} 100%{stroke-dashoffset:0} }
        @keyframes medulla-glow { 0%,100%{fill:rgba(0,255,157,0.1)} 50%{fill:rgba(0,255,157,0.35)} }
        @keyframes receptor-ping { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.15);opacity:1} }
        .ns { stroke-dasharray:300; animation:nerve-signal 2.5s linear infinite; animation-play-state:${ps}; }
        .ns2 { stroke-dasharray:300; animation:nerve-signal 2.5s linear infinite 0.5s; animation-play-state:${ps}; }
        .med { animation:medulla-glow 2s ease-in-out infinite; animation-play-state:${ps}; }
        .rcpt { animation:receptor-ping 2s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Regulation of Respiration</text>
      {/* Brain */}
      <ellipse cx="200" cy="90" rx="80" ry="55" fill="#1a1a2e" stroke="#818cf8" strokeWidth="2"/>
      <text x="200" y="78" textAnchor="middle" fontSize="9" fill="#a78bfa">Cerebrum (voluntary)</text>
      {/* Medulla oblongata */}
      <ellipse className="med" cx="200" cy="135" rx="42" ry="20" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="2.5"/>
      <text x="200" y="132" textAnchor="middle" fontSize="8" fill="#00FF9D" fontWeight="bold">Medulla Oblongata</text>
      <text x="200" y="143" textAnchor="middle" fontSize="7" fill="#4ade80">Respiratory Rhythm Centre</text>
      {/* Pons */}
      <rect x="172" y="153" width="56" height="14" rx="4" fill="#1a2a1a" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="200" y="163" textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="bold">Pons</text>
      {/* Phrenic nerve to diaphragm */}
      <path className="ns" d="M200 167 Q190 210 185 260" fill="none" stroke="#00FF9D" strokeWidth="2.5"/>
      <text x="165" y="215" fontSize="8" fill="#00FF9D">Phrenic</text>
      <text x="165" y="225" fontSize="8" fill="#00FF9D">Nerve</text>
      {/* Diaphragm */}
      <path d="M130 270 Q200 258 270 270" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
      <text x="200" y="290" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">Diaphragm</text>
      {/* Chemoreceptors - CO2 sensing */}
      <g className="rcpt" style={{ transformOrigin: "60px 185px" }}>
        <circle cx="60" cy="185" r="16" fill="#1a0d0d" stroke="#f87171" strokeWidth="2"/>
        <text x="60" y="181" textAnchor="middle" fontSize="7" fill="#f87171" fontWeight="bold">CO₂</text>
        <text x="60" y="192" textAnchor="middle" fontSize="7" fill="#f87171">receptor</text>
      </g>
      <path className="ns2" d="M75 178 Q130 160 175 145" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="300"/>
      <text x="110" y="155" textAnchor="middle" fontSize="8" fill="#f87171">↑CO₂ signal</text>
      {/* O2 receptor */}
      <g className="rcpt" style={{ transformOrigin: "340px 185px", animationDelay: "0.5s" }}>
        <circle cx="340" cy="185" r="16" fill="#0d1a2a" stroke="#60a5fa" strokeWidth="2"/>
        <text x="340" y="181" textAnchor="middle" fontSize="7" fill="#60a5fa" fontWeight="bold">O₂</text>
        <text x="340" y="192" textAnchor="middle" fontSize="7" fill="#60a5fa">receptor</text>
      </g>
      <path className="ns2" d="M325 178 Q268 160 225 145" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="300" style={{ animationDelay: "1s" }}/>
      <text x="285" y="155" textAnchor="middle" fontSize="8" fill="#60a5fa">↓O₂ signal</text>
      <text x="200" y="316" textAnchor="middle" fontSize="8" fill="#94a3b8">Normal RR = 12–20 breaths/min | Exercise → ↑CO₂ → ↑breathing rate</text>
    </svg>
  );
}

function DisordersVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes swell { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes mucus-drip { 0%{transform:translateY(0);opacity:0} 50%{opacity:1} 100%{transform:translateY(12px);opacity:0} }
        @keyframes narrowing { 0%,100%{rx:18} 50%{rx:10} }
        .sw { animation:swell 2s ease-in-out infinite; animation-play-state:${ps}; }
        .md { animation:mucus-drip 2s linear infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Respiratory Disorders</text>
      {/* 4 disorder cards */}
      {[
        {
          x: 15, y: 38, name: "ASTHMA", color: "#f59e0b",
          desc1: "Bronchial muscle spasm", desc2: "→ Narrowed airways",
          desc3: "Wheeze, breathlessness",
        },
        {
          x: 210, y: 38, name: "EMPHYSEMA", color: "#f87171",
          desc1: "Alveolar wall destruction", desc2: "→ ↓ Surface area",
          desc3: "Chronic, irreversible",
        },
        {
          x: 15, y: 190, name: "OCCUPATIONAL", color: "#60a5fa",
          desc1: "Dust / fibres / fumes", desc2: "→ Fibrosis of lungs",
          desc3: "Silicosis, Asbestosis",
        },
        {
          x: 210, y: 190, name: "PNEUMONIA", color: "#c084fc",
          desc1: "Infection (bacteria/virus)", desc2: "→ Alveoli fill with fluid",
          desc3: "Fever, difficulty breathing",
        },
      ].map((d, i) => (
        <g key={i} className="sw" style={{ transformOrigin: `${d.x + 90}px ${d.y + 65}px`, animationDelay: `${i * 0.3}s` }}>
          <rect x={d.x} y={d.y} width="175" height="135" rx="8" fill="#0d1117" stroke={d.color} strokeWidth="2"/>
          <rect x={d.x} y={d.y} width="175" height="32" rx="8" fill={d.color} opacity="0.2"/>
          <text x={d.x + 88} y={d.y + 21} textAnchor="middle" fontSize="11" fill={d.color} fontWeight="bold">{d.name}</text>
          <text x={d.x + 12} y={d.y + 58} fontSize="9" fill="#e2e8f0">{d.desc1}</text>
          <text x={d.x + 12} y={d.y + 75} fontSize="9" fill={d.color}>{d.desc2}</text>
          <text x={d.x + 12} y={d.y + 100} fontSize="9" fill="#94a3b8">{d.desc3}</text>
          {/* Animated icon */}
          {i === 0 && (
            <g>
              <ellipse cx={d.x + 140} cy={d.y + 100} rx="14" ry="22" fill="none" stroke={d.color} strokeWidth="2"/>
              <ellipse cx={d.x + 140} cy={d.y + 100} rx="7" ry="22" fill="none" stroke={d.color} strokeWidth="1.5" opacity="0.5"/>
            </g>
          )}
          {i === 1 && (
            <g>
              <circle cx={d.x + 142} cy={d.y + 100} r="18" fill="none" stroke={d.color} strokeWidth="2" opacity="0.7" strokeDasharray="4,3"/>
              <circle cx={d.x + 142} cy={d.y + 100} r="8" fill={d.color} opacity="0.15"/>
            </g>
          )}
          {i === 2 && (
            <g className="md">
              <rect x={d.x + 135} y={d.y + 82} width="12" height="8" rx="2" fill={d.color} opacity="0.8"/>
              <rect x={d.x + 133} y={d.y + 92} width="16" height="12" rx="2" fill={d.color} opacity="0.5"/>
            </g>
          )}
          {i === 3 && (
            <g>
              <circle cx={d.x + 142} cy={d.y + 95} r="15" fill={d.color} opacity="0.15" stroke={d.color} strokeWidth="1.5"/>
              <circle cx={d.x + 142} cy={d.y + 95} r="7" fill={d.color} opacity="0.25"/>
              <text x={d.x + 142} y={d.y + 99} textAnchor="middle" fontSize="7" fill={d.color}>fluid</text>
            </g>
          )}
        </g>
      ))}
      <text x="200" y="330" textAnchor="middle" fontSize="8" fill="#94a3b8">Most caused by smoking, pollution, or infection</text>
    </svg>
  );
}

function RespiratoryOrgansVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes path-glow { 0%,100%{stroke-dashoffset:500} to{stroke-dashoffset:0} }
        @keyframes label-fade { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .pathway { stroke-dasharray:500; animation:path-glow 4s linear infinite; animation-play-state:${ps}; }
        .lbl { animation:label-fade 2s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Human Respiratory Tract</text>
      {/* Nose */}
      <ellipse cx="200" cy="52" rx="22" ry="16" fill="#1a1a2e" stroke="#00FF9D" strokeWidth="2"/>
      <text x="200" y="56" textAnchor="middle" fontSize="9" fill="#00FF9D" fontWeight="bold">Nose</text>
      {/* Pharynx */}
      <rect x="186" y="68" width="28" height="24" rx="4" fill="#1a1a2e" stroke="#4ade80" strokeWidth="1.5"/>
      <text x="200" y="83" textAnchor="middle" fontSize="8" fill="#4ade80">Pharynx</text>
      {/* Larynx */}
      <rect x="184" y="94" width="32" height="20" rx="4" fill="#1a1a2e" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="200" y="107" textAnchor="middle" fontSize="8" fill="#60a5fa">Larynx</text>
      {/* Trachea */}
      <rect x="190" y="116" width="20" height="50" rx="6" fill="#1a1a2e" stroke="#818cf8" strokeWidth="2"/>
      {[0,1,2,3].map(i => (
        <line key={i} x1="190" y1={120 + i*12} x2="210" y2={120 + i*12} stroke="#818cf8" strokeWidth="1" opacity="0.5"/>
      ))}
      <text x="240" y="143" fontSize="8" fill="#818cf8">Trachea</text>
      <line x1="228" y1="141" x2="212" y2="141" stroke="#818cf8" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Bronchi */}
      <path d="M190 166 Q165 176 148 192" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/>
      <path d="M210 166 Q235 176 252 192" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/>
      <text x="118" y="185" textAnchor="end" fontSize="8" fill="#f59e0b">L. Bronchus</text>
      <text x="255" y="185" fontSize="8" fill="#f59e0b">R. Bronchus</text>
      {/* Bronchioles */}
      <path d="M148 192 Q128 210 120 238" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
      <path d="M148 192 Q155 218 150 240" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M252 192 Q272 210 280 238" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
      <path d="M252 192 Q245 218 250 240" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Alveoli clusters */}
      {[[115,246],[148,252],[278,246],[252,252]].map(([cx,cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="10" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="1.5" opacity="0.9"/>
          <circle cx={cx-6} cy={cy+8} r="7" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="1.5" opacity="0.7"/>
          <circle cx={cx+6} cy={cy+8} r="7" fill="#0d2a1a" stroke="#00FF9D" strokeWidth="1.5" opacity="0.7"/>
        </g>
      ))}
      {/* Animated pathway */}
      <path className="pathway" d="M200 36 L200 68 L200 94 L200 166 Q170 180 148 192 Q128 212 120 248" fill="none" stroke="#00FF9D" strokeWidth="1.5" opacity="0.4"/>
      <text x="200" y="295" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="bold">Conducting Zone → Respiratory Zone</text>
      <text x="200" y="310" textAnchor="middle" fontSize="8" fill="#94a3b8">No gas exchange until alveoli (≈300M per lung)</text>
      <text x="115" y="285" textAnchor="middle" fontSize="8" fill="#00FF9D">Alveoli</text>
      <text x="280" y="285" textAnchor="middle" fontSize="8" fill="#00FF9D">Alveoli</text>
    </svg>
  );
}

function LungAnatomyVisual({ playing }: { playing: boolean }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 340" className="w-full h-full">
      <style>{`
        @keyframes lobe-highlight { 0%,100%{opacity:0.25} 50%{opacity:0.5} }
        @keyframes pointer-blink { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .lobe { animation:lobe-highlight 3s ease-in-out infinite; animation-play-state:${ps}; }
        .ptr { animation:pointer-blink 2s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <text x="200" y="20" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">Anatomy of the Lungs</text>
      {/* Trachea */}
      <rect x="192" y="38" width="16" height="48" rx="7" fill="#4ade80" opacity="0.8"/>
      <path d="M192 82 Q165 92 152 110" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round"/>
      <path d="M208 82 Q235 92 248 110" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round"/>
      {/* LEFT lung — 2 lobes */}
      <path d="M152 110 Q96 122 88 175 Q84 218 96 248 Q108 268 136 268 Q164 262 180 242 Q192 218 192 110Z"
        fill="#0d2a1a" stroke="#00FF9D" strokeWidth="2"/>
      {/* Left lobe dividing fissure */}
      <path d="M120 140 Q105 185 120 230" fill="none" stroke="#00FF9D" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7"/>
      <path className="lobe" d="M152 110 Q130 118 120 140 Q110 160 126 175 Q148 170 168 155 Q180 140 192 120Z"
        fill="#00FF9D" opacity="0.25"/>
      <text x="150" y="138" textAnchor="middle" fontSize="8" fill="#00FF9D">Superior</text>
      <text x="115" y="210" textAnchor="middle" fontSize="8" fill="#4ade80">Inferior</text>
      <text x="65" y="160" fontSize="9" fill="#00FF9D" fontWeight="bold">LEFT</text>
      <text x="65" y="172" fontSize="8" fill="#4ade80">2 lobes</text>
      {/* RIGHT lung — 3 lobes */}
      <path d="M248 110 Q304 122 312 175 Q316 218 304 248 Q292 268 264 268 Q236 262 220 242 Q208 218 208 110Z"
        fill="#0d1a2a" stroke="#60a5fa" strokeWidth="2"/>
      {/* Right lobe fissures */}
      <path d="M275 128 Q292 165 278 195" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7"/>
      <path d="M260 178 Q290 192 280 215" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7"/>
      <path className="lobe" d="M248 110 Q270 115 278 128 Q284 145 270 152 Q254 148 244 135 Q238 124 248 110Z"
        fill="#60a5fa" opacity="0.25"/>
      <text x="268" y="138" textAnchor="middle" fontSize="8" fill="#60a5fa">Superior</text>
      <text x="285" y="178" textAnchor="middle" fontSize="8" fill="#93c5fd">Middle</text>
      <text x="265" y="225" textAnchor="middle" fontSize="8" fill="#bfdbfe">Inferior</text>
      <text x="340" y="160" fontSize="9" fill="#60a5fa" fontWeight="bold">RIGHT</text>
      <text x="340" y="172" fontSize="8" fill="#93c5fd">3 lobes</text>
      {/* Cardiac notch */}
      <path className="ptr" d="M192 195 Q185 215 192 230" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="4,3"/>
      <text x="140" y="228" fontSize="8" fill="#f87171">Cardiac</text>
      <text x="140" y="238" fontSize="8" fill="#f87171">notch ←</text>
      {/* Pleura */}
      <text x="200" y="295" textAnchor="middle" fontSize="9" fill="#94a3b8">Covered by pleural membranes (visceral + parietal)</text>
      <text x="200" y="310" textAnchor="middle" fontSize="8" fill="#64748b">Pleural fluid lubricates movement</text>
      {/* Hilum */}
      <circle cx="185" cy="175" r="6" fill="#f59e0b" opacity="0.8"/>
      <text x="175" y="168" fontSize="7" fill="#f59e0b">Hilum</text>
    </svg>
  );
}

function GenericVisual({ playing, chapterColor }: { playing: boolean; chapterColor: string }) {
  const ps = playing ? "running" : "paused";
  return (
    <svg viewBox="0 0 400 320" className="w-full h-full">
      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-15px) rotate(5deg)} }
        @keyframes orbit-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dot-pulse { 0%,100%{r:3} 50%{r:5} }
        .f1 { animation:float1 4s ease-in-out infinite; animation-play-state:${ps}; }
        .ob { transform-origin:200px 155px; animation:orbit-slow 10s linear infinite; animation-play-state:${ps}; }
        .dp { animation:dot-pulse 1.5s ease-in-out infinite; animation-play-state:${ps}; }
      `}</style>
      <circle cx="200" cy="155" r="72" fill="#0d1a0d" stroke={chapterColor} strokeWidth="2" opacity="0.5"/>
      <circle cx="200" cy="155" r="50" fill={chapterColor} opacity="0.12"/>
      <text x="200" y="148" textAnchor="middle" fontSize="36">🧬</text>
      <text x="200" y="178" textAnchor="middle" fontSize="11" fill={chapterColor} fontWeight="bold">BIOLOGY</text>
      <g className="ob">
        {[0,1,2,3,4].map(i => {
          const angle = (i / 5) * Math.PI * 2;
          return <circle key={i} className="dp" cx={200 + Math.cos(angle)*105} cy={155 + Math.sin(angle)*85} r="4" fill={chapterColor} opacity="0.7" style={{ animationDelay: `${i*0.3}s` }}/>;
        })}
      </g>
      <g className="f1" style={{ transformOrigin: "80px 100px" }}>
        <rect x="60" y="85" width="40" height="28" rx="5" fill="#1a1a2e" stroke={chapterColor} strokeWidth="1.5" opacity="0.8"/>
        <text x="80" y="104" textAnchor="middle" fontSize="8" fill={chapterColor}>NCERT</text>
      </g>
      <g className="f1" style={{ transformOrigin: "310px 100px", animationDelay: "1s" }}>
        <rect x="290" y="85" width="40" height="28" rx="5" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8"/>
        <text x="310" y="104" textAnchor="middle" fontSize="8" fill="#f59e0b">NEET</text>
      </g>
      <text x="200" y="28" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">Chapter Overview</text>
    </svg>
  );
}

// ─── Visual registry ──────────────────────────────────────────────────────────

function VisualRenderer({ type, playing, color }: { type: AnimFrame["visual"]; playing: boolean; color: string }) {
  switch (type) {
    case "breathing-in":       return <BreathingInVisual playing={playing} />;
    case "breathing-out":      return <BreathingOutVisual playing={playing} />;
    case "alveolus":           return <AlveolusVisual playing={playing} />;
    case "lung-volumes":       return <LungVolumesVisual playing={playing} />;
    case "partial-pressure":   return <PartialPressureVisual playing={playing} />;
    case "haemoglobin":        return <HaemoglobinVisual playing={playing} />;
    case "co2-transport":      return <CO2TransportVisual playing={playing} />;
    case "regulation":         return <RegulationVisual playing={playing} />;
    case "disorders":          return <DisordersVisual playing={playing} />;
    case "respiratory-organs": return <RespiratoryOrgansVisual playing={playing} />;
    case "lung-anatomy":       return <LungAnatomyVisual playing={playing} />;
    // Legacy types for other chapters
    case "lungs":              return <BreathingInVisual playing={playing} />;
    case "flow":               return <PartialPressureVisual playing={playing} />;
    case "compare":            return <LungVolumesVisual playing={playing} />;
    case "brain":              return <RegulationVisual playing={playing} />;
    case "molecules":          return <CO2TransportVisual playing={playing} />;
    case "heart": case "cycle": case "dna": case "cell":
    default:                   return <GenericVisual playing={playing} chapterColor={color} />;
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
    if (playing && frame) speak(frame.narration);
    else window.speechSynthesis.cancel();
    return () => { window.speechSynthesis.cancel(); };
  }, [playing, frameIdx, speak, frame]);

  useEffect(() => { return () => { window.speechSynthesis.cancel(); }; }, []);

  const goNext = () => { window.speechSynthesis.cancel(); setFrameIdx(i => Math.min(i + 1, frames.length - 1)); };
  const goPrev = () => { window.speechSynthesis.cancel(); setFrameIdx(i => Math.max(i - 1, 0)); };
  const togglePlay = () => setPlaying(p => !p);
  const toggleAudio = () => { setAudioOn(a => { if (a) window.speechSynthesis.cancel(); return !a; }); };

  if (!chapter || !frame) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bs-bg)" }}>
        <p style={{ color: "var(--bs-text)" }}>Animation not found</p>
      </div>
    );
  }

  const progress = ((frameIdx + 1) / frames.length) * 100;

  return (
    <div className="min-h-screen font-['Space_Grotesk'] flex flex-col" style={{ background: "var(--bs-bg)", color: "var(--bs-text)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(var(--bs-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--bs-grid-color) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", zIndex: 0,
      }}/>
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 blur-[120px] pointer-events-none" style={{
        background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, zIndex: 0,
      }}/>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-4 pt-5 pb-3 border-b" style={{ borderColor: "var(--bs-border-subtle)" }}>
        <button
          onClick={() => { window.speechSynthesis.cancel(); navigate(`/subunits/${cls}/${chapterId}`); }}
          className="flex items-center gap-2 font-mono uppercase tracking-wide text-sm transition-colors"
          style={{ color: "var(--bs-text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: accentColor }}>
            {chapterAnim?.icon} {chapter.name}
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight leading-tight truncate" style={{ color: "var(--bs-text)" }}>
            {subunit}
          </h1>
        </div>
        <span className="text-xs font-mono shrink-0" style={{ color: "var(--bs-text-muted)" }}>
          {frameIdx + 1} / {frames.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-1 w-full" style={{ background: "var(--bs-surface)" }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: accentColor }}/>
      </div>

      {/* Main content */}
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
          <div className="inline-block border-l-4 pl-3 mb-4" style={{ borderLeftColor: accentColor }}>
            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--bs-text)" }}>
              {frame.title}
            </h2>
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--bs-text-muted)" }}>
            {frame.narration}
          </p>
          <div className="flex-1">
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: accentColor }}>
              Key Points
            </div>
            <ul className="space-y-2">
              {frame.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm transition-all duration-500"
                  style={{ opacity: i < pointsVisible ? 1 : 0, transform: i < pointsVisible ? "translateX(0)" : "translateX(-12px)" }}>
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

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-t gap-4"
        style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface)" }}>
        <button onClick={goPrev} disabled={frameIdx === 0}
          className="flex items-center gap-2 px-4 py-2 border font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
          style={{ borderColor: "var(--bs-border-subtle)", background: "var(--bs-surface-2)", color: "var(--bs-text)" }}>
          <SkipBack className="w-4 h-4" /> Prev
        </button>
        <div className="flex items-center gap-3">
          <button onClick={toggleAudio}
            className="w-9 h-9 flex items-center justify-center border transition-all"
            style={{ borderColor: audioOn ? accentColor : "var(--bs-border-subtle)", color: audioOn ? accentColor : "var(--bs-text-muted)", background: audioOn ? `color-mix(in srgb, ${accentColor} 12%, transparent)` : "var(--bs-surface-2)" }}
            title={audioOn ? "Mute narration" : "Enable narration"}>
            {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={togglePlay}
            className="flex items-center gap-2 px-6 py-2.5 font-black uppercase tracking-wider text-sm border-2 transition-all"
            style={{ borderColor: accentColor, background: playing ? accentColor : `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: playing ? "#000" : accentColor }}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>
        <button onClick={goNext} disabled={frameIdx === frames.length - 1}
          className="flex items-center gap-2 px-4 py-2 border font-black uppercase tracking-wider text-sm transition-all disabled:opacity-30"
          style={{ borderColor: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}>
          Next <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Subunit navigator */}
      {chapter.subunits.length > 1 && (
        <div className="relative z-10 px-4 py-3 border-t overflow-x-auto" style={{ borderColor: "var(--bs-border-subtle)" }}>
          <div className="flex gap-2 min-w-max">
            {chapter.subunits.map((su, i) => {
              const isActive = su === subunit;
              return (
                <button key={su}
                  onClick={() => { window.speechSynthesis.cancel(); setPlaying(false); setFrameIdx(0); navigate(`/animations/${cls}/${chapterId}/${encodeURIComponent(su)}`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wide border whitespace-nowrap transition-all"
                  style={{ borderColor: isActive ? accentColor : "var(--bs-border-subtle)", background: isActive ? `color-mix(in srgb, ${accentColor} 18%, transparent)` : "var(--bs-surface)", color: isActive ? accentColor : "var(--bs-text-muted)" }}>
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
