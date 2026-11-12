# PHASE 00 — Audit

**Status:** COMPLETED (audit source); layanan eksternal tetap belum diverifikasi.

## Tujuan dan kondisi awal

Mengenali project root, fitur, konfigurasi, database code, integrasi, dokumentasi, dan Git worktree sebelum membuat dokumentasi. Package root adalah repository root.

## Ruang lingkup dan task

- Baca manifest/config/route/component/schema/migrations.
- Inventaris source dan existing docs.
- Periksa branch/log/status Git read-only.
- Catat env variable names saja.
- Pisahkan fakta dari runtime yang belum dibuktikan.

## File terkait

`package.json`, `app/`, `components/`, `lib/`, `auth.ts`, `middleware.ts`, `lib/db/`, root docs, `.project-ai/`.

## Dependensi dan risiko

Tidak ada perubahan aplikasi atau database. Risiko audit utama adalah menimpa file pengguna yang sudah dirty/untracked; file itu dipertahankan.

## Acceptance, testing, exit

Exit source audit terpenuhi dengan status dan bukti tersimpan di `PROJECT_STATUS.md`; Vercel/provider live secara eksplisit tidak termasuk bukti audit. Status runtime eksternal tidak menghalangi penutupan audit source.
