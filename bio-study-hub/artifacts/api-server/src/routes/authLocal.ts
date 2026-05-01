import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user";

const router = Router();

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
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      class: cls || "11",
    });

    const userData = user.toJSON();
    (req.session as Record<string, unknown>).userId = userData.id;
    (req.session as Record<string, unknown>).user = userData;

    res.status(201).json({ user: userData });
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

    const userData = user.toJSON();
    (req.session as Record<string, unknown>).userId = userData.id;
    (req.session as Record<string, unknown>).user = userData;

    res.json({ user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.get("/auth/me", (req: Request, res: Response) => {
  const user = (req.session as Record<string, unknown>).user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  res.json({ user });
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
