import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client("115301406415-k3g2dcn65n6kt5t251f7bmlo2sgs9vd6.apps.googleusercontent.com");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "biospark_secret_2024";
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://biospark:biospark123@cluster0.8ymwxg8.mongodb.net/biospark?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors({ origin: true, credentials: true, methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.warn("MongoDB error:", err.message));

const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, cls: String, avatar: String, role: { type: String, enum: ["student","admin"], default: "student" }, questionsAttempted: { type: Number, default: 0 }, questionsCorrect: { type: Number, default: 0 }, lastActive: { type: Date, default: Date.now } }, { timestamps: true });
const User = mongoose.model("User", userSchema);

const chapterSchema = new mongoose.Schema({ name: { type: String, required: true }, subject: { type: String, required: true }, order: { type: Number, default: 0 } }, { timestamps: true });
const Chapter = mongoose.model("Chapter", chapterSchema);

const questionSchema = new mongoose.Schema({ question: { type: String, required: true }, options: [String], correctAnswer: { type: Number, required: true }, explanation: { type: String, default: "" }, subject: { type: String, required: true }, chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }, chapterName: String, subunit: String, cls: String, difficulty: { type: String, enum: ["Easy","Medium","Hard"], default: "Medium" }, questionType: { type: String, default: "mcq" }, year: Number, tags: [String], active: { type: Boolean, default: true } }, { timestamps: true });
const Question = mongoose.model("Question", questionSchema);

const attemptSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }, selectedOption: Number, isCorrect: Boolean, attemptedAt: { type: Date, default: Date.now } });
const Attempt = mongoose.model("Attempt", attemptSchema);

function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}

async function adminMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access only" });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

app.get("/health", (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

// AUTH
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, cls } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, cls });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CHAPTERS
app.get("/api/chapters", async (req, res) => {
  try {
    const chapters = await Chapter.find().sort({ order: 1 });
    res.json(chapters);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/chapters", adminMiddleware, async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.json(chapter);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// QUESTIONS
app.get("/api/questions", async (req, res) => {
  try {
    const { limit = 20, skip = 0, cls, difficulty, type, search, chapter, subunit } = req.query;
    const filter = {};
    if (cls) filter.cls = cls;
    if (difficulty) filter.difficulty = difficulty;
    if (chapter) {
      if (chapter.match(/^[0-9a-fA-F]{24}$/)) filter.chapter = chapter;
      else filter.chapterName = chapter;
    }
    if (subunit) filter.subunit = subunit;
    if (type) filter.questionType = type;
    if (search) filter.question = { $regex: search, $options: "i" };
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter).sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit));
    const mapped = questions.map(q => { const obj = q.toObject(); return { ...obj, id: obj._id.toString(), is_active: obj.active, class: obj.cls, option1: obj.options?.[0] || "", option2: obj.options?.[1] || "", option3: obj.options?.[2] || "", option4: obj.options?.[3] || "", correct: ["option1","option2","option3","option4"][obj.correctAnswer] || "option1", type: obj.questionType || "mcq" }; });
    res.json({ data: mapped, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/questions/:id", async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });
    res.json(q);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/questions", adminMiddleware, async (req, res) => {
  try {
    const b = { ...req.body };
    // Transform frontend format
    if (b.option1 !== undefined) {
      b.options = [b.option1, b.option2, b.option3, b.option4].filter(Boolean);
      const corrMap = { option1: 0, option2: 1, option3: 2, option4: 3 };
      b.correctAnswer = corrMap[b.correct] ?? 0;
      delete b.option1; delete b.option2; delete b.option3; delete b.option4; delete b.correct;
    }
    if (b.class) { b.cls = b.class; delete b.class; }
    if (b.is_active !== undefined) { b.active = b.is_active; delete b.is_active; }
    if (b.difficulty) b.difficulty = b.difficulty.charAt(0).toUpperCase() + b.difficulty.slice(1);
    if (b.type) { b.questionType = b.type; delete b.type; }
    if (!b.subject) b.subject = "Biology";

    // chapter is a string slug from frontend, not ObjectId — store as chapterName
    if (b.chapter && typeof b.chapter === "string" && !b.chapter.match(/^[0-9a-fA-F]{24}$/)) {
      b.chapterName = b.chapter;
      delete b.chapter;
    }

    const { question, options, correctAnswer, subject } = b;
    if (!question || !options || options.length < 2 || correctAnswer === undefined || !subject)
      return res.status(400).json({ error: "question, options, correctAnswer, subject required" });

    const q = await Question.create(b);
    res.json(q);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/questions/:id", adminMiddleware, async (req, res) => {
  try {
    const b = { ...req.body };
    if (b.option1 !== undefined) {
      b.options = [b.option1, b.option2, b.option3, b.option4].filter(Boolean);
      const corrMap = { option1: 0, option2: 1, option3: 2, option4: 3 };
      b.correctAnswer = corrMap[b.correct] ?? 0;
      delete b.option1; delete b.option2; delete b.option3; delete b.option4; delete b.correct;
    }
    if (b.class) { b.cls = b.class; delete b.class; }
    if (b.is_active !== undefined) { b.active = b.is_active; delete b.is_active; }
    if (b.difficulty) b.difficulty = b.difficulty.charAt(0).toUpperCase() + b.difficulty.slice(1);
    if (b.chapter && typeof b.chapter === "string" && !b.chapter.match(/^[0-9a-fA-F]{24}$/)) {
      b.chapterName = b.chapter;
      delete b.chapter;
    }
    const q = await Question.findByIdAndUpdate(req.params.id, b, { new: true });
    res.json(q);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/questions/:id", adminMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// STUDENTS
app.get("/api/students", adminMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ADMIN STATS
app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalQuestions = await Question.countDocuments();
    const totalAttempts = await Attempt.countDocuments();
    res.json({ totalStudents, totalQuestions, totalAttempts });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// QUIZ
app.get("/api/quiz", authMiddleware, async (req, res) => {
  try {
    const { count = 10, cls, chapter, difficulty } = req.query;
    const filter = { active: true };
    if (cls) filter.cls = cls;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.aggregate([{ $match: filter }, { $sample: { size: parseInt(count) } }, { $project: { explanation: 0 } }]);
    res.json(questions);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/quiz/submit", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ error: "answers array required" });
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).select("correctAnswer explanation");
    const qMap = Object.fromEntries(questions.map(q => [q._id.toString(), q]));
    let correct = 0;
    const results = answers.map(a => {
      const q = qMap[a.questionId];
      const isCorrect = q && q.correctAnswer === a.selectedOption;
      if (isCorrect) correct++;
      return { questionId: a.questionId, isCorrect, correctAnswer: q?.correctAnswer, explanation: q?.explanation };
    });
    await User.findByIdAndUpdate(req.user.id, { $inc: { questionsAttempted: answers.length, questionsCorrect: correct }, lastActive: new Date() });
    res.json({ results, correct, total: answers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GOOGLE AUTH
app.post("/api/auth/google", async (req, res) => {
  try {
    const { userInfo } = req.body;
    if (!userInfo || !userInfo.email) return res.status(400).json({ error: "Invalid Google user info" });
    const { email, name, picture } = userInfo;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: "", avatar: picture, cls: "Class 11", role: "student" });
    }
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, cls: user.cls, role: user.role, avatar: user.avatar } });
  } catch (e) { res.status(401).json({ error: "Google auth failed: " + e.message }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
