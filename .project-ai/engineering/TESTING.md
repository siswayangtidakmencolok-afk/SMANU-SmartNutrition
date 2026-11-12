# Testing dan Validasi

**Pembaruan:** 2026-11-12

## Tooling yang tersedia

- `npm run lint` menjalankan ESLint.
- `npm run build` menjalankan `next build`.
- Tidak ada `npm test`/runner unit test yang dinyatakan di `package.json`; tidak ditemukan suite test project pada inventaris source.
- `scripts/test-scanner-pipeline.ts`, `scripts/test-gemini-vision.ts`, evaluasi baseline, check DB/auth adalah script utilitas/manual; periksa source sebelum menggunakannya karena beberapa memerlukan service/credential.

## Pemeriksaan yang disarankan

1. ESLint terfokus pada file berubah.
2. `npx tsc --noEmit` setelah memeriksa generated `.next` types; catat bila error berasal dari file generated.
3. Production build.
4. Auth: `/api/auth/csrf`, `/api/auth/session`, guest dan login session.
5. Langflow/AI: provider request nyata, timeout/error, response parse, dan UI; jangan mencetak secret atau data pribadi.
6. Food Scanner: jenis/ukuran image, low-confidence, source status, guest vs authenticated save.
7. League: input tampered, idempotency, duplicate/concurrent request, migration, dan guest/user.

## Catatan hasil terakhir

Sesi sebelumnya melaporkan ESLint file League dan production build terisolasi lulus; smoke endpoint pascamigrasi lulus (dashboard/Learning Journey/leaderboard/achievements; profile guest 401). Root `npx tsc --noEmit` saat itu gagal karena sintaks pada generated `.next/dev/types/routes.d.ts`. Tidak ada akun login atau test race-condition yang dijalankan. Ini catatan sesi, bukan hasil test baru pada audit dokumentasi.

## Security dan scale test baseline

Source review 2026-11-12 tidak menjalankan pentest, dependency scan, load test, atau test database. Tidak ditemukan `test` script/test files atau workflow CI di `.github/workflows` pada inventaris saat audit; verifikasi ini hanya untuk workspace yang sedang diperiksa.

Sebelum merge perubahan API/auth/data:

- Guest, signed-in owner, signed-in other-user, dan admin/non-admin harus mendapat hasil akses yang diharapkan untuk setiap route.
- Uji input invalid, field tambahan, payload oversized sebelum parsing, pagination boundary, retry/idempotency, timeout, provider quota, serta error response yang tidak membocorkan detail.
- Regression `photo-contribute`: scan owner yang sama diterima; scan id milik user lain ditolak; scan tidak ada ditangani konsisten.
- Regression scanner save: server memverifikasi reference/provenance dan hanya menyimpan numeric finite/range-valid; estimate tidak berubah menjadi verified.
- AI: uji prompt/provider errors dan untrusted retrieved content secara defensif; jangan memakai payload sensitif atau production credentials.
- DB: gunakan isolated test database; uji foreign keys, uniqueness, cleanup/restore, serta concurrency hanya di lingkungan yang disetujui.
- Kapasitas: benchmark dengan dataset sintetis dan staged traffic; tetapkan target p95, error rate, concurrent users, provider spend, dan Neon resource use sebelum klaim ribuan pengguna.

Jangan menjadikan hasil lint/build sebagai bukti auth, privacy, live provider, BOLA, ataupun capacity aman. Checklist temuan dan prioritas berada di [SECURITY.md](SECURITY.md).
