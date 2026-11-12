# PHASE 07 — Testing and Security

**Status:** IN PROGRESS

## Tujuan

Menambah regresi otomatis dan memvalidasi batas auth, data, provider, serta privasi.

## Kondisi awal

`package.json` menyediakan lint/build, bukan test script. Beberapa utilitas manual ada. Root typecheck pernah terkena generated `.next/dev/types/routes.d.ts`; catat dan jangan hapus generated files untuk menutupi hasil.

## Task aktif

SMANU-001 pada `project-management/NEXT_TASK.md`.

## File terkait

API route kritis, `auth.ts`, schema/migrations, package/testing config, scripts.

## Acceptance/testing

Suite unit repeatable terpisah dari smoke test provider/DB live; log tersanitasi; auth ownership, idempotency, fallback/error diuji.

## Risiko

Test terhubung ke production DB, fake success result, secret/payload muncul di log.

## Exit criteria

Test runner dan coverage kontrak inti ada; risiko/gap yang belum dites didaftarkan.
