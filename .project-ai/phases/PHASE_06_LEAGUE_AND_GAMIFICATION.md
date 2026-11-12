# PHASE 06 — League and Gamification

**Status:** PARTIALLY COMPLETE

## Tujuan

Menghitung EXP/tier/leaderboard/achievements hanya dari activity server verified dan idempotent.

## Kondisi awal

Route activity/profile/leaderboard, schema dan migration 0006 tersedia. Handoff terdahulu menyebut migration dijalankan/diverifikasi serta smoke test endpoint lulus; akun/race tests belum dilakukan.

## File terkait

`app/api/user/activity/route.ts`, `app/api/user/learning-profile/route.ts`, `app/api/league/**`, `lib/exp-system.ts`, `lib/achievement-checker.ts`, League components/pages, migration 0003/0006.

## Dependensi

Auth, Neon schema, server question bank/challenge scorer, scan ownership.

## Acceptance/testing

Uji score tampering, duplicate, concurrency, guest, legacy unverified rows, leaderboard windows, achievement reward uniqueness.

## Risiko

EXP ganda, migrasi environment salah, data browser lokal dianggap authoritative.

## Exit criteria

Account-backed integration dan race tests lulus di DB test/preview; jangan migrasi production tanpa izin.
