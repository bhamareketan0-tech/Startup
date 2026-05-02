import { useEffect, useState } from "react";

interface BadgeUnlockPopupProps {
  badge: { id: string; name: string; emoji: string; description: string };
  onDone?: () => void;
}

export function BadgeUnlockPopup({ badge, onDone }: BadgeUnlockPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 200);
    }, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className="fixed bottom-8 right-8 z-[9997] border p-4 flex items-center gap-4 max-w-xs transition-all duration-200"
      style={{
        background: "var(--bs-surface)",
        borderColor: "#FFD700",
        boxShadow: "0 0 30px rgba(255,215,0,0.2)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "#FFD700" }} />
      <div className="text-3xl shrink-0">{badge.emoji}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "#FFD700" }}>Badge Unlocked!</p>
        <p className="font-black uppercase text-sm truncate" style={{ color: "var(--bs-text)" }}>{badge.name}</p>
        <p className="text-xs font-mono truncate" style={{ color: "var(--bs-text-muted)" }}>{badge.description}</p>
      </div>
    </div>
  );
}

interface BadgeQueueManagerProps {
  badges: Array<{ id: string; name: string; emoji: string; description: string }>;
  onRemove: (id: string) => void;
}

export function BadgeQueueManager({ badges, onRemove }: BadgeQueueManagerProps) {
  if (badges.length === 0) return null;
  return <BadgeUnlockPopup badge={badges[0]} onDone={() => onRemove(badges[0].id)} />;
}
