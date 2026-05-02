import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.length === 0) return callback(null, true);
    if (ALLOWED_ORIGINS.includes("*")) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || "")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.warn("MongoDB connection failed:", err.message));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  cls: String,
  avatar: String,
  googleId: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

app.get("/", (_req, res) => { res.json({ status: "ok" }); });

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, cls } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ error: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, cls });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls } });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ error: "Wrong password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls } });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get("/api/auth/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    const user = await User.findById(decoded.id).select("-password");
    res.json({ user });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
