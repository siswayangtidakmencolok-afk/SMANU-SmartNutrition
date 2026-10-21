/**
 * Drizzle ORM Schema — SMANU Users + Food Scanner + Learning Profile
 *
 * Phase 1: auth tables (users, sessions, verification_tokens)
 * Phase 2: food_items + food_scan_logs (AI Food Scanner)
 * Phase 3: candidate_foods (user feedback loop)
 * Phase 4: user_activities + user_exp_ledger (Learning Profile — DB-backed)
 *          photo_contributions (dataset consent loop)
 *
 * Migrations: run `npx drizzle-kit generate` then `npx drizzle-kit migrate`
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  displayName: text("display_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Role for access control
  // 'student' (default) | 'admin' (internal team)
  role: text("role").notNull().default("student"),
  // Optional profile fields
  age: integer("age"),
  school: text("school"),
  grade: text("grade"),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Auth.js v5 required tables for session strategy
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOD ITEMS — reference nutritional database
//
// Primary source: TKPI (Tabel Komposisi Pangan Indonesia) 2017, Kemenkes RI.
// Secondary: USDA FoodData Central (for foods not covered by TKPI).
// All values are per 100 g edible portion unless noted otherwise.
// "estimated" = value derived from closest analog, not direct measurement.
// ─────────────────────────────────────────────────────────────────────────────
export const foodItems = pgTable("food_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Identity
  foodId: text("food_id").notNull().unique(),          // stable slug, e.g. "nasi-putih"
  namePrimary: text("name_primary").notNull(),          // canonical Indonesian name
  nameAliases: text("name_aliases").array().notNull().default([]), // synonyms / local names
  nameEnglish: text("name_english"),

  // Classification
  category: text("category").notNull(),                // e.g. "Serealia & Olahannya"
  subCategory: text("sub_category"),
  cookingMethod: text("cooking_method"),               // "rebus" | "goreng" | "kukus" | null

  // Macronutrients (per 100 g edible portion)
  energyKcal: real("energy_kcal"),
  proteinG: real("protein_g"),
  fatG: real("fat_g"),
  carbG: real("carb_g"),
  fiberG: real("fiber_g"),
  waterG: real("water_g"),

  // Micronutrients — available for subset only
  sodiumMg: real("sodium_mg"),
  calciumMg: real("calcium_mg"),
  ironMg: real("iron_mg"),
  vitaminCMg: real("vitamin_c_mg"),

  // Portion helpers
  typicalPortionG: real("typical_portion_g"),          // common serving size in grams
  typicalPortionLabel: text("typical_portion_label"),  // e.g. "1 centong (100 g)"

  // Data provenance
  dataSource: text("data_source").notNull(),           // "TKPI-2017" | "USDA-FDC" | "estimate"
  dataSourceId: text("data_source_id"),                // TKPI code or USDA FDC id
  dataCapturedAt: timestamp("data_captured_at", { withTimezone: true }),
  verified: boolean("verified").notNull().default(false),
  isEstimate: boolean("is_estimate").notNull().default(false),
  estimateNote: text("estimate_note"),                 // explanation if isEstimate=true

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOD SCAN LOGS — stores confirmed scanner results per user
//
// Photo originals are NOT stored — only metadata + analysis output.
// Guest scans are session-only and never written here.
// ─────────────────────────────────────────────────────────────────────────────
export const foodScanLogs = pgTable("food_scan_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Ownership — must match an authenticated user
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Recognition result
  recognizedFoodId: text("recognized_food_id")
    .references(() => foodItems.id, { onDelete: "set null" }),
  recognizedFoodName: text("recognized_food_name").notNull(),  // snapshot at save time
  candidatesJson: jsonb("candidates_json"),                    // raw vision candidates array

  // Confirmed portion
  portionG: real("portion_g"),
  portionLabel: text("portion_label"),

  // Estimated nutrition (computed at scan time, snapshot)
  estimatedEnergyKcal: real("estimated_energy_kcal"),
  estimatedProteinG: real("estimated_protein_g"),
  estimatedFatG: real("estimated_fat_g"),
  estimatedCarbG: real("estimated_carb_g"),



  estimatedFiberG: real("estimated_fiber_g"),

  // Source status — distinguishes verified DB data from AI estimates
  // 'database_verified' | 'ai_estimate' | 'unavailable'
  dataStatus: text("data_status").default("database_verified"),

  // Energy range string for high-uncertainty AI estimates (e.g. "450–600 kcal")
  energyRange: text("energy_range"),

  // Full structured AI explanation blob (7-section report) — null for DB results
  explanationJson: jsonb("explanation_json"),

  // Meta
  modelUsed: text("model_used"),                 // e.g. "gemini-flash-lite-latest"
  confidenceNote: text("confidence_note"),       // e.g. "high" | "medium" | "low"
  dataSourceUsed: text("data_source_used"),      // e.g. "TKPI-2017" | "Estimasi AI"
  assumptions: text("assumptions"),             // free-text assumptions displayed to user

  // Timestamps
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE FOODS — user-submitted foods not yet in the knowledge base
//
// Submitted when vision returns a food not matched in food_items, or when
// a user manually corrects a scan. Candidates are held for human review
// before being promoted to food_items. Never used as production nutrition data.
// ─────────────────────────────────────────────────────────────────────────────
export const candidateFoods = pgTable("candidate_foods", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  // Submitted name (raw from user or vision model)
  foodNameRaw: text("food_name_raw").notNull(),
  // Normalized for deduplication (lowercase, trimmed)
  foodNameNormalized: text("food_name_normalized").notNull(),
  foodNameEnglish: text("food_name_english"),

  // Who submitted
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  // Origin
  submissionSource: text("submission_source").notNull().default("vision_unmatched"),

  // Vision context
  originalVisionName: text("original_vision_name"),
  originalConfidence: text("original_confidence"),

  // Optional portion hint (not used in production calculations)
  suggestedPortionG: real("suggested_portion_g"),
  suggestedPortionLabel: text("suggested_portion_label"),

  // User notes — for reviewer reference only
  userNotes: text("user_notes"),

  // Review lifecycle
  status: text("status").notNull().default("pending"),
  mergedFoodId: text("merged_food_id").references(() => foodItems.id, { onDelete: "set null" }),
  reviewerNotes: text("reviewer_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  // Timestamps
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIVITIES — every tracked learning event
//
// Covered activity types: 'quest' | 'challenge' | 'scan_save'
// idempotency_key prevents recording the same event twice.
// ─────────────────────────────────────────────────────────────────────────────
export const userActivities = pgTable("user_activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // 'quest' | 'challenge' | 'scan_save'
  activityType: text("activity_type").notNull(),

  // Human-readable label e.g. "NutriQuest · Gizi Dasar"
  activityLabel: text("activity_label").notNull(),

  // Reference to the source record (quest result id, challenge id, scan log id)
  sourceRef: text("source_ref"),

  // Score snapshot at time of activity (0–100)
  score: integer("score"),

  // Domain / topic if applicable
  domain: text("domain"),

  // Idempotency key — prevents double-recording
  // Format: `${userId}:${activityType}:${sourceRef}`
  idempotencyKey: text("idempotency_key").notNull(),

  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// USER EXP LEDGER — append-only EXP change log
//
// Current total EXP = SELECT SUM(delta) WHERE user_id = ?
// Level is derived from total EXP at query time.
// Never update or delete rows — add corrections as new rows with negative delta.
// ─────────────────────────────────────────────────────────────────────────────
export const userExpLedger = pgTable("user_exp_ledger", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // EXP change (positive = award, negative = correction)
  delta: integer("delta").notNull(),

  // Reason: 'quest_complete' | 'quest_perfect' | 'challenge_complete' |
  //         'challenge_pass' | 'scan_save' | 'admin_adjustment'
  reason: text("reason").notNull(),

  // FK to user_activities — which activity triggered this EXP
  activityRef: text("activity_ref")
    .references(() => userActivities.id, { onDelete: "set null" }),

  // Idempotency key (same as the activity's key)
  idempotencyKey: text("idempotency_key").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO CONTRIBUTIONS — consent-gated metadata for dataset feedback loop
//
// Stores METADATA only. Actual photos live in object storage (Vercel Blob / S3).
// photo_storage_ref = opaque key from storage provider; null if deleted.
// ─────────────────────────────────────────────────────────────────────────────
export const photoContributions = pgTable("photo_contributions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),

  scanLogId: text("scan_log_id")
    .references(() => foodScanLogs.id, { onDelete: "set null" }),

  // Explicit consent — required before any photo is stored
  consentGiven: boolean("consent_given").notNull().default(false),

  // Whether the photo should be kept after analysis
  retainPhoto: boolean("retain_photo").notNull().default(false),

  // Object storage key (null if photo was never uploaded or already deleted)
  photoStorageRef: text("photo_storage_ref"),

  // Storage provider identifier (for future-proofing)
  storageProvider: text("storage_provider"),

  // Label from vision model at contribution time
  visionLabel: text("vision_label"),

  // Human-verified label (set during dataset review)
  verifiedLabel: text("verified_label"),

  // 'pending' | 'analyzed' | 'rejected'
  status: text("status").notNull().default("pending"),

  reviewerNotes: text("reviewer_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  // Photo diversity metadata (no PII)
  lightingCondition: text("lighting_condition"),  // 'bright' | 'dim' | 'outdoor' | 'indoor'
  angleDescription: text("angle_description"),    // 'top' | 'side' | 'angled'
  backgroundType: text("background_type"),        // 'plain' | 'complex'

  contributedAt: timestamp("contributed_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Type helpers
// ─────────────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FoodItem = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;
export type FoodScanLog = typeof foodScanLogs.$inferSelect;
export type NewFoodScanLog = typeof foodScanLogs.$inferInsert;
export type CandidateFood = typeof candidateFoods.$inferSelect;
export type NewCandidateFood = typeof candidateFoods.$inferInsert;
export type UserActivity = typeof userActivities.$inferSelect;
export type NewUserActivity = typeof userActivities.$inferInsert;
export type UserExpLedger = typeof userExpLedger.$inferSelect;
export type NewUserExpLedger = typeof userExpLedger.$inferInsert;
export type PhotoContribution = typeof photoContributions.$inferSelect;
export type NewPhotoContribution = typeof photoContributions.$inferInsert;
