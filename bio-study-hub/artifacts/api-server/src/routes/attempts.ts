import { Router } from "express";
import { Attempt } from "../models/attempt";

const router = Router();

router.post("/attempts", async (req, res) => {
  try {
    const doc = await Attempt.create(req.body);
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/attempts", async (req, res) => {
  try {
    const { user_id, limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (user_id) filter.user_id = user_id;
    const data = await Attempt.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    const total = await Attempt.countDocuments(filter);
    res.json({ data: data.map((d) => d.toJSON()), total });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
