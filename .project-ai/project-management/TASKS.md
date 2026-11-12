# Daftar Task

**Pembaruan:** 2026-11-12<br>
Status yang digunakan: NOT STARTED, IN PROGRESS, BLOCKED, REVIEW REQUIRED, COMPLETED, CANCELLED.

| Task ID | Task | Phase | Priority | Status | Related Files |
|---|---|---|---|---|---|
| SMANU-001 | Menambahkan regression checks untuk alur API kritis | 07 | P1 | NOT STARTED | `package.json`, `app/api/**`, `scripts/` |
| SMANU-002 | Restore Ask SMANU Production AI Connectivity | 03 | P1 | BLOCKED | `app/(main)/ask-smanu/page.tsx`, `app/api/nutripath/route.ts`, Vercel environment |
| SMANU-003 | Menguji Food Scanner end-to-end dengan status provenance | 04 | P1 | BLOCKED | `components/FoodScannerModal.tsx`, `app/api/food-scanner/**` |
| SMANU-004 | Menguji verified activity League termasuk duplikasi/konkurensi | 06 | P1 | BLOCKED | `app/api/user/activity/route.ts`, migrations |
| SMANU-005 | Mengonfirmasi konfigurasi build dan environment Vercel | 08 | P1 | BLOCKED | `vercel.json`, deployment settings |
| SMANU-006 | Menyelaraskan README root setelah review maintainer | 01 | P2 | REVIEW REQUIRED | `README.md`, `.project-ai/README.md` |
| SMANU-007 | Menerapkan Interactive Navigation Hub pada dashboard | 05 | P2 | COMPLETED | `app/(main)/page.tsx`, `components/dashboard/DashboardNavigationHub.tsx`, `app/globals.css` |

BLOCKED berarti perlu provider/environment/akun atau akses pemilik; jangan meminta nilai secret melalui chat. Perbarui status hanya setelah bukti tersedia.
