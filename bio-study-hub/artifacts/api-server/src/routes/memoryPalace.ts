import { Router } from "express";
import { MemoryPalace } from "../models/memoryPalace";

const router = Router();

router.get("/memory-palace", async (req, res) => {
  try {
    const { cls, chapter, admin } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (!admin) filter.published = true;
    if (cls) filter.$or = [{ class: cls }, { class: "both" }];
    if (chapter) filter.chapter = chapter;
    const items = await MemoryPalace.find(filter).sort({ chapter: 1, title: 1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/memory-palace/:id", async (req, res) => {
  try {
    const item = await MemoryPalace.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/memory-palace", async (req, res) => {
  try {
    const item = await MemoryPalace.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put("/memory-palace/:id", async (req, res) => {
  try {
    const item = await MemoryPalace.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/memory-palace/:id", async (req, res) => {
  try {
    await MemoryPalace.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
