import { Router } from "express";
import { Settings } from "../models/settings";

const router = Router();

async function getGeminiKey(): Promise<string> {
  const fromEnv = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  if (fromEnv) return fromEnv;
  try {
    const doc = await Settings.findOne({ key: "cred_gemini_api_key" });
    if (doc?.value && String(doc.value).trim()) return String(doc.value).trim();
  } catch {}
  return "";
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

type GenType =
  | "paragraph" | "pointer_notes" | "tricks"
  | "mcq" | "assertion" | "statements" | "truefalse"
  | "fillblanks" | "match" | "diagram" | "table_based" | "pyq";

function buildPrompt(type: GenType, text: string, chapter: string, subunit: string, cls: string, count: number): string {
  const ctx = `You are an expert NEET Biology question creator for Class ${cls} Biology.
Chapter: "${chapter}"${subunit ? `, Topic: "${subunit}"` : ""}.
Base ALL questions STRICTLY on this textbook content:

--- BEGIN CONTENT ---
${text.slice(0, 9000)}
--- END CONTENT ---

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON array.

`;

  switch (type) {
    case "paragraph":
      return ctx + `Write 1 comprehensive study passage (400–600 words) covering all key concepts.
Return: [{"content":"<full passage>"}]`;

    case "pointer_notes":
      return ctx + `Create 12–15 concise revision bullet points covering all key facts.
Return: [{"points":["point 1","point 2","point 3","..."]}]`;

    case "tricks":
      return ctx + `Create ${count} memory tricks or mnemonics to remember key facts from this topic.
Return: [{"trick":"<mnemonic>","full_form":"<expansion if acronym, else empty>","explanation":"<how to use>"}]`;

    case "mcq":
      return ctx + `Create ${count} NEET-standard MCQ questions. 4 options, exactly 1 correct.
Return: [{"question":"...","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "assertion":
      return ctx + `Create ${count} Assertion-Reason questions (NEET pattern).
Options are ALWAYS exactly these strings:
option1 = "Both A and R are correct and R is the correct explanation of A"
option2 = "Both A and R are correct but R is not the correct explanation of A"
option3 = "A is correct but R is incorrect"
option4 = "A is incorrect but R is incorrect"
Return: [{"question":"Assertion: <A>\\nReason: <R>","option1":"Both A and R are correct and R is the correct explanation of A","option2":"Both A and R are correct but R is not the correct explanation of A","option3":"A is correct but R is incorrect","option4":"A is incorrect but R is incorrect","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "statements":
      return ctx + `Create ${count} "How many of the following statements are correct?" questions with 4 statements each.
Return: [{"question":"How many of the following statements are correct?\\n(i) <s1>\\n(ii) <s2>\\n(iii) <s3>\\n(iv) <s4>","option1":"Only one","option2":"Only two","option3":"Only three","option4":"All four","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "truefalse":
      return ctx + `Create ${count} True/False style MCQ questions presenting 4 statements. Ask which combination is correct.
Return: [{"question":"Which of the following statements are CORRECT?\\n(i) <s1>\\n(ii) <s2>\\n(iii) <s3>\\n(iv) <s4>","option1":"(i) and (ii) only","option2":"(i), (ii) and (iii) only","option3":"(ii) and (iv) only","option4":"(i), (iii) and (iv) only","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "fillblanks":
      return ctx + `Create ${count} Fill in the Blank questions. Use _____ as the blank in the question.
Return: [{"question":"<sentence with _____ blank>","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "match":
      return ctx + `Create ${count} Match the Column questions. Column A has items 1–4, Column B has items a–d.
Return: [{"question":"Match Column A with Column B:\\nColumn A:\\n1. <item>\\n2. <item>\\n3. <item>\\n4. <item>\\nColumn B:\\na. <item>\\nb. <item>\\nc. <item>\\nd. <item>","option1":"1-a, 2-b, 3-c, 4-d","option2":"1-b, 2-c, 3-d, 4-a","option3":"1-c, 2-d, 3-a, 4-b","option4":"1-d, 2-a, 3-b, 4-c","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "diagram":
      return ctx + `Create ${count} diagram-based conceptual questions referencing biological structures or figures.
Return: [{"question":"...","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "table_based":
      return ctx + `Create ${count} table-based MCQ questions. Include a small comparison/data table in the question text using plain text formatting.
Return: [{"question":"Study the table and answer:\\n| Feature | ... | ... |\\n|---------|-----|-----|\\n| ... | ... | ... |\\n<question>","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"easy|medium|hard"}]`;

    case "pyq":
      return ctx + `Create ${count} Previous Year NEET Exam style questions (NEET 2010–2024 patterns). Make them challenging.
Return: [{"question":"...","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1|option2|option3|option4","explanation":"...","difficulty":"medium|hard","year":"NEET <year> style"}]`;

    default:
      return ctx + `Create ${count} MCQ questions.
Return: [{"question":"...","option1":"...","option2":"...","option3":"...","option4":"...","correct":"option1","explanation":"...","difficulty":"medium"}]`;
  }
}

function toQuestions(raw: any[], type: GenType, chapter: string, subunit: string, cls: string) {
  const base = { type, chapter, subunit, class: cls, subject: "Biology", is_active: true };

  if (type === "paragraph") {
    return raw.slice(0, 1).map((r) => ({
      ...base,
      question: `Passage: ${chapter}${subunit ? " — " + subunit : ""}`,
      option1: "", option2: "", option3: "", option4: "",
      correct: "option1", explanation: "", difficulty: "easy",
      meta: { content: r.content || "" },
    })).filter((q) => (q.meta.content || "").length > 50);
  }

  if (type === "pointer_notes") {
    return raw.slice(0, 1).map((r) => ({
      ...base,
      question: `Revision Notes: ${chapter}${subunit ? " — " + subunit : ""}`,
      option1: "", option2: "", option3: "", option4: "",
      correct: "option1", explanation: "", difficulty: "easy",
      meta: { points: Array.isArray(r.points) ? r.points : [] },
    })).filter((q) => (q.meta.points || []).length > 3);
  }

  if (type === "tricks") {
    return raw.map((r) => ({
      ...base,
      question: r.trick || "Memory Trick",
      option1: "", option2: "", option3: "", option4: "",
      correct: "option1",
      explanation: r.explanation || "",
      difficulty: "easy",
      meta: { trick: r.trick || "", full_form: r.full_form || "" },
    })).filter((q) => (q.question || "").length > 5);
  }

  return raw.map((r) => ({
    ...base,
    question: r.question || "",
    option1: r.option1 || "",
    option2: r.option2 || "",
    option3: r.option3 || "",
    option4: r.option4 || "",
    correct: ["option1","option2","option3","option4"].includes(r.correct) ? r.correct : "option1",
    explanation: r.explanation || "",
    difficulty: ["easy","medium","hard"].includes(r.difficulty) ? r.difficulty : "medium",
    meta: type === "pyq" ? { year: r.year || "NEET style" } : null,
  })).filter((q) => (q.question || "").trim().length > 10 && (q.option1 || "").trim().length > 0);
}

router.post("/admin/ai-generate-questions", async (req, res) => {
  const apiKey = await getGeminiKey();
  if (!apiKey) return res.status(503).json({ error: "GEMINI_API_KEY not configured on server" });

  const { text, chapter, subunit = "", cls = "11", type, count = 20 } = req.body as {
    text: string; chapter: string; subunit?: string; cls?: string; type: GenType; count?: number;
  };

  if (!text || !chapter || !type) {
    return res.status(400).json({ error: "text, chapter, and type are required" });
  }

  const prompt = buildPrompt(type as GenType, text, chapter, subunit, cls, count);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000);

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: `Gemini API error: ${errText.slice(0, 300)}` });
    }

    const data = (await response.json()) as any;
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let parsed: any[];
    try {
      parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      const m = rawText.match(/\[[\s\S]*\]/);
      try { parsed = m ? JSON.parse(m[0]) : []; } catch { parsed = []; }
    }

    const questions = toQuestions(parsed, type as GenType, chapter, subunit, cls);
    res.json({ questions, count: questions.length });
  } catch (err: any) {
    if (err?.name === "AbortError") return res.status(504).json({ error: "Timed out. Try shorter text." });
    res.status(500).json({ error: String(err) });
  }
});

export default router;
