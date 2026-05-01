-- Migration: Add meta JSONB column to questions table
-- Purpose: Store structured content for non-standard question types:
--   - paragraph: { highlights: string[] }
--   - pointer_notes: { bullets: string[] }
--   - assertion: { statementA: string, statementR: string }
--   - statements: { statements: string[] }
--   - match: { colLeft: string[], colRight: string[] }

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS meta JSONB NULL;

-- Rollback: ALTER TABLE questions DROP COLUMN meta;
