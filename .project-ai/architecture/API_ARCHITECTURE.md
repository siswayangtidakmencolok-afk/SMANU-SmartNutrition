# Arsitektur API

**Pembaruan:** 2026-11-12

| Endpoint | Method | Auth | Fungsi / sumber |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Auth.js | Session, CSRF, providers, credentials callback, sign-out. |
| `/api/auth/register` | POST | Publik | Validasi registrasi dan bcrypt hash, insert user. |
| `/api/profile` | GET, PATCH | Wajib | Profil user sendiri. DELETE eksplisit 405. |
| `/api/nutripath` | POST | Publik | Konteks/question → Langflow atau jalur provider sesuai konfigurasi → SSE. |
| `/api/ai-chat` | POST | Publik | Multi-turn Gemini; JSON `{ reply }`. |
| `/api/knowledge` | POST | Publik | Konten bagian topik, Langflow lalu fallback knowledge lokal. |
| `/api/search?q=` | GET | Publik | Pencarian knowledge lokal. |
| `/api/food-scanner` | POST | Publik | Gambar Base64 → kandidat Gemini Vision + pencocokan data makanan. |
| `/api/food-scanner/nutrition` | GET | Publik | Nutrition scaling dari data in-memory, lalu DB. |
| `/api/food-scanner/explain` | POST | Publik | Estimasi AI terstruktur untuk makanan/porsi. |
| `/api/food-scanner/save` | POST | Wajib | Simpan snapshot scan milik user. |
| `/api/food-scanner/history` | GET, DELETE | Wajib | Daftar/penghapusan scan milik user. DELETE memakai `?id=`. |
| `/api/food-scanner/candidate` | POST | Opsional | Kandidat makanan untuk review. |
| `/api/food-scanner/photo-contribute` | POST | Wajib + consent | Catat metadata kontribusi foto; upload file tidak terverifikasi sebagai aktif. |
| `/api/user/activity` | POST | Wajib | Validasi ulang aktivitas, pencatatan verified dan EXP. |
| `/api/user/learning-profile` | GET | Wajib | EXP, activity summary, riwayat dan skor verified. |
| `/api/league/leaderboard` | GET | Opsional | Papan skor berdasarkan ledger verified. |
| `/api/league/achievements` | GET | Opsional | Definisi dan status unlock pengguna. |
| `/api/league/check-achievements` | POST | Wajib | Evaluasi achievement akun. |
| `/api/admin/ml-stats` | GET | Admin | Statistik scanner/candidate yang dianonimkan. |

Kontrak dan auth di atas berasal dari handler source pada audit. Periksa handler untuk validasi/status detail sebelum konsumsi baru. Tidak ada klaim bahwa endpoint production tersedia.

## Klasifikasi akses dan batas keamanan

| Kelas | Endpoint | Kontrol yang tampak pada source | Gap yang perlu ditutup/diuji |
|---|---|---|---|
| Public, no-cost/read | `/api/search`, `/api/knowledge`, `/api/league/leaderboard`, `/api/league/achievements` | Search dan leaderboard memvalidasi parameter tertentu; leaderboard hanya mengeluarkan display name/progres publik; knowledge punya fallback lokal. | Tetapkan response fields yang memang boleh publik, input/body limits, cache policy, dan rate limits. |
| Public, provider/cost-bearing | `/api/nutripath`, `/api/ai-chat`, `/api/food-scanner`, `/api/food-scanner/explain` | API keys server-side; beberapa request/response field atau image type dibatasi; model timeout tersedia pada sebagian jalur. | Belum terlihat shared rate/quota/budget controls; beberapa body belum punya batas ukuran transport atau panjang field sebelum provider dipanggil. |
| Public, database write | `/api/auth/register`, `/api/food-scanner/candidate` | Validasi field dan database unique/pending checks; kandidat dapat menerima sesi opsional. | Rate-limit/abuse guard belum ditemukan. Registrasi membedakan identifier yang sudah digunakan. |
| Authenticated, own-data | `/api/profile`, `/api/food-scanner/save`, `/api/food-scanner/history`, `/api/food-scanner/photo-contribute`, `/api/user/activity`, `/api/user/learning-profile`, `/api/league/check-achievements` | Handler mengambil user ID dari Auth.js session; history/profile memakai user-scoped query; activity melakukan validasi server. | Uji ownership lintas user untuk semua object IDs. Photo contribution belum tampak memastikan `scanLogId` milik user yang sama; save menerima snapshot dari client dan butuh verifikasi/provenance server. |
| Admin | `/api/admin/ml-stats` | Role dibaca dari row user di database, bukan dipercayai dari body/client; output scan terbaru tidak membawa `userId`. | Uji role denial, minimisasi data, admin access audit dan log redaction. |
| Auth protocol | `/api/auth/[...nextauth]` | Handler Auth.js GET/POST dan CSRF/session disediakan oleh catch-all. | Uji CSRF/session guest/credentials dan cookie settings untuk preview/production; belum ada otomasi test. |

### Aturan kontrak untuk route baru

- Default ke deny; anotasi apakah route publik, authenticated-owner, atau admin dan siapa yang boleh membaca/menulis.
- Ambil `userId` dari session server, jangan percaya ID dari request/model. Tiap ID yang mengarah ke row harus dilindungi ownership check di query/mutasi yang sama bila memungkinkan.
- Validasi JSON schema, field allowlist, tipe, panjang, rentang, MIME dan batas bytes sebelum biaya DB/provider. Batas setelah `req.json()` tidak mencegah body besar dibaca ke memory.
- Untuk mutation gunakan idempotency saat retry dapat membuat duplikasi; raw SQL harus parameterized; batasi pagination dan response size.
- Uji CSRF pada custom cookie-authenticated mutations secara terpisah dari proteksi endpoint Auth.js; source review ini tidak memastikan semua browser-origin case.
- Provider/DB network calls memiliki timeout/cancellation, quota, dan logging teredaksi; jangan memasukkan prompt, gambar, credential, token, atau raw provider error ke log secara default.
- Tetapkan status/error response yang konsisten dan jangan mengembalikan internal exception, DB details, atau data user lain.

Lihat [SECURITY.md](../engineering/SECURITY.md) untuk temuan dan prioritas; matriks ini mengklasifikasikan kode source, bukan pengesahan endpoint production.
