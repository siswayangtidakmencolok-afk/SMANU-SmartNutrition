# Deployment

**Pembaruan:** 2026-11-12<br>
**Status deployment:** UNKNOWN

## Konfigurasi repository

`vercel.json` mendeklarasikan framework `nextjs`, build `next build`, output `.next`, install `npm install`, region `sin1`. Root package juga menyediakan `npm run build`/`start`.

## Prosedur aman

1. Pastikan preview/production env memiliki nama variabel yang dibutuhkan (lihat [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)) tanpa membagikan nilai secret.
2. Pastikan migration DB yang diperlukan sudah diterapkan ke environment yang benar dan schema cocok; production migration perlu persetujuan.
3. Jalankan lint/build dan smoke checks pada preview.
4. Verifikasi Auth, database, AI provider, dan scanner dari log/status tanpa membocorkan payload/credential.
5. Lakukan deployment hanya dengan izin pengguna.

## Hal belum diverifikasi

Tidak ada akses dashboard/CLI/log Vercel yang diperiksa untuk audit ini. `vercel.json` saja tidak membuktikan project terhubung, domain aktif, env diset, build sukses, maupun provider terjangkau.
