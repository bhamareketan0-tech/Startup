import { Router } from "express";

const router = Router();

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(text: string): string {
  return `You are a NEET Biology MCQ extractor. Extract EVERY single question from the text below — all 100, 200, 500, or however many there are. Do not skip any.

Return ONLY a valid JSON object. No markdown, no explanation, no extra text:

{
  "questions": [
    {
      "question": "Full question text",
      "option1": "Option A",
      "option2": "Option B",
      "option3": "Option C",
      "option4": "Option D",
      "correct": "option2",
      "type": "mcq",
      "explanation": ""
    }
  ]
}

Rules:
- "correct" must be exactly one of: option1, option2, option3, option4
- "type": mcq | assertion | match | statements | truefalse | fillblanks | table_based
- For assertion-reason: type="assertion", write "Assertion (A): ... Reason (R): ..." in question field
- For match-the-column: type="match", include column data in question
- Extract ALL questions — every single one
- Return ONLY raw JSON, nothing else

TEXT:
${text}`;
}

function parseResponse(raw: string, chapter: string, subunit: string, cls: string) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];
  try {
    const data = JSON.parse(jsonMatch[0]);
    return (data.questions || [])
      .filter((q: Record<string, unknown>) => String(q.question || "").trim().length > 5)
      .map((q: Record<string, unknown>) => ({
        question: String(q.question || "").trim(),
        option1: String(q.option1 || "").trim(),
        option2: String(q.option2 || "").trim(),
        option3: String(q.option3 || "").trim(),
        option4: String(q.option4 || "").trim(),
        correct: ["option1","option2","option3","option4"].includes(q.correct as string)
          ? (q.correct as string) : "option1",
        type: String(q.type || "mcq"),
        difficulty: "medium",
        explanation: String(q.explanation || "").trim(),
        subject: "Biology",
        chapter,
        subunit,
        class: cls,
        is_active: true,
        meta: q.meta || null,
      }));
  } catch {
    return [];
  }
}

router.post("/pdf-extract", async (req, res) => {
  try {
    const { text, chapter, subunit, class: cls } = req.body as Record<string, string>;

    if (!text?.trim()) {
      res.status(400).json({ error: "No text provided for extraction." });
      return;
    }

    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key not configured." });
      return;
    }

    console.log(`PDF extract: ${text.length} chars → ${GEMINI_MODEL}`);

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text) }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const questions = parseResponse(content, chapter || "", subunit || "", cls || "11");

    console.log(`Extracted ${questions.length} questions`);
    res.json({ questions, count: questions.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PDF extract error:", message);
    res.status(500).json({ error: message });
  }
});

export default router;
