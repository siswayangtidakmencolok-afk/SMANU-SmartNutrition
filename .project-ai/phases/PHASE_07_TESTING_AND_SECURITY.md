# PHASE 07 — Testing and Security

**Status:** IN PROGRESS — source review selesai, implementation/test gates belum selesai

## Tujuan

Menambah regresi otomatis dan memvalidasi batas auth, data, provider, serta privasi.

## Kondisi awal

`package.json` menyediakan lint/build, bukan test script. Beberapa utilitas manual ada. Root typecheck pernah terkena generated `.next/dev/types/routes.d.ts`; catat dan jangan hapus generated files untuk menutupi hasil.

Source-only security review 2026-11-12 mendata prioritas di `engineering/SECURITY.md`: throttling/provider cost, payload limits, `photo-contribute` ownership, scanner snapshot provenance, Auth secret consistency, and missing CI/tests. Ini belum pentest/dependency audit. Tidak ditemukan test suite atau `.github/workflows` pada inventaris workspace.

## Task aktif

SMANU-001 pada `project-management/NEXT_TASK.md`.

## File terkait

API route kritis, `auth.ts`, schema/migrations, package/testing config, scripts.

## Acceptance/testing

Suite unit repeatable terpisah dari smoke test provider/DB live; log tersanitasi; auth ownership, idempotency, fallback/error diuji.

Tambahkan access matrix guest/owner/other-user/admin, schema and body size tests sebelum parse/provider, concurrency/idempotency test di DB terisolasi, dan budget/rate-limit tests tanpa menghubungkan ke production.

## Risiko

Test terhubung ke production DB, fake success result, secret/payload muncul di log.

## Exit criteria

Test runner dan coverage kontrak inti ada; risiko/gap yang belum dites didaftarkan.

Security baseline harus punya bukti verifikasi lintas-user untuk tiap route object ID dan tidak mencatat secret/PII. Pentest dan load test memerlukan scope/izin terpisah serta tidak disubstitusi oleh lint/build.
