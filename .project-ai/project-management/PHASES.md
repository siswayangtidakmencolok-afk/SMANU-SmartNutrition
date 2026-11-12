# Peta Fase

**Pembaruan:** 2026-11-12

| Fase | Nama | Status |
|---|---|---|
| 00 | Audit | COMPLETED — audit source dan dokumentasi kondisi aktual selesai; runtime eksternal dicatat belum diverifikasi. |
| 01 | Stabilization | PARTIALLY COMPLETE — kode inti ada; tes regresi/runtime belum cukup. |
| 02 | Core System | PARTIALLY COMPLETE — auth, DB, profile dan halaman tersedia; perilaku environment perlu uji. |
| 03 | AI and RAG | BLOCKED — production Ask API ditolak karena `LANGFLOW_SERVER_URL` bukan HTTPS; akses Vercel dan Flow ID belum diverifikasi. |
| 04 | Food Scanner | PARTIALLY COMPLETE — pipeline source ada; live data/provider/storage belum semua diverifikasi. |
| 05 | User Experience | PARTIALLY COMPLETE — banyak halaman responsif; audit browser lintas ukuran belum tercatat. |
| 06 | League and Gamification | PARTIALLY COMPLETE — persistent verified design dan migration ada; account/race tests tertunda. |
| 07 | Testing and Security | IN PROGRESS — task aktif berikutnya. |
| 08 | Production Readiness | BLOCKED — deployment/environment eksternal tidak dapat diverifikasi dari repository saja. |

Detail tujuan dan exit criteria pada dokumen `PHASE_00_AUDIT.md` sampai `PHASE_08_PRODUCTION_READINESS.md`.
