import { Router, type Request, type Response } from "express";
import { User } from "../models/user";
import { awardXP, getXPSummary } from "../services/xpService";
import { evaluateBadges } from "../services/badgeService";
import { XP_AWARDS } from "../lib/xpConfig";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

router.post("/xp/award", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });

  try {
    const { reason, correctCount: rawCount } = req.body as { reason?: string; correctCount?: number };
    const correctCount = Math.min(Math.max(1, Math.floor(Number(rawCount) || 1)), 200);
    let amount = 0;

    switch (reason) {
      case "correct_answer":       amount = XP_AWARDS.CORRECT_ANSWER; break;
      case "practice_session":     amount = XP_AWARDS.CORRECT_ANSWER * correctCount; break;
      case "daily_challenge_done": amount = XP_AWARDS.DAILY_CHALLENGE_DONE; break;
      case "mock_test_done":       amount = XP_AWARDS.MOCK_TEST_DONE; break;
      case "streak_7":             amount = XP_AWARDS.STREAK_7_DAY; break;
      case "streak_30":            amount = XP_AWARDS.STREAK_30_DAY; break;
      default:                     amount = 0;
    }

    if (amount <= 0) return res.status(400).json({ error: "Invalid XP reason." });

    if (reason === "mock_test_done") {
      const perfectScore = correctCount >= 180;
      await User.findByIdAndUpdate(userId, {
        $inc: { mockTestsCompleted: 1 },
        ...(perfectScore ? { mockPerfectScore: true } : {}),
      });
    }

    const result = await awardXP(userId, amount);
    const newBadges = await evaluateBadges(userId);

    res.json({ xpResult: result, newBadges });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/xp/summary", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const xp = (user.get("xp") as number) || 0;
    const summary = getXPSummary(xp);
    const badges = (user.get("badges") as unknown[]) || [];

    res.json({ ...summary, badges });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/profile/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const lowerUsername = username.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let user = await User.findOne({ username: lowerUsername });
    if (!user) {
      user = await User.findOne({
        email: { $regex: `^${lowerUsername}@`, $options: "i" },
      });
    }
    if (!user) return res.status(404).json({ error: "Profile not found." });

    const { QuestionAttempt } = await import("../models/questionAttempt");
    const { UserDailyChallenge } = await import("../models/dailyChallenge");
    const { User: UserModel } = await import("../models/user");

    const userId = user._id.toString();

    const [attempts, dailyChallenges, allUsers] = await Promise.all([
      QuestionAttempt.find({ user_id: userId }),
      UserDailyChallenge.find({ user_id: userId, completed: true }).sort({ date: -1 }).limit(365),
      UserModel.find({}).select("xp").lean(),
    ]);

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.is_correct).length;
    const accuracyPct = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    const byChapter: Record<string, { total: number; correct: number }> = {};
    for (const a of attempts) {
      if (!byChapter[a.chapter]) byChapter[a.chapter] = { total: 0, correct: 0 };
      byChapter[a.chapter].total++;
      if (a.is_correct) byChapter[a.chapter].correct++;
    }
    const strongestChapters = Object.entries(byChapter)
      .filter(([, v]) => v.total >= 3)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
      .slice(0, 3)
      .map(([name, v]) => ({ name, accuracy: Math.round((v.correct / v.total) * 100), total: v.total }));

    const xp = (user.get("xp") as number) || 0;
    const sortedUsers = [...allUsers].sort((a, b) => ((b as Record<string, number>).xp || 0) - ((a as Record<string, number>).xp || 0));
    const rank = sortedUsers.findIndex((u) => u._id.toString() === userId) + 1;

    const streakDates = dailyChallenges.map((d) => d.date);
    const streakHistory = streakDates;

    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = today;
    for (let i = 0; i < 365; i++) {
      if (streakDates.includes(checkDate)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }

    const u = user.toJSON();
    const derivedUsername = ((u as Record<string, unknown>).username as string) || ((u as Record<string, unknown>).email as string || "").split("@")[0];
    const publicProfile = {
      username: derivedUsername,
      displayName: derivedUsername,
      initials: derivedUsername.slice(0, 2).toUpperCase(),
      level: (u as Record<string, unknown>).level || "Beginner",
      xp,
      badges: (u as Record<string, unknown>).badges || [],
      streakCount: currentStreak,
      streakHistory,
      rank,
      totalAttempts,
      correctAttempts,
      accuracyPct,
      strongestChapters,
      class: (u as Record<string, unknown>).class,
      plan: (u as Record<string, unknown>).plan,
      memberSince: (u as Record<string, unknown>).created_at,
    };

    res.json({ profile: publicProfile });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
