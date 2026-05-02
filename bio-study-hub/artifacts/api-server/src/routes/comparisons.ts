import { Router } from "express";
import { Comparison } from "../models/comparison";

const router = Router();

router.get("/comparisons", async (req, res) => {
  try {
    const { cls, chapter, admin } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (!admin) filter.published = true;
    if (cls) filter.$or = [{ class: cls }, { class: "both" }];
    if (chapter) filter.chapter = chapter;
    const comps = await Comparison.find(filter).sort({ chapter: 1, title: 1 });
    res.json(comps);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/comparisons", async (req, res) => {
  try {
    const comp = await Comparison.create(req.body);
    res.status(201).json(comp);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put("/comparisons/:id", async (req, res) => {
  try {
    const comp = await Comparison.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comp) return res.status(404).json({ error: "Not found" });
    res.json(comp);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/comparisons/:id", async (req, res) => {
  try {
    await Comparison.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/comparisons/:id/bookmark", async (req, res) => {
  try {
    const { userId } = req.body;
    const comp = await Comparison.findById(req.params.id);
    if (!comp) return res.status(404).json({ error: "Not found" });
    const idx = comp.bookmarkedBy.indexOf(userId);
    if (idx === -1) comp.bookmarkedBy.push(userId);
    else comp.bookmarkedBy.splice(idx, 1);
    await comp.save();
    res.json({ bookmarked: idx === -1 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
