# BioSpark — NEET MCQ Platform

## Overview

Full-stack NEET Biology MCQ practice platform with admin panel, MongoDB backend, and React frontend.

## Stack

- **Frontend**: React 19 + Vite + TailwindCSS v4
- **Backend**: Express 4 + Mongoose + Passport.js (session auth)
- **Database**: MongoDB Atlas (`MONGODB_URI` environment variable)
- **Package manager**: pnpm workspaces
- **TypeScript**: 5.9

## Canonical Source Code

```
bio-study-hub/
├── artifacts/
│   ├── biospark/           # React frontend (Vite, port 5000 dev / dist/public for prod)
│   └── api-server/         # Express API server (port 8080)
├── .env                    # Dev env vars (MongoDB URI etc.)
├── pnpm-workspace.yaml
└── replit.md
```

**Do NOT edit** `Startup-star/` or `bio-study-hub/server.js` — they are legacy/unused.

## Workflows

- **BioSpark Frontend** — `cd bio-study-hub/artifacts/biospark && PORT=5000 npx vite --host 0.0.0.0 --port 5000` (webview, port 5000)
- **BioSpark API** — `cd bio-study-hub/artifacts/api-server && pnpm exec tsx --env-file=../../.env ./src/index.ts` (console, port 8080)

## Deployment

### Frontend → GitHub Pages
- Deployed via `.github/workflows/deploy.yml` (GitHub Actions)
- Root: `bio-study-hub/artifacts/biospark`
- Build command: `npm run build`
- Publish dir: `dist/public`
- Set `VITE_API_URL` as a GitHub Actions repository variable pointing to the Render backend URL

### Backend → Render
- Root: `bio-study-hub/artifacts/api-server`
- Build command: `npm install && npx tsx build.ts` (or `npm run build`)
- Start command: `node dist/index.js`
- Required env vars:
  - `MONGODB_URI` — MongoDB Atlas connection string
  - `SESSION_SECRET` — random string, min 32 chars
  - `ALLOWED_ORIGINS` — GitHub Pages frontend URL (comma-separated)
  - `NODE_ENV=production`
  - `PORT=8080` (Render sets this automatically)

## Features

- 38 chapters for Class 11 & 12 seeded in MongoDB (15 + 16 chapters via `seed-chapters.ts`)
- 10 question types: paragraph, pointer_notes, mcq, assertion, statements, truefalse, fillblanks, match, diagram, table_based
- 30-minute countdown timer + scoring
- Score page with breakdown + attempt logging to MongoDB
- Community discussions
- Plans page (Free / Pro ₹299 / Elite ₹799)
- Admin panel (email: `bhamareketan18@gmail.com`)
  - Questions manager (full CRUD → MongoDB)
  - Chapters manager (add/edit/reorder → MongoDB)
  - Students panel
  - Settings panel (API keys, CORS, deployment config → MongoDB)
  - Passages manager

### Prompt 4 — Student Features (8 features)

- **Bookmarks** (`/bookmarks`) — Save/toggle questions from PracticePage; list with search + chapter filter; delete
- **Notes** (`/notes`) — Per-question notes from PracticePage; list with search, edit, delete, chapter filter
- **Custom Quiz** (`/custom-quiz`) — 5-step builder (class → chapter → type → difficulty → count/time); inline quiz + result screen
- **Revision Mode** (`/revision`) — Re-attempts wrong questions (3 consecutive correct = mastered); progress ring
- **Daily Challenge** (`/daily-challenge`) — Fixed 10-question set per IST day; timer; score/leaderboard; streak tracking
- **Performance Dashboard** (`/performance`) — Accuracy/score/time charts (Recharts); per-chapter breakdown; weak chapter heatmap; streak calendar
- **Syllabus Tracker** (`/syllabus`) — Toggle chapter completion (Class 11/12); progress bar per class; persisted to MongoDB
- **Study Streak Calendar** — Integrated in PerformancePage; GitHub-style activity grid
- **Bookmark/Note toolbar** — Inline Bookmark + Add Note buttons in both mobile and desktop PracticePage views

## API Routes (prefix: `/api`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/questions` | List/filter questions |
| POST | `/questions` | Create question (admin) |
| PUT | `/questions/:id` | Update question (admin) |
| DELETE | `/questions/:id` | Delete question (admin) |
| GET | `/chapters` | Get chapters by class |
| PUT | `/chapters/bulk` | Save chapters (admin) |
| GET | `/settings` | Get all app settings (admin) |
| PUT | `/settings` | Save settings (admin) |
| GET | `/settings/public` | Public settings (site name, colors) |
| GET | `/attempts` | Student attempts |
| POST | `/attempts` | Log attempt |
| GET/POST/DELETE | `/discussions` | Community discussions |
| GET | `/users` | Students list (admin) |
| GET | `/stats` | Dashboard stats (admin) |
| POST | `/passages` | PDF passage extraction |

## Auth

- Session-based (express-session + passport-local)
- Password hashed with bcryptjs
- Google OAuth2 (optional, requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`)
- Admin check: email === `bhamareketan18@gmail.com`

## Environment Variables

Local dev (`.env` at `bio-study-hub/`):
```
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/biospark_dev
SESSION_SECRET=biospark-dev-secret-change-in-production-min-32-chars
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Production (set in Render dashboard):
- `MONGODB_URI` — Atlas URI
- `SESSION_SECRET` — strong secret
- `ALLOWED_ORIGINS` — GitHub Pages frontend URL(s)
- `NODE_ENV=production`

## Key Files

- `bio-study-hub/artifacts/biospark/src/lib/api.ts` — HTTP client (credentials: include)
- `bio-study-hub/artifacts/biospark/src/lib/chaptersManager.ts` — chapters API + in-memory cache
- `bio-study-hub/artifacts/api-server/src/app.ts` — Express app, CORS, sessions
- `bio-study-hub/artifacts/api-server/src/routes/appSettings.ts` — Settings CRUD
- `bio-study-hub/artifacts/api-server/src/routes/chapters.ts` — Chapters CRUD
- `.github/workflows/deploy.yml` — GitHub Actions deploy to GitHub Pages
- `render.yaml` — Render backend configuration (no secrets — set those in Render dashboard)
