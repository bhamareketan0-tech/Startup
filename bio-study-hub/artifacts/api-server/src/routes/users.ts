import { Router } from "express";
import { User } from "../models/user";
import { Attempt } from "../models/attempt";

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
    res.json({ data: data.map((d) => d.toJSON()), total, page: pageNum, limit: limitNum });
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    res.json({ data: data.map((d) => d.toJSON()), total, page: pageNum, limit: limitNum });
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
