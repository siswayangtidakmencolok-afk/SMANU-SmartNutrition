# Kamus Data

**Pembaruan:** 2026-11-12<br>
Tipe ringkas mengikuti deklarasi Drizzle; cek `lib/db/schema.ts` dan SQL untuk definisi lengkap.

| Tabel | Kolom penting | Makna / sensitivitas |
|---|---|---|
| `users` | `id`, `full_name`, `display_name`, `username`, `email`, `password_hash`, `role`, `age`, `school`, `grade`, timestamps | Identitas/profil; `password_hash` sangat sensitif dan tidak boleh dikirim ke client/log. |
| `food_items` | `food_id`, names/aliases, category, macros/micros, portion, `data_source`, `verified`, `is_estimate`, `estimate_note` | Nilai per 100 g edible portion; provenance penting untuk menafsirkan estimate. |
| `food_scan_logs` | user/food IDs, recognized name, `candidates_json`, portion, estimated nutrients, `data_status`, `energy_range`, `explanation_json`, model/source/assumptions, `scanned_at` | Snapshot scan per user. Hindari publikasi bebas atas data/prompt pengguna. Foto asli tidak disimpan oleh flow recognition yang diperiksa. |
| `candidate_foods` | raw/normalized name, submitter, source, vision confidence, suggested portion, user/reviewer notes, status, merged food | Menunggu review; bukan katalog nutrisi production sampai diverifikasi. |
| `user_activities` | user, `activity_type`, label, source ref, score, domain, idempotency key, verified, occurred at | Aktivitas yang verified menjadi input League/Learning Journey. |
| `user_exp_ledger` | user, signed delta, reason, activity ref, idempotency key, verified, created at | Append-only menurut desain; total dihitung dari delta verified. |
| `achievements` | key, title, description, icon, `exp_reward`, category/sort | Definisi achievement. |
| `user_achievements` | user, achievement key, unlocked time, unique idempotency key | Unlock user dan reward idempoten. |
| `photo_contributions` | user/scan refs, consent, retain, storage ref/provider, labels, review status, photo metadata | Source saat ini menyimpan metadata; file upload harus diverifikasi terpisah. |

Data profil anak/pelajar dan gambar perlu perlindungan privasi; jangan menaruh nilai/record aktual di dokumentasi.
