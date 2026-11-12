# Arsitektur Database

**Pembaruan:** 2026-11-12

Database kode menggunakan PostgreSQL pada Neon via `@neondatabase/serverless` HTTP dan Drizzle ORM. `lib/db/index.ts` membuat akses lazy dan membaca `DATABASE_URL`; tidak membuka database dari browser. Schema deklaratif berada di `lib/db/schema.ts`, SQL migration pada `lib/db/migrations/`.

Kelompok data:

- akun: `users`, `sessions`, `verification_tokens`;
- referensi makanan dan scan: `food_items`, `food_scan_logs`, `candidate_foods`, `photo_contributions`;
- belajar/League: `user_activities`, `user_exp_ledger`, `achievements`, `user_achievements`.

Relasi, key, dan field ada di [TABLES_AND_RELATIONS.md](../database/TABLES_AND_RELATIONS.md). Migration source bukan bukti bahwa database environment tertentu sudah diperbarui; catatan penerapan sebelumnya dan batas verifikasi ada di [MIGRATIONS.md](../database/MIGRATIONS.md).
