import { Router } from "express";
import { SamplePaper } from "../models/samplePaper";
import { Question } from "../models/question";

const router = Router();

router.get("/sample-papers/:userId", async (req, res) => {
  try {
    const papers = await SamplePaper.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(papers);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/sample-papers/detail/:id", async (req, res) => {
  try {
    const paper = await SamplePaper.findById(req.params.id).populate("questionIds");
    if (!paper) return res.status(404).json({ error: "Not found" });
    res.json(paper);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/sample-papers/generate", async (req, res) => {
  try {
    const { userId, config } = req.body as {
      userId: string;
      config: {
        classes: string[];
        chapters: string[];
        totalQuestions: number;
        difficulty: { easy: number; medium: number; hard: number };
        includePYQ: boolean;
      };
    };

    const MAX_PER_FREE = 5;
    const existing = await SamplePaper.countDocuments({ userId });
    if (existing >= MAX_PER_FREE) {
      await SamplePaper.findOneAndDelete({ userId }, { sort: { createdAt: 1 } });
    }

    const total = config.totalQuestions || 90;
    const easyN = Math.round((config.difficulty.easy / 100) * total);
    const hardN = Math.round((config.difficulty.hard / 100) * total);
    const medN = total - easyN - hardN;

    const baseFilter: Record<string, unknown> = { type: "mcq" };
    if (config.classes?.length) baseFilter.class = { $in: config.classes };
    if (config.chapters?.length) baseFilter.chapter = { $in: config.chapters };
    if (!config.includePYQ) baseFilter.pyqYear = { $exists: false };

    async function fetchRandom(difficulty: string, n: number) {
      const q = await (Question as any).aggregate([
        { $match: { ...baseFilter, difficulty } },
        { $sample: { size: n } },
      ]);
      return q;
    }

    const [easy, medium, hard] = await Promise.all([
      fetchRandom("easy", easyN),
      fetchRandom("medium", medN),
      fetchRandom("hard", hardN),
    ]);

    const all = [...easy, ...medium, ...hard];
    const questionIds = all.map((q: any) => q._id);

    const title = `Paper — ${new Date().toLocaleDateString("en-IN")}`;
    const paper = await SamplePaper.create({ userId, title, config, questionIds });
    res.status(201).json({ ...paper.toJSON(), questions: all });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.put("/sample-papers/:id/result", async (req, res) => {
  try {
    const { score, timeTaken } = req.body;
    const paper = await SamplePaper.findByIdAndUpdate(
      req.params.id,
      { attempted: true, score, timeTaken },
      { new: true }
    );
    res.json(paper);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/sample-papers/:id", async (req, res) => {
  try {
    await SamplePaper.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
