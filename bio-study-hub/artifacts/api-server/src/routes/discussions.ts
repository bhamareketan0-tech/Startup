import { Router } from "express";
import { Discussion } from "../models/discussion";

const router = Router();

router.get("/discussions", async (req, res) => {
  try {
    const { limit = "50" } = req.query as Record<string, string>;
    const data = await Discussion.find().sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/discussions", async (req, res) => {
  try {
    const doc = await Discussion.create(req.body);
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/discussions/:id", async (req, res) => {
  try {
    const { status } = req.body as { status?: string };
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    const doc = await Discussion.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/discussions/:id/like", async (req, res) => {
  try {
    const doc = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/discussions/:id", async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
