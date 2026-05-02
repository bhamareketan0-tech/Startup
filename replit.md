# BioSpark — NEET Study Platform

## Overview
Full-stack NEET preparation platform with React/Vite frontend and Express/MongoDB API.

## Architecture
- **Frontend**: React + Vite + Tailwind at `bio-study-hub/artifacts/biospark/` (port 5000)
- **API Server**: Express + MongoDB at `bio-study-hub/artifacts/api-server/` (port 8080)
- **Deployment**: Frontend → GitHub Pages (https://bhamareketan0-tech.github.io/Startup/), API → Render (https://startup-85w8.onrender.com)
- **Database**: MongoDB Atlas via `MONGODB_URI` secret

## Key Workflows
- **BioSpark Frontend** — runs Vite dev server on port 5000
- **BioSpark API** — runs Express API on port 8080

## Design Rules
- `SpaceBackground.tsx` and `ThemePicker.tsx` **must use ONLY inline styles** (Tailwind classes are tree-shaken in production)
- Theme system uses CSS variables via `ThemeContext` and `--bs-*` custom properties
- Brand color: `#00FF9D` (neon green)
- Font: `Space Grotesk`

## Student Sections (all routes under /src/pages/)
| Route | Page | Description |
|-------|------|-------------|
| /dashboard | DashboardPage | XP, streaks, recent activity |
| /practice | ClassSelectPage → ChaptersPage → PracticePage | MCQ drill |
| /mock-test | MockTestPage | Timed full-length test |
| /daily-challenge | DailyChallengePage | One question per day |
| /maa | MaaPage | Mind/Awareness/Action — breathing, memory palace, sleep |
| /short-notes | ShortNotesPage | Quick-reference notes per chapter |
| /flashcards | FlashcardsPage | Flip cards, swipe to mark known/unknown |
| /pyq | PYQPage | Previous year questions (2010–2024) |
| /sample-papers | SamplePapersPage | AI-generated NEET-pattern practice papers |
| /comparisons | ComparisonsPage | Side-by-side comparison tables |
| /revision | RevisionPage | Spaced repetition review queue |
| /bookmarks | BookmarksPage | Saved questions |
| /notes | NotesPage | Personal study notes |
| /custom-quiz | CustomQuizPage | Filter by chapter/difficulty |
| /performance | PerformancePage | Charts and accuracy stats |
| /syllabus | SyllabusPage | Chapter progress tracker |
| /community | CommunityPage | Discussion arena |
| /leaderboard | LeaderboardPage | XP-based ranking |
| /plans | PlansPage | Subscription pricing |

## Admin Panel (/admin) — all sections at /src/pages/admin/
**Overview**: Dashboard, Analytics  
**Content**: Questions, Chapters, Passages, PDF Import, AI Extractor, Short Notes, Flashcards, Comparisons, Memory Palace, Quotes  
**Users**: Students, Subscriptions, Reports  
**Communication**: Messaging (push/email/whatsapp/sms)  
**Monetization**: Revenue Dashboard, Razorpay Settings, Pricing Plans  
**System**: Settings, Credentials & Keys, MongoDB Status  

## API Routes (all under /api)
- `/questions` — MCQ bank with pyqYear + difficulty fields
- `/attempts` — student attempt tracking
- `/discussions` — community posts
- `/users` + `/users/xp` — user management + XP increments
- `/stats` — aggregated statistics
- `/passages` — reading comprehension passages
- `/chapters` + `/syllabus-progress` — chapter/topic tree
- `/short-notes` — admin-created quick reference notes
- `/flashcards` — bulk-importable flip cards
- `/comparisons` — structured comparison tables
- `/memory-palace` — image diagrams with clickable hotspot labels
- `/quotes` — motivational quotes (category: morning/evening/exam/general)
- `/spaced-repetition/:userId/due` — spaced review queue
- `/sample-papers/generate` — generates random papers from question bank
- `/bookmarks`, `/notes`, `/custom-quiz`, `/daily-challenge`, `/performance`

## Backend Models
shortNote, flashcard, comparison, memoryPalace, quote, spacedRepetition, samplePaper, question, user, attempt, discussion, passage, chapter, note, bookmark, questionAttempt, seenQuestion, syllabusProgress, customQuiz

## Tech Stack
- React 18, Vite 6, TypeScript, Tailwind CSS, React Router v6
- Express 4, Mongoose 8, tsx (no compile step)
- Lucide icons, Space Grotesk font
- GitHub REST API for deployments (destructive git ops blocked)
