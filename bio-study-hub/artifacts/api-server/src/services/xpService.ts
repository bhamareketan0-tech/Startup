import { User } from "../models/user";
import { getLevelInfo, LEVELS } from "../lib/xpConfig";

export interface XPResult {
  xpAwarded: number;
  totalXP: number;
  leveledUp: boolean;
  newLevel: string;
  newLevelEmoji: string;
  levelInfo: ReturnType<typeof getLevelInfo>;
}

export async function awardXP(userId: string, amount: number): Promise<XPResult> {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const oldXP: number = (user.get("xp") as number) || 0;
  const newXP = Math.max(0, oldXP + amount);
  const oldLevelInfo = getLevelInfo(oldXP);
  const newLevelInfo = getLevelInfo(newXP);
  const leveledUp = newLevelInfo.index > oldLevelInfo.index;

  await User.findByIdAndUpdate(userId, {
    xp: newXP,
    level: newLevelInfo.name,
  });

  return {
    xpAwarded: amount,
    totalXP: newXP,
    leveledUp,
    newLevel: newLevelInfo.name,
    newLevelEmoji: newLevelInfo.emoji,
    levelInfo: newLevelInfo,
  };
}

export function getXPSummary(xp: number) {
  const info = getLevelInfo(xp);
  return {
    xp,
    level: info.name,
    levelEmoji: info.emoji,
    nextLevelXP: info.nextXP,
    progressPct: info.progressPct,
    levelIndex: info.index,
    maxLevel: LEVELS.length - 1,
  };
}
