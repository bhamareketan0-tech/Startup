import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const FRONTEND_URL = process.env.FRONTEND_URL || "";

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}/auth/google/callback`
    : "http://localhost:5000/auth/google/callback");

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value ?? `${profile.id}@google.oauth`;
          const avatar = profile.photos?.[0]?.value ?? null;
          const name = profile.displayName || email.split("@")[0];

          let user = await User.findOne({ googleId: profile.id });
          if (!user) user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ name, email, googleId: profile.id, avatar });
          } else {
            if (!user.googleId) user.googleId = profile.id;
            if (avatar && !user.get("avatar")) user.set("avatar", avatar);
            await user.save();
          }
          return done(null, user.toJSON());
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

router.get("/auth/google/status", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      ok: false,
      error: "Google Sign-In is not configured on the server. GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.",
    });
  }
  return res.json({ ok: true, callbackURL: GOOGLE_CALLBACK_URL });
});

router.get("/auth/google", (req, res, next) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    const fe = FRONTEND_URL || "";
    return res.redirect(`${fe}/login?googleError=1&reason=not_configured`);
  }
  return passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const user = req.user as Record<string, unknown>;
    (req.session as Record<string, unknown>).userId = user["id"] || user["_id"];
    (req.session as Record<string, unknown>).user = user;
    res.redirect(`${FRONTEND_URL}/home`);
  }
);

export default router;
