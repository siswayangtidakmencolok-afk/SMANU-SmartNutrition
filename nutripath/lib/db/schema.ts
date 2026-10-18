/**
 * Drizzle ORM Schema — SMANU Users + Food Scanner
 *
 * Phase 1: auth tables (users, sessions, verification_tokens)
 * Phase 2: food_items + food_scan_logs (AI Food Scanner)
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

  // Meta
  modelUsed: text("model_used"),                 // e.g. "gemini-2.0-flash"
  confidenceNote: text("confidence_note"),       // e.g. "high" | "medium" | "low"
  dataSourceUsed: text("data_source_used"),      // e.g. "TKPI-2017"
  assumptions: text("assumptions"),             // free-text assumptions displayed to user

  // Timestamps
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
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
