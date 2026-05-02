import { Router, type Request, type Response } from "express";
import { Note } from "../models/note";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

router.get("/notes", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const { chapter, search, limit = "100", skip = "0" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { user_id: userId };
    if (chapter) filter.chapter = chapter;
    if (search) filter.note_text = { $regex: search, $options: "i" };
    const total = await Note.countDocuments(filter);
    const data = await Note.find(filter).sort({ updatedAt: -1 }).skip(Number(skip)).limit(Number(limit));
    res.json({ data: data.map((d) => d.toJSON()), total });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/notes/:questionId", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const { note_text, question_text, chapter, subunit, class: cls } = req.body as Record<string, string>;
    const key = { user_id: userId, question_id: req.params.questionId };
    const update = { note_text: note_text || "", question_text: question_text || "", chapter: chapter || "", subunit: subunit || "", class: cls || "" };
    const doc = await Note.findOneAndUpdate(key, update, { upsert: true, new: true });
    res.json({ data: doc.toJSON() });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/notes/:questionId", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: null });
  try {
    const doc = await Note.findOne({ user_id: userId, question_id: req.params.questionId });
    res.json({ data: doc ? doc.toJSON() : null });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/notes/:questionId", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    await Note.deleteOne({ user_id: userId, question_id: req.params.questionId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
