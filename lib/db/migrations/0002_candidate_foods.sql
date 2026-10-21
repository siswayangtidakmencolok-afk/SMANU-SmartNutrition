-- 0002_candidate_foods.sql
--
-- Adds candidate_foods table for the user feedback / continuous improvement loop.
--
-- Purpose:
--   When a user scans a food that is NOT in food_items, or corrects a
--   recognition result, the system can save it here as a "candidate" for
--   future verification and addition to the knowledge base.
--
-- Rules:
--   - Candidates are NOT used as production nutrition data until verified.
--   - status = 'pending'  → submitted, awaiting human review.
--   - status = 'approved' → reviewed and promoted to food_items.
--   - status = 'rejected' → reviewed and discarded.
--   - user_id is nullable: anonymous candidates allowed but lower priority.
--   - Unique on (food_name_normalized) to prevent exact duplicates.
--
-- Safe to run multiple times (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "candidate_foods" (
  "id"                    text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,

  -- Submitted food name (raw from user or vision model)
  "food_name_raw"         text NOT NULL,
  -- Normalized version for deduplication (lowercase, trimmed)
  "food_name_normalized"  text NOT NULL,
  -- English name if known
  "food_name_english"     text,

  -- Who submitted this candidate
  "user_id"               text REFERENCES "users"("id") ON DELETE SET NULL,

  -- Origin: "user_correction" | "vision_unmatched" | "manual_entry"
  "submission_source"     text NOT NULL DEFAULT 'vision_unmatched',

  -- The vision model's original suggestion (what it guessed before correction)
  "original_vision_name"  text,
  -- Confidence the vision model had on the original suggestion
  "original_confidence"   text,

  -- User-provided portion info (for context, not used in production calculations)
  "suggested_portion_g"   real,
  "suggested_portion_label" text,

  -- Optional rough nutrition info provided by user (NOT production data)
  -- These are stored for human reviewer reference ONLY.
  "user_notes"            text,

  -- Review lifecycle
  "status"                text NOT NULL DEFAULT 'pending',
  -- If approved: which food_items.id this was merged into
  "merged_food_id"        text REFERENCES "food_items"("id") ON DELETE SET NULL,
  -- Reviewer notes
  "reviewer_notes"        text,
  "reviewed_at"           timestamp with time zone,

  -- Timestamps
  "submitted_at"          timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"            timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint

-- Index: fast lookup by normalized name for deduplication checks
CREATE INDEX IF NOT EXISTS "candidate_foods_name_norm_idx"
  ON "candidate_foods"("food_name_normalized");

--> statement-breakpoint

-- Index: reviewer workflow — find all pending candidates
CREATE INDEX IF NOT EXISTS "candidate_foods_status_idx"
  ON "candidate_foods"("status");

--> statement-breakpoint

-- Prevent exact duplicates by normalized name + status pending
-- (allow re-submission after rejection)
CREATE UNIQUE INDEX IF NOT EXISTS "candidate_foods_name_pending_uniq"
  ON "candidate_foods"("food_name_normalized")
  WHERE "status" = 'pending';
