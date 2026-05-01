export interface ParsedQuestion {
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

export interface ParseResult {
  subUnit: string;
  questions: ParsedQuestion[];
}

const LETTER_MAP: Record<string, string> = {
  A: "option1",
  B: "option2",
  C: "option3",
  D: "option4",
};

function letterToKey(letter: string): string {
  return LETTER_MAP[letter?.toUpperCase().trim()] ?? "option1";
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function extractOptions(text: string): Record<string, string> {
  const opts: Record<string, string> = { A: "", B: "", C: "", D: "" };
  const matches = [...text.matchAll(/([A-D])\)\s*([\s\S]*?)(?=(?:[A-D]\))|$)/g)];
  for (const m of matches) {
    opts[m[1]] = clean(m[2]);
  }
  return opts;
}

function splitIntoQBlocks(content: string): Array<{ num: number; text: string }> {
  const blocks: Array<{ num: number; text: string }> = [];
  const matches = [...content.matchAll(/Q(\d+)\s/g)];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
    blocks.push({ num: parseInt(matches[i][1]), text: content.slice(start, end) });
  }
  return blocks;
}

function parseAnswerKey(text: string): Record<string, Record<number, string>> {
  const ak: Record<string, Record<number, string>> = {
    type1: {},
    type2: {},
    type3: {},
    type4: {},
    type5: {},
    type6: {},
    type7: {},
  };

  // Find answer key section — supports "■ Answer Key", "Answer Key:", or inline answer lines
  const akIdx = text.search(/(?:■\s*)?Answer\s*Key[:\s]/i);
  // Also detect inline answer key blocks that start with "Basic MCQs:" pattern
  const inlineAkIdx = text.search(/(?:^|\n)\s*Basic MCQs\s*:/im);
  const startIdx = akIdx !== -1 ? akIdx : inlineAkIdx !== -1 ? inlineAkIdx : -1;
  if (startIdx === -1) return ak;
  const akText = text.slice(startIdx);

  // Helper: extract answers from a section string — supports both "Q1: A" and "Q1-A | Q2-B" formats
  function extractQAnswers(s: string): Record<number, string> {
    const result: Record<number, string> = {};
    // Format: Q1-A | Q2-B | Q3-C  OR  Q1: A  Q2: B
    for (const m of s.matchAll(/Q(\d+)[:\-]\s*([A-D])/gi)) result[+m[1]] = m[2].toUpperCase();
    return result;
  }

  const t1 = akText.match(/Basic\s*MCQs[^:\n]*:\s*([^\n]+)/i);
  if (t1) {
    // Supports "1-A, 2-B" and "Q1-A | Q2-B" formats
    for (const m of t1[1].matchAll(/(?:Q)?(\d+)[:\-]\s*([A-D])/gi)) ak.type1[+m[1]] = m[2].toUpperCase();
  }

  const t2 = akText.match(/Match[^:\n]*:\s*([\s\S]*?)(?=Assertion|No\.|True[\s\/]False|Fill|Table|SUB-UNIT|$)/i);
  if (t2) Object.assign(ak.type2, extractQAnswers(t2[1]));

  const t3 = akText.match(/Assertion[^:\n]*:\s*([\s\S]*?)(?=No\.\s*of|True[\s\/]False|Fill|Table|SUB-UNIT|$)/i);
  if (t3) Object.assign(ak.type3, extractQAnswers(t3[1]));

  const t4 = akText.match(/No\.\s*of[^:\n]*\n?[^:\n]*:\s*([\s\S]*?)(?=True[\s\/]False|Fill|Table|SUB-UNIT|$)/i);
  if (t4) Object.assign(ak.type4, extractQAnswers(t4[1]));

  const t5 = akText.match(/True[\s\/]False[^:\n]*:\s*([\s\S]*?)(?=Fill|Table|SUB-UNIT|$)/i);
  if (t5) Object.assign(ak.type5, extractQAnswers(t5[1]));

  const t6 = akText.match(/Fill\s*in[^:\n]*:\s*([^\n]+)/i);
  if (t6) {
    for (const m of t6[1].matchAll(/(?:Q)?(\d+)[:\-]\s*([A-D])/gi)) ak.type6[+m[1]] = m[2].toUpperCase();
  }

  const t7 = akText.match(/Table[^:\n]*:\s*([\s\S]*?)(?=SUB-UNIT|$)/i);
  if (t7) Object.assign(ak.type7, extractQAnswers(t7[1]));

  return ak;
}

function parseMCQSection(
  content: string,
  type: string,
  answerKey: Record<number, string>,
  difficulty: string,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");
    const optStart = text.search(/[A-D]\)/);
    if (optStart === -1) continue;
    const qText = clean(text.slice(0, optStart));
    if (!qText) continue;
    const opts = extractOptions(text.slice(optStart));
    const correct = letterToKey(answerKey[block.num] ?? "A");
    questions.push({
      question: qText,
      option1: opts.A,
      option2: opts.B,
      option3: opts.C,
      option4: opts.D,
      correct,
      type,
      difficulty,
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: null,
    });
  }
  return questions;
}

function parseMatchSection(
  content: string,
  answerKey: Record<number, string>,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");
    const optStart = text.search(/[A-D]\)/);
    if (optStart === -1) continue;

    const bodyText = text.slice(0, optStart);
    const opts = extractOptions(text.slice(optStart));

    const colAEntries: string[] = [];
    const colBEntries: string[] = [];

    const colAIdx = bodyText.search(/Column\s*A/i);
    const colBIdx = bodyText.search(/Column\s*B/i);

    if (colAIdx !== -1 && colBIdx !== -1) {
      const colAText = bodyText.slice(colAIdx, colBIdx);
      const colBText = bodyText.slice(colBIdx);
      for (const m of colAText.matchAll(/\d+\.\s+(.*?)(?=\d+\.|$)/gs)) {
        const v = clean(m[1]);
        if (v) colAEntries.push(v);
      }
      for (const m of colBText.matchAll(/[P-S]\.\s+(.*?)(?=[P-S]\.|$)/gs)) {
        const v = clean(m[1]);
        if (v) colBEntries.push(v);
      }
    }

    const answerLetter = answerKey[block.num] ?? "A";
    const correct = letterToKey(answerLetter);
    const correctOptText = opts[answerLetter] ?? opts.A ?? "";
    const correctMapping = parseMatchMapping(correctOptText);

    questions.push({
      question: "Match the following:",
      option1: opts.A,
      option2: opts.B,
      option3: opts.C,
      option4: opts.D,
      correct,
      type: "match",
      difficulty: "medium",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: {
        colLeft: colAEntries,
        colRight: colBEntries,
        correctMapping,
      },
    });
  }
  return questions;
}

function parseMatchMapping(optText: string): number[] {
  const letterToIdx: Record<string, number> = { P: 0, Q: 1, R: 2, S: 3 };
  const mapping: number[] = [];
  for (const m of optText.matchAll(/\d+-([P-S])/g)) {
    mapping.push(letterToIdx[m[1]] ?? 0);
  }
  return mapping.length > 0 ? mapping : [0, 1, 2, 3];
}

function parseAssertionSection(
  content: string,
  answerKey: Record<number, string>,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");
    const assertMatch = text.match(/Assertion\s*\(A\)\s*:\s*([\s\S]*?)(?=Reason\s*\(R\)|[A-D]\)|$)/i);
    const reasonMatch = text.match(/Reason\s*\(R\)\s*:\s*([\s\S]*?)(?=[A-D]\)|$)/i);
    if (!assertMatch) continue;

    const assertion = clean(assertMatch[1]);
    const reason = reasonMatch ? clean(reasonMatch[1]) : "";
    const optStart = text.search(/[A-D]\)/);
    const opts = optStart !== -1 ? extractOptions(text.slice(optStart)) : {};
    const correct = letterToKey(answerKey[block.num] ?? "A");

    questions.push({
      question: `Assertion (A): ${assertion}`,
      option1: opts.A || "Both A & R true — R is correct explanation of A",
      option2: opts.B || "Both A & R true — R is NOT correct explanation",
      option3: opts.C || "A true, R false",
      option4: opts.D || "A false, R true",
      correct,
      type: "assertion",
      difficulty: "hard",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: { statementR: reason },
    });
  }
  return questions;
}

function parseStatementsSection(
  content: string,
  answerKey: Record<number, string>,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");
    const stmtStart = text.search(/\(i\)/i);
    const optStart = text.search(/[A-D]\)/);
    if (optStart === -1) continue;

    const qHeader = clean(text.slice(0, stmtStart !== -1 ? stmtStart : optStart));
    const stmtsText = stmtStart !== -1 ? text.slice(stmtStart, optStart) : "";
    const labels = ["i", "ii", "iii", "iv"];
    const stmts: string[] = [];
    for (const m of stmtsText.matchAll(/\((i{1,3}v?)\)\s*([\s\S]*?)(?=\((i{1,3}v?)\)|$)/g)) {
      const v = clean(m[2].replace(/\((i{1,3}v?)\)\s*$/, ""));
      if (v.length > 2) stmts.push(v);
    }

    const fullQ = qHeader + (stmts.length ? "\n" + stmts.map((s, i) => `(${labels[i] ?? i + 1}) ${s}`).join("\n") : "");
    const opts = extractOptions(text.slice(optStart));
    const correct = letterToKey(answerKey[block.num] ?? "C");

    questions.push({
      question: fullQ,
      option1: opts.A || "Only 1",
      option2: opts.B || "Only 2",
      option3: opts.C || "Only 3",
      option4: opts.D || "All 4",
      correct,
      type: "statements",
      difficulty: "medium",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: null,
    });
  }
  return questions;
}

function parseTrueFalseSection(
  content: string,
  answerKey: Record<number, string>,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");
    const stmtStart = text.search(/\(i\)/i);
    const optStart = text.search(/[A-D]\)/);
    if (optStart === -1) continue;

    const stmtsText = stmtStart !== -1 ? text.slice(stmtStart, optStart) : "";
    const labels = ["i", "ii", "iii", "iv"];
    const stmts: string[] = [];
    for (const m of stmtsText.matchAll(/\((i{1,3}v?)\)\s*([\s\S]*?)(?=\((i{1,3}v?)\)|$)/g)) {
      const v = clean(m[2].replace(/\((i{1,3}v?)\)\s*$/, ""));
      if (v.length > 2) stmts.push(v);
    }

    const fullQ =
      "Identify whether each statement is True (T) or False (F):\n" +
      stmts.map((s, i) => `(${labels[i] ?? i + 1}) ${s}`).join("\n");

    const opts = extractOptions(text.slice(optStart));
    const correct = letterToKey(answerKey[block.num] ?? "A");

    questions.push({
      question: fullQ,
      option1: opts.A,
      option2: opts.B,
      option3: opts.C,
      option4: opts.D,
      correct,
      type: "truefalse",
      difficulty: "medium",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: null,
    });
  }
  return questions;
}

function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const tableLines = lines.filter((l) => l.startsWith("|") && l.endsWith("|"));
  if (tableLines.length < 2) return null;

  const parseRow = (line: string) =>
    line.split("|").slice(1, -1).map((c) => c.trim());

  const headerRow = parseRow(tableLines[0]);
  const dataRows = tableLines
    .slice(1)
    .filter((l) => !l.match(/^\|[\s\-:|]+\|$/))
    .map(parseRow);

  if (headerRow.length === 0 || dataRows.length === 0) return null;
  return { headers: headerRow, rows: dataRows };
}

function parseTableSection(
  content: string,
  answerKey: Record<number, string>,
  chapter: string,
  subunit: string,
  cls: string
): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^Q\d+\s*/, "");

    // Find the table (lines starting with |)
    const tableMatch = text.match(/((?:\|[^\n]+\|\n?)+)/);
    const tableData = tableMatch ? parseMarkdownTable(tableMatch[1]) : null;

    // Question text = everything before the table (or whole text if no table)
    const qEndIdx = tableMatch ? text.indexOf(tableMatch[0]) : text.search(/[A-D]\)/);
    const rawQ = clean(text.slice(0, qEndIdx > 0 ? qEndIdx : text.length));

    // Options come after the table
    const afterTable = tableMatch
      ? text.slice(text.indexOf(tableMatch[0]) + tableMatch[0].length)
      : text;
    const optStart = afterTable.search(/[A-D]\)/);
    if (optStart === -1 && !tableData) continue;

    const opts = optStart !== -1 ? extractOptions(afterTable.slice(optStart)) : { A: "", B: "", C: "", D: "" };
    const correct = letterToKey(answerKey[block.num] ?? "A");

    const qText = rawQ || "Study the table and answer:";

    questions.push({
      question: qText,
      option1: opts.A,
      option2: opts.B,
      option3: opts.C,
      option4: opts.D,
      correct,
      type: "table_based",
      difficulty: "medium",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit,
      class: cls,
      is_active: true,
      meta: tableData ? { tableData } : null,
    });
  }

  return questions;
}

export function parseNEETQuestionBank(
  text: string,
  chapter: string,
  subunit: string,
  cls: string
): ParseResult {
  const questions: ParsedQuestion[] = [];

  const subUnitMatch = text.match(/Sub-Unit:\s*(.+)/);
  const detectedSubUnit = subUnitMatch ? clean(subUnitMatch[1]) : subunit;

  const ak = parseAnswerKey(text);
  const mainText = text.replace(/■\s*Answer\s*Key[\s\S]*/i, "");

  // Map each section type label → internal key
  const SECTION_HEADERS: Array<{ key: string; re: RegExp }> = [
    { key: "passage",  re: /[■✏]{1,2}\s*Read the Passage Carefully/gi },
    { key: "notes",    re: /[■✏]{1,2}\s*Quick Revision Notes/gi },
    { key: "type1",    re: /[■✏]{1,2}\s*Type\s*1\s*[—\-]/gi },
    { key: "type2",    re: /[■✏]{1,2}\s*Type\s*2\s*[—\-]/gi },
    { key: "type3",    re: /[■✏]{1,2}\s*Type\s*3\s*[—\-]/gi },
    { key: "type4",    re: /[■✏]{1,2}\s*Type\s*4\s*[—\-]/gi },
    { key: "type5",    re: /[■✏]{1,2}\s*Type\s*5\s*[—\-]/gi },
    { key: "type6",    re: /[■✏]{1,2}\s*Type\s*6\s*[—\-]/gi },
    { key: "type7",    re: /[■✏]{1,2}\s*Type\s*7\s*[—\-]/gi },
    // Diagram Based — skip (image questions added manually)
    { key: "skip",     re: /[■✏]{1,2}\s*Type\s*8\s*[—\-]/gi },
    { key: "skip",     re: /[■✏]{1,2}\s*Type\s*[9][—\-]/gi },
    { key: "skip",     re: /[■✏]{1,2}\s*Type\s*1[0-9]\s*[—\-]/gi },
    { key: "skip",     re: /[■✏]{1,2}\s*Diagram\s*(Based)?/gi },
  ];

  // Also track Sub-Unit headings so multi-sub-unit PDFs get correct labels
  // Supports: "Sub-Unit: NAME", "SUB-UNIT 14.5 — NAME", "SUB-UNIT 14.5 - NAME"
  const subUnitHeadings: Array<{ name: string; start: number }> = [];
  const SUB_UNIT_RE = /(?:Sub-Unit:\s*(.+)|SUB-UNIT\s+[\d.]+\s*[—\-]+\s*(.+))/gi;
  for (const m of mainText.matchAll(SUB_UNIT_RE)) {
    if (m.index !== undefined) {
      const raw = (m[1] || m[2] || "").trim();
      const name = clean(raw);
      if (name) subUnitHeadings.push({ name, start: m.index });
    }
  }

  // Find ALL occurrences of every section header (handles multiple sub-units per PDF)
  const positions: Array<{ key: string; start: number; end: number }> = [];
  for (const { key, re } of SECTION_HEADERS) {
    for (const m of mainText.matchAll(re)) {
      if (m.index !== undefined) {
        positions.push({ key, start: m.index, end: m.index + m[0].length });
      }
    }
  }
  positions.sort((a, b) => a.start - b.start);

  // Helper: get the nearest sub-unit heading before a given position
  function subUnitAt(pos: number): string {
    let best = detectedSubUnit || subunit;
    for (const h of subUnitHeadings) {
      if (h.start <= pos) best = h.name;
    }
    return best || subunit;
  }

  const sections: Array<{ type: string; content: string; sectionStart: number }> = [];
  for (let i = 0; i < positions.length; i++) {
    const nextStart = i + 1 < positions.length ? positions[i + 1].start : mainText.length;
    sections.push({
      type: positions[i].key,
      content: mainText.slice(positions[i].end, nextStart),
      sectionStart: positions[i].start,
    });
  }

  for (const sec of sections) {
    if (sec.type === "skip") {
      // Diagram Based / Table Based — skip entirely
      continue;
    }

    const secSubUnit = subUnitAt(sec.sectionStart);

    if (sec.type === "passage") {
      const passageText = clean(sec.content.replace(/\n+/g, " "));
      if (passageText.length > 20) {
        questions.push({
          question: passageText,
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correct: "option1",
          type: "paragraph",
          difficulty: "easy",
          explanation: "",
          subject: "Biology",
          chapter,
          subunit: secSubUnit,
          class: cls,
          is_active: true,
          meta: { highlights: [] },
        });
      }
    } else if (sec.type === "notes") {
      const bullets: string[] = [];
      for (const line of sec.content.split("\n")) {
        const b = clean(line.replace(/^[●•\*]\s*/, ""));
        if (b.length > 5 && !b.match(/^(Quick Revision|Line-by-Line)/i)) bullets.push(b);
      }
      if (bullets.length > 0) {
        questions.push({
          question: "Quick Revision Notes",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correct: "option1",
          type: "pointer_notes",
          difficulty: "easy",
          explanation: "",
          subject: "Biology",
          chapter,
          subunit: secSubUnit,
          class: cls,
          is_active: true,
          meta: { bullets },
        });
      }
    } else if (sec.type === "type1") {
      questions.push(...parseMCQSection(sec.content, "mcq", ak.type1, "medium", chapter, secSubUnit, cls));
    } else if (sec.type === "type2") {
      questions.push(...parseMatchSection(sec.content, ak.type2, chapter, secSubUnit, cls));
    } else if (sec.type === "type3") {
      questions.push(...parseAssertionSection(sec.content, ak.type3, chapter, secSubUnit, cls));
    } else if (sec.type === "type4") {
      questions.push(...parseStatementsSection(sec.content, ak.type4, chapter, secSubUnit, cls));
    } else if (sec.type === "type5") {
      questions.push(...parseTrueFalseSection(sec.content, ak.type5, chapter, secSubUnit, cls));
    } else if (sec.type === "type6") {
      questions.push(...parseMCQSection(sec.content, "fillblanks", ak.type6, "easy", chapter, secSubUnit, cls));
    } else if (sec.type === "type7") {
      questions.push(...parseTableSection(sec.content, ak.type7, chapter, secSubUnit, cls));
    }
  }

  return { subUnit: detectedSubUnit, questions };
}

// ─── General-purpose NEET MCQ parser ────────────────────────────────────────
// Handles standard NEET/competitive-exam PDFs that use common question
// numbering conventions (not the BioPrep-specific format above).

const OPTION_LETTERS = ["A", "B", "C", "D"];

/** Extract options that use any of these patterns:
 *   (A) text   A. text   A) text   a) text   (a) text
 *   1) text    (1) text  1. text  (i) text
 */
function extractGeneralOptions(text: string): { A: string; B: string; C: string; D: string } {
  const opts: { A: string; B: string; C: string; D: string } = { A: "", B: "", C: "", D: "" };

  // Try letter-based options first: (A) / A) / A. / (a)
  const letterPat = /(?:^|\s)[\(\[]?([A-Da-d])[\)\]\.]\s*([\s\S]*?)(?=(?:^|\s)[\(\[]?[A-Da-d][\)\]\.]|$)/gm;
  const lMatches = [...text.matchAll(letterPat)];
  if (lMatches.length >= 2) {
    for (const m of lMatches) {
      const key = m[1].toUpperCase() as "A" | "B" | "C" | "D";
      if (OPTION_LETTERS.includes(key)) opts[key] = clean(m[2]);
    }
    return opts;
  }

  // Try numbered options: (1) / 1) / 1. — map to A/B/C/D
  const numPat = /(?:^|\s)[\(\[]?([1-4])[\)\]\.]\s*([\s\S]*?)(?=(?:^|\s)[\(\[]?[1-4][\)\]\.]|$)/gm;
  const nMatches = [...text.matchAll(numPat)];
  for (const m of nMatches) {
    const idx = parseInt(m[1]) - 1;
    const key = OPTION_LETTERS[idx] as "A" | "B" | "C" | "D";
    if (key) opts[key] = clean(m[2]);
  }
  return opts;
}

/** Split raw text into question blocks supporting many numbering styles:
 *  1. / Q1. / Q. 1 / (1) / 1) / Q1) / Q.1
 */
function splitGeneralQBlocks(text: string): Array<{ num: number; text: string }> {
  // Patterns to detect question starts
  const Q_START = /(?:^|\n)\s*(?:Q\.?\s*)?(\d{1,3})[.\)]\s+(?=[A-Z\(])/g;
  const blocks: Array<{ num: number; start: number }> = [];
  for (const m of text.matchAll(Q_START)) {
    blocks.push({ num: parseInt(m[1]), start: m.index! });
  }

  return blocks.map((b, i) => ({
    num: b.num,
    text: text.slice(b.start, i + 1 < blocks.length ? blocks[i + 1].start : text.length),
  }));
}

/** Parse an answer key block at end of PDF.
 *  Supports: "1. A  2. B  3. C ..." or "1-A, 2-B ..." or table rows "1 A"
 */
function parseGeneralAnswerKey(text: string): Record<number, string> {
  const ak: Record<number, string> = {};

  // Look for answer key section
  const akIdx = text.search(/answer\s*(key|sheet|s)?[:\s]/i);
  const akText = akIdx !== -1 ? text.slice(akIdx) : text.slice(-2000);

  // Pattern: number followed by letter (A-D or a-d)
  const patterns = [
    /(\d+)[.\):\-\s]+([A-Da-d])\b/g,
  ];

  for (const pat of patterns) {
    for (const m of akText.matchAll(pat)) {
      ak[parseInt(m[1])] = m[2].toUpperCase();
    }
  }
  return ak;
}

/**
 * Fallback parser for standard NEET / competitive exam PDFs.
 * Call this when the BioPrep-specific parser returns 0 questions.
 */
export function parseGeneralNEET(
  text: string,
  chapter: string,
  subunit: string,
  cls: string
): ParseResult {
  const questions: ParsedQuestion[] = [];
  const ak = parseGeneralAnswerKey(text);

  // Remove answer key section before parsing questions
  const mainText = text.replace(/answer\s*(key|sheet|s)?[:\s][\s\S]*/i, "");

  const blocks = splitGeneralQBlocks(mainText);

  for (const block of blocks) {
    const rawText = block.text.replace(/^\s*(?:Q\.?\s*)?\d+[.\)]\s*/, "");

    // Find where options start — look for first A) / (A) / A. / 1) / (1)
    const optStart = rawText.search(/(?:^|\s)[\(\[]?[A-Da-d1-4][\)\]\.]\s+\S/m);
    if (optStart === -1) continue;

    const qText = clean(rawText.slice(0, optStart));
    if (qText.length < 5) continue;

    const optText = rawText.slice(optStart);
    const opts = extractGeneralOptions(optText);

    // Only keep if at least 2 options are non-empty
    const nonEmpty = Object.values(opts).filter(Boolean).length;
    if (nonEmpty < 2) continue;

    const answerLetter = ak[block.num] ?? "";
    let correct = "option1";
    if (answerLetter) {
      correct = letterToKey(answerLetter);
    }

    questions.push({
      question: qText,
      option1: opts.A || "",
      option2: opts.B || "",
      option3: opts.C || "",
      option4: opts.D || "",
      correct,
      type: "mcq",
      difficulty: "medium",
      explanation: "",
      subject: "Biology",
      chapter,
      subunit: subunit || "",
      class: cls,
      is_active: true,
      meta: null,
    });
  }

  return { subUnit: subunit, questions };
}
