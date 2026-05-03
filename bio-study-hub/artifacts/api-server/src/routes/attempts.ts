import { Router } from "express";
import { Attempt } from "../models/attempt";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/attempts", requireAuth, async (req, res) => {
  try {
    const doc = await Attempt.create(req.body);
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/attempts", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as Record<string, unknown>).user as Record<string, unknown> | undefined;
    const { user_id, limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (sessionUser?.["role"] === "admin") {
      if (user_id) filter.user_id = user_id;
    } else {
      filter.user_id = sessionUser?.["id"];
    }
    const data = await Attempt.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    const total = await Attempt.countDocuments(filter);
    res.json({ data: data.map((d) => d.toJSON()), total });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
