import { Router, type Request, type Response } from "express";
import { DailyChallenge, UserDailyChallenge } from "../models/dailyChallenge";
import { Question } from "../models/question";
import { awardXP } from "../services/xpService";
import { evaluateBadges } from "../services/badgeService";
import { User } from "../models/user";
import { XP_AWARDS } from "../lib/xpConfig";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

function getTodayIST(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

async function getOrCreateDailyChallenge(date: string) {
  let dc = await DailyChallenge.findOne({ date });
  if (dc) return dc;
  const questions = await Question.aggregate([
    { $match: { is_active: true, type: { $in: ["mcq", "assertion", "statements", "truefalse", "fillblanks"] } } },
    { $sample: { size: 10 } },
  ]);
  const ids = questions.map((q) => q._id.toString());
  dc = await DailyChallenge.create({ date, question_ids: ids });
  return dc;
}

router.get("/daily-challenge/today", async (req: Request, res: Response) => {
  try {
    const date = getTodayIST();
    const dc = await getOrCreateDailyChallenge(date);
    const userId = getUid(req);

    let userAttempt = null;
    let streakInfo = { current: 0, best: 0 };

    if (userId) {
      userAttempt = await UserDailyChallenge.findOne({ user_id: userId, date });

      const allCompleted = await UserDailyChallenge.find({ user_id: userId, completed: true })
        .sort({ date: -1 });

      let streak = 0;
      let best = 0;
      let cur = 0;
      let checkDate = new Date(new Date(date).getTime() + 5.5 * 60 * 60 * 1000);

      for (let i = 0; i < 365; i++) {
        const d = checkDate.toISOString().split("T")[0];
        const found = allCompleted.find((a) => a.date === d);
        if (found) {
          cur++;
          if (cur > best) best = cur;
        } else if (i === 0) {
          cur = 0;
        } else {
          break;
        }
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      }
      streak = cur;
      streakInfo = { current: streak, best };
    }

    const questions = await Question.find({ _id: { $in: dc.question_ids } });

    const safeQuestions = questions.map((q) => {
      const j = q.toJSON();
      if (!userAttempt) {
        delete (j as Record<string, unknown>).correct;
        delete (j as Record<string, unknown>).explanation;
      }
      return j;
    });

    res.json({
      date,
      questions: safeQuestions,
      completed: !!userAttempt?.completed,
      userAttempt: userAttempt ? userAttempt.toJSON() : null,
      streak: streakInfo,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/daily-challenge/attempt", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const date = getTodayIST();
    const existing = await UserDailyChallenge.findOne({ user_id: userId, date });
    if (existing?.completed) {
      return res.status(400).json({ error: "Already attempted today's challenge." });
    }

    const { answers } = req.body as { answers: Record<string, string> };
    const dc = await DailyChallenge.findOne({ date });
    if (!dc) return res.status(404).json({ error: "No challenge today." });

    const questions = await Question.find({ _id: { $in: dc.question_ids } });
    let correct = 0;
    let wrong = 0;
    for (const q of questions) {
      const qid = q._id.toString();
      const userAns = answers[qid];
      if (!userAns) continue;
      if (userAns === q.correct) correct++;
      else wrong++;
    }
    const skipped = questions.length - correct - wrong;
    const score = correct * 4 - wrong * 1;

    const attempt = await UserDailyChallenge.findOneAndUpdate(
      { user_id: userId, date },
      { score, correct, wrong, answers, completed: true },
      { upsert: true, new: true }
    );

    const xpResult = await awardXP(userId, XP_AWARDS.DAILY_CHALLENGE_DONE);

    const allCompleted = await UserDailyChallenge.find({ user_id: userId, completed: true }).sort({ date: -1 });
    let streakCount = 0;
    let checkDate = date;
    for (let i = 0; i < 365; i++) {
      const found = allCompleted.find((a) => a.date === checkDate);
      if (found) {
        streakCount++;
      } else if (i > 0) {
        break;
      }
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }

    const updates: Record<string, unknown> = { streakCount, lastActivity: new Date() };
    if (streakCount === 7) await awardXP(userId, XP_AWARDS.STREAK_7_DAY);
    if (streakCount === 30) await awardXP(userId, XP_AWARDS.STREAK_30_DAY);
    await User.findByIdAndUpdate(userId, updates);

    const newBadges = await evaluateBadges(userId);

    const questionsWithAnswers = questions.map((q) => q.toJSON());
    res.json({ attempt: attempt.toJSON(), score, correct, wrong, skipped, questions: questionsWithAnswers, xpResult, newBadges, streakCount });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/daily-challenge/streak", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ current: 0, best: 0, history: [] });
  try {
    const all = await UserDailyChallenge.find({ user_id: userId, completed: true }).sort({ date: -1 }).limit(365);
    const today = getTodayIST();
    let cur = 0;
    let best = 0;
    let checkDate = today;
    for (let i = 0; i < 365; i++) {
      const found = all.find((a) => a.date === checkDate);
      if (found) {
        cur++;
        if (cur > best) best = cur;
      } else if (i > 0) {
        break;
      }
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }
    res.json({ current: cur, best, history: all.map((a) => ({ date: a.date, score: a.score, correct: a.correct })) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/daily-challenge/leaderboard", async (req: Request, res: Response) => {
  try {
    const date = getTodayIST();
    const top = await UserDailyChallenge.find({ date, completed: true }).sort({ score: -1, correct: -1 }).limit(20);
    const { User } = await import("../models/user");
    const ids = top.map((t) => t.user_id);
    const users = await User.find({ _id: { $in: ids } });
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.toJSON()]));
    const result = top.map((t) => ({
      ...t.toJSON(),
      user: userMap[t.user_id] || null,
    }));
    res.json({ data: result, date });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
