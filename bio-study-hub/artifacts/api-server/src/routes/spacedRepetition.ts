import { Router } from "express";
import { SpacedRep } from "../models/spacedRepetition";
import { Question } from "../models/question";

const router = Router();

router.get("/spaced-repetition/:userId/due", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const dueItems = await SpacedRep.find({
      userId,
      mastered: false,
      nextReviewDate: { $lte: now },
    })
      .sort({ nextReviewDate: 1 })
      .limit(50)
      .populate("questionId");
    res.json(dueItems);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/spaced-repetition/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const [due, mastered, total] = await Promise.all([
      SpacedRep.countDocuments({ userId, mastered: false, nextReviewDate: { $lte: now } }),
      SpacedRep.countDocuments({ userId, mastered: true }),
      SpacedRep.countDocuments({ userId }),
    ]);
    res.json({ due, mastered, total });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/spaced-repetition/review", async (req, res) => {
  try {
    const { userId, questionId, correct } = req.body;
    const doc = await (SpacedRep as any).scheduleReview(userId, questionId, correct);
    const masteredQ = await SpacedRep.countDocuments({ userId, mastered: true });
    res.json({ doc, mastered: masteredQ });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/spaced-repetition/wrong", async (req, res) => {
  try {
    const { userId, questionId } = req.body;
    const doc = await (SpacedRep as any).scheduleReview(userId, questionId, false);
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
