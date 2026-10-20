-- 0003_learning_profile.sql
--
-- Adds persistent learning profile tables for SMANU:
--   1. role column on users (default 'student')
--   2. user_activities — every tracked learning event (quiz, challenge, scan save)
--   3. user_exp_ledger — append-only EXP delta log; current EXP = SUM(delta) per user
--
-- Design principles:
--   - Each activity carries an idempotency_key to prevent double-awarding EXP.
--   - EXP ledger is append-only; never UPDATE or DELETE rows (audit trail).
--   - Test sets and unverified data do not award EXP.
--   - activity_type ENUM-like text: 'quest' | 'challenge' | 'scan_save'
--
-- Safe to run multiple times (CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS).

-- ── 1. Add role column to users ───────────────────────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'student';

-- ── 2. user_activities ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_activities" (
  "id"               text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,

  -- Owner
  "user_id"          text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  -- What happened
  -- Values: 'quest' | 'challenge' | 'scan_save'
  "activity_type"    text NOT NULL,

  -- Human-readable label (e.g. "NutriQuest · Gizi Dasar")
  "activity_label"   text NOT NULL,

  -- Source reference — e.g. quiz result id, challenge result id, scan log id
  "source_ref"       text,

  -- Score snapshot at time of activity (0–100)
  "score"            integer,

  -- Domain / topic if applicable
  "domain"           text,

  -- Idempotency key — prevent double-recording the same event
  -- Derived from: userId + activityType + sourceRef (or timestamp-based UUID for one-offs)
  "idempotency_key"  text NOT NULL,

  -- Timestamp
  "occurred_at"      timestamp with time zone DEFAULT now() NOT NULL
);

-- Fast lookups: user's recent activities
CREATE INDEX IF NOT EXISTS "user_activities_user_id_idx"
  ON "user_activities"("user_id", "occurred_at" DESC);

-- Idempotency enforcement: one activity per key per user
CREATE UNIQUE INDEX IF NOT EXISTS "user_activities_idem_key_uniq"
  ON "user_activities"("user_id", "idempotency_key");

-- ── 3. user_exp_ledger ────────────────────────────────────────────────────────
-- Append-only EXP log. Current EXP = SELECT SUM(delta) FROM user_exp_ledger WHERE user_id = ?
-- Level is computed at query time from total EXP.
CREATE TABLE IF NOT EXISTS "user_exp_ledger" (
  "id"               text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,

  -- Owner
  "user_id"          text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  -- EXP change (+positive, -negative for corrections)
  "delta"            integer NOT NULL,

  -- Why EXP was awarded/deducted
  -- Values: 'quest_complete' | 'quest_perfect' | 'challenge_complete' |
  --         'challenge_pass' | 'scan_save' | 'admin_adjustment'
  "reason"           text NOT NULL,

  -- Links to the activity that generated this EXP
  "activity_ref"     text REFERENCES "user_activities"("id") ON DELETE SET NULL,

  -- Idempotency: same activity cannot earn EXP twice
  "idempotency_key"  text NOT NULL,

  -- Timestamp (immutable after insert)
  "created_at"       timestamp with time zone DEFAULT now() NOT NULL
);

-- Fast sum query
CREATE INDEX IF NOT EXISTS "user_exp_ledger_user_id_idx"
  ON "user_exp_ledger"("user_id");

-- Idempotency enforcement
CREATE UNIQUE INDEX IF NOT EXISTS "user_exp_ledger_idem_key_uniq"
  ON "user_exp_ledger"("user_id", "idempotency_key");
