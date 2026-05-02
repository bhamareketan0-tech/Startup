import { Router, type Request, type Response } from "express";
import { SeenQuestion } from "../models/seenQuestion";
import { Question } from "../models/question";

const router = Router();

function getSessionUserId(req: Request): string | null {
  const session = req.session as Record<string, unknown>;
  const id = session.userId as string | undefined;
  return id ?? null;
}

router.get("/seen-questions", async (req: Request, res: Response) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.json({ seen_ids: [] });

    const { chapter, subunit, class: cls, type } = req.query as Record<string, string>;
    if (!chapter || !cls || !type) return res.json({ seen_ids: [] });

    const doc = await SeenQuestion.findOne({
      user_id: userId,
      chapter,
      subunit: subunit || "",
      class: cls,
      type,
    });
    res.json({ seen_ids: doc?.seen_ids ?? [] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/seen-questions/mark", async (req: Request, res: Response) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Not authenticated." });

    const { chapter, subunit, class: cls, type, question_ids } = req.body as {
      chapter: string;
      subunit?: string;
      class: string;
      type: string;
      question_ids: string[];
    };

    if (!chapter || !cls || !type || !Array.isArray(question_ids)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const key = { user_id: userId, chapter, subunit: subunit || "", class: cls, type };

    const totalInPool = await Question.countDocuments({
      chapter,
      subunit: subunit || "",
      class: cls,
      type,
      is_active: true,
    });

    const existing = await SeenQuestion.findOne(key);
    let newSeenIds: string[];

    if (existing) {
      const merged = [...new Set([...existing.seen_ids, ...question_ids])];
      newSeenIds = merged.length >= totalInPool && totalInPool > 0 ? [] : merged;
      existing.seen_ids = newSeenIds;
      await existing.save();
    } else {
      newSeenIds =
        totalInPool > 0 && question_ids.length >= totalInPool ? [] : question_ids;
      await SeenQuestion.create({ ...key, seen_ids: newSeenIds });
    }

    res.json({ seen_ids: newSeenIds, reset: newSeenIds.length === 0 });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
