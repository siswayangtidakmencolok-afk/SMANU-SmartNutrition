# Profil Pengguna dan Learning Journey

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED

## 1. Purpose

Menyediakan data profil pengguna, konteks pribadi yang dipilih, dan ringkasan aktivitas belajar.

## 2. Current Implementation

`/api/profile` mengembalikan profil aman dan memperbarui field yang diizinkan. `/api/user/learning-profile` mengembalikan EXP, level/tier, aktivitas verified, agregat domain, dan EXP history untuk user login. Dashboard/Learning Journey meminta API tersebut.

## 3. Directory and Files

- `app/(main)/my-context/page.tsx`, `app/(main)/settings/page.tsx`
- `app/(main)/learning-journey/page.tsx`
- `components/dashboard/LiveContextWidget.tsx`
- `context/AuthContext.tsx`
- `app/api/profile/route.ts`, `app/api/user/learning-profile/route.ts`
- `lib/learning-journey-store.ts`

## 4. Architecture

Identitas server dari Auth.js JWT; request body tidak boleh menentukan owner. Profil disimpan pada `users`; learning aggregates diambil dari activity/EXP ledger.

## 5. Data Flow

Halaman meminta API dan menampilkan loading/error untuk request. Beberapa preferensi konteks UI tetap merupakan state/client input; jangan anggap menjadi data profil server tanpa bukti API.

## 6. API Endpoints

- `GET/PATCH /api/profile` — auth wajib.
- `GET /api/user/learning-profile` — auth wajib; guest mendapat 401.

## 7. Database Dependencies

Kolom users: display/full name, username, email, age, school, grade, timestamps; aktivitas/EXP untuk learning profile.

## 8. External Dependencies

Auth.js dan Neon.

## 9. Current Status

Route dan UI diperiksa; pengalaman akun login aktual belum diuji pada audit ini.

## 10. Known Bugs

Data lokal yang masih digunakan oleh widget lama/legacy harus dibedakan dari hasil server, terutama score/history.

## 11. Limitations

Learning profile memerlukan login dan kolom/tabel migration yang sesuai. Profil API tidak mengembalikan password hash.

## 12. Pending Improvements

Tambah tes izin user sendiri, validasi PATCH, guest state, dan error/loading UI.

## 13. Testing

Tidak ada suite test otomatis project yang terdeteksi pada manifest.

## 14. Related Tasks

[Authentication](AUTHENTICATION.md), [League](STUDENT_NUTRITION_LEAGUE.md), [database dictionary](../database/DATA_DICTIONARY.md).
