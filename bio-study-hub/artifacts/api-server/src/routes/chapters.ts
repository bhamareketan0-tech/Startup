import { Router } from "express";
import { Chapter } from "../models/chapter";

const router = Router();

router.get("/chapters", async (req, res) => {
  try {
    const { class: cls } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (cls) filter.class = cls;
    const data = await Chapter.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/chapters/bulk", async (req, res) => {
  try {
    const { class: cls, chapters } = req.body as { class: string; chapters: { id: string; name: string; subject: string; class: string; subunits: string[]; order: number }[] };
    if (!cls || !Array.isArray(chapters)) {
      return res.status(400).json({ error: "class and chapters array required" });
    }
    await Chapter.deleteMany({ class: cls });
    if (chapters.length > 0) {
      await Chapter.insertMany(
        chapters.map((c, i) => ({ ...c, class: cls, subject: c.subject || "Biology", order: i }))
      );
    }
    const updated = await Chapter.find({ class: cls }).sort({ order: 1 });
    res.json({ data: updated.map((d) => d.toJSON()) });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
