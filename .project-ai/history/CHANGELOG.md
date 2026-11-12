# Changelog Dokumentasi Proyek

## 2026-11-12 — Konsolidasi audit arsitektur, AI, dan security

- Memperbarui dokumentasi AI/RAG, keamanan, klasifikasi API, Auth, database, testing, fase, status, roadmap, daftar task, environment, dan indeks berdasarkan source review.
- Mencatat Langflow/OpenAI/Gemini sebagai jalur yang sudah ada di source; MCP/Mastra dan vector DB sebagai belum terintegrasi. Rekomendasi evolusi bertahap mempertahankan API Next.js sebagai auth/policy boundary.
- Mendokumentasikan risiko source untuk payload/quota, ownership `photo-contribute`, provenance scanner snapshot, rate limiting, secret consistency, serta batas bukti DB/scale.
- Tidak membuat Markdown baru dan tidak mengubah source aplikasi, `.env.local`, database, migration, Vercel, atau task aktif `NEXT_TASK.md`.
- Validasi perubahan dokumentasi: `git diff --check` dan pemeriksaan tautan lokal; tidak menjalankan build karena source tidak berubah. Tidak melakukan pentest, dependency scan, load test, atau verifikasi runtime eksternal.

## 2026-11-12 — Memperbaiki lintasan intro bot Ask SMANU

- Animasi lintasan, jejak, efek pendorong, daun, dan teks kini dimulai setelah komponen terhidrasi, bukan sebelum class peluncuran aktif.
- Reduced-motion tetap menampilkan gerakan singkat dan salam tanpa efek tambahan; setelah tiba, bot kembali tegak dan diam di posisi tujuan.
- Browser mengonfirmasi posisi berubah selama lintasan pada mode normal serta mencapai posisi akhir tegak pada mode normal dan reduced-motion. TypeScript, ESLint terfokus, build, dan `git diff --check` lulus; lint halaman Ask masih memiliki diagnostic lama pada efek `searchParams`.

## 2026-11-12 — Visual hub dan karakter Ask SMANU

- Menambahkan orbit cahaya hijau dan daun SVG dekoratif di sekitar hub dashboard pusat.
- Mengganti ikon senyum/emoji pada halaman Ask SMANU dengan maskot bot inline; status mengubah ekspresi, fokus input mengarahkan tatapan, dan jadwal blink/angguk/miring/daun dibuat bergantian dengan jeda acak.
- Menonaktifkan gerakan melalui `prefers-reduced-motion`; tidak mengubah request Langflow, kontrak SSE, Auth.js, floating AI chat, atau Food Scanner.
- Validasi TypeScript dan production build lulus. ESLint pada komponen baru lulus; file Ask SMANU masih memiliki diagnostic lint existing di efek `searchParams` yang tidak terkait perubahan visual.

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
