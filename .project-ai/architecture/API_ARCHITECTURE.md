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
