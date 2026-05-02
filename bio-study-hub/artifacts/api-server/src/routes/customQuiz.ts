import { Router, type Request, type Response } from "express";
import { Question } from "../models/question";

const router = Router();

router.post("/custom-quiz/questions", async (req: Request, res: Response) => {
  try {
    const {
      class: cls,
      chapters = [],
      subunits = [],
      types = [],
      difficulty = "mixed",
      count = 20,
    } = req.body as {
      class?: string;
      chapters?: string[];
      subunits?: string[];
      types?: string[];
      difficulty?: string;
      count?: number;
    };

    const filter: Record<string, unknown> = { is_active: true };
    if (cls) filter.class = cls;
    if (chapters.length > 0) filter.chapter = { $in: chapters };
    if (subunits.length > 0) filter.subunit = { $in: subunits };
    if (types.length > 0) filter.type = { $in: types };
    if (difficulty && difficulty !== "mixed") filter.difficulty = difficulty;

    const practiceTypes = ["mcq", "assertion", "statements", "truefalse", "fillblanks", "match", "diagram", "table_based", "pyq"];
    if (!filter.type) filter.type = { $in: practiceTypes };

    const total = await Question.countDocuments(filter);
    const sampleSize = Math.min(Number(count) || 20, 100, total);

    if (sampleSize === 0) return res.json({ questions: [], total: 0 });

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: sampleSize } },
    ]);

    res.json({ questions, total, sampled: sampleSize });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
