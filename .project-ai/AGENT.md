# Aturan Kerja AI Agent

**Pembaruan:** 2026-11-12

## Sebelum mulai

1. Baca `PROJECT_CONTEXT.md`, `PROJECT_STATUS.md`, `project-management/NEXT_TASK.md`, dan `history/SESSION_HANDOFF.md`.
2. Baca dokumen arsitektur/modul yang berkaitan, lalu periksa source aktual. Dokumentasi bukan pengganti source.
3. Periksa branch, status Git, diff, file staged/unstaged, dan file untracked. Jangan menghapus, menimpa, atau men-stage perubahan pengguna.
4. Ikuti task yang ditetapkan pengguna. `NEXT_TASK.md` adalah task berikutnya hanya jika tidak ada instruksi pengguna yang lebih baru; jangan mengganti isinya tanpa izin.

## Prinsip perubahan

- Pertahankan fitur yang berfungsi; perbaiki penyebab inti dan jangan membuat implementasi duplikat.
- Jangan menghapus fitur tanpa persetujuan. Jangan membuat mock sebagai pengganti layanan production atau mengklaim integrasi aktif hanya karena route/config ada.
- Jangan mengarang API, tabel, environment variable, data, atau hasil tes. Tandai klaim UNKNOWN bila bukti tidak tersedia.
- Jangan membaca/menampilkan nilai secret; gunakan hanya nama environment variable pada dokumentasi. Secret hanya di server.
- Jangan menjalankan migrasi production, deployment, commit, push, atau operasi Git destruktif tanpa izin eksplisit. Database production tidak boleh diubah tanpa persetujuan.
- Jaga validasi server, autentikasi/otorisasi, idempotensi, privasi, dan error yang dapat dipahami. Hindari fallback yang menyamarkan kegagalan.
- Untuk Next.js, patuhi blok instruksi root `AGENTS.md` dan baca panduan relevan di `node_modules/next/dist/docs/` sebelum perubahan kode Next.js.

## Implementasi dan verifikasi

- Ikuti pola, penamaan, localization, dan tipe yang sudah ada. Perubahan dokumentasi harus berbahasa Indonesia teknis dan mencantumkan path aktual.
- Uji perubahan dengan lint, TypeScript, build, atau pengujian spesifik yang tersedia; laporkan tes yang tidak dapat dijalankan.
- Perubahan dokumentasi harus memeriksa link relatif, konsistensi klaim/status, dan ketiadaan secret.
- Setelah pekerjaan, perbarui dokumen modul/arsitektur/status yang terdampak, task bila sesuai, changelog, dan session handoff. Jangan mengarang commit.

## Konflik instruksi

Instruksi pengguna terbaru mengungguli task lama. Jika batasan keselamatan, akses, perubahan worktree pengguna, atau kebutuhan keputusan menghalangi, berhenti pada bagian itu dan minta keputusan yang diperlukan.
