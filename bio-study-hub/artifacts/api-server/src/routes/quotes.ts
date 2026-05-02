import { Router } from "express";
import { Quote } from "../models/quote";

const router = Router();

router.get("/quotes", async (req, res) => {
  try {
    const { category, random } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { active: true };
    if (category) filter.category = category;
    let quotes;
    if (random) {
      const count = await Quote.countDocuments(filter);
      const skip = Math.max(0, Math.floor(Math.random() * count));
      quotes = await Quote.findOne(filter).skip(skip);
    } else {
      quotes = await Quote.find(filter).sort({ createdAt: -1 });
    }
    res.json(quotes);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/quotes", async (req, res) => {
  try {
    const quote = await Quote.create(req.body);
    res.status(201).json(quote);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put("/quotes/:id", async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quote) return res.status(404).json({ error: "Not found" });
    res.json(quote);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/quotes/:id", async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
