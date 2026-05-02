import { useEffect, useState } from "react";

interface XPPopupProps {
  amount: number;
  onDone?: () => void;
}

export function XPPopup({ amount, onDone }: XPPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 100);
    }, 300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.1s ease-out",
        animation: visible ? "xpFloat 0.3s ease-out forwards" : "none",
      }}
    >
      <style>{`
        @keyframes xpFloat {
          0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
          30%  { transform: translate(-50%, -65%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -85%) scale(0.9); opacity: 0; }
        }
      `}</style>
      <div
        className="flex items-center gap-1.5 px-4 py-2 font-black uppercase tracking-widest text-sm border"
        style={{
          background: "color-mix(in srgb, #00FF9D 15%, black)",
          borderColor: "#00FF9D",
          color: "#00FF9D",
          boxShadow: "0 0 20px rgba(0,255,157,0.4)",
        }}
      >
        <span>⚡</span>
        <span>+{amount} XP</span>
      </div>
    </div>
  );
}

interface XPPopupManagerProps {
  events: Array<{ id: string; amount: number }>;
  onRemove: (id: string) => void;
}

export function XPPopupManager({ events, onRemove }: XPPopupManagerProps) {
  return (
    <>
      {events.map((ev) => (
        <XPPopup key={ev.id} amount={ev.amount} onDone={() => onRemove(ev.id)} />
      ))}
    </>
  );
}
