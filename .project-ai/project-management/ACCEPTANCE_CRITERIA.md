# Kriteria Penerimaan Lintas Proyek

**Pembaruan:** 2026-11-12

Setiap task dinyatakan selesai hanya bila:

1. Acceptance criteria spesifik task terpenuhi dan bukti dicatat.
2. Perubahan mempertahankan kontrak API/UI atau mendokumentasikan perubahan yang disetujui.
3. Tidak ada secret, data pengguna, mock production, atau nilai palsu.
4. Error, guest, loading, empty, retry, dan hak akses relevan ditangani.
5. Lint/type/build dan tes terfokus yang tersedia lulus; keterbatasan dijelaskan.
6. Database/provider/deployment runtime diuji hanya pada environment dan dengan izin yang tepat.
7. Dokumentasi status/arsitektur/modul/handoff yang terdampak diperbarui.
8. File staged/unstaged/untracked milik pengguna tetap utuh.
9. Commit/push/deploy/migration tidak dilakukan tanpa instruksi eksplisit.

Kriteria khusus modul tersedia pada [TASKS.md](TASKS.md), dokumen modul, dan fase terkait.
