# Roadmap

**Pembaruan:** 2026-11-12

Roadmap ini diurutkan menurut risiko dan bukti audit, bukan janji rilis. Source review dokumentasi 2026-11-12 menemukan baseline yang cukup untuk mengarahkan tindak lanjut, tetapi bukan pengesahan security atau kapasitas production.

1. **Security baseline (P1, sebelum pertumbuhan):** tutup ownership check `photo-contribute`, validasi payload dan size pre-parse, provider/auth throttling serta budget controls, secret fail-closed, scan snapshot provenance; tambah tes akses guest/owner/other-user/admin. Lihat [SECURITY.md](../engineering/SECURITY.md).
2. **Regression and CI (P1):** tambahkan test runner dan CI checks untuk Auth, API contract, data isolation, AI error/fallback, scanner provenance, serta League idempotency; pakai test DB dan provider mock/sandbox yang terpisah dari production.
3. **Ask SMANU production (P1):** lanjutkan SMANU-002 melalui URL HTTPS dan Flow ID/flow valid yang dikonfirmasi pemilik; uji server egress, SSE success/error, provider, dan UI. Jangan mengubah prioritas provider sebelum verifikasi dan persetujuan.
4. **Database/data governance (P1):** verifikasi DB role, backup/restore, RPO/RTO, retention/deletion, schema per environment, query indexes dan ownership. Jangan migrasi production tanpa persetujuan.
5. **AI/RAG modularization (P2):** definisikan evaluation set, groundedness/provenance, data minimization, model/provider comparison yang bertanggal, token/cost/latency metrics dan routing policy. Tidak ada vector store/embedding/MCP/Mastra aktif yang dapat diasumsikan.
6. **MCP feasibility (P2, optional):** hanya lakukan pilot read-only jika ada kebutuhan tool interoperable; design MCP tool allowlist, server-side identity/authorization, resource minimization, consent, timeout/quota, audit and trust boundaries. Mastra adalah kandidat, belum diintegrasikan.
7. **Scale validation (P2):** tetapkan target p95/error/cost, lakukan load/query test dengan data sintetis di staging, ukur concurrency/cold starts/provider quota, lalu pilih caching/queue/indexing hanya dari hasil benchmark.
8. **Feature validation (P1/P2):** uji Food Scanner unknown-food, verified-vs-estimated nutrition, persistence dan consent; uji League uniqueness/konkurensi; audit responsive/accessibility UX.
9. **Production readiness (P1):** verifikasi domain, Vercel project/environment/build/logging, database migration status, provider access, incident response, monitoring, privacy, and recovery sebelum klaim siap produksi.

Task yang boleh dikerjakan agent pada sesi berikutnya ditentukan manual dalam [NEXT_TASK.md](NEXT_TASK.md). Fase ada di `../phases/`; fase tidak selesai hanya karena UI/source ada.

Urutan implementasi perubahan prioritas dicatat di [TASKS.md](TASKS.md). Target "ribuan pengguna" adalah sasaran perencanaan, bukan kapasitas teruji; belum ada load test yang membuktikan target tersebut.
