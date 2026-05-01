import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "biospark_secret_2024";
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://biospark:biospark123@cluster0.8ymwxg8.mongodb.net/biospark?retryWrites=true&w=majority&appName=Cluster0";
const ADMIN_EMAIL = "bhamareketan18@gmail.com";

app.use(cors({ origin: true, credentials: true, methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGO_URI).then(() => console.log("MongoDB Connected")).catch(err => console.warn("MongoDB error:", err.message));

const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, cls: String, avatar: String, role: { type: String, enum: ["student","admin"], default: "student" }, questionsAttempted: { type: Number, default: 0 }, questionsCorrect: { type: Number, default: 0 }, lastActive: { type: Date, default: Date.now } }, { timestamps: true });
const User = mongoose.model("User", userSchema);

const chapterSchema = new mongoose.Schema({ name: { type: String, required: true }, subject: { type: String, required: true }, order: { type: Number, default: 0 } }, { timestamps: true });
const Chapter = mongoose.model("Chapter", chapterSchema);

const questionSchema = new mongoose.Schema({ question: { type: String, required: true }, options: [String], correctAnswer: { type: Number, required: true }, explanation: { type: String, default: "" }, subject: { type: String, required: true }, chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }, chapterName: String, subunit: String, cls: String, difficulty: { type: String, enum: ["Easy","Medium","Hard"], default: "Medium" }, year: Number, tags: [String], active: { type: Boolean, default: true } }, { timestamps: true });
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

app.get("/", (req, res) => res.json({ status: "BioSpark API running", version: "2.0.0" }));
app.get("/health", (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, cls } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ error: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const role = email === ADMIN_EMAIL ? "admin" : "student";
    const user = await User.create({ name, email, password: hashed, cls, role });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls, role: user.role } });
  } catch (e) { res.json({ error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ error: "Wrong password" });
    user.lastActive = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, cls: user.cls, role: user.role } });
  } catch (e) { res.json({ error: e.message }); }
});

app.post("/api/auth/logout", (req, res) => { res.clearCookie("token"); res.json({ success: true }); });

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try { const user = await User.findById(req.user.id).select("-password"); res.json({ user }); }
  catch (e) { res.json({ error: e.message }); }
});

app.get("/api/chapters", async (req, res) => {
  try { const { subject } = req.query; const filter = subject ? { subject } : {}; const chapters = await Chapter.find(filter).sort({ subject: 1, order: 1, name: 1 }); res.json(chapters); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/chapters/:id", async (req, res) => {
  try { const chapter = await Chapter.findById(req.params.id); if (!chapter) return res.status(404).json({ error: "Chapter not found" }); res.json(chapter); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/chapters", adminMiddleware, async (req, res) => {
  try { const { name, subject, order } = req.body; if (!name || !subject) return res.status(400).json({ error: "name and subject required" }); const chapter = await Chapter.create({ name, subject, order: order || 0 }); res.status(201).json(chapter); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/chapters/:id", adminMiddleware, async (req, res) => {
  try { const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!chapter) return res.status(404).json({ error: "Chapter not found" }); res.json(chapter); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/chapters/:id", adminMiddleware, async (req, res) => {
  try { await Chapter.findByIdAndDelete(req.params.id); res.json({ message: "Chapter deleted" }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/questions", async (req, res) => {
  try {
    const { subject, chapter, difficulty, page = 1, limit = 200, search, subunit, cls, type, is_active } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) { filter.$or = [{ chapter: chapter }, { chapterName: chapter }]; }
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.question = { $regex: search, $options: "i" };
    if (subunit) filter.subunit = subunit;
    if (cls) filter.cls = cls;
    if (type) { filter.$or = filter.$or ? [...filter.$or] : undefined; filter.questionType = type; }
    if (is_active !== undefined) filter.active = is_active === "true";
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter).populate("chapter", "name subject").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ questions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/questions/:id", async (req, res) => {
  try { const question = await Question.findById(req.params.id).populate("chapter", "name subject"); if (!question) return res.status(404).json({ error: "Question not found" }); res.json(question); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/questions", adminMiddleware, async (req, res) => {
  const b = req.body;
  if (b.option1 !== undefined) {
    b.options = [b.option1, b.option2, b.option3, b.option4].filter(Boolean);
    const corrMap = { option1: 0, option2: 1, option3: 2, option4: 3 };
    b.correctAnswer = corrMap[b.correct] ?? 0;
    delete b.option1; delete b.option2; delete b.option3; delete b.option4; delete b.correct;
  }
  if (b.class) { b.cls = b.class; delete b.class; }
  if (b.is_active !== undefined) { b.active = b.is_active; delete b.is_active; }
  if (b.difficulty) b.difficulty = b.difficulty.charAt(0).toUpperCase() + b.difficulty.slice(1);
  if (!b.subject) b.subject = "Biology";
  try {
    const { question, options, correctAnswer, explanation, subject, chapter, difficulty, year, tags, subunit, cls, active } = req.body;
    if (!question || !options || options.length < 2 || correctAnswer === undefined || !subject)
      return res.status(400).json({ error: "question, options, correctAnswer, subject required" });
    let chapterName;
    if (chapter) { const ch = await Chapter.findById(chapter); chapterName = ch ? ch.name : undefined; }
    const newQ = await Question.create({ question, options, correctAnswer, explanation: explanation || "", subject, chapter: chapter || undefined, chapterName, difficulty: difficulty || "Medium", year: year || undefined, tags: tags || [], subunit: subunit || "", cls: cls || "", active: active !== undefined ? active : true });
    res.status(201).json(newQ);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/questions/:id", adminMiddleware, async (req, res) => {
  try {
    if (req.body.chapter) { const ch = await Chapter.findById(req.body.chapter); if (ch) req.body.chapterName = ch.name; }
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/questions/:id", adminMiddleware, async (req, res) => {
  try { await Question.findByIdAndDelete(req.params.id); res.json({ message: "Question deleted" }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/questions/bulk", adminMiddleware, async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) return res.status(400).json({ error: "questions array required" });
    const inserted = await Question.insertMany(questions, { ordered: false });
    res.status(201).json({ inserted: inserted.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/students", adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: "student" };
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const students = await User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/students/:id", adminMiddleware, async (req, res) => {
  try { const student = await User.findById(req.params.id).select("-password"); if (!student) return res.status(404).json({ error: "Student not found" }); res.json(student); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete("/api/students/:id", adminMiddleware, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Student removed" }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/admin/stats", adminMiddleware, async (req, res) => {
  try {
    const [totalStudents, totalQuestions, totalChapters, recentStudents] = await Promise.all([
      User.countDocuments({ role: "student" }), Question.countDocuments(), Chapter.countDocuments(),
      User.find({ role: "student" }).select("name email createdAt lastActive").sort({ createdAt: -1 }).limit(5)
    ]);
    const subjectBreakdown = await Question.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const difficultyBreakdown = await Question.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]);
    res.json({ totalStudents, totalQuestions, totalChapters, recentStudents, subjectBreakdown, difficultyBreakdown });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/quiz", authMiddleware, async (req, res) => {
  try {
    const { subject, chapter, difficulty, count = 10 } = req.query;
    const filter = { active: true };
    if (subject) filter.subject = subject;
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
      return { questionId: a.questionId, selectedOption: a.selectedOption, correctAnswer: q?.correctAnswer, isCorrect, explanation: q?.explanation };
    });
    await User.findByIdAndUpdate(req.user.id, { $inc: { questionsAttempted: answers.length, questionsCorrect: correct }, lastActive: new Date() });
    Attempt.insertMany(answers.map(a => ({ user: req.user.id, question: a.questionId, selectedOption: a.selectedOption, isCorrect: results.find(r => r.questionId === a.questionId)?.isCorrect }))).catch(() => {});
    res.json({ correct, total: answers.length, score: Math.round((correct / answers.length) * 100), results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, "0.0.0.0", () => console.log("BioSpark API running on port " + PORT));
