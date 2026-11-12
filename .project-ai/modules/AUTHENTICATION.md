# Authentication

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED

## 1. Purpose

Mendaftarkan akun, mengautentikasi credentials, dan menyediakan sesi bagi route yang memerlukan user.

## 2. Current Implementation

Auth.js v5 (`next-auth` beta) dengan Credentials provider, JWT strategy, pencarian email/username pada `users`, dan pembandingan password memakai `bcryptjs`. Session callback menambahkan `id`, `username`, dan `fullName`. Login/register UI berada di route group `(auth)`.

## 3. Directory and Files

- `auth.ts` — konfigurasi provider, callback, cookie, dan ekspor handler/auth/signIn/signOut.
- `app/api/auth/[...nextauth]/route.ts` — ekspor GET/POST handlers.
- `app/api/auth/register/route.ts` — validasi, uniqueness, hash bcrypt, insert.
- `middleware.ts` — redirect user yang sudah masuk dari `/login` atau `/register`; route lain dilewatkan.
- `context/AuthContext.tsx`, `app/layout.tsx` — client session wrapper.

## 4. Architecture

```mermaid
sequenceDiagram
  participant B as Browser
  participant A as Auth.js
  participant D as Neon
  B->>A: Credentials sign-in
  A->>D: Lookup email/username
  A->>A: bcrypt compare
  A-->>B: JWT session cookie
  B->>A: session endpoint
  A-->>B: User session / empty session
```

## 5. Data Flow

Registration menerima nama, username, email, password dan konfirmasi; password minimum 8 karakter dan hash bcrypt dengan 12 rounds. Auth lookup menggunakan normalized identifier. Hash tidak dikirim balik ke client.

## 6. API Endpoints

- `/api/auth/[...nextauth]` GET/POST.
- `/api/auth/register` POST.
- Protected API menggunakan `auth()` dan `session.user.id`.

## 7. Database Dependencies

`users` adalah sumber akun. Schema juga mendeklarasikan tabel Auth.js adapter/session, meski strategi sesi aktif pada `auth.ts` adalah JWT.

## 8. External Dependencies

`next-auth`, `@auth/drizzle-adapter` (tercantum manifest), Neon, Drizzle, bcryptjs.

## 9. Current Status

Source handler dan register flow ditemukan. Login runtime, cookie pada production, database reachability, serta environment Vercel belum diperiksa pada audit dokumen ini.

## 10. Known Bugs

- `auth.ts` mengandalkan konfigurasi secret Auth.js dari runtime; `middleware.ts` fallback ke `AUTH_SECRET` lalu `NEXTAUTH_SECRET` dan string kosong. Pastikan variabel konsisten pada semua environment.
- Middleware hanya matcher halaman login/register; jangan anggap semua halaman terlindungi.

## 11. Limitations

Credentials saja; tidak ada OAuth/email verification yang ditemukan. Middleware tidak melakukan query DB.

## 12. Pending Improvements

Tambah smoke/regression test `/api/auth/csrf`, `/api/auth/session`, credentials, guest, dan environment production tanpa mencetak credential.

## 13. Testing

Tidak ada test script pada `package.json`; live Auth endpoints tidak diuji ulang dalam dokumentasi audit.

## 14. Related Tasks

Lihat [NEXT_TASK.md](../project-management/NEXT_TASK.md) dan daftar environment di [ENVIRONMENT_VARIABLES.md](../engineering/ENVIRONMENT_VARIABLES.md).
