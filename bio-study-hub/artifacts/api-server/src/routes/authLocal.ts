import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user";
import { awardXP } from "../services/xpService";
import { evaluateBadges } from "../services/badgeService";
import { XP_AWARDS } from "../lib/xpConfig";

const router = Router();

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / msPerDay);
}

async function handleComebackBonus(userId: string): Promise<{
  comebackType: "none" | "comeback" | "fresh_start";
  xpAwarded: number;
  message: string;
}> {
  const user = await User.findById(userId);
  if (!user) return { comebackType: "none", xpAwarded: 0, message: "" };

  const lastActivity = user.get("lastActivity") as Date | null;
  const now = new Date();
  const streakCount = (user.get("streakCount") as number) || 0;

  await User.findByIdAndUpdate(userId, { lastActivity: now });

  if (!lastActivity) {
    return { comebackType: "none", xpAwarded: 0, message: "" };
  }

  const daysMissed = daysBetween(lastActivity, now);

  if (daysMissed === 0) {
    return { comebackType: "none", xpAwarded: 0, message: "" };
  }

  if (daysMissed >= 1 && daysMissed <= 3 && streakCount > 0) {
    await awardXP(userId, XP_AWARDS.COMEBACK_1_3_DAYS);
    await User.findByIdAndUpdate(userId, { comebackBonusAwarded: true });
    await evaluateBadges(userId);
    return {
      comebackType: "comeback",
      xpAwarded: XP_AWARDS.COMEBACK_1_3_DAYS,
      message: `Welcome back! 🎉 You were missed! Here's +${XP_AWARDS.COMEBACK_1_3_DAYS} XP for returning!`,
    };
  }

  if (daysMissed >= 7) {
    await User.findByIdAndUpdate(userId, { streakCount: 0, comebackBonusAwarded: true });
    await awardXP(userId, XP_AWARDS.COMEBACK_7_PLUS_DAYS);
    await evaluateBadges(userId);
    return {
      comebackType: "fresh_start",
      xpAwarded: XP_AWARDS.COMEBACK_7_PLUS_DAYS,
      message: `Fresh start! 🚀 Your streak was reset, but you've earned +${XP_AWARDS.COMEBACK_7_PLUS_DAYS} XP for coming back. You got this!`,
    };
  }

  return { comebackType: "none", xpAwarded: 0, message: "" };
}

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, class: cls } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      class?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const emailPrefix = email.toLowerCase().split("@")[0].replace(/[^a-z0-9_]/g, "");
    let username = emailPrefix;
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      username = `${emailPrefix}${Math.floor(Math.random() * 9000) + 1000}`;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      class: cls || "11",
      username,
      lastActivity: new Date(),
    });

    const userData = user.toJSON();
    (req.session as Record<string, unknown>).userId = userData.id;
    (req.session as Record<string, unknown>).user = userData;

    res.status(201).json({ user: userData, comeback: { comebackType: "none", xpAwarded: 0, message: "" } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.get("password")) {
      res.status(401).json({ error: "This account uses Google Sign-In. Please continue with Google." });
      return;
    }

    const valid = await bcrypt.compare(password, user.get("password") as string);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const userId = user._id.toString();
    const comeback = await handleComebackBonus(userId);

    const updated = await User.findById(userId);
    const userData = (updated || user).toJSON();
    (req.session as Record<string, unknown>).userId = userData.id;
    (req.session as Record<string, unknown>).user = userData;

    res.json({ user: userData, comeback });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const sessionUserId = (req.session as Record<string, unknown>).userId as string | undefined;
  if (!sessionUserId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  try {
    const freshUser = await User.findById(sessionUserId);
    if (!freshUser) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const userData = freshUser.toJSON();
    (req.session as Record<string, unknown>).user = userData;
    res.json({ user: userData });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.put("/auth/profile", async (req: Request, res: Response) => {
  const sessionUser = (req.session as Record<string, unknown>).user as Record<string, unknown> | undefined;
  if (!sessionUser) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  try {
    const { name, class: cls } = req.body as { name?: string; class?: string };
    const updates: Record<string, unknown> = {};
    if (name && name.trim()) updates["name"] = name.trim();
    if (cls === "11" || cls === "12") updates["class"] = cls;

    const user = await User.findByIdAndUpdate(sessionUser["id"], updates, { new: true });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    const userData = user.toJSON();
    (req.session as Record<string, unknown>).user = userData;
    res.json({ user: userData });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
