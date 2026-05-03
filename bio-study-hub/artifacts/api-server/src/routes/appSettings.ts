import { Router } from "express";
import { Settings } from "../models/settings";
import { requireAdmin } from "../middlewares/requireAuth";

const router = Router();

const PUBLIC_KEYS = ["site_name", "accent_color", "maintenance_mode"];

router.get("/settings/public", async (_req, res) => {
  try {
    const docs = await Settings.find({ key: { $in: PUBLIC_KEYS } });
    const result: Record<string, unknown> = {};
    for (const doc of docs) result[doc.key] = doc.value;
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const { keys } = req.query as { keys?: string };
    const requestedKeys = keys ? keys.split(",").map((k) => k.trim()) : null;
    const filter = requestedKeys ? { key: { $in: requestedKeys } } : {};
    const docs = await Settings.find(filter);
    const result: Record<string, unknown> = {};
    for (const doc of docs) {
      result[doc.key] = doc.value;
    }
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const updates = req.body as Record<string, unknown>;
    const ops = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    const all = await Settings.find();
    const result: Record<string, unknown> = {};
    for (const doc of all) result[doc.key] = doc.value;
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
