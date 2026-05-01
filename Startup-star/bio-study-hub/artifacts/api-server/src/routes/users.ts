import { Router } from "express";
import { User } from "../models/user";
import { Attempt } from "../models/attempt";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const { class: cls, plan, limit = "50", skip = "0" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (cls) filter.class = cls;
    if (plan) filter.plan = plan;
    const total = await User.countDocuments(filter);
    const data = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({ data: data.map((d) => d.toJSON()), total });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/users/:id/stats", async (req, res) => {
  try {
    const attempts_count = await Attempt.countDocuments({ user_id: req.params.id });
    res.json({ attempts_count });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { name, class: cls, plan } = req.body as { name?: string; class?: string; plan?: string };
    const updates: Record<string, unknown> = {};
    if (name && name.trim()) updates["name"] = name.trim();
    if (cls === "11" || cls === "12") updates["class"] = cls;
    if (["free", "pro", "elite"].includes(plan || "")) updates["plan"] = plan;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    res.json({ user: user.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
