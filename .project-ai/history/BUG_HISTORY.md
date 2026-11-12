# Riwayat Bug dan Gap yang Teramati

**Pembaruan:** 2026-11-12<br>
Dokumen ini mencatat gap dari source atau handoff, bukan laporan vulnerability.

| ID | Observasi | Bukti/status |
|---|---|---|
| OBS-001 | README dan rencana lama tidak sejalan dengan versi/struktur/provider sekarang. | Divergensi source vs docs diverifikasi pada audit. |
| OBS-002 | Test script project tidak ada pada package manifest. | `package.json` hanya dev/build/start/lint; regression suite belum ditemukan. |
| OBS-003 | Ask client mengabaikan SSE `error` event; saat ini route error utama berupa JSON non-2xx dan SSE sukses memuat meta/token/done. | Terlihat source; belum direproduksi sebagai bug runtime. |
| OBS-004 | Photo contribution mengindikasikan status storage dari token, tetapi handler menyimpan metadata dengan `photoStorageRef: null` dan tidak meng-upload file. | Divergensi kontrak/comment vs implementasi source; jangan klaim foto ter-upload. |
| OBS-005 | Root TypeScript check pada catatan sesi sebelumnya gagal di generated `.next/dev/types/routes.d.ts`. | Perlu diperiksa ulang hanya jika menjalankan typecheck; jangan hapus `.next` tanpa scope. |
| OBS-006 | Langflow, Gemini/OpenAI, Vercel, dan akun production tidak diuji ulang pada audit dokumentasi. | UNVERIFIED, bukan bukti kegagalan. |
| OBS-007 | League activity login/race-condition belum diuji pada catatan sebelumnya. | Test gap, bukan bukti duplicate award terjadi. |
| OBS-008 | Ask SMANU production POST ditolak HTTP 503: `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` | Direproduksi 2026-11-12 pada public API; validation terjadi sebelum fetch Langflow. Production URL config perlu diperbaiki; flow ID/key/access belum diverifikasi. |

Sebelum memperlakukan item sebagai bug aktif, reproduksi pada environment yang sesuai dan update status dengan bukti.
