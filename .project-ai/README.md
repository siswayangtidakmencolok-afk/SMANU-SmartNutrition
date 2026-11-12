# Dokumentasi Proyek SMANU

**Pembaruan:** 2026-11-12<br>
**Status:** Dokumentasi dibuat dari audit source code; konfigurasi runtime pihak ketiga belum diverifikasi ulang.

## Tujuan

Folder ini adalah konteks teknis yang dapat diperbarui untuk AI coding agent dan maintainer SMANU — SmartNutrition for Students. Source code di repository root adalah acuan implementasi; dokumen ini mencatat status bukti, batasan, dan pekerjaan berikutnya tanpa menyatakan konfigurasi eksternal aktif.

## Urutan baca untuk agent

1. [AGENT.md](AGENT.md) — aturan kerja.
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — identitas dan batasan produk.
3. [PROJECT_STATUS.md](PROJECT_STATUS.md) — status modul berdasarkan bukti.
4. [project-management/NEXT_TASK.md](project-management/NEXT_TASK.md) — satu task yang ditetapkan untuk sesi berikutnya.
5. [history/SESSION_HANDOFF.md](history/SESSION_HANDOFF.md) — konteks perubahan terbaru.
6. Dokumen pada [architecture/](architecture/), [modules/](modules/), [database/](database/), atau [engineering/](engineering/) sesuai task.

## Indeks

- [Arsitektur](architecture/SYSTEM_ARCHITECTURE.md) · [AI](architecture/AI_ARCHITECTURE.md) · [API](architecture/API_ARCHITECTURE.md)
- [Modul](modules/ASK_SMANU.md) · [Autentikasi](modules/AUTHENTICATION.md) · [Food Scanner](modules/FOOD_SCANNER.md) · [League](modules/STUDENT_NUTRITION_LEAGUE.md)
- [Database/schema](database/DATABASE_SCHEMA.md) · [Keamanan](engineering/SECURITY.md) · [Environment](engineering/ENVIRONMENT_VARIABLES.md) · [Deployment](engineering/DEPLOYMENT.md)
- [Roadmap](project-management/ROADMAP.md) · [Task berikutnya](project-management/NEXT_TASK.md) · [Riwayat sesi](history/SESSION_HANDOFF.md)

## Struktur

Dokumen dibagi menjadi arsitektur, modul, database, engineering, manajemen proyek, riwayat, dan fase. [FOLDER_STRUCTURE.md](architecture/FOLDER_STRUCTURE.md) menjelaskan direktori source aktual. [PROJECT_STATUS.md](PROJECT_STATUS.md) membedakan VERIFIED, PARTIALLY VERIFIED, PLANNED, NOT IMPLEMENTED, dan UNKNOWN.

## Daftar dokumen

- **Root:** [README](README.md), [AGENT](AGENT.md), [PROMPT](PROMPT.md), [PROJECT_CONTEXT](PROJECT_CONTEXT.md), [PROJECT_STATUS](PROJECT_STATUS.md).
- **Arsitektur:** [SYSTEM_ARCHITECTURE](architecture/SYSTEM_ARCHITECTURE.md), [FOLDER_STRUCTURE](architecture/FOLDER_STRUCTURE.md), [FRONTEND_ARCHITECTURE](architecture/FRONTEND_ARCHITECTURE.md), [BACKEND_ARCHITECTURE](architecture/BACKEND_ARCHITECTURE.md), [API_ARCHITECTURE](architecture/API_ARCHITECTURE.md), [AI_ARCHITECTURE](architecture/AI_ARCHITECTURE.md), [DATA_FLOW](architecture/DATA_FLOW.md), [INTEGRATIONS](architecture/INTEGRATIONS.md).
- **Modul:** [AUTHENTICATION](modules/AUTHENTICATION.md), [ASK_SMANU](modules/ASK_SMANU.md), [LANGFLOW_RAG](modules/LANGFLOW_RAG.md), [NUTRITION_KNOWLEDGE](modules/NUTRITION_KNOWLEDGE.md), [FOOD_SCANNER](modules/FOOD_SCANNER.md), [STUDENT_NUTRITION_LEAGUE](modules/STUDENT_NUTRITION_LEAGUE.md), [USER_PROFILE](modules/USER_PROFILE.md), [SHARED_COMPONENTS](modules/SHARED_COMPONENTS.md).
- **Database:** [DATABASE_SCHEMA](database/DATABASE_SCHEMA.md) (mencakup arsitektur akses dan batas verifikasi database), [TABLES_AND_RELATIONS](database/TABLES_AND_RELATIONS.md), [MIGRATIONS](database/MIGRATIONS.md), [DATA_DICTIONARY](database/DATA_DICTIONARY.md).
- **Engineering:** [TECH_STACK](engineering/TECH_STACK.md), [CODING_STANDARDS](engineering/CODING_STANDARDS.md), [SECURITY](engineering/SECURITY.md), [TESTING](engineering/TESTING.md), [ERROR_HANDLING](engineering/ERROR_HANDLING.md), [DEPLOYMENT](engineering/DEPLOYMENT.md), [ENVIRONMENT_VARIABLES](engineering/ENVIRONMENT_VARIABLES.md).
- **Manajemen proyek:** [ROADMAP](project-management/ROADMAP.md), [PHASES](project-management/PHASES.md), [TASKS](project-management/TASKS.md), [NEXT_TASK](project-management/NEXT_TASK.md), [TASK_TEMPLATE](project-management/TASK_TEMPLATE.md), [PRIORITIES](project-management/PRIORITIES.md), [ACCEPTANCE_CRITERIA](project-management/ACCEPTANCE_CRITERIA.md).
- **Riwayat:** [CHANGELOG](history/CHANGELOG.md), [COMMIT_HISTORY](history/COMMIT_HISTORY.md), [TECHNICAL_DECISIONS](history/TECHNICAL_DECISIONS.md), [BUG_HISTORY](history/BUG_HISTORY.md), [SESSION_HANDOFF](history/SESSION_HANDOFF.md).
- **Fase:** [PHASE_00_AUDIT](phases/PHASE_00_AUDIT.md), [PHASE_01_STABILIZATION](phases/PHASE_01_STABILIZATION.md), [PHASE_02_CORE_SYSTEM](phases/PHASE_02_CORE_SYSTEM.md), [PHASE_03_AI_AND_RAG](phases/PHASE_03_AI_AND_RAG.md), [PHASE_04_FOOD_SCANNER](phases/PHASE_04_FOOD_SCANNER.md), [PHASE_05_USER_EXPERIENCE](phases/PHASE_05_USER_EXPERIENCE.md), [PHASE_06_LEAGUE_AND_GAMIFICATION](phases/PHASE_06_LEAGUE_AND_GAMIFICATION.md), [PHASE_07_TESTING_AND_SECURITY](phases/PHASE_07_TESTING_AND_SECURITY.md), [PHASE_08_PRODUCTION_READINESS](phases/PHASE_08_PRODUCTION_READINESS.md).

## Cara memilih dan memperbarui task

- Edit `project-management/NEXT_TASK.md` secara manual untuk menetapkan pekerjaan berikutnya. Agent tidak boleh mengganti task tersebut secara otomatis.
- Gunakan `TASK_TEMPLATE.md` untuk task baru, lalu catat di `TASKS.md` dan fase yang relevan.
- Setelah perubahan kode, jalankan pemeriksaan relevan, perbarui status hanya berdasarkan bukti, dan lengkapi `history/SESSION_HANDOFF.md`.
- Perbarui `CHANGELOG.md` dan `COMMIT_HISTORY.md` hanya dari perubahan/commit yang benar-benar terjadi. Perubahan lokal tanpa commit harus ditandai **UNCOMMITTED WORK**.
- Jangan menaruh credential, nilai `.env`, data pengguna, atau salinan database di dokumentasi.

## Status proyek terakhir

Source aplikasi berada di root repository dan memakai Next.js App Router. Audit ini memeriksa konfigurasi, halaman, route API, skema Drizzle, migration, integrasi AI, serta git log. Route dan provider dapat diidentifikasi dari kode, tetapi koneksi Langflow/AI dan deployment Vercel tidak diuji ulang dalam pekerjaan dokumentasi ini. Lihat [PROJECT_STATUS.md](PROJECT_STATUS.md) untuk batasan per modul.

Audit dokumentasi/security 2026-11-12 adalah source review saja: tidak ada penetration test, dependency scan, load test, atau verifikasi environment Vercel/Neon baru. Temuan dan tindak lanjut ada di [SECURITY.md](engineering/SECURITY.md), [AI_ARCHITECTURE.md](architecture/AI_ARCHITECTURE.md), [ROADMAP.md](project-management/ROADMAP.md), dan [TASKS.md](project-management/TASKS.md). MCP/Mastra dan vector DB belum terintegrasi.

## Catatan sumber lama

Root [README.md](../README.md) dan [smanu-production-plan.md](../smanu-production-plan.md) berisi referensi scaffold/rencana yang tidak sepenuhnya sesuai source saat ini (antara lain Next.js 15, struktur `nutripath/`, demo mock, dan rencana provider ganda). Catat perbedaan ini; jangan menganggapnya sebagai kondisi runtime.
