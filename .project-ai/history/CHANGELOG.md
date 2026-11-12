# Changelog Dokumentasi Proyek

## 2026-11-12 — Refinement radial desktop dan mobile

- Mengatur delapan widget menjadi diagram radial dengan hub lingkaran di tengah pada desktop dan komposisi perimeter dua kolom pada mobile.
- Menambahkan konektor responsif dan memperluas bidang gelap hub mengikuti workspace desktop, tanpa mengubah data fitur atau handler navigasi.
- Pengujian browser pada 360px, 375px, 390px, 412px, dan 1280px menunjukkan hub bulat, delapan widget terlihat, tanpa overflow horizontal/tumpang tindih; interaksi dua langkah dan CTA tetap bekerja.
- ESLint terfokus, TypeScript, production build, reduced-motion, dan `git diff --check` lulus.

## 2026-11-12 — Interactive Navigation Hub dashboard

- Mengganti header/hero teratas dashboard dengan SMANU Interactive Navigation Hub; widget data, challenge, materi, insight, dan footer yang berada di bawahnya tetap dipertahankan.
- Menambahkan navigasi dua langkah dengan preview yang bisa ditutup, CTA navigasi, komposisi radial dan animasi stagger, serta dukungan `prefers-reduced-motion`.
- Rute kartu scanner menunjuk ke Nutrition Knowledge karena AI Food Scanner saat ini berupa modal di halaman tersebut; tidak membuat route baru.
- Validasi browser pada 360px, 390px, dan 1280px menunjukkan tidak ada horizontal overflow atau tumpang tindih antar-widget. TypeScript, ESLint terfokus, dan production build lulus.
- **UNCOMMITTED WORK:** implementasi dashboard dan dokumentasi belum di-commit; tidak ada perubahan sidebar, autentikasi, route fitur, API, database, atau `.env.local`.

## 2026-11-12 — Temuan koneksi Ask SMANU production

- Production POST `/api/nutripath` mengembalikan HTTP 503 karena `LANGFLOW_SERVER_URL` bukan HTTPS.
- Mencatat bahwa route berhenti sebelum request Langflow; Gemini tidak menjadi fallback saat Langflow config invalid.
- Task SMANU-002 diblokir menunggu koreksi environment Vercel dan redeploy oleh pemilik yang berwenang.
- Vercel CLI tidak terautentikasi dan project tidak ter-link di workspace.
- **UNCOMMITTED WORK:** pembaruan dokumentasi/task saja; tidak ada perubahan aplikasi atau environment.

## 2026-11-12 — Pencatatan kondisi setelah audit repository

- Membuat sistem dokumentasi `.project-ai` dengan status evidence-based, peta API, modul, database, integrasi, engineering, task management, fase, dan handoff.
- Mencatat perbedaan root README/production plan lama dari source manifest terkini.
- Mencatat bahwa koneksi Langflow/AI dan deployment tidak diuji ulang pada audit dokumentasi.
- **UNCOMMITTED WORK:** file dokumentasi baru dan tambahan instruksi root `AGENTS.md`; belum dibuat commit.
- Tidak ada source fitur, database, provider, atau `.env.local` yang diubah oleh pekerjaan dokumentasi.

Changelog ini hanya mencatat perubahan yang benar-benar dilakukan dalam sesi ini; gunakan Git untuk riwayat kode.
