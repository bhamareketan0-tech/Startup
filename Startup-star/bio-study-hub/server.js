import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

const app = express();

/* ================= CORS ================= */
app.use(cors({
  origin: [
    "https://startup-one-umber.vercel.app",
    "https://biospark-frontend.netlify.app"
  ],
  credentials: true
}));

app.use(express.json());

/* ================= SESSION ================= */
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* ================= DB ================= */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/* ================= USER MODEL ================= */
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  cls: String,
  avatar: String,
  googleId: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

/* ================= PASSPORT ================= */
passport.use(new GoogleStrategy.Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://startup-85w8.onrender.com/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

/* ===== GOOGLE AUTH ===== */
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://startup-one-umber.vercel.app/login"
  }),
  (req, res) => {
    res.redirect("https://startup-one-umber.vercel.app");
  }
);

/* ===== REGISTER ===== */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, cls } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      cls
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cls: user.cls
      }
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

/* ===== LOGIN ===== */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cls: user.cls
      }
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

/* ===== PROFILE ===== */
app.get("/api/auth/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.json({ error: "No token" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret123"
    );

    const user = await User.findById(decoded.id).select("-password");

    res.json({ user });

  } catch (e) {
    res.json({ error: e.message });
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
