-- 0004_photo_contributions.sql
--
-- Adds photo_contributions table for the private photo consent feedback loop.
--
-- This table stores METADATA only. Actual photo files are stored in object storage
-- (Vercel Blob or similar), NOT in the database. The photo_storage_ref column holds
-- the opaque storage key/path returned by the storage provider.
--
-- Design:
--   - User must give explicit consent (consent_given = true) before anything is stored.
--   - Original files are deleted from object storage after analysis (retain_photo = false default).
--   - If user later withdraws consent, reviewer can delete both the metadata and the file.
--   - Status lifecycle: 'pending' → 'analyzed' | 'rejected'
--   - Used ONLY for internal dataset improvement — never shown to other users.
--
-- Safe to run multiple times (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "photo_contributions" (
  "id"                  text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,

  -- Owner (nullable if contributed anonymously, but consent still required)
  "user_id"             text REFERENCES "users"("id") ON DELETE SET NULL,

  -- Link to the scan that produced this contribution
  "scan_log_id"         text REFERENCES "food_scan_logs"("id") ON DELETE SET NULL,

  -- Explicit consent — MUST be true before storing anything
  -- This field is set by the user UI before the upload request is sent.
  "consent_given"       boolean NOT NULL DEFAULT false,

  -- Whether the original photo is retained in object storage after analysis
  -- Default false: delete after initial analysis unless user opts in.
  "retain_photo"        boolean NOT NULL DEFAULT false,

  -- Object storage reference (opaque key from Vercel Blob / S3 / R2)
  -- Null if photo was never uploaded or was already deleted.
  "photo_storage_ref"   text,

  -- Object storage provider identifier for future-proofing
  -- e.g. 'vercel-blob' | 's3' | 'r2'
  "storage_provider"    text,

  -- Label applied by the scanner at contribution time (not yet human-verified)
  "vision_label"        text,

  -- Human-verified label (set during dataset review)
  "verified_label"      text,

  -- Review status
  -- 'pending'  → submitted, awaiting review
  -- 'analyzed' → photo analyzed, included in dataset evaluation
  -- 'rejected' → does not meet quality or licensing criteria
  "status"              text NOT NULL DEFAULT 'pending',

  -- Reviewer notes
  "reviewer_notes"      text,
  "reviewed_at"         timestamp with time zone,

  -- Photo metadata (logged for dataset diversity tracking — no PII)
  "lighting_condition"  text,  -- 'bright' | 'dim' | 'outdoor' | 'indoor' | null
  "angle_description"   text,  -- 'top' | 'side' | 'angled' | null
  "background_type"     text,  -- 'plain' | 'complex' | null

  -- Timestamps
  "contributed_at"      timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"          timestamp with time zone DEFAULT now() NOT NULL
);

-- Index: reviewer workflow
CREATE INDEX IF NOT EXISTS "photo_contributions_status_idx"
  ON "photo_contributions"("status");

-- Index: find contributions by user (for "my data" page / consent withdrawal)
CREATE INDEX IF NOT EXISTS "photo_contributions_user_id_idx"
  ON "photo_contributions"("user_id");
