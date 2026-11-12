# Database Schema

**Pembaruan:** 2026-11-12<br>
**Status:** Skema source VERIFIED; deployment environment PARTIALLY VERIFIED

## Database dan akses

Kode menargetkan PostgreSQL pada Neon. `lib/db/index.ts` membuat Neon HTTP client dan Drizzle secara lazy dari `DATABASE_URL`; schema `lib/db/schema.ts`. Jangan mencetak connection string.

## Tabel terdefinisi

| Tabel | Penggunaan utama |
|---|---|
| `users` | Identitas, credentials hash, role, profil opsional. |
| `sessions` | Tabel session adapter; strategi aktif di `auth.ts` JWT. |
| `verification_tokens` | Token verifikasi adapter. |
| `food_items` | Referensi makanan/nutrisi dengan provenance, verified, estimate. |
| `food_scan_logs` | Hasil scan dan snapshot estimasi milik user. |
| `candidate_foods` | Kandidat belum disetujui untuk review manusia. |
| `user_activities` | Aktivitas belajar, score/domain dan verified flag. |
| `user_exp_ledger` | Ledger delta EXP, verified, idempotency key. |
| `achievements` | Definisi achievement. |
| `user_achievements` | Unlock user dengan idempotency key. |
| `photo_contributions` | Metadata consent/review kontribusi foto. |

Relasi dan field penting dirinci di [TABLES_AND_RELATIONS.md](TABLES_AND_RELATIONS.md) dan [DATA_DICTIONARY.md](DATA_DICTIONARY.md).

## Status migration

Tujuh file SQL bernomor 0000–0006 tersedia di `lib/db/migrations/`. Catatan sesi sebelumnya menyebut 0006 telah dijalankan ke database Neon terkonfigurasi dan diverifikasi, tetapi audit dokumentasi ini tidak menjalankan query ulang. Lihat [MIGRATIONS.md](MIGRATIONS.md).
