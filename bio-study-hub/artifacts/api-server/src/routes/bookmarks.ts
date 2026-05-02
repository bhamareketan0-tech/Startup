import { Router, type Request, type Response } from "express";
import { Bookmark } from "../models/bookmark";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

router.get("/bookmarks", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const { chapter } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { user_id: userId };
    if (chapter) filter.chapter = chapter;
    const data = await Bookmark.find(filter).sort({ createdAt: -1 });
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/bookmarks", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const { question_id, question_text, chapter, subunit, class: cls, question_type, difficulty } = req.body as Record<string, string>;
    if (!question_id || !chapter || !cls) return res.status(400).json({ error: "Missing fields." });
    const existing = await Bookmark.findOne({ user_id: userId, question_id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }
    await Bookmark.create({ user_id: userId, question_id, question_text: question_text || "", chapter, subunit: subunit || "", class: cls, question_type: question_type || "mcq", difficulty: difficulty || "medium" });
    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/bookmarks/status/:questionId", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ bookmarked: false });
  try {
    const existing = await Bookmark.findOne({ user_id: userId, question_id: req.params.questionId });
    res.json({ bookmarked: !!existing });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/bookmarks/:questionId", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    await Bookmark.deleteOne({ user_id: userId, question_id: req.params.questionId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/bookmarks/questions", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const { chapter } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { user_id: userId };
    if (chapter) filter.chapter = chapter;
    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).limit(200);
    const questionIds = bookmarks.map((b) => b.question_id);
    res.json({ question_ids: questionIds, data: bookmarks.map((b) => b.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
