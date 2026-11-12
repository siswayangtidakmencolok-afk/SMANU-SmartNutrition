# Database Schema

**Pembaruan:** 2026-11-12<br>
**Status:** Skema source VERIFIED; deployment environment dan runtime security PARTIALLY VERIFIED

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

## Trust boundary dan kontrol yang dibuktikan

- Akses menggunakan `@neondatabase/serverless` HTTP driver dan Drizzle; koneksi dibuat lazy dari server-only `DATABASE_URL`. Ini bukan bukti role/privilege Neon yang dipakai runtime.
- Schema/migrations mendeklarasikan foreign keys, user indexes, unique indexes untuk idempotency ledger/activity, dan beberapa cascade behavior. Unique keys melindungi beberapa operasi spesifik; tidak menjamin semua write endpoint idempotent.
- Source user-data routes menggunakan Auth.js `session.user.id` untuk scoping utama. Tidak tampak PostgreSQL row-level security policy atau pemisahan role read/write dalam migrasi yang diaudit; database-level enforcement tidak dapat dipastikan dari repo.
- PII yang jelas ada di `users` (email, username, nama, password hash) dan data terkait scan/learning. Foto asli tidak termasuk schema upload aktif yang diperiksa; scan log menyimpan label/nutrisi/snapshot.
- `food_scan_logs` menyimpan atribut provenance dan estimasi, tetapi beberapa API menerima snapshot yang dikirim client. Validasi nilai/provenance oleh server perlu diperkuat agar snapshot tersimpan tidak dianggap sebagai bukti nutrisi terverifikasi.
- Backup, restore drill, retention, deletion lifecycle, Neon branch separation, dan least-privilege role belum diverifikasi. Jangan menganggap tersedia hanya karena provider menawarkan fitur tersebut.

## Kapasitas dan kesiapan ribuan akun

Tidak ada hasil load test atau benchmark query yang ditemukan. Skema memiliki beberapa index untuk relasi/ledger; ini belum membuktikan target kapasitas. Sebelum menetapkan target pengguna, ukur pola request dan query pada dataset sintetis/berizin, termasuk pagination, agregasi leaderboard, riwayat, cold starts, dan konkurensi Neon HTTP.

Checklist bertahap:

1. Pastikan index untuk filter/join/sort yang benar-benar dipakai; validasi dengan `EXPLAIN` di staging setelah data representative tersedia.
2. Batasi pagination/response dan biaya query; gunakan agregasi/cache hanya setelah metrik menunjukkan bottleneck dan invalidation aman.
3. Tetapkan connection/runtime limits, alert database, backup retention, restore test, RPO/RTO, dan prosedur migration per environment.
4. Verifikasi akses user lintas akun serta role database least privilege; pertimbangkan RLS hanya dengan desain dan test yang sesuai driver/credentials, bukan sebagai asumsi.
5. Catat batasan data dan deletion/retention untuk akun muda; jangan menyimpan data sensitif tambahan untuk kebutuhan AI tanpa dasar dan consent.

## Status migration

Tujuh file SQL bernomor 0000–0006 tersedia di `lib/db/migrations/`. Catatan sesi sebelumnya menyebut 0006 telah dijalankan ke database Neon terkonfigurasi dan diverifikasi, tetapi audit dokumentasi ini tidak menjalankan query ulang. Lihat [MIGRATIONS.md](MIGRATIONS.md).
