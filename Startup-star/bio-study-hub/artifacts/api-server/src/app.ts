import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { createProxyMiddleware } from "http-proxy-middleware";
import router from "./routes";
import authRouter from "./routes/auth";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "biospark-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.use(authRouter);
app.use("/api", router);

// Forward all other requests to the Vite frontend dev server
const frontendProxy = createProxyMiddleware({
  target: "http://localhost:3000",
  changeOrigin: true,
  ws: true,
});
app.use(frontendProxy);

export default app;
