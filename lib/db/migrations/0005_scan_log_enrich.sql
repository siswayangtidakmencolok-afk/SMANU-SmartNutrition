-- 0005_scan_log_enrich.sql
--
-- Adds new columns to food_scan_logs to persist the enriched AI explanation
-- and structured data produced by the /api/food-scanner/explain endpoint.
--
-- New fields:
--   data_status        — 'database_verified' | 'ai_estimate' | 'unavailable'
--   estimated_fiber_g  — fiber estimate (missing from original schema)
--   energy_range       — e.g. "450–600 kcal" when uncertainty is high
--   explanation_json   — structured JSON blob: all 7 sections of the AI report
--
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS).

-- Status of the data source for this scan
ALTER TABLE "food_scan_logs"
  ADD COLUMN IF NOT EXISTS "data_status" text DEFAULT 'database_verified';

-- Fiber estimate (was missing from original schema)
ALTER TABLE "food_scan_logs"
  ADD COLUMN IF NOT EXISTS "estimated_fiber_g" real;

-- Energy range string for high-uncertainty AI estimates
ALTER TABLE "food_scan_logs"
  ADD COLUMN IF NOT EXISTS "energy_range" text;

-- Full structured explanation from AI (JSON blob).
-- Stores the complete 7-section report so it can be re-rendered without
-- calling Gemini again. NULL for database_verified results.
ALTER TABLE "food_scan_logs"
  ADD COLUMN IF NOT EXISTS "explanation_json" jsonb;
