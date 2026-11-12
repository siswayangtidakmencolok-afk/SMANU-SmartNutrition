# Keamanan dan Privasi

**Pembaruan:** 2026-11-12

## Kontrol yang tampak pada source

- Password registration di-hash bcrypt; hash dikecualikan dari response profile.
- Auth.js memakai JWT dan credentials. Route user-specific mengambil session di server.
- Activity API menghitung ulang skor quest/challenge dan memeriksa ownership scan; idempotency key dan ledger verified mencegah duplikasi normal.
- Admin ML stats mengecek role dari tabel users dan membatasi field scan yang dipulangkan.
- Food recognition memiliki batas tipe dan ukuran gambar; source menyatakan gambar diproses in-memory.
- Secret provider dibaca via env server-side; tidak diletakkan di bundle client.
- Foto kontribusi mewajibkan auth dan consent di route.

## Batas dan hal yang harus diverifikasi

- Middleware hanya matcher `/login` dan `/register`; authorization tetap harus ditegakkan tiap API.
- Belum ada audit penetrasi atau pengujian production pada pekerjaan dokumentasi.
- Route photo contribution yang diperiksa menyimpan metadata, bukan bytes gambar. Jangan klaim object storage aman/aktif hanya dari nama environment.
- Log/error harus disanitasi: jangan mencatat key, token, connection string, gambar, password, atau payload pribadi.
- Nilai environment lokal tidak ditampilkan dalam audit dan tidak boleh didokumentasikan.
- Data nutrisi hasil AI adalah estimate; jangan menampilkan sebagai nilai klinis terverifikasi.

Laporan ini ringkasan kontrol source, bukan security review penuh. Lihat [AUTHENTICATION.md](../modules/AUTHENTICATION.md), [FOOD_SCANNER.md](../modules/FOOD_SCANNER.md), dan [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).
