import { Router } from "express";
import { Question } from "../models/question";

const router = Router();

router.get("/questions/counts", async (req, res) => {
  try {
    const { class: cls, chapter } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { is_active: true };
    if (cls) filter.class = cls;
    if (chapter) filter.chapter = chapter;

    const counts = await Question.aggregate([
      { $match: filter },
      { $group: { _id: { subunit: "$subunit", type: "$type" }, count: { $sum: 1 } } },
    ]);

    const result: Record<string, { total: number; byType: Record<string, number> }> = {};
    for (const item of counts) {
      const sub = item._id.subunit || "";
      if (!result[sub]) result[sub] = { total: 0, byType: {} };
      result[sub].total += item.count;
      result[sub].byType[item._id.type] = item.count;
    }

    const chapterTotal = await Question.countDocuments(filter);
    res.json({ bySubunit: result, chapterTotal });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/questions", async (req, res) => {
  try {
    const { class: cls, subunit, type, is_active, chapter, limit = "50", skip = "0", search, exclude } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (cls) filter.class = cls;
    if (subunit) filter.subunit = subunit;
    if (type) filter.type = type;
    if (chapter) filter.chapter = chapter;
    if (is_active !== undefined) filter.is_active = is_active === "true";
    if (search) filter.question = { $regex: search, $options: "i" };
    if (exclude) {
      const excludeIds = exclude.split(",").filter(Boolean);
      if (excludeIds.length > 0) filter._id = { $nin: excludeIds };
    }

    const total = await Question.countDocuments(filter);
    const data = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ data: data.map((d) => d.toJSON()), total });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/questions", async (req, res) => {
  try {
    const body = req.body;
    if (Array.isArray(body)) {
      const docs = await Question.insertMany(body, { ordered: false });
      res.json({ data: docs.map((d) => d.toJSON()), count: docs.length });
    } else {
      const doc = await Question.create(body);
      res.json({ data: doc.toJSON() });
    }
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/questions/:id", async (req, res) => {
  try {
    const doc = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ data: doc.toJSON() });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/questions/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/questions/stats", async (_req, res) => {
  try {
    const total = await Question.countDocuments();
    const byType = await Question.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const byDifficulty = await Question.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);
    const recent = await Question.find().sort({ createdAt: -1 }).limit(5);
    res.json({
      total,
      byType: byType.map((d) => ({ type: d._id, count: d.count })),
      byDifficulty: byDifficulty.map((d) => ({ difficulty: d._id, count: d.count })),
      recent: recent.map((d) => d.toJSON()),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
