import { useState } from "react";
import { BADGE_DEFINITIONS } from "@/lib/badges";

interface EarnedBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

interface BadgeGridProps {
  earnedBadges: EarnedBadge[];
  showLocked?: boolean;
}

export function BadgeGrid({ earnedBadges, showLocked = true }: BadgeGridProps) {
  const [popover, setPopover] = useState<string | null>(null);
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  const badges = showLocked ? BADGE_DEFINITIONS : BADGE_DEFINITIONS.filter((b) => earnedIds.has(b.id));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {badges.map((badgeDef) => {
        const earned = earnedIds.has(badgeDef.id);
        const earnedData = earnedBadges.find((b) => b.id === badgeDef.id);
        const isOpen = popover === badgeDef.id;

        return (
          <div key={badgeDef.id} className="relative">
            <button
              className="w-full border p-3 flex flex-col items-center gap-2 text-center transition-all hover:scale-105 relative overflow-hidden"
              style={{
                background: earned ? "var(--bs-surface)" : "var(--bs-surface-2)",
                borderColor: earned ? "color-mix(in srgb, #FFD700 40%, transparent)" : "var(--bs-border-subtle)",
                opacity: earned ? 1 : 0.4,
                filter: earned ? "none" : "grayscale(1)",
              }}
              onClick={() => setPopover(isOpen ? null : badgeDef.id)}
              title={badgeDef.name}
            >
              {earned && (
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #FFD700, transparent)" }} />
              )}
              <span className="text-2xl">{badgeDef.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-tight leading-tight" style={{ color: earned ? "var(--bs-text)" : "var(--bs-text-muted)" }}>
                {badgeDef.name}
              </span>
            </button>

            {isOpen && (
              <div
                className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 border p-3 w-48 text-left shadow-xl"
                style={{ background: "var(--bs-surface)", borderColor: "#FFD700" }}
              >
                <div className="text-2xl mb-1">{badgeDef.emoji}</div>
                <p className="font-black uppercase text-xs mb-1" style={{ color: "var(--bs-text)" }}>{badgeDef.name}</p>
                <p className="text-[10px] font-mono mb-2" style={{ color: "var(--bs-text-muted)" }}>{badgeDef.description}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--bs-border-strong)" }}>
                  {earned ? (
                    earnedData?.unlockedAt ? `Earned ${new Date(earnedData.unlockedAt).toLocaleDateString()}` : "Earned"
                  ) : (
                    `How: ${badgeDef.condition}`
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
