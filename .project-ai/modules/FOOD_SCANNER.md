# AI Food Scanner

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED

## 1. Purpose

Memberi kandidat identitas visual makanan, data nutrisi rujukan berskala porsi, atau estimasi AI yang diberi label jelas.

## 2. Current Implementation

Modal menerima JPEG/PNG/WebP hingga 4 MiB, mengirim Base64 ke Gemini Vision, mencocokkan kandidat dengan katalog, lalu meminta nutrition endpoint. Jika data tidak ditemukan, UI meminta Gemini explain endpoint. Login diperlukan untuk menyimpan scan.

## 3. Directory and Files

- `components/FoodScannerModal.tsx`
- `app/api/food-scanner/route.ts`
- `app/api/food-scanner/nutrition/route.ts`
- `app/api/food-scanner/explain/route.ts`
- `app/api/food-scanner/save/route.ts`
- `app/api/food-scanner/history/route.ts`
- `app/api/food-scanner/candidate/route.ts`
- `app/api/food-scanner/photo-contribute/route.ts`
- `lib/food-database.ts`, `lib/db/schema.ts`

## 4. Architecture

Vision membuat nama/candidate dan kualitas gambar saja. Nutrisi utama datang dari in-memory TKPI, lalu `food_items`; AI estimate adalah jalur eksplisit saat data referensi tidak ditemukan, bukan fakta verified.

## 5. Data Flow

Gambar diproses in-memory oleh endpoint recognition. Confirmed result dapat disimpan ke `food_scan_logs` oleh user terautentikasi. Guest dapat mencoba recognition/lookup tetapi tidak menyimpan history pribadi.

## 6. API Endpoints

Daftar lengkap method/auth/tujuan ada di [API_ARCHITECTURE.md](../architecture/API_ARCHITECTURE.md).

## 7. Database Dependencies

`food_items`, `food_scan_logs`, `candidate_foods`, `photo_contributions`; migration 0001–0005 menambah data/fungsi scanner.

## 8. External Dependencies

Gemini API untuk recognition/explanation; Neon untuk lookup tambahan dan persistence. `BLOB_READ_WRITE_TOKEN` direferensikan source kontribusi, namun route yang diperiksa hanya menyimpan metadata dan `photoStorageRef: null`; jangan klaim foto benar-benar terupload.

## 9. Current Status

Route, validasi format/ukuran, data status source, dan session check terlihat pada code. Provider, DB production, dan alur browser live belum diuji dalam audit dokumentasi.

## 10. Known Bugs

Route kontribusi melaporkan state `storageEnabled` berdasarkan token dan menyebut upload, tetapi implementasi yang diperiksa belum mengirim/menyimpan bytes gambar ke object storage.
Source review 2026-11-12 juga menemukan `photo-contribute` belum terlihat memvalidasi bahwa `scanLogId` dimiliki user yang login, dan `/save` menyimpan beberapa nilai nutrisi/provenance dari request client tanpa bukti verifikasi server. Lihat prioritas P1 pada [SECURITY.md](../engineering/SECURITY.md); keduanya belum diperbaiki oleh pembaruan dokumentasi ini.

## 11. Limitations

Foto tidak membuktikan resep, bahan tersembunyi, atau berat. Porsi perkiraan bukan pengukuran. Data kosong/missing harus tampil sebagai null, bukan nol.

## 12. Pending Improvements

Tambahkan regression tests pipeline dan ownership; hitung/verifikasi snapshot nutrition/provenance server-side. Jika object storage dikerjakan, pastikan consent, ownership, retention/deletion, validasi upload, dan lifecycle diuji.

## 13. Testing

Ada beberapa script manual `scripts/test-*`/evaluation, tetapi bukan script test otomatis npm. Tidak dijalankan pada pekerjaan dokumentasi.

## 14. Related Tasks

[Database schema](../database/DATABASE_SCHEMA.md), [Environment variables](../engineering/ENVIRONMENT_VARIABLES.md).
