export interface ParsedQuestion {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  type: string;
  meta?: any;
}

// ---------------- CLEAN ----------------
function clean(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

// ---------------- SPLIT ----------------
function splitBlocks(text: string) {
  const regex = /TYPE:\s*(\w+)[\s\S]*?Q\d+\.[\s\S]*?(?=(\nTYPE:|\nQ\d+\.|$))/g;
  const blocks: { type: string; text: string }[] = [];

  if (!text) return blocks;

  for (const m of text.matchAll(regex)) {
    if (!m || !m[0] || !m[1]) continue;

    blocks.push({
      type: m[1].toUpperCase(),
      text: m[0],
    });
  }

  return blocks;
}

// ---------------- OPTIONS ----------------
function extractOptions(text: string) {
  const opts: Record<string, string> = { A: "", B: "", C: "", D: "" };
  if (!text) return opts;

  const regex = /\n([A-D])\)\s*([^\n]+)/g;

  for (const m of text.matchAll(regex)) {
    if (!m || !m[1]) continue;
    opts[m[1]] = clean(m[2]);
  }

  return opts;
}

// ---------------- ANSWER ----------------
function extractAnswer(text: string) {
  if (!text) return "";
  const m = text.match(/ANS:\s*([A-D])/i);
  return m && m[1] ? m[1].toUpperCase() : "";
}

// ---------------- TYPE MAP ----------------
function mapType(type: string) {
  switch ((type || "").toUpperCase()) {
    case "PARAGRAPH": return "paragraph";
    case "POINTER": return "pointer_notes";
    case "MCQ": return "mcq";
    case "ASSERTION": return "assertion_reason";
    case "STATEMENTS": return "no_of_correct";
    case "TRUEFALSE": return "true_false";
    case "FILL": return "fill_blanks";
    case "MATCH": return "match_column";
    case "DIAGRAM": return "diagram_based";
    case "TABLE": return "table_based";
    default: return "mcq";
  }
}

// ---------------- MATCH PARSER ----------------
function parseMatch(raw: string) {
  try {
    if (!raw) {
      return { columnA: [], columnB: [], correctMapping: [0, 1, 2, 3] };
    }

    const colA: string[] = [];
    const colB: string[] = [];

    const colAText = raw.split("COLUMN_A:")[1]?.split("COLUMN_B:")[0] || "";
    const colBText = raw.split("COLUMN_B:")[1]?.split("OPTIONS:")[0] || "";

    for (const m of colAText.matchAll(/\d+\.\s*(.*)/g)) {
      if (m && m[1]) colA.push(clean(m[1]));
    }

    for (const m of colBText.matchAll(/[P-S]\.\s*(.*)/g)) {
      if (m && m[1]) colB.push(clean(m[1]));
    }

    const opts = extractOptions(raw);
    const ans = extractAnswer(raw);

    const mappingText = ans && opts[ans] ? opts[ans] : "";

    const map: number[] = [];
    const idx: Record<string, number> = { P: 0, Q: 1, R: 2, S: 3 };

    if (mappingText) {
      for (const m of mappingText.matchAll(/\d+-([P-S])/g)) {
        if (m && m[1]) map.push(idx[m[1]]);
      }
    }

    return {
      columnA: colA,
      columnB: colB,
      correctMapping: map.length ? map : [0, 1, 2, 3],
    };
  } catch (e) {
    console.error("MATCH PARSE ERROR", e);
    return { columnA: [], columnB: [], correctMapping: [0, 1, 2, 3] };
  }
}

// ---------------- MAIN PARSER ----------------
export function parse(text: string): ParsedQuestion[] {
  try {
    if (!text || typeof text !== "string") return [];

    if (!text.includes("TYPE:")) {
      console.warn("Invalid input: missing TYPE");
      return [];
    }

    const blocks = splitBlocks(text);
    const result: ParsedQuestion[] = [];

    for (const block of blocks || []) {
      if (!block || !block.text) continue;

      try {
        const raw = block.text;
        const type = mapType(block.type);

        // ---------- MATCH ----------
        if (block.type === "MATCH") {
          result.push({
            question: "Match the following:",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correct: "",
            type,
            meta: parseMatch(raw),
          });
          continue;
        }

        // ---------- PARAGRAPH / POINTER ----------
        if (block.type === "PARAGRAPH" || block.type === "POINTER") {
          const q = clean(
            raw
              .replace(/TYPE:\s*\w+/i, "")
              .replace(/Q\d+\.\s*/, "")
              .replace(/ANS:\s*-/i, "")
          );

          result.push({
            question: q,
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correct: "",
            type,
          });
          continue;
        }

        // ---------- NORMAL ----------
        const optStart = raw.search(/\n[A-D]\)/);
        if (optStart === -1) continue;

        const qText = clean(
          raw
            .slice(0, optStart)
            .replace(/TYPE:\s*\w+/i, "")
            .replace(/Q\d+\.\s*/, "")
        );

        const opts = extractOptions(raw.slice(optStart));
        const ans = extractAnswer(raw);

        const index = ["A", "B", "C", "D"].indexOf(ans);

        result.push({
          question: qText,
          option1: opts.A || "",
          option2: opts.B || "",
          option3: opts.C || "",
          option4: opts.D || "",
          correct: index !== -1 ? `option${index + 1}` : "",
          type,
        });

      } catch (innerErr) {
        console.warn("Skipping broken question", innerErr);
        continue;
      }
    }

    return result;
  } catch (err) {
    console.error("PARSER CRASH", err);
    return [];
  }
}

// ---------------- COMPATIBILITY ----------------
export const parseNEETQuestionBank = parse;
export const parseGeneralNEET = parse;
