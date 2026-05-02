import type { Question } from "./types";
import { api } from "./api";

export async function getQuestionsForPracticeFromAPI(
  chapter: string,
  subunit: string,
  cls: string,
  type?: string
): Promise<Question[]> {
  try {
    const params: Record<string, string | number> = { chapter, subunit, cls, limit: 200 };
    if (type) params.type = type;
    const res = await api.get("/questions", params) as { data?: Question[] };
    return (res.data || []).filter((q: Question) => q.is_active);
  } catch {
    return [];
  }
}

export async function getAllQuestionsFromAPI(filters?: Record<string, string | number>): Promise<Question[]> {
  try {
    const params = { limit: 200, ...filters };
    const res = await api.get("/questions", params) as { data?: Question[] };
    return res.data || [];
  } catch {
    return [];
  }
}

export async function createQuestionAPI(q: Partial<Question>): Promise<Question | null> {
  try {
    const res = await api.post("/questions", q) as { data?: Question };
    return res.data || null;
  } catch {
    return null;
  }
}

export async function updateQuestionAPI(id: string, updates: Partial<Question>): Promise<boolean> {
  try {
    await api.put(`/questions/${id}`, updates);
    return true;
  } catch {
    return false;
  }
}

export async function deleteQuestionAPI(id: string): Promise<boolean> {
  try {
    await api.del(`/questions/${id}`);
    return true;
  } catch {
    return false;
  }
}

export function getQuestionsForPractice(chapter: string, subunit: string): Question[] {
  return [];
}

export function isLocalQuestion(_id: string): boolean {
  return false;
}
