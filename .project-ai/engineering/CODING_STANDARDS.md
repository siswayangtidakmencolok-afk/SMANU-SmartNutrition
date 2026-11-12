# Standar Coding

**Pembaruan:** 2026-11-12<br>
Berikut pola yang terlihat di source dan batas perubahan; bukan formatter rule baru.

- Gunakan TypeScript strict, tipe request/response, guard input JSON, dan narrowing hasil API.
- Ikuti App Router: UI di `app/`, handler `app/api/**/route.ts`, server-only SDK dan database tidak diimpor ke client component.
- Gunakan Drizzle/schema yang sudah ada; jangan menambah tabel/kolom tanpa migration dan persetujuan yang sesuai.
- Untuk user-specific data, ambil user ID dari Auth.js session server-side, bukan dari body.
- Teks UI banyak memakai Bahasa Indonesia; pertahankan istilah/status yang sudah digunakan.
- Bedakan sourced/verified nutrition dari estimate; null berarti tidak tersedia, bukan nol.
- Idempotency untuk aktivitas/EXP mengikuti helper `lib/exp-system.ts` dan unique constraint migration.
- Tangani loading, empty, retry/error pada UI dan JSON status secara eksplisit; jangan membuat success-shaped fallback.
- API key dibaca di server; jangan beri prefix `NEXT_PUBLIC_` pada secret.
- Jangan menambah komentar obvious; dokumentasikan alasan non-obvious.
- Jalankan ESLint/build relevan (`npm run lint`, `npm run build`) dan tes yang tersedia.
- Sebelum perubahan Next.js, ikuti instruksi root `AGENTS.md` untuk membaca docs versi terpasang.
