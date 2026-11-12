# Komponen Bersama

**Pembaruan:** 2026-11-12<br>
**Status:** VERIFIED (source inventory)

## 1. Purpose

Mendokumentasikan komponen layout, UI, context, dan widget yang dipakai lintas halaman.

## 2. Current Implementation

Layout aplikasi menyediakan sidebar/header dan mobile navigation. `HistoryProvider` mengelola session Ask SMANU di browser. `AuthProvider` mengekspos session/guest state melalui `useSession`. `AiChatWidget` adalah chat Gemini terpisah yang dipasang di main layout.

## 3. Directory and Files

- `components/ui/` — Button, Card, Badge, Input, EmptyState, PageHeader.
- `components/layout/Header.tsx`, `Sidebar.tsx`.
- `components/AiChatWidget.tsx`.
- `components/dashboard/` — `DashboardNavigationHub` dan dashboard widgets.
- `components/league/` — achievement/history/leaderboard UI.
- `context/AuthContext.tsx`, `context/HistoryContext.tsx`.

## 4. Architecture

`app/layout.tsx` memasang SessionProvider/AuthProvider; `(main)/layout.tsx` memasang HistoryProvider dan AI widget.

`DashboardNavigationHub` memakai daftar fitur lokal dengan rute yang sudah ada. Klik pertama menampilkan penjelasan dan menandai pilihan; klik kedua pada pilihan yang sama atau CTA membuka halaman; tombol Tutup mereset pilihan. Komponen tidak memanggil API atau mengubah status/auth. Scanner diarahkan ke `/nutrition-knowledge`, tempat modal scanner saat ini diluncurkan.

## 5. Data Flow

Komponen API client harus mempertahankan status pending/error, validasi response, serta abort saat unmount. AI bubble menggunakan `/api/ai-chat`, tidak menggunakan Langflow.

## 6. API Endpoints

Tergantung komponen: `/api/ai-chat`, `/api/profile`, `/api/user/learning-profile`, leaderboard dan endpoints lain yang dirinci pada modul.

## 7. Database Dependencies

Tidak langsung; data dibaca melalui server API.

## 8. External Dependencies

Auth.js client, Lucide icons, Tailwind CSS.

## 9. Current Status

Daftar komponen diverifikasi dari source tree.

## 10. Known Bugs

`history-store.ts`, `nutriquest-store.ts`, dan `challenge-store.ts` memiliki catch localStorage yang mengabaikan error; jangan menjadikan penyimpanan browser sebagai persistence authoritative.

## 11. Limitations

UI component ada tidak membuktikan backend integration tersedia.

## 12. Pending Improvements

Konsistenkan empty/error/loading states dan test breakpoint/keyboard flow pada komponen yang disentuh.

## 13. Testing

Test runner UI tidak terdeteksi pada package scripts. Dashboard hub diperiksa melalui ESLint, TypeScript, build, dan browser pada lebar 360px, 390px, serta desktop; detail hasil sesi terakhir berada di [SESSION_HANDOFF.md](../history/SESSION_HANDOFF.md).

## 14. Related Tasks

[Frontend architecture](../architecture/FRONTEND_ARCHITECTURE.md), [Error handling](../engineering/ERROR_HANDLING.md).
