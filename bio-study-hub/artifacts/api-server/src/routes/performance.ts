import { Router, type Request, type Response } from "express";
import { Attempt } from "../models/attempt";
import { QuestionAttempt } from "../models/questionAttempt";
import { UserDailyChallenge } from "../models/dailyChallenge";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

router.get("/performance/overview", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const [attempts, qAttempts, dailyChallenges] = await Promise.all([
      Attempt.find({ user_id: userId }).sort({ createdAt: -1 }),
      QuestionAttempt.find({ user_id: userId }),
      UserDailyChallenge.find({ user_id: userId, completed: true }).sort({ date: -1 }),
    ]);

    const totalAttempted = qAttempts.length;
    const totalCorrect = qAttempts.filter((a) => a.is_correct).length;
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const totalTimeSec = attempts.reduce((s, a) => s + (a.time_taken || 0), 0);
    const totalStudyMinutes = Math.round(totalTimeSec / 60);

    const today = getTodayIST();
    let streak = 0;
    let checkDate = today;
    for (let i = 0; i < 365; i++) {
      const found = dailyChallenges.find((d) => d.date === checkDate);
      if (found) { streak++; }
      else if (i > 0) break;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }

    const byChapter: Record<string, { total: number; correct: number; timeSec: number }> = {};
    for (const a of qAttempts) {
      if (!byChapter[a.chapter]) byChapter[a.chapter] = { total: 0, correct: 0, timeSec: 0 };
      byChapter[a.chapter].total++;
      if (a.is_correct) byChapter[a.chapter].correct++;
    }
    for (const a of attempts) {
      if (!byChapter[a.chapter]) byChapter[a.chapter] = { total: 0, correct: 0, timeSec: 0 };
      byChapter[a.chapter].timeSec += a.time_taken || 0;
    }

    const byType: Record<string, number> = {};
    for (const a of qAttempts) {
      byType[a.question_type] = (byType[a.question_type] || 0) + 1;
    }

    const byDifficulty: Record<string, number> = {};
    for (const a of qAttempts) {
      byDifficulty[a.difficulty] = (byDifficulty[a.difficulty] || 0) + 1;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentAttempts = attempts.filter((a) => new Date(a.createdAt ?? 0) >= thirtyDaysAgo);
    const dailyActivity: Record<string, number> = {};
    for (const a of recentAttempts) {
      const d = new Date(a.createdAt ?? 0).toISOString().split("T")[0];
      dailyActivity[d] = (dailyActivity[d] || 0) + (a.total || 0);
    }

    const thisWeekQ = qAttempts.filter((a) => new Date(a.updatedAt ?? 0) >= last7).length;
    const prevWeekQ = qAttempts.filter((a) => {
      const t = new Date(a.updatedAt ?? 0);
      return t >= prev7Start && t < last7;
    }).length;

    const chapterAccuracy = Object.entries(byChapter)
      .map(([name, v]) => ({ name, accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0, total: v.total }))
      .sort((a, b) => b.accuracy - a.accuracy);

    res.json({
      totalAttempted,
      totalCorrect,
      accuracy,
      totalStudyMinutes,
      streak,
      byChapter,
      byType,
      byDifficulty,
      dailyActivity,
      chapterAccuracy,
      thisWeekQuestions: thisWeekQ,
      prevWeekQuestions: prevWeekQ,
      dailyChallengesCompleted: dailyChallenges.length,
      xp: totalCorrect * 10 + dailyChallenges.length * 50,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/performance/activity", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const attempts = await Attempt.find({ user_id: userId, createdAt: { $gte: yearAgo } });
    const activityMap: Record<string, { count: number; correct: number }> = {};
    for (const a of attempts) {
      const d = new Date(a.createdAt ?? 0).toISOString().split("T")[0];
      if (!activityMap[d]) activityMap[d] = { count: 0, correct: 0 };
      activityMap[d].count += a.total || 0;
      activityMap[d].correct += a.correct || 0;
    }
    const data = Object.entries(activityMap).map(([date, v]) => ({
      date,
      count: v.count,
      correct: v.correct,
      accuracy: v.count > 0 ? Math.round((v.correct / v.count) * 100) : 0,
    }));
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
