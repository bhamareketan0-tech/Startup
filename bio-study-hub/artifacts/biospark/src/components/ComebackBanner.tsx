import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export function ComebackBanner() {
  const { comebackMessage, clearComebackMessage } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comebackMessage && comebackMessage.type !== "none") {
      setTimeout(() => setVisible(true), 100);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(clearComebackMessage, 400);
      }, 6000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [comebackMessage, clearComebackMessage]);

  if (!comebackMessage || comebackMessage.type === "none") return null;

  const isComeback = comebackMessage.type === "comeback";
  const color = isComeback ? "#00FF9D" : "#00ccff";
  const icon = isComeback ? "🎉" : "🚀";

  return (
    <div
      className="fixed top-24 left-1/2 z-[9990] border px-6 py-4 max-w-md w-[90vw] transition-all duration-400"
      style={{
        background: "var(--bs-surface)",
        borderColor: color,
        boxShadow: `0 0 30px color-mix(in srgb, ${color} 20%, transparent)`,
        transform: `translate(-50%, ${visible ? "0" : "-20px"})`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: color }} />
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase text-sm mb-0.5" style={{ color }}>
            {isComeback ? "Welcome Back!" : "Fresh Start!"}
          </p>
          <p className="text-xs font-mono" style={{ color: "var(--bs-text-muted)" }}>{comebackMessage.message}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(clearComebackMessage, 400); }}
          className="shrink-0 text-sm font-mono"
          style={{ color: "var(--bs-text-muted)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
