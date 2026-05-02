import { Router } from "express";
import { Flashcard } from "../models/flashcard";

const router = Router();

router.get("/flashcards", async (req, res) => {
  try {
    const { cls, chapter, admin } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (!admin) filter.published = true;
    if (cls) filter.class = cls;
    if (chapter) filter.chapter = chapter;
    const cards = await Flashcard.find(filter).sort({ chapter: 1, order: 1 });
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/flashcards", async (req, res) => {
  try {
    const card = await Flashcard.create(req.body);
    res.status(201).json(card);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.post("/flashcards/bulk", async (req, res) => {
  try {
    const { cards } = req.body as { cards: unknown[] };
    const created = await Flashcard.insertMany(cards);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put("/flashcards/:id", async (req, res) => {
  try {
    const card = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ error: "Not found" });
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/flashcards/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
