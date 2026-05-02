import { User } from "../models/user";
import { QuestionAttempt } from "../models/questionAttempt";
import { UserDailyChallenge } from "../models/dailyChallenge";
import { BADGES, BadgeId, getLevelInfo } from "../lib/xpConfig";

export interface BadgeResult {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt: string;
}

export async function evaluateBadges(userId: string): Promise<BadgeResult[]> {
  const user = await User.findById(userId);
  if (!user) return [];

  const earned: string[] = (user.get("badges") as Array<{ id: string }> || []).map((b) => b.id);
  const newlyUnlocked: BadgeResult[] = [];

  const xp: number = (user.get("xp") as number) || 0;
  const streakCount: number = (user.get("streakCount") as number) || 0;

  const [attempts, dailyChallenges] = await Promise.all([
    QuestionAttempt.find({ user_id: userId }),
    UserDailyChallenge.find({ user_id: userId, completed: true }),
  ]);

  const correctCount = attempts.filter((a) => a.is_correct).length;
  const totalAttempts = attempts.length;
  const accuracyPct = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
  const levelInfo = getLevelInfo(xp);

  const conditions: Record<BadgeId, boolean> = {
    first_correct:   correctCount >= 1,
    streak_3:        streakCount >= 3,
    streak_7:        streakCount >= 7,
    streak_30:       streakCount >= 30,
    correct_10:      correctCount >= 10,
    correct_50:      correctCount >= 50,
    correct_100:     correctCount >= 100,
    correct_500:     correctCount >= 500,
    level_novice:    levelInfo.index >= 1,
    level_expert:    levelInfo.index >= 4,
    level_champion:  levelInfo.index >= 6,
    daily_first:     dailyChallenges.length >= 1,
    daily_10:        dailyChallenges.length >= 10,
    mock_first:      (user.get("mockTestsCompleted") as number || 0) >= 1,
    mock_perfect:    (user.get("mockPerfectScore") as boolean) || false,
    comeback:        (user.get("comebackBonusAwarded") as boolean) || false,
    xp_1000:         xp >= 1000,
    accuracy_90:     totalAttempts >= 20 && accuracyPct >= 90,
  };

  const unlockedAt = new Date().toISOString();

  for (const badge of BADGES) {
    if (!earned.includes(badge.id) && conditions[badge.id]) {
      newlyUnlocked.push({
        id: badge.id,
        name: badge.name,
        emoji: badge.emoji,
        description: badge.description,
        unlockedAt,
      });
    }
  }

  if (newlyUnlocked.length > 0) {
    const existingBadges = (user.get("badges") as Array<{ id: string; name: string; emoji: string; description: string; unlockedAt: string }>) || [];
    await User.findByIdAndUpdate(userId, {
      badges: [...existingBadges, ...newlyUnlocked],
    });
  }

  return newlyUnlocked;
}
