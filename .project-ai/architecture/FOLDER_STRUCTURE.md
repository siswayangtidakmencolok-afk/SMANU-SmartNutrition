# Struktur Direktori

**Pembaruan:** 2026-11-12

| Path | Fungsi aktual |
|---|---|
| `app/` | App Router, layout, halaman, dan API routes. |
| `app/(main)/` | Halaman utama aplikasi: Ask SMANU, knowledge, League, profile, history, challenge, dashboard. |
| `app/(auth)/` | Halaman login/register. |
| `app/api/` | Handler server untuk auth, AI, profile, scanner, learning, leaderboard, knowledge, dan search. |
| `components/` | UI React, layout, scanner, AI chat, dashboard, league. |
| `components/ui/` | Komponen UI bersama. |
| `context/` | Context auth dan histori browser. |
| `lib/` | Logika domain, data statis, retrieval, penyimpanan lokal, DB, EXP/achievement. |
| `lib/db/` | Drizzle schema, koneksi Neon, SQL migrations. |
| `data/` | Dataset/data aplikasi; isi harus diperiksa sebelum dipakai atau diganti. |
| `public/` | Aset publik dan gambar lokal. |
| `scripts/` | Script migrasi, seed, pemeriksaan, serta evaluasi manual; bukan otomatis dijalankan saat build. |
| `.project-ai/` | Dokumentasi AI dan task management ini. |
| `.bob/`, `.vscode/`, `.next/`, `node_modules/` | Tooling/generated/dependencies; jangan menimpa atau menghapus tanpa task dan pemeriksaan status. |

## Catatan penting

Root adalah package Next.js (`package.json`). Komentar/path contoh di README dan beberapa komentar source menyebut subfolder `nutripath/`; jangan menganggap folder tersebut sebagai root aplikasi. Ada direktori `nutripath/` untracked pada saat audit, sehingga jangan menyentuhnya tanpa scope dan izin. File `.bob/artifacts/...` serta `dir` juga tercatat terhapus di worktree saat audit dan bukan bagian dari dokumentasi baru.
