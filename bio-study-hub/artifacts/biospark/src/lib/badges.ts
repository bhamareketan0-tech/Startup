export const BADGE_DEFINITIONS = [
  { id: "first_correct",  name: "First Blood",     emoji: "🩸", description: "Get your first correct answer",              condition: "Get 1 correct answer" },
  { id: "streak_3",       name: "On Fire",          emoji: "🔥", description: "Reach a 3-day daily challenge streak",      condition: "3-day streak" },
  { id: "streak_7",       name: "Week Warrior",     emoji: "⚔️",  description: "Maintain a 7-day streak",                  condition: "7-day streak" },
  { id: "streak_30",      name: "Monthly Master",   emoji: "📅", description: "Maintain a 30-day streak",                 condition: "30-day streak" },
  { id: "correct_10",     name: "Warm Up",          emoji: "🌡️",  description: "Answer 10 questions correctly",            condition: "10 correct answers" },
  { id: "correct_50",     name: "Half Century",     emoji: "🎯", description: "Answer 50 questions correctly",            condition: "50 correct answers" },
  { id: "correct_100",    name: "Centurion",        emoji: "💯", description: "Answer 100 questions correctly",           condition: "100 correct answers" },
  { id: "correct_500",    name: "Biology Beast",    emoji: "🦁", description: "Answer 500 questions correctly",           condition: "500 correct answers" },
  { id: "level_novice",   name: "Novice Scholar",   emoji: "📖", description: "Reach Novice level",                       condition: "Reach 100 XP" },
  { id: "level_expert",   name: "Domain Expert",    emoji: "⚡", description: "Reach Expert level",                      condition: "Reach 1000 XP" },
  { id: "level_champion", name: "Champion",         emoji: "👑", description: "Reach Champion level",                    condition: "Reach 2500 XP" },
  { id: "daily_first",    name: "Daily Starter",    emoji: "🌅", description: "Complete your first daily challenge",      condition: "Complete 1 daily challenge" },
  { id: "daily_10",       name: "Habit Builder",    emoji: "🏗️",  description: "Complete 10 daily challenges",            condition: "10 daily challenges" },
  { id: "mock_first",     name: "Test Taker",       emoji: "📝", description: "Complete your first mock test",           condition: "Complete 1 mock test" },
  { id: "mock_perfect",   name: "Perfect Score",    emoji: "🌟", description: "Score 100% on a mock test",               condition: "100% mock test score" },
  { id: "comeback",       name: "Comeback Kid",     emoji: "🚀", description: "Return after missing days",               condition: "Return after absence" },
  { id: "xp_1000",        name: "XP Grinder",       emoji: "⚙️",  description: "Earn 1000 XP total",                     condition: "1000 XP total" },
  { id: "accuracy_90",    name: "Sharp Mind",       emoji: "🧠", description: "Achieve 90%+ accuracy over 20+ questions", condition: "90% accuracy (20+ attempts)" },
] as const;

export type BadgeId = typeof BADGE_DEFINITIONS[number]["id"];
