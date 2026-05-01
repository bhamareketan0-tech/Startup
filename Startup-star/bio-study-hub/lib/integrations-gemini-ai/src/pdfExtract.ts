import { GoogleGenAI } from "@google/genai";

export interface ExtractedQuestion {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  type: string;
  difficulty: string;
  explanation: string;
  subject: string;
  chapter: string;
  subunit: string;
  class: string;
  is_active: boolean;
  meta: Record<string, unknown> | null;
}

const EXTRACTION_PROMPT = `You are an expert NEET Biology MCQ extractor. Your task is to extract ALL questions from this PDF and return them as a JSON array.

IMPORTANT RULES:
1. Extract EVERY question you find — do not skip any, including diagram-based and table-based ones.
2. For diagram-based questions, describe the diagram in the question text (e.g., "The diagram shows a plant cell with labeled parts A, B, C, D. Part A represents...").
3. For table-based questions, include the table content as text in the question.
4. Return ONLY a valid JSON array — no markdown, no explanation, no code blocks.

For each question, return an object with these exact fields:
{
  "question": "Full question text",
  "option1": "Option A text",
  "option2": "Option B text", 
  "option3": "Option C text",
  "option4": "Option D text",
  "correct": "option1" | "option2" | "option3" | "option4",
  "type": "mcq" | "assertion" | "match" | "statements" | "truefalse" | "fillblanks",
  "difficulty": "easy" | "medium" | "hard",
  "explanation": "Answer explanation if present, else empty string",
  "subject": "Biology",
  "chapter": "",
  "subunit": "",
  "class": "11" | "12",
  "is_active": true,
  "meta": null
}

Question type rules:
- "mcq" — standard multiple choice
- "assertion" — assertion-reason type (Assertion: ... Reason: ...)
- "match" — match the column (Column I vs Column II)
- "statements" — "how many statements are correct" type
- "truefalse" — true/false questions
- "fillblanks" — fill in the blanks

Difficulty rules:
- "easy" — straightforward factual recall
- "medium" — application or moderate reasoning
- "hard" — complex multi-step reasoning, diagram analysis, or advanced concepts

For correct answer mapping:
- If answer is A or first option → "option1"
- If answer is B or second option → "option2"
- If answer is C or third option → "option3"
- If answer is D or fourth option → "option4"
- If answer key not present → guess "option1"

NOW EXTRACT ALL QUESTIONS FROM THE PDF. Return ONLY the JSON array.`;

export async function extractQuestionsFromPDF(
  pdfBuffer: Buffer,
  chapterOverride?: string,
  subunitOverride?: string,
  classOverride?: string
): Promise<ExtractedQuestion[]> {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI_INTEGRATIONS_GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const base64Data = pdfBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 65536,
    },
  });

  const text = response.text ?? "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return a valid JSON array. Response: " + text.slice(0, 500));
  }

  let questions: ExtractedQuestion[] = JSON.parse(jsonMatch[0]);

  if (chapterOverride || subunitOverride || classOverride) {
    questions = questions.map((q) => ({
      ...q,
      chapter: chapterOverride || q.chapter,
      subunit: subunitOverride || q.subunit,
      class: classOverride || q.class,
    }));
  }

  return questions;
}
