# PHASE 02 — Core System

**Status:** PARTIALLY COMPLETE

## Tujuan

Memelihara kerangka App Router, Auth, profile, route API, dan akses persistent data.

## Kondisi awal

Route/layout, credentials auth, profile API, Neon/Drizzle schema dan migrations ditemukan. Production auth/database reachability belum diuji pada audit dokumentasi.

## Ruang lingkup dan file terkait

`app/layout.tsx`, `app/(main)/layout.tsx`, `auth.ts`, `middleware.ts`, `app/api/profile/route.ts`, `lib/db/`.

## Dependensi

Environment database dan auth, migrations yang sesuai per environment.

## Acceptance/testing

Guest/login, profile ownership, validasi input, DB error handling, migration compatibility diuji tanpa mengungkap data.

## Risiko

Mengubah credentials/hash/schema dapat merusak akun dan production data.

## Exit criteria

Contract core tervalidasi pada preview/test environment dan regression checks tersedia.
