import { Router, type Request, type Response } from "express";
import { QuestionAttempt } from "../models/questionAttempt";
import { awardXP } from "../services/xpService";
import { evaluateBadges } from "../services/badgeService";
import { XP_AWARDS } from "../lib/xpConfig";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

router.post("/question-attempts", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const {
      question_id, question_text, chapter, subunit, class: cls,
      question_type, difficulty, is_correct, user_answer, correct_answer,
    } = req.body as Record<string, unknown>;

    if (!question_id) return res.status(400).json({ error: "question_id required" });

    const existing = await QuestionAttempt.findOne({ user_id: userId, question_id });
    let consecutiveCorrect = 0;
    let xpResult = null;
    let newBadges: unknown[] = [];

    if (existing) {
      const wasCorrect = existing.is_correct;
      consecutiveCorrect = is_correct ? (existing.consecutive_correct || 0) + 1 : 0;
      const mastered = consecutiveCorrect >= 3;
      existing.is_correct = is_correct as boolean;
      existing.user_answer = (user_answer as string) || "";
      existing.correct_answer = (correct_answer as string) || "";
      existing.consecutive_correct = consecutiveCorrect;
      existing.mastered = mastered;
      await existing.save();

      if (is_correct) {
        xpResult = await awardXP(userId, XP_AWARDS.CORRECT_ANSWER);
        newBadges = await evaluateBadges(userId);
      }

      return res.json({ data: existing.toJSON(), xpResult, newBadges });
    }

    consecutiveCorrect = is_correct ? 1 : 0;
    const doc = await QuestionAttempt.create({
      user_id: userId,
      question_id,
      question_text: question_text || "",
      chapter: chapter || "",
      subunit: subunit || "",
      class: cls || "",
      question_type: question_type || "mcq",
      difficulty: difficulty || "medium",
      is_correct: !!is_correct,
      user_answer: user_answer || "",
      correct_answer: correct_answer || "",
      consecutive_correct: consecutiveCorrect,
      mastered: consecutiveCorrect >= 3,
    });

    if (is_correct) {
      xpResult = await awardXP(userId, XP_AWARDS.CORRECT_ANSWER);
      newBadges = await evaluateBadges(userId);
    }

    res.json({ data: doc.toJSON(), xpResult, newBadges });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/question-attempts/wrong", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const { chapter, class: cls } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { user_id: userId, is_correct: false, mastered: false };
    if (chapter) filter.chapter = chapter;
    if (cls) filter.class = cls;
    const data = await QuestionAttempt.find(filter).sort({ updatedAt: -1 }).limit(200);
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/question-attempts/stats", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ total: 0, correct: 0, wrong: 0, mastered: 0, byChapter: {} });
  try {
    const all = await QuestionAttempt.find({ user_id: userId });
    const total = all.length;
    const correct = all.filter((a) => a.is_correct).length;
    const wrong = total - correct;
    const mastered = all.filter((a) => a.mastered).length;
    const byChapter: Record<string, { total: number; correct: number }> = {};
    for (const a of all) {
      if (!byChapter[a.chapter]) byChapter[a.chapter] = { total: 0, correct: 0 };
      byChapter[a.chapter].total++;
      if (a.is_correct) byChapter[a.chapter].correct++;
    }
    res.json({ total, correct, wrong, mastered, byChapter });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
