# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Mongoose
- **Database**: MongoDB Atlas (via `MONGODB_URI` secret)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server + MongoDB
│   └── biospark/           # BioSpark NEET MCQ Platform (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema (unused by biospark)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
└── package.json            # Root package
```

## BioSpark — NEET MCQ Platform

### About
A complete NEET biology MCQ practice platform with:
- Demo auth (hardcoded mock credentials — no Supabase)
- 38 chapters for Class 11 & 12
- 8 question types in practice mode
- 30-minute countdown timer
- Score page with animated ring charts (saves attempts to MongoDB)
- Community discussions (MongoDB)
- Plans page (Free / Pro ₹299 / Elite ₹799)
- Admin panel (protected, email: bhamareketan18@gmail.com)

### Architecture (Supabase fully removed)
- **Frontend** runs on port 3000 (Vite dev server)
- **API server** runs on port 8080 (Express + Mongoose, started via `concurrently` in the biospark workflow)
- **Vite proxy** forwards all `/api/*` requests to `localhost:8080`
- **No Supabase** — `@supabase/supabase-js` removed entirely
- `supabase.ts` retained only for TypeScript type exports (`Question`, `Attempt`, `UserProfile`)
- Auth is demo-only: `demo@biospark.com / biospark123` and `bhamareketan18@gmail.com / Gitanjali@7038`

### API Endpoints (Express, prefix `/api`)
- `GET  /api/questions` — filter by class, subunit, type, is_active, chapter, search, limit, skip
- `POST /api/questions` — insert single or array of questions
- `PUT  /api/questions/:id` — update question
- `DELETE /api/questions/:id` — delete question
- `GET  /api/questions/stats` — question distribution stats
- `POST /api/attempts` — save practice attempt
- `GET  /api/attempts` — fetch attempts (filter by user_id)
- `GET  /api/discussions` — fetch discussions
- `POST /api/discussions` — create discussion
- `POST /api/discussions/:id/like` — like a discussion
- `DELETE /api/discussions/:id` — delete discussion
- `GET  /api/users` — fetch users (filter by class, plan)
- `GET  /api/users/:id/stats` — get attempt count for a user
- `GET  /api/stats` — admin dashboard stats (questions, students, premium, discussions, typeDist, dailyActivity)
- `GET  /api/health` — health check

### MongoDB Models (api-server/src/models/)
- `Question` — All MCQ + study material types
- `User` — Student profiles
- `Attempt` — Practice session results
- `Discussion` — Community posts

### Key Files
- `artifacts/biospark/src/lib/api.ts` — API client replacing Supabase (fetch-based)
- `artifacts/biospark/src/lib/supabase.ts` — Types only (Question, Attempt, UserProfile)
- `artifacts/biospark/src/lib/auth.tsx` — Demo auth context (no Supabase)
- `artifacts/biospark/src/lib/chapters.ts` — Chapter/subunit data (19 Ch11 + 13 Ch12 chapters)
- `artifacts/biospark/src/lib/chaptersManager.ts` — localStorage-backed CRUD layer
- `artifacts/biospark/src/lib/mockQuestions.ts` — Offline fallback questions
- `artifacts/biospark/src/lib/pdfParser.ts` — PDF parser for NEET question banks
- `artifacts/biospark/src/pages/admin/AdminSupabaseConfig.tsx` — Repurposed to MongoDB status page
- `artifacts/biospark/vite.config.ts` — Proxy: `/api → localhost:8080`
- `artifacts/biospark/package.json` — dev script uses `concurrently` for both Vite + API

### Design
- Dark background (`#050a14` / `#07111f`) with `#00ffb3` teal/green accent
- Space Grotesk font
- Animated space background on login page

### PDF Import
- Admin can upload NEET biology PDFs → parser extracts all question types
- Questions are batch-posted to MongoDB via `POST /api/questions` (array)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server with Mongoose and MongoDB Atlas. Models: Question, User, Attempt, Discussion.

### `artifacts/biospark` (`@workspace/biospark`)
BioSpark NEET MCQ Platform — React + Vite, MongoDB (via API proxy), Tailwind CSS.

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM with PostgreSQL (not used by biospark).

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI spec and Orval codegen config.
