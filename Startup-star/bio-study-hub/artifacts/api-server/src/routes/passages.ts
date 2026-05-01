import { Router } from "express";
import { Passage } from "../models/passage";

const router = Router();

router.get("/passages", async (req, res) => {
  try {
    const { chapter, class: cls, status, limit = "100" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (chapter) filter.chapter = chapter;
    if (cls) filter.class = cls;
    if (status) filter.status = status;
    const data = await Passage.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/passages", async (req, res) => {
  try {
    const doc = await Passage.create(req.body);
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/passages/:id", async (req, res) => {
  try {
    const doc = await Passage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/passages/:id", async (req, res) => {
  try {
    await Passage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
