-- Student Nutrition League tables and trusted activity flags.
-- Existing activity and EXP rows remain unverified; only server-validated
-- events written after this migration are eligible for League progress.

ALTER TABLE "user_activities"
  ADD COLUMN IF NOT EXISTS "verified" boolean NOT NULL DEFAULT false;

ALTER TABLE "user_exp_ledger"
  ADD COLUMN IF NOT EXISTS "verified" boolean NOT NULL DEFAULT false;

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activities_user_verified_occurred_idx"
  ON "user_activities" ("user_id", "verified", "occurred_at" DESC);

CREATE INDEX IF NOT EXISTS "user_exp_ledger_verified_created_idx"
  ON "user_exp_ledger" ("verified", "created_at" DESC);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievements" (
  "id"          text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
  "key"         text NOT NULL UNIQUE,
  "title"       text NOT NULL,
  "description" text NOT NULL,
  "icon"        text NOT NULL DEFAULT '🏅',
  "exp_reward"  integer NOT NULL DEFAULT 0,
  "category"    text NOT NULL DEFAULT 'general',
  "sort_order"  integer NOT NULL DEFAULT 0,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_achievements" (
  "id"               text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"          text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "achievement_key"  text NOT NULL REFERENCES "achievements"("key") ON DELETE CASCADE,
  "unlocked_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "idempotency_key"  text NOT NULL UNIQUE
);

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_achievements_user_idx"
  ON "user_achievements" ("user_id");

CREATE INDEX IF NOT EXISTS "user_achievements_key_idx"
  ON "user_achievements" ("achievement_key");

--> statement-breakpoint
INSERT INTO "achievements" ("key", "title", "description", "icon", "exp_reward", "category", "sort_order") VALUES
  ('first_scan',         'Pemindai Pertama',     'Simpan hasil scan makanan pertamamu.',                    '📷', 15,  'scan',      1),
  ('scan_5',             'Peneliti Muda',         'Simpan 5 hasil scan makanan.',                            '🔬', 20,  'scan',      2),
  ('scan_20',            'Ahli Scanner',          'Simpan 20 hasil scan makanan.',                           '🔭', 30,  'scan',      3),
  ('first_quest',        'Penemu Kuis',           'Selesaikan NutriQuest pertamamu.',                        '📚', 15,  'quest',     4),
  ('quest_perfect',      'Nilai Sempurna',        'Raih skor 100 pada sebuah NutriQuest.',                   '⭐', 25,  'quest',     5),
  ('quest_5',            'Pelajar Tekun',         'Selesaikan 5 NutriQuest.',                                '📖', 20,  'quest',     6),
  ('quest_20',           'Akademisi Gizi',        'Selesaikan 20 NutriQuest.',                               '🎓', 50,  'quest',     7),
  ('first_challenge',    'Penantang Pertama',     'Selesaikan Food Challenge pertamamu.',                    '⚡', 15,  'challenge', 8),
  ('challenge_pass',     'Lulus Tantangan',       'Lulus satu Food Challenge dengan skor ≥ 70.',             '✅', 20,  'challenge', 9),
  ('challenge_10',       'Juara Tantangan',       'Selesaikan 10 Food Challenge.',                           '🏆', 40,  'challenge', 10),
  ('tier_silver',        'Naik ke Silver',        'Capai tier Silver (250 EXP).',                            '🥈', 10,  'explore',   11),
  ('tier_gold',          'Naik ke Gold',          'Capai tier Gold (500 EXP).',                              '🥇', 15,  'explore',   12),
  ('tier_platinum',      'Naik ke Platinum',      'Capai tier Platinum (900 EXP).',                          '💎', 20,  'explore',   13),
  ('tier_diamond',       'Naik ke Diamond',       'Capai tier Diamond (1500 EXP).',                          '🔷', 30,  'explore',   14),
  ('tier_master',        'Naik ke Master',        'Capai tier Master (2500 EXP).',                           '👑', 50,  'explore',   15),
  ('tier_scholar_elite', 'Scholar Elite',         'Capai tier tertinggi Scholar Elite (4000 EXP).',          '🌟', 100, 'explore',   16),
  ('multi_domain',       'Penjelajah Domain',     'Selesaikan aktivitas pada 3 domain gizi berbeda.',        '🗺️', 25,  'explore',   17)
ON CONFLICT ("key") DO NOTHING;
