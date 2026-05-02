export const LEVELS = [
  { name: "Beginner",    emoji: "🌱", minXP: 0    },
  { name: "Novice",      emoji: "📖", minXP: 100  },
  { name: "Apprentice",  emoji: "🔬", minXP: 300  },
  { name: "Scholar",     emoji: "🧪", minXP: 600  },
  { name: "Expert",      emoji: "⚡", minXP: 1000 },
  { name: "Master",      emoji: "🏆", minXP: 1500 },
  { name: "Champion",    emoji: "👑", minXP: 2500 },
] as const;

export const XP_AWARDS = {
  CORRECT_ANSWER:          10,
  WRONG_ANSWER:             0,
  DAILY_CHALLENGE_DONE:   100,
  MOCK_TEST_DONE:          50,
  STREAK_7_DAY:            75,
  STREAK_30_DAY:          200,
  COMEBACK_1_3_DAYS:       50,
  COMEBACK_7_PLUS_DAYS:    20,
} as const;

export type LevelInfo = {
  name: string;
  emoji: string;
  minXP: number;
  nextXP: number;
  progressPct: number;
  index: number;
};

export function getLevelInfo(xp: number): LevelInfo {
  let levelIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) { levelIdx = i; break; }
  }
  const current = LEVELS[levelIdx];
  const next = LEVELS[levelIdx + 1];
  const nextXP = next ? next.minXP : current.minXP;
  const rangeStart = current.minXP;
  const rangeEnd = next ? next.minXP : current.minXP;
  const progressPct = rangeEnd > rangeStart
    ? Math.min(100, Math.round(((xp - rangeStart) / (rangeEnd - rangeStart)) * 100))
    : 100;
  return {
    name: current.name,
    emoji: current.emoji,
    minXP: current.minXP,
    nextXP,
    progressPct,
    index: levelIdx,
  };
}

export const BADGES = [
  { id: "first_correct",       name: "First Blood",        emoji: "🩸", description: "Get your first correct answer",           condition: "Correct answer #1" },
  { id: "streak_3",            name: "On Fire",            emoji: "🔥", description: "Reach a 3-day daily challenge streak",     condition: "3-day streak" },
  { id: "streak_7",            name: "Week Warrior",       emoji: "⚔️",  description: "Maintain a 7-day streak",                 condition: "7-day streak" },
  { id: "streak_30",           name: "Monthly Master",     emoji: "📅", description: "Maintain a 30-day streak",                condition: "30-day streak" },
  { id: "correct_10",          name: "Warm Up",            emoji: "🌡️",  description: "Answer 10 questions correctly",           condition: "10 correct answers" },
  { id: "correct_50",          name: "Half Century",       emoji: "🎯", description: "Answer 50 questions correctly",           condition: "50 correct answers" },
  { id: "correct_100",         name: "Centurion",          emoji: "💯", description: "Answer 100 questions correctly",          condition: "100 correct answers" },
  { id: "correct_500",         name: "Biology Beast",      emoji: "🦁", description: "Answer 500 questions correctly",          condition: "500 correct answers" },
  { id: "level_novice",        name: "Novice Scholar",     emoji: "📖", description: "Reach Novice level",                      condition: "Reach 100 XP" },
  { id: "level_expert",        name: "Domain Expert",      emoji: "⚡", description: "Reach Expert level",                     condition: "Reach 1000 XP" },
  { id: "level_champion",      name: "Champion",           emoji: "👑", description: "Reach Champion level",                   condition: "Reach 2500 XP" },
  { id: "daily_first",         name: "Daily Starter",      emoji: "🌅", description: "Complete your first daily challenge",     condition: "Complete daily challenge" },
  { id: "daily_10",            name: "Habit Builder",      emoji: "🏗️",  description: "Complete 10 daily challenges",           condition: "10 daily challenges" },
  { id: "mock_first",          name: "Test Taker",         emoji: "📝", description: "Complete your first mock test",          condition: "Complete mock test" },
  { id: "mock_perfect",        name: "Perfect Score",      emoji: "🌟", description: "Score 100% on a mock test",              condition: "100% mock test score" },
  { id: "comeback",            name: "Comeback Kid",       emoji: "🚀", description: "Return after missing a day and keep going", condition: "Comeback after absence" },
  { id: "xp_1000",             name: "XP Grinder",         emoji: "⚙️",  description: "Earn 1000 XP",                          condition: "1000 XP total" },
  { id: "accuracy_90",         name: "Sharp Mind",         emoji: "🧠", description: "Achieve 90%+ accuracy over 20+ questions", condition: "90% accuracy" },
] as const;

export type BadgeId = typeof BADGES[number]["id"];
