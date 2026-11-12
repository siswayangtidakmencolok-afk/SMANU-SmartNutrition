# Arsitektur Frontend

**Pembaruan:** 2026-11-12

## Struktur UI

- Root layout `app/layout.tsx` menyediakan font, metadata, `SessionProvider`, dan `AuthProvider`.
- `app/(main)/layout.tsx` menyusun sidebar, header, konten responsif, mobile bottom navigation, `HistoryProvider`, dan `AiChatWidget`.
- Route group `(auth)` berisi halaman login/register. Route group bukan segmen URL.
- Halaman utama memakai React client components untuk interaksi seperti form, scanner, histori browser, quiz, dan challenge.
- Styling memakai Tailwind CSS 4 dan global CSS; komponen bersama tersedia pada `components/ui/`.

## Dashboard dan navigasi fitur

- `app/(main)/page.tsx` tetap menjadi Server Component dan menyusun `DashboardNavigationHub` di atas widget data serta section dashboard yang sudah ada.
- `components/dashboard/DashboardNavigationHub.tsx` adalah Client Component untuk preview dan navigasi dua langkah. Klik pertama memilih fitur; klik kedua pada fitur yang sama atau tombol **Buka Halaman** menavigasi dengan `router.push`; tombol **Tutup** menutup preview.
- Dashboard memakai diagram radial 3×3 pada desktop (`min-width: 1024px`) dan susunan perimeter dua kolom pada mobile, dengan hub melingkar di tengah dan konektor responsif. Latar hub melebar mengikuti workspace tanpa mengubah layout shared, sidebar, header, atau bottom navigation.
- Rute widget mengikuti halaman aktual: `/ask-smanu`, `/nutrition-knowledge`, `/learning-journey`, `/food-challenge`, `/league`, `/scan-history`, `/my-context`, dan `/history`.
- AI Food Scanner berupa modal yang diluncurkan dari `/nutrition-knowledge`; kartu pemindai mengarah ke halaman pemilik modal tersebut, bukan rute baru. NutriQuest tetap tersedia di section dashboard dan halaman `/my-context`.
- Konektor dekoratif disesuaikan untuk diagram desktop dan mobile. Animasi entrance, stagger, glow, dan preview menghormati `prefers-reduced-motion`.

## Data dan status UI

Ask SMANU menyimpan thread pada state halaman dan mencatat sesi ke `localStorage` lewat `HistoryContext`. NutriQuest/Food Challenge juga menyimpan ringkasan hasil di localStorage, sedangkan event verified user dipost ke server. League dan Learning Journey meminta profil dari API server.

Loading/error/empty states perlu dinilai per halaman; keberadaan route UI tidak membuktikan semua provider tersedia. Hindari menggunakan nilai localStorage sebagai data resmi League.

## Aturan perubahan

Pertahankan status pending/error, abort signal, aksesibilitas, dan layout mobile saat mengubah komponen. Periksa konsumennya dan kontrak endpoint yang terkait. Rincian alur per fitur ada di [ASK_SMANU.md](../modules/ASK_SMANU.md), [FOOD_SCANNER.md](../modules/FOOD_SCANNER.md), dan [STUDENT_NUTRITION_LEAGUE.md](../modules/STUDENT_NUTRITION_LEAGUE.md).
