-- 0001_food_scanner.sql
--
-- Adds food_items and food_scan_logs tables for the AI Food Scanner feature.
-- Run with: npx drizzle-kit migrate
--
-- Pre-condition: users, sessions, verification_tokens already exist.
-- This migration only creates the two new Food Scanner tables.
-- It is safe to run multiple times if wrapped by Drizzle's migrate().

CREATE TABLE IF NOT EXISTS "food_items" (
	"id" text PRIMARY KEY NOT NULL,
	"food_id" text NOT NULL,
	"name_primary" text NOT NULL,
	"name_aliases" text[] DEFAULT '{}' NOT NULL,
	"name_english" text,
	"category" text NOT NULL,
	"sub_category" text,
	"cooking_method" text,
	"energy_kcal" real,
	"protein_g" real,
	"fat_g" real,
	"carb_g" real,
	"fiber_g" real,
	"water_g" real,
	"sodium_mg" real,
	"calcium_mg" real,
	"iron_mg" real,
	"vitamin_c_mg" real,
	"typical_portion_g" real,
	"typical_portion_label" text,
	"data_source" text NOT NULL,
	"data_source_id" text,
	"data_captured_at" timestamp with time zone,
	"verified" boolean DEFAULT false NOT NULL,
	"is_estimate" boolean DEFAULT false NOT NULL,
	"estimate_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_items_food_id_unique" UNIQUE("food_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "food_scan_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recognized_food_id" text,
	"recognized_food_name" text NOT NULL,
	"candidates_json" jsonb,
	"portion_g" real,
	"portion_label" text,
	"estimated_energy_kcal" real,
	"estimated_protein_g" real,
	"estimated_fat_g" real,
	"estimated_carb_g" real,
	"model_used" text,
	"confidence_note" text,
	"data_source_used" text,
	"assumptions" text,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "food_scan_logs" ADD CONSTRAINT "food_scan_logs_user_id_users_id_fk"
   FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "food_scan_logs" ADD CONSTRAINT "food_scan_logs_recognized_food_id_food_items_id_fk"
   FOREIGN KEY ("recognized_food_id") REFERENCES "public"."food_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
