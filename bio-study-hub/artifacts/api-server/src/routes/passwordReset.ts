import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/user";
import { Resend } from "resend";

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const resetTokens = new Map<string, { email: string; expires: number; attempts: number }>();

// POST /api/auth/forgot-password
router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If this email exists, a reset link has been sent." });

  const existingEntries = [...resetTokens.entries()].filter(
    ([, v]) => v.email === email && v.expires > Date.now()
  );
  if (existingEntries.length >= 3) {
    return res.status(429).json({ error: "Too many reset requests. Try again in 1 hour." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 15 * 60 * 1000;

  resetTokens.set(token, { email, expires, attempts: 0 });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "BioSpark <onboarding@resend.dev>",
    to: email,
    subject: "Reset your BioSpark password",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #00ff88;">Reset Your Password</h2>
        <p>You requested a password reset for your BioSpark account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #00ff88; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  });

  res.json({ message: "If this email exists, a reset link has been sent." });
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const entry = resetTokens.get(token);
  if (!entry) return res.status(400).json({ error: "Invalid or expired reset link" });
  if (entry.expires < Date.now()) {
    resetTokens.delete(token);
    return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
  }

  entry.attempts += 1;
  if (entry.attempts > 3) {
    resetTokens.delete(token);
    return res.status(400).json({ error: "Too many attempts. Please request a new reset link." });
  }

  const user = await User.findOne({ email: entry.email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const hashed = await bcrypt.hash(password, 12);
  user.set("password", hashed);
  await user.save();

  resetTokens.delete(token);

  res.json({ message: "Password reset successfully!" });
});

export default router;
