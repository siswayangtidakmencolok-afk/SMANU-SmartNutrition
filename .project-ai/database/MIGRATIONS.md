# Riwayat Migration

**Pembaruan:** 2026-11-12

| File | Tujuan dari SQL/source |
|---|---|
| `0000_wild_vargas.sql` | Baseline: users, sessions, verification tokens, food items, scan logs dan relasi. |
| `0001_food_scanner.sql` | Tabel/index scanner idempoten untuk instalasi/penyesuaian scanner. |
| `0002_candidate_foods.sql` | Kandidat makanan, status review, normalized-name pending uniqueness. |
| `0003_learning_profile.sql` | Role, user activities dan EXP ledger beserta idempotency key/index. |
| `0004_photo_contributions.sql` | Metadata consent/review kontribusi foto. |
| `0005_scan_log_enrich.sql` | Kolom tambahan snapshot scan seperti data status/estimasi/explanation. |
| `0006_league.sql` | Verified flags/index, tabel achievements/user achievements, seed 17 definitions. |

## Eksekusi dan keselamatan

`drizzle.config.ts` memuat `.env.local` dan menunjuk `lib/db/schema.ts`. Repository berisi script migration khusus scanner dan League; baca script sebelum menjalankan. Catatan sesi terdahulu menyebut `scripts/migrate-league.ts` telah diperbaiki untuk mengeksekusi tiap SQL statement Neon secara terpisah, lalu migration 0006 dijalankan setelah izin eksplisit dan schema diverifikasi.

Catatan tersebut bukan izin untuk menjalankan migration baru. Periksa environment/backup, minta persetujuan eksplisit, dan jangan menjalankan migrasi production tanpa mandat. Jangan menjalankan migration ulang hanya karena belum ada bukti pada sesi saat ini.

## Batas verifikasi

Audit dokumentasi membaca SQL/schema, tidak menghubungi Neon. Status penerapan per environment perlu dicatat dengan waktu, environment, hasil query schema, dan otorisasi—tanpa credential atau data pengguna.
