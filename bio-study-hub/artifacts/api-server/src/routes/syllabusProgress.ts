import { Router, type Request, type Response } from "express";
import { SyllabusProgress } from "../models/syllabusProgress";

const router = Router();

function getUid(req: Request): string | null {
  return ((req.session as Record<string, unknown>).userId as string) ?? null;
}

router.get("/syllabus-progress", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.json({ data: [] });
  try {
    const { class: cls } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { user_id: userId };
    if (cls) filter.class = cls;
    const data = await SyllabusProgress.find(filter);
    res.json({ data: data.map((d) => d.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/syllabus-progress/toggle", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const { class: cls, chapter, subunit } = req.body as Record<string, string>;
    if (!cls || !chapter || !subunit) return res.status(400).json({ error: "Missing fields." });
    const key = { user_id: userId, class: cls, chapter, subunit };
    const existing = await SyllabusProgress.findOne(key);
    if (existing) {
      existing.studied = !existing.studied;
      await existing.save();
      return res.json({ studied: existing.studied });
    }
    await SyllabusProgress.create({ ...key, studied: true });
    res.json({ studied: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/syllabus-progress/bulk", async (req: Request, res: Response) => {
  const userId = getUid(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated." });
  try {
    const { class: cls, chapter, studied } = req.body as { class: string; chapter: string; studied: boolean };
    await SyllabusProgress.updateMany({ user_id: userId, class: cls, chapter }, { studied }, { new: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
