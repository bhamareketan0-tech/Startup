import { Router } from "express";
import { ShortNote } from "../models/shortNote";
import { requireAdmin, requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/short-notes", async (req, res) => {
  try {
    const { cls, chapter, search, admin } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (!admin) filter.published = true;
    if (cls) filter.class = cls;
    if (chapter) filter.chapter = chapter;
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
    const notes = await ShortNote.find(filter).sort({ class: 1, chapter: 1, order: 1 });
    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/short-notes/:id", async (req, res) => {
  try {
    const note = await ShortNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/short-notes", requireAdmin, async (req, res) => {
  try {
    const note = await ShortNote.create(req.body);
    res.status(201).json(note);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.put("/short-notes/:id", requireAdmin, async (req, res) => {
  try {
    const note = await ShortNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

router.delete("/short-notes/:id", requireAdmin, async (req, res) => {
  try {
    await ShortNote.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post("/short-notes/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as Record<string, unknown>).user as Record<string, unknown> | undefined;
    const userId = sessionUser?.["id"] as string;
    const note = await ShortNote.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Not found" });
    const idx = note.bookmarkedBy.indexOf(userId);
    if (idx === -1) note.bookmarkedBy.push(userId);
    else note.bookmarkedBy.splice(idx, 1);
    await note.save();
    res.json({ bookmarked: idx === -1 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
