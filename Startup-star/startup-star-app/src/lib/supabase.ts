export type Question = {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct: string;
  subject: string;
  chapter: string;
  subunit: string;
  type: string;
  explanation: string;
  class: string;
  difficulty: string;
  is_active: boolean;
  created_at: string;
  meta?: Record<string, unknown> | null;
};

export type Attempt = {
  id: string;
  user_id: string;
  chapter: string;
  subunit: string;
  class: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  time_taken: number;
  created_at: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  class: string;
  score: number;
  plan: string;
  created_at: string;
};
