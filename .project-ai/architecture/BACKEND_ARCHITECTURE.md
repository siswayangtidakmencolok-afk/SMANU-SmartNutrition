# Arsitektur Backend

**Pembaruan:** 2026-11-12

## Runtime dan pola

API menggunakan file `app/api/**/route.ts` Next.js App Router. Route yang membutuhkan driver/SDK server menandai `runtime = "nodejs"`. Request AI divalidasi di server dan key dibaca dari `process.env`; database diakses melalui Drizzle dan Neon HTTP.

## Area backend

- Identitas: `auth.ts`, catch-all Auth.js route, register endpoint, dan middleware redirect untuk halaman login/register.
- Profil: `/api/profile` menggunakan session user ID dari server, bukan ID body.
- AI: `/api/nutripath` SSE untuk Ask SMANU; `/api/ai-chat` JSON untuk widget terpisah; `/api/knowledge` untuk bagian artikel.
- Scanner: recognition, nutrition lookup, explain, persistence, history, candidate, dan contribution routes.
- Learning: `/api/user/activity` memvalidasi skor di server; `/api/user/learning-profile` menyajikan data verified; `/api/league/*` membaca leaderboard/achievement.
- Search: `/api/search` menjalankan pencarian lokal.

## Error dan keamanan

Route mengembalikan status JSON/stream dan sebagian menulis error teknis ke server log. Hindari memasukkan prompt, foto, API key, token, connection string, atau data pribadi ke log. Evaluasi tiap route terhadap validasi body, kepemilikan resource, role, timeout, dan status error saat mengubahnya.

Endpoint lengkap tercantum di [API_ARCHITECTURE.md](API_ARCHITECTURE.md). Implementasi tidak otomatis aktif hanya karena route tersedia.
