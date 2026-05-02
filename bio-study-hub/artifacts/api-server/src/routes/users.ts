import { Router } from "express";
import { User } from "../models/user";
import { Attempt } from "../models/attempt";
import { getXPSummary } from "../services/xpService";

const router = Router();

function parsePaginationParams(query: Record<string, string>) {
  const limitNum = Math.max(1, Math.min(200, parseInt(query.limit, 10) || 50));
  let skip: number;
  let pageNum: number;
  if (query.skip !== undefined) {
    skip = Math.max(0, parseInt(query.skip, 10) || 0);
    pageNum = Math.floor(skip / limitNum) + 1;
  } else {
    pageNum = Math.max(1, parseInt(query.page, 10) || 1);
    skip = (pageNum - 1) * limitNum;
  }
  return { pageNum, limitNum, skip };
}

function enrichWithXP(u: Record<string, unknown>) {
  const xp = (u.xp as number) || 0;
  const summary = getXPSummary(xp);
  return { ...u, xpSummary: summary };
}

router.get("/students", async (req, res) => {
  try {
    const { class: cls, plan } = req.query as Record<string, string>;
    const { pageNum, limitNum, skip } = parsePaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (cls) filter.class = cls;
    if (plan) filter.plan = plan;
    const total = await User.countDocuments(filter);
    const data = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    res.json({ data: data.map((d) => enrichWithXP(d.toJSON() as Record<string, unknown>)), total, page: pageNum, limit: limitNum });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { class: cls, plan } = req.query as Record<string, string>;
    const { pageNum, limitNum, skip } = parsePaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (cls) filter.class = cls;
    if (plan) filter.plan = plan;
    const total = await User.countDocuments(filter);
    const data = await User.find(filter)
      .sort({ xp: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    res.json({ users: data.map((d) => enrichWithXP(d.toJSON() as Record<string, unknown>)), total, page: pageNum, limit: limitNum });
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
    res.json({ user: enrichWithXP(user.toJSON() as Record<string, unknown>) });
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

router.post("/users/xp", async (req, res) => {
  try {
    const { userId, xp } = req.body as { userId: string; xp: number; reason?: string };
    const user = await User.findByIdAndUpdate(userId, { $inc: { score: xp } }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ score: user.score });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
