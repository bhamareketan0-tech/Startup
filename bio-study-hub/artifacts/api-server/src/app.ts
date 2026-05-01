import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import router from "./routes";
import authRouter from "./routes/auth";

const app: Express = express();

app.set("trust proxy", 1);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
      if (ALLOWED_ORIGINS.includes("*")) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "biospark-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/healthz", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.post("/format", async (req, res) => {
  try {
    const input = req.body?.text || "";

    if (!input) {
      return res.status(400).json({ error: "No input text provided" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `STRICTLY convert into this format:

TYPE: MCQ
Q1. Question
A) Option
B) Option
C) Option
D) Option
ANS: A

NO extra text. NO explanation.

INPUT:
${input}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ text: output });

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Gemini failed" });
  }
});
app.use(authRouter);
app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
