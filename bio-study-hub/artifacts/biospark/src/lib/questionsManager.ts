import type { Question } from "./supabase";

const LS_KEY = "biospark_questions";

function loadAll(): Question[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Question[];
  } catch {}
  return [];
}

function saveAll(questions: Question[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(questions));
}

export function getAllQuestions(): Question[] {
  return loadAll();
}

export function addQuestion(q: Partial<Question>): Question {
  const all = loadAll();
  const now = new Date().toISOString();
  const newQ: Question = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    question: q.question || "",
    option1: q.option1 || "",
    option2: q.option2 || "",
    option3: q.option3 || "",
    option4: q.option4 || "",
    correct: q.correct || "option1",
    subject: q.subject || "Biology",
    chapter: q.chapter || "",
    subunit: q.subunit || "",
    type: q.type || "mcq",
    explanation: q.explanation || "",
    class: q.class || "11",
    difficulty: q.difficulty || "medium",
    is_active: q.is_active ?? true,
    meta: q.meta ?? null,
    created_at: now,
  };
  saveAll([newQ, ...all]);
  return newQ;
}

export function updateQuestion(id: string, updates: Partial<Question>): void {
  const all = loadAll().map((q) => (q.id === id ? { ...q, ...updates } : q));
  saveAll(all);
}

export function deleteQuestion(id: string): void {
  saveAll(loadAll().filter((q) => q.id !== id));
}

export function getQuestionsForPractice(chapter: string, subunit: string): Question[] {
  return loadAll().filter(
    (q) => q.chapter === chapter && q.subunit === subunit && q.is_active
  );
}

export function isLocalQuestion(id: string): boolean {
  return id.startsWith("local_");
}
