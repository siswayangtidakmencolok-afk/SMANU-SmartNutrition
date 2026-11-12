# PHASE 04 — Food Scanner

**Status:** PARTIALLY COMPLETE

## Tujuan

Identifikasi visual yang transparan, nutrition reference/estimate berlabel, dan penyimpanan hasil dengan izin.

## Kondisi awal

Gemini Vision, lookup data lokal/DB, fallback explain dan save/history/candidate routes tersedia di source. Runtime belum diuji pada audit ini. Photo contribution yang diperiksa menyimpan metadata; upload bytes belum dibuktikan.

## Ruang lingkup

`FoodScannerModal`, route `app/api/food-scanner/`, `lib/food-database.ts`, scanner schema/migrations.

## Dependensi

Gemini key, DB migrated, test image non-pribadi dan akun test bila perlu.

## Acceptance/testing

Validasi file/MIME/size, quality gate, candidate match, reference nutrition vs AI estimate, guest/login persistence, delete ownership dan consent.

## Risiko

Asumsi resep/berat, estimasi dianggap fakta, foto tersimpan tanpa consent.

## Exit criteria

Pipeline test repeatable; setiap angka memiliki source/status dan batasan jelas.
