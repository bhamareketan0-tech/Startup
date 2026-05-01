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
  return s.replace(/\s+/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

/**
 * Hardened option extraction to handle same-line options and various bracket styles.
 */
function extractOptions(text: string): Record<string, string> {
  const opts: Record<string, string> = { A: "", B: "", C: "", D: "" };
  
  // Supports A), (A), A., 1), (1), 1.
  const pattern = /[\(\[]?([A-D]|[1-4])[\)\]\.]\s*([\s\S]*?)(?=[\(\[]?[A-D]|[1-4][\)\]\.]|$)/gi;
  const matches = [...text.matchAll(pattern)];
  
  matches.forEach((m) => {
    const rawLabel = m[1].toUpperCase();
    let key = "";
    
    if (["A", "1"].includes(rawLabel)) key = "A";
    else if (["B", "2"].includes(rawLabel)) key = "B";
    else if (["C", "3"].includes(rawLabel)) key = "C";
    else if (["D", "4"].includes(rawLabel)) key = "D";

    if (key) opts[key] = clean(m[2]);
  });

  return opts;
}

/**
 * Robust splitting to catch Q1, Q.1, 1., or 1) 
 */
function splitIntoQBlocks(content: string): Array<{ num: number; text: string }> {
  const blocks: Array<{ num: number; text: string }> = [];
  const qRegex = /(?:(?:^|\n)\s*(?:Q\.?\s*)?(\d+)[.\)]\s+)/gi;
  const matches = [...content.matchAll(qRegex)];
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
    blocks.push({ num: parseInt(matches[i][1]), text: content.slice(start, end) });
  }
  return blocks;
}

function parseAnswerKey(text: string): Record<string, Record<number, string>> {
  const ak: Record<string, Record<number, string>> = {
    type1: {}, type2: {}, type3: {}, type4: {}, type5: {}, type6: {}, type7: {},
  };

  const akIdx = text.search(/(?:■\s*)?Answer\s*Key[:\s]/i);
  const inlineAkIdx = text.search(/(?:^|\n)\s*Basic MCQs\s*:/im);
  const startIdx = akIdx !== -1 ? akIdx : inlineAkIdx !== -1 ? inlineAkIdx : -1;
  if (startIdx === -1) return ak;
  const akText = text.slice(startIdx);

  function extractQAnswers(s: string): Record<number, string> {
    const result: Record<number, string> = {};
    for (const m of s.matchAll(/Q(\d+)[:\-]\s*([A-D])/gi)) result[+m[1]] = m[2].toUpperCase();
    return result;
  }

  const t1 = akText.match(/Basic\s*MCQs[^:\n]*:\s*([^\n]+)/i);
  if (t1) {
    for (const m of t1[1].matchAll(/(?:Q)?(\d+)[:\-]\s*([A-D])/gi)) ak.type1[+m[1]] = m[2].toUpperCase();
  }

  const sections = [
    { key: "type2", re: /Match[^:\n]*:\s*([\s\S]*?)(?=Assertion|No\.|True|Fill|Table|SUB-UNIT|$)/i },
    { key: "type3", re: /Assertion[^:\n]*:\s*([\s\S]*?)(?=No\.\s*of|True|Fill|Table|SUB-UNIT|$)/i },
    { key: "type4", re: /No\.\s*of[^:\n]*\n?[^:\n]*:\s*([\s\S]*?)(?=True|Fill|Table|SUB-UNIT|$)/i },
    { key: "type5", re: /True[\s\/]False[^:\n]*:\s*([\s\S]*?)(?=Fill|Table|SUB-UNIT|$)/i },
    { key: "type7", re: /Table[^:\n]*:\s*([\s\S]*?)(?=SUB-UNIT|$)/i },
  ];

  sections.forEach(sec => {
    const m = akText.match(sec.re);
    if (m) Object.assign(ak[sec.key], extractQAnswers(m[1]));
  });

  const t6 = akText.match(/Fill\s*in[^:\n]*:\s*([^\n]+)/i);
  if (t6) {
    for (const m of t6[1].matchAll(/(?:Q)?(\d+)[:\-]\s*([A-D])/gi)) ak.type6[+m[1]] = m[2].toUpperCase();
  }

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
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const optStart = text.search(/[\(\[]?[A-D][\)\]\.]/i);
    if (optStart === -1) continue;
    const qText = clean(text.slice(0, optStart));
    if (!qText) continue;
    const opts = extractOptions(text.slice(optStart));
    questions.push({
      question: qText,
      option1: opts.A, option2: opts.B, option3: opts.C, option4: opts.D,
      correct: letterToKey(answerKey[block.num] ?? "A"),
      type, difficulty, explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true, meta: null,
    });
  }
  return questions;
}

function parseMatchSection(content: string, answerKey: Record<number, string>, chapter: string, subunit: string, cls: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const optStart = text.search(/[\(\[]?[A-D][\)\]\.]/i);
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
      for (const m of colAText.matchAll(/\d+\.\s+(.*?)(?=\d+\.|$)/gs)) colAEntries.push(clean(m[1]));
      for (const m of colBText.matchAll(/[P-S]\.\s+(.*?)(?=[P-S]\.|$)/gs)) colBEntries.push(clean(m[1]));
    }

    const answerLetter = answerKey[block.num] ?? "A";
    questions.push({
      question: "Match the following:",
      option1: opts.A, option2: opts.B, option3: opts.C, option4: opts.D,
      correct: letterToKey(answerLetter),
      type: "match", difficulty: "medium", explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true,
      meta: { colLeft: colAEntries, colRight: colBEntries, correctMapping: parseMatchMapping(opts[answerLetter] || opts.A || "") },
    });
  }
  return questions;
}

function parseMatchMapping(optText: string): number[] {
  const letterToIdx: Record<string, number> = { P: 0, Q: 1, R: 2, S: 3 };
  const mapping: number[] = [];
  for (const m of optText.matchAll(/\d+-([P-S])/g)) mapping.push(letterToIdx[m[1]] ?? 0);
  return mapping.length > 0 ? mapping : [0, 1, 2, 3];
}

function parseAssertionSection(content: string, answerKey: Record<number, string>, chapter: string, subunit: string, cls: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const assertMatch = text.match(/Assertion\s*\(A\)\s*:\s*([\s\S]*?)(?=Reason\s*\(R\)|[\(\[]?[A-D][\)\]\.]|$)/i);
    const reasonMatch = text.match(/Reason\s*\(R\)\s*:\s*([\s\S]*?)(?=[\(\[]?[A-D][\)\]\.]|$)/i);
    if (!assertMatch) continue;

    const optStart = text.search(/[\(\[]?[A-D][\)\]\.]/i);
    const opts = optStart !== -1 ? extractOptions(text.slice(optStart)) : {};

    questions.push({
      question: `Assertion (A): ${clean(assertMatch[1])}`,
      option1: opts.A || "Both A & R true — R is correct explanation of A",
      option2: opts.B || "Both A & R true — R is NOT correct explanation",
      option3: opts.C || "A true, R false",
      option4: opts.D || "A false, R true",
      correct: letterToKey(answerKey[block.num] ?? "A"),
      type: "assertion", difficulty: "hard", explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true, meta: { statementR: reasonMatch ? clean(reasonMatch[1]) : "" },
    });
  }
  return questions;
}

function parseStatementsSection(content: string, answerKey: Record<number, string>, chapter: string, subunit: string, cls: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const stmtStart = text.search(/\(i\)/i);
    const optStart = text.search(/[\(\[]?[A-D][\)\]\.]/i);
    if (optStart === -1) continue;

    const qHeader = clean(text.slice(0, stmtStart !== -1 ? stmtStart : optStart));
    const stmtsText = stmtStart !== -1 ? text.slice(stmtStart, optStart) : "";
    const stmts: string[] = [];
    for (const m of stmtsText.matchAll(/\((i{1,3}v?)\)\s*([\s\S]*?)(?=\((i{1,3}v?)\)|$)/g)) {
      const v = clean(m[2]);
      if (v.length > 2) stmts.push(v);
    }

    const fullQ = qHeader + (stmts.length ? "\n" + stmts.map((s, i) => `(${i + 1}) ${s}`).join("\n") : "");
    const opts = extractOptions(text.slice(optStart));
    questions.push({
      question: fullQ,
      option1: opts.A || "Only 1", option2: opts.B || "Only 2", option3: opts.C || "Only 3", option4: opts.D || "All 4",
      correct: letterToKey(answerKey[block.num] ?? "C"),
      type: "statements", difficulty: "medium", explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true, meta: null,
    });
  }
  return questions;
}

function parseTrueFalseSection(content: string, answerKey: Record<number, string>, chapter: string, subunit: string, cls: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const stmtStart = text.search(/\(i\)/i);
    const optStart = text.search(/[\(\[]?[A-D][\)\]\.]/i);
    if (optStart === -1) continue;

    const stmtsText = stmtStart !== -1 ? text.slice(stmtStart, optStart) : "";
    const stmts: string[] = [];
    for (const m of stmtsText.matchAll(/\((i{1,3}v?)\)\s*([\s\S]*?)(?=\((i{1,3}v?)\)|$)/g)) {
      const v = clean(m[2]);
      if (v.length > 2) stmts.push(v);
    }

    const opts = extractOptions(text.slice(optStart));
    questions.push({
      question: "Identify whether each statement is True (T) or False (F):\n" + stmts.map((s, i) => `(${i + 1}) ${s}`).join("\n"),
      option1: opts.A, option2: opts.B, option3: opts.C, option4: opts.D,
      correct: letterToKey(answerKey[block.num] ?? "A"),
      type: "truefalse", difficulty: "medium", explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true, meta: null,
    });
  }
  return questions;
}

function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const tableLines = lines.filter(l => l.startsWith("|") && l.endsWith("|"));
  if (tableLines.length < 2) return null;
  const parseRow = (line: string) => line.split("|").slice(1, -1).map(c => c.trim());
  const headerRow = parseRow(tableLines[0]);
  const dataRows = tableLines.slice(1).filter(l => !l.match(/^\|[\s\-:|]+\|$/)).map(parseRow);
  return headerRow.length && dataRows.length ? { headers: headerRow, rows: dataRows } : null;
}

function parseTableSection(content: string, answerKey: Record<number, string>, chapter: string, subunit: string, cls: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  for (const block of splitIntoQBlocks(content)) {
    const text = block.text.replace(/^(?:Q\.?\s*)?\d+[.\)]\s*/i, "");
    const tableMatch = text.match(/((?:\|[^\n]+\|\n?)+)/);
    const tableData = tableMatch ? parseMarkdownTable(tableMatch[1]) : null;
    const qEndIdx = tableMatch ? text.indexOf(tableMatch[0]) : text.search(/[\(\[]?[A-D][\)\]\.]/i);
    const afterTable = tableMatch ? text.slice(text.indexOf(tableMatch[0]) + tableMatch[0].length) : text;
    const optStart = afterTable.search(/[\(\[]?[A-D][\)\]\.]/i);
    const opts = optStart !== -1 ? extractOptions(afterTable.slice(optStart)) : { A: "", B: "", C: "", D: "" };
    questions.push({
      question: clean(text.slice(0, qEndIdx > 0 ? qEndIdx : text.length)) || "Study the table and answer:",
      option1: opts.A, option2: opts.B, option3: opts.C, option4: opts.D,
      correct: letterToKey(answerKey[block.num] ?? "A"),
      type: "table_based", difficulty: "medium", explanation: "", subject: "Biology",
      chapter, subunit, class: cls, is_active: true, meta: tableData ? { tableData } : null,
    });
  }
  return questions;
}

export function parseNEETQuestionBank(text: string, chapter: string, subunit: string, cls: string): ParseResult {
  const questions: ParsedQuestion[] = [];
  const subUnitMatch = text.match(/Sub-Unit:\s*(.+)/);
  const detectedSubUnit = subUnitMatch ? clean(subUnitMatch[1]) : subunit;
  const ak = parseAnswerKey(text);
  const mainText = text.replace(/(?:■\s*)?Answer\s*Key[\s\S]*/i, "");

  const SECTION_HEADERS = [
    { key: "passage", re: /[■✏]{1,2}\s*Read the Passage/gi },
    { key: "notes", re: /[■✏]{1,2}\s*Quick Revision Notes/gi },
    { key: "type1", re: /[■✏]{1,2}\s*Type\s*1/gi },
    { key: "type2", re: /[■✏]{1,2}\s*Type\s*2/gi },
    { key: "type3", re: /[■✏]{1,2}\s*Type\s*3/gi },
    { key: "type4", re: /[■✏]{1,2}\s*Type\s*4/gi },
    { key: "type5", re: /[■✏]{1,2}\s*Type\s*5/gi },
    { key: "type6", re: /[■✏]{1,2}\s*Type\s*6/gi },
    { key: "type7", re: /[■✏]{1,2}\s*Type\s*7/gi },
    { key: "skip", re: /[■✏]{1,2}\s*(?:Type\s*(?:8|9|1[0-9])|Diagram)/gi },
  ];

  const subUnitHeadings: Array<{ name: string; start: number }> = [];
  for (const m of mainText.matchAll(/(?:Sub-Unit:\s*(.+)|SUB-UNIT\s+[\d.]+\s*[—\-]+\s*(.+))/gi)) {
    if (m.index !== undefined) subUnitHeadings.push({ name: clean(m[1] || m[2] || ""), start: m.index });
  }

  const positions: Array<{ key: string; start: number; end: number }> = [];
  SECTION_HEADERS.forEach(({ key, re }) => {
    for (const m of mainText.matchAll(re)) if (m.index !== undefined) positions.push({ key, start: m.index, end: m.index + m[0].length });
  });
  positions.sort((a, b) => a.start - b.start);

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    if (pos.key === "skip") continue;
    const content = mainText.slice(pos.end, i + 1 < positions.length ? positions[i + 1].start : mainText.length);
    let secSubUnit = detectedSubUnit;
    for (const h of subUnitHeadings) if (h.start <= pos.start) secSubUnit = h.name;

    if (pos.key === "passage") {
      const pText = clean(content.replace(/\n+/g, " "));
      if (pText.length > 20) questions.push({ question: pText, option1: "", option2: "", option3: "", option4: "", correct: "option1", type: "paragraph", difficulty: "easy", explanation: "", subject: "Biology", chapter, subunit: secSubUnit, class: cls, is_active: true, meta: { highlights: [] } });
    } else if (pos.key === "notes") {
      const bullets = content.split("\n").map(l => clean(l.replace(/^[●•\*]\s*/, ""))).filter(b => b.length > 5 && !b.match(/Quick Revision/i));
      if (bullets.length) questions.push({ question: "Quick Revision Notes", option1: "", option2: "", option3: "", option4: "", correct: "option1", type: "pointer_notes", difficulty: "easy", explanation: "", subject: "Biology", chapter, subunit: secSubUnit, class: cls, is_active: true, meta: { bullets } });
    } else if (pos.key === "type1") questions.push(...parseMCQSection(content, "mcq", ak.type1, "medium", chapter, secSubUnit, cls));
    else if (pos.key === "type2") questions.push(...parseMatchSection(content, ak.type2, chapter, secSubUnit, cls));
    else if (pos.key === "type3") questions.push(...parseAssertionSection(content, ak.type3, chapter, secSubUnit, cls));
    else if (pos.key === "type4") questions.push(...parseStatementsSection(content, ak.type4, chapter, secSubUnit, cls));
    else if (pos.key === "type5") questions.push(...parseTrueFalseSection(content, ak.type5, chapter, secSubUnit, cls));
    else if (pos.key === "type6") questions.push(...parseMCQSection(content, "fillblanks", ak.type6, "easy", chapter, secSubUnit, cls));
    else if (pos.key === "type7") questions.push(...parseTableSection(content, ak.type7, chapter, secSubUnit, cls));
  }
  return { subUnit: detectedSubUnit, questions };
}
