# Roadmap

**Pembaruan:** 2026-11-12

Roadmap ini diurutkan menurut risiko dan bukti audit, bukan janji rilis.

1. **Stabilisasi/verifikasi kritis (P1):** tambahkan regression checks untuk kontrak Auth, AI, Food Scanner, dan League; validasi environment/preview dengan akses yang sah.
2. **Core persistence:** dokumentasikan dan uji batas localStorage vs server DB; pastikan account/guest flow konsisten.
3. **AI & RAG:** uji Langflow Cloud aktif, parsing respons, timeout, dan output section; jangan mengganti provider atau fallback tanpa keputusan.
4. **Food Scanner:** uji kualitas/unknown food, provenance nutrition, persistence, consent dan klaim storage.
5. **UX:** audit responsivitas dan aksesibilitas semua halaman dengan browser yang didukung.
6. **League:** verifikasi idempotensi/konkurensi dengan akun dan database test environment.
7. **Production readiness:** verifikasi domain, Vercel build, env, migrasi, observability, privasi dan acceptance criteria sebelum klaim siap produksi.

Task yang boleh dikerjakan agent pada sesi berikutnya ditentukan manual dalam [NEXT_TASK.md](NEXT_TASK.md). Fase ada di `../phases/`; fase tidak selesai hanya karena UI/source ada.
