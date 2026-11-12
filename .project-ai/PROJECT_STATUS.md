# Status Proyek

**Diperbarui:** 2026-11-12<br>
**Basis audit:** source di root, manifest, migrations, route, git log, dan satu POST smoke test production Ask SMANU. Vercel dashboard tidak dapat diakses dari workspace.

| Modul | Status | Bukti | Kendala/batas bukti | Prioritas |
|---|---|---|---|---|
| Authentication | PARTIALLY VERIFIED | `auth.ts`, catch-all handler, register API, middleware, JWT Credentials | Implementasi terbaca; login/production environment tidak diuji pada audit ini. `AUTH_SECRET` ada sebagai nama lokal, nilainya tidak diperiksa. | P1 |
| Ask SMANU | PARTIALLY VERIFIED (production blocked) | Production POST `/api/nutripath` diuji 2026-11-12: HTTP 503 JSON `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` | Production gagal pada validasi URL sebelum panggilan Langflow; provider config aktif tetapi Flow ID kebenaran/flow aktif belum diverifikasi. SSE success belum teruji. Gemini tidak dipakai bila Langflow config invalid. | P1 |
| AI Assistant bubble | PARTIALLY VERIFIED | `components/AiChatWidget.tsx` → `/api/ai-chat` → Gemini | Jalur berbeda dari Ask SMANU; runtime Gemini belum diuji dalam audit dokumentasi. | P1 |
| Langflow RAG | PARTIALLY VERIFIED (production blocked) | Production API menolak URL Langflow karena skema bukan HTTPS; panduan proyek mencatat host HTTPS Langflow Cloud | Request upstream belum terjadi; akses server dari Vercel, API key, Flow ID yang benar, serta flow aktif belum dikonfirmasi. | P1 |
| Nutrition Knowledge | PARTIALLY VERIFIED | `lib/nutrition-knowledge-data.ts`, halaman list/detail, `/api/knowledge`, `lib/knowledge-base.ts` | Ada data statis dan jalur Langflow/fallback; uji live tidak dilakukan. Dua sumber knowledge berbeda untuk pengalaman berbeda. | P2 |
| Food Scanner | PARTIALLY VERIFIED | `FoodScannerModal`, route scanner/nutrition/explain/save/history/candidate | Integrasi Gemini dan aturan data terlihat; API key/model, database runtime, serta UI end-to-end tidak diuji pada audit ini. | P1 |
| Database | PARTIALLY VERIFIED | `lib/db/schema.ts`, 7 migration, Neon HTTP driver | Skema source lengkap. Catatan sesi sebelumnya menyatakan migration 0006 dijalankan dan diverifikasi; database tidak diperiksa ulang pada audit dokumentasi. | P1 |
| Student Nutrition League | PARTIALLY VERIFIED | activity/profile/leaderboard/achievements routes, schema, UI | Perhitungan server verified/idempotent ada; akses akun dan race-condition test belum terekam. | P1 |
| NutriQuest & Food Challenge | PARTIALLY VERIFIED | `lib/nutriquest-bank.ts`, `lib/food-challenge-data.ts`, komponen/halaman, `/api/user/activity` | Skor dapat dihitung ulang server untuk akun masuk; hasil UI juga memakai localStorage; tidak ada e2e test dalam audit ini. | P2 |
| Search | VERIFIED (source) | `/api/search` memakai `lib/search.ts` | Endpoint source lokal ada; bukan bukti search eksternal/vektor. | P3 |
| Deployment | UNKNOWN | `vercel.json` mendeklarasikan framework Next.js, command, region `sin1` | Tidak ada verifikasi deployment, domain, build log, atau Vercel environment dalam audit. | P1 |
| Automated tests | NOT IMPLEMENTED (manifest) | `package.json` menyediakan lint/build; tidak ada script `test` | Tidak ditemukan runner/test suite project pada inventaris source yang diperiksa. | P1 |

## Catatan konsistensi teknis

- Root `README.md` adalah dokumentasi scaffold lama dan bertentangan dengan manifest/source kini.
- `smanu-production-plan.md` menyebut dual path dan responsive tasks sebagai rencana; route `/api/nutripath` saat ini memiliki Langflow, OpenAI, dan Gemini branch dengan kondisi pemilihan yang harus dibaca langsung.
- Histori Ask SMANU disimpan di browser melalui `HistoryContext`/`localStorage`, bukan melalui endpoint persistence server.
- `.env.local` diaudit hanya dengan mengeluarkan nama variabel; nilainya tidak ditampilkan. Lihat [ENVIRONMENT_VARIABLES.md](engineering/ENVIRONMENT_VARIABLES.md).
- File generated `.next` dan file pengguna yang sudah dirty/untracked tidak menjadi target perubahan dokumentasi.
