# SMANU Design System

Dokumen ini mencatat bahasa visual yang benar-benar tampak pada source aplikasi, lalu memisahkan arahan yang disarankan dari implementasi yang sudah ada. Source of truth untuk nilai yang terpakai adalah `app/globals.css` dan komponen/halaman; jangan menganggap rekomendasi di bawah sebagai token atau fitur yang sudah diimplementasikan.

## Brand and design direction

**Design read:** platform edukasi nutrisi untuk pelajar, dengan karakter teknologi akademik yang tenang dan praktis. Deep navy memberi struktur dan fokus, emerald menandai tindakan serta konteks nutrisi, dan neutral terang menjaga materi mudah dibaca.

| Dial | Arah | Dasar |
|---|---:|---|
| ENERGY | 2, balanced | Halaman materi dan data memakai permukaan ringan; hub dashboard dan navigasi memakai navy yang lebih tegas. |
| RHYTHM | 2, balanced | Konten memakai daftar, grid, panel detail, chat, modal, dan hub sesuai fungsi, bukan satu layout untuk semua halaman. |
| MOTION | 2, restrained | Hover/focus membantu affordance; motion khusus hub dan maskot memperkenalkan atau mengarahkan perhatian. |

Prinsip:

- Dahulukan hierarki informasi, bukti nutrisi, dan tindakan pengguna, bukan dekorasi.
- Gunakan navy, emerald, dan neutral sebagai identitas SMANU. Accent warna lain hanya untuk status atau kategori yang benar-benar berbeda.
- Pertahankan perbedaan antara data rujukan dan estimasi AI; visual tidak boleh membuat estimasi terlihat seperti fakta terverifikasi.
- Gunakan bahasa yang konkret dan informatif. Hindari klaim pemasaran, statistik tanpa sumber, atau copy generik.
- Variasikan komposisi sesuai tugas: dashboard untuk orientasi, chat untuk percakapan, katalog untuk eksplorasi, scanner untuk alur bertahap.
- Jangan menambah aset, ikon, atau affordance yang tidak punya fungsi/arti. Maskot bot inline SVG adalah karakter khusus Ask SMANU, bukan alasan untuk menambahkan ilustrasi dekoratif di setiap halaman.

## Color system

### Values found in source

Nilai berikut sudah didefinisikan atau dipakai. Nilai hex di bawah merupakan warna aktual source, bukan palette baru.

| Role | Current value/examples | Current use |
|---|---|---|
| Deep navy | `#0B1220`, `#0F172A`, `#131B2E`, `#102433` | Background hub, sidebar, dan panel fitur gelap. |
| Emerald | `#006C49`, Tailwind `emerald-500`/`emerald-600`, `#6CF8BB` | Aksi utama, status aktif, fokus nutrisi, progress, dan highlight. |
| Main neutral | `#F8FAFC`, `#F8F9FF`, `#FFFFFF`, `slate-50` hingga `slate-200` | Canvas, panel, card, border, dan permukaan konten. |
| Main text | `#0B1C30`, `slate-800`/`slate-900` | Judul dan teks utama. |
| Supporting text | `#45464D`, `slate-500`/`slate-600` | Deskripsi dan metadata. |
| Semantic error | `#BA1A1A`, Tailwind `red`/`rose` | Error dan validasi gagal. |
| Semantic warning | Tailwind `amber-50`/`amber-200`/`amber-700` | Peringatan, ketidakpastian, dan perhatian. |
| Additional informational colors | Tertiary cyan `#0090A9`, fixed cyan `#ACEDFF`, Tailwind `blue`/`teal` | Status informasi, kategori, dan beberapa widget. Bukan warna aksen umum. |

`app/globals.css` juga mendefinisikan semantic custom properties, termasuk:

- Surface: `--color-surface: #f8f9ff`; container low `#eff4ff`, default `#e5eeff`, high `#dce9ff`, highest `#d3e4fe`.
- Text: `--color-on-surface: #0b1c30`; variant `#45464d`.
- Primary: `--color-primary: #000000`; secondary `#006c49`; tertiary `#000000`.
- Outline: `#76777d` dan variant `#c6c6cd`.
- Error: `#ba1a1a` dengan container `#ffdad6`.

### Status and guidance

**Sudah diterapkan:** semantic tokens di global CSS, warna navy/emerald/neutral yang digunakan lintas layout, dan warna status pada badge/error/progress.

**Perlu ditinjau, belum diselaraskan:** semantic `primary` masih hitam, sementara banyak panel brand memakai navy. Surface token cenderung biru muda, sementara halaman sering memakai neutral/slate. Cyan dan beberapa utility colors juga hadir. Jangan membuat token baru atau mengganti nilai diam-diam; saat menyentuh warna, gunakan keluarga yang sudah ada dan tandai inkonsistensi untuk konsolidasi terpisah.

Gunakan warna status bersama label/ikon/teks, bukan warna saja. Jangan mengandalkan opacity rendah untuk teks penting. Kontras WCAG untuk kombinasi aktual belum diaudit secara menyeluruh.

## Typography

### Fonts and scales found in source

- **Inter** adalah font body default dari `app/layout.tsx` dan base style.
- **Plus Jakarta Sans** dimuat sebagai display/headline font. CSS theme menyediakan `--font-display-lg`, `--font-headline-*`, dan `--font-metric-display` yang menunjuk ke font ini.
- **Material Symbols Outlined** dipakai untuk ikon interface; sidebar juga memiliki beberapa ikon SVG khusus.
- Ukuran theme yang didefinisikan di `app/globals.css`: display `3.5rem/4rem`; headline `2rem/2.5rem`, `1.5rem/2rem`, `1.25rem/1.75rem`; body `1.125rem/1.75rem`, `1rem/1.5rem`, `0.875rem/1.25rem`; label `0.875rem/1.25rem`, `0.75rem/1rem`; metric `2rem/2.25rem`.
- Komponen juga memakai ukuran Tailwind eksplisit dari `10px`/`text-xs` sampai `text-3xl`; tidak semua halaman memakai named theme scales.

### Use

- Gunakan Plus Jakarta Sans untuk judul/angka utama jika hierarki memerlukan penekanan; Inter untuk paragraf, input, navigasi, dan teks padat.
- Jaga line-height memadai untuk teks penjelasan dan materi. Batasi uppercase/tracking lebar pada label pendek, bukan paragraf atau judul panjang.
- Jangan mengecilkan teks utama demi memuat layout. Pada mobile, pecah baris atau susun ulang komponen.
- Konsistensi bahasa belum penuh: beberapa label/navigasi masih berbahasa Inggris meski banyak konten berbahasa Indonesia. Gunakan copy Indonesia yang jelas untuk perubahan baru kecuali nama fitur produk memang dipertahankan.

## Spacing, sizing, radius, and elevation

### Spacing values found in source

Global theme mendefinisikan `space-xs` `0.25rem`, `space-sm` `0.5rem`, `space-md` `1rem`, `space-lg` `1.5rem`, `space-xl` `2rem`, dan `space-2xl` `3rem`. Gutter yang tersedia: `1rem`, `1.5rem`, `2rem`; margin yang tersedia: `1rem`, `2rem`, `4rem`.

Implementasi juga banyak memakai skala Tailwind `gap-1` sampai `gap-6`, padding `p-3`/`p-4`/`p-5`/`p-6`, serta page gutters `px-4 sm:px-6`. Perlakukan nilai-nilai ini sebagai pola penggunaan, bukan aturan bahwa semua area harus memiliki padding sama.

### Radius and elevation found in source

- Radius umum: `rounded-lg` pada input/tombol, `rounded-xl` pada panel dan komponen UI, `rounded-2xl` pada cards/modal, `rounded-3xl` pada dashboard hub; `rounded-full` untuk avatar, chip, badge, dan indikator melingkar sesuai bentuknya.
- Tidak ada radius token terpusat di global CSS.
- `shadow-sm` dipakai untuk elevasi ringan; hub, modal, dan drawer memakai bayangan lebih kuat. Glow emerald khusus pada hub/intro, bukan standar semua card.
- Border tipis `slate-100`/`slate-200` atau `outline-variant` membantu memisahkan permukaan.

**Rekomendasi:** gunakan radius berdasarkan bentuk dan level komponen di atas; hindari pill untuk card/input besar. Tambahkan elevasi hanya ketika membantu membedakan layer interaktif atau modal.

## Layout and responsive behavior

### Current application shell

- Main shell memakai sidebar selebar `w-64` pada desktop, header bersama, dan area konten yang dapat scroll.
- Halaman umum berada di container `max-w-7xl`, dengan padding `px-4 sm:px-6`, spacing vertikal `py-6`, serta ruang ekstra untuk bottom navigation mobile.
- Mobile memakai sidebar sebagai drawer dan bottom navigation tetap di viewport. Hindari menaruh kontrol penting di balik navigasi atau area yang tertutup.
- Ask SMANU adalah halaman full-height tersendiri. Panel konteks berupa drawer dari bawah pada layar kecil, dan sidebar konteks di `xl` ke atas.
- Dashboard hub memiliki layout spesifik: radial 3×3 pada desktop mulai 1024px; mobile/tablet memakai dua kolom dengan hub di tengah alur konten. Section dashboard lain tetap memakai grid sesuai jumlah/kebutuhan data.
- Nutrition Knowledge memakai katalog satu kolom pada mobile, dua kolom dari `sm`, tiga kolom pada `xl`; widget samping baru tampil pada `lg`.
- Food Scanner berupa dialog dengan lebar maksimum `max-w-md`, tinggi maksimum `92vh`, dan body yang scroll di dalam dialog.

### Breakpoints

Project menggunakan Tailwind breakpoints standar: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. CSS hub menambahkan kondisi khusus `max-width: 360px` dan radial desktop `min-width: 1024px`.

**Sudah diterapkan:** layout responsif di shell, dashboard, katalog, chat, dan dialog scanner.

**Rekomendasi:** desain untuk lebar konten, bukan hanya nama device. Uji minimal 360px, 390px, tablet, dan desktop. Pastikan tanpa horizontal overflow, clipped copy, tab yang tak terjangkau, atau kontrol kecil. Gunakan scroll horizontal hanya untuk deretan kategori/chip yang memang satu dimensi, dengan indikator dan akses keyboard yang memadai.

## Components and visual patterns

Reusable UI di `components/ui/`:

- `Button`: variant primary, secondary, ghost, outline, danger; ukuran sm/md/lg; loading dan disabled.
- `Card`: default/low/filled dan padding sm/md/lg/none.
- `Badge`: success/neutral/warning/error/info.
- `Input`: label/hint/error/icon opsional.
- `EmptyState`: icon, judul, deskripsi, action.
- `PageHeader`: badge opsional, judul, subtitle, action.

Komponen lain berdasarkan fungsi:

- Dashboard: hub interaktif, widget data, progres, riwayat, dan pencapaian. Hub adalah komposisi unik, bukan template card untuk halaman lain.
- Ask SMANU: chat stream, status permintaan, konteks, quick prompts, drawer mobile, dan maskot SMANU. Pesan pengguna/asisten dibedakan oleh peran dan status, bukan dekorasi.
- Nutrition Knowledge: katalog artikel, pencarian/filter, tab materi, sumber, status konten dan fallback.
- Food Scanner: dialog bertahap untuk unggah/pilih gambar, kandidat, porsi, hasil, simpan, loading, error, dan empty/result states.

**Rekomendasi:** pakai primitive shared UI saat bentuk dan behavior cocok. Jangan memaksa semua modul menjadi card identik. Pertahankan label data, provenance, status loading/error, dan tindakan retry yang sesuai. Jangan membuat kontrol dekoratif atau mengubah link menjadi tombol tanpa alasan.

## Navigation and interaction

- Navigasi menggunakan link dengan tujuan route yang nyata. Shell menandai route aktif; mobile menyediakan bottom nav.
- Dashboard feature hub: klik pertama memilih widget dan membuka penjelasan; klik kedua atau tombol “Buka Halaman” membuka route. Pertahankan dua tahap ini bila komponen tersebut dipakai.
- Input, tombol, tab, kategori, upload, dialog, dan accordion harus mempertahankan behavior nyata dan state aktif/disabled/error.
- Tampilkan fokus keyboard yang mudah terlihat. Hover tidak boleh menjadi satu-satunya cara menemukan aksi.
- Dialog perlu nama yang jelas, tombol tutup, dan perilaku keyboard yang sesuai. Jangan menambah pola modal/drawer baru tanpa menguji fokus dan Escape.
- Beri label yang menjelaskan tindakan secara spesifik; hindari CTA generik dan link tanpa tujuan.

## Motion

Motion yang ditemukan:

- Hub dashboard memakai entrance bertahap blur-to-clear, konektor putus-putus yang bergerak, orbit/daun, highlight pilihan, dan transisi preview.
- Intro Ask SMANU memakai lintasan maskot, trail, efek angin/daun, lalu idle; global CSS menyediakan alternatif pada `prefers-reduced-motion`.
- Kontrol lain memakai transisi warna/transform, spinner, pulse, dan animasi loading.

**Aturan:** gunakan motion untuk feedback, fokus, atau menjelaskan urutan. Jangan menambahkan animasi ke setiap elemen. Hormati `prefers-reduced-motion`; motion dekoratif dapat dihilangkan sementara informasi dan state tetap terlihat. Reduced-motion saat ini diatur hanya untuk sejumlah kelas hub/maskot, bukan setiap animasi aplikasi.

## Accessibility

### Present in source

- Beberapa komponen menggunakan native `button`, `a`, label input, `aria-label`, `aria-live`, `role="alert"`, dan progressbar semantics.
- Tombol shared UI dan beberapa kontrol custom menyediakan `focus-visible` ring.
- CSS memiliki aturan reduced-motion untuk hub dan maskot.
- Ikon utama berasal dari Material Symbols; SVG dekoratif pada hub ditandai `aria-hidden`.

### Gaps and recommendations, not yet guaranteed

- Fokus terlihat belum konsisten di semua link, tombol, tab, dan kontrol scanner. Jangan menghapus outline tanpa pengganti.
- Target sentuh 44px belum konsisten pada seluruh kontrol; periksa khusus tombol ikon, tab, chip, dan close action.
- Contrast AA belum diuji untuk semua pasangan warna/status.
- Root layout saat ini menetapkan `lang="en"` dan viewport `maximumScale=1`; keduanya perlu ditinjau untuk konten Indonesia dan kemampuan zoom.
- Food Scanner saat ini memakai `div` sebagai overlay dan panel, tanpa semantik dialog eksplisit (`role="dialog"`/`aria-modal`), penanganan Escape, atau manajemen fokus yang terlihat di source. Tombol tutup dan klik backdrop tersedia, tetapi belum cukup untuk menyatakan dialog dapat dioperasikan dengan keyboard atau pembaca layar.
- Context drawer Ask SMANU dan dialog scanner perlu keyboard/focus-management verification. Jangan menganggap atribut ARIA saja sudah membuat dialog accessible.
- Setiap gambar memerlukan alt yang sesuai; gambar dekoratif memakai alt kosong atau disembunyikan dari assistive technology.
- Jangan menyampaikan state hanya dengan warna, animasi, atau emoji. Sediakan label/status teks yang dapat dibaca pembaca layar.

## Data visualization

Visualisasi yang tampak saat ini terutama progress ring/bar untuk kelengkapan konteks, skor, atau progres tier; dashboard juga memiliki comparison bars. Tidak ditemukan sistem chart khusus yang konsisten.

- Visualisasikan hanya nilai dari state/data yang nyata dan jelaskan satuan, periode, serta sumber.
- Labelkan nilai/progress langsung; jangan mengandalkan panjang bar atau warna saja.
- Gunakan emerald untuk progress positif yang dimaknai jelas, neutral untuk track, dan warna status untuk kondisi khusus.
- Jangan membuat angka, persentase, benchmark, atau klaim peningkatan tanpa sumber terverifikasi. Periksa sumber untuk comparison/insight yang ditampilkan sebelum menjadikannya pola desain.
- Jika nilai tidak tersedia, tampilkan empty/unavailable state, bukan nol yang menyesatkan.

## Themes

Tidak ditemukan theme toggle atau sistem dark/light yang lengkap. Aplikasi saat ini memakai shell dan konten terang, dengan beberapa area navy gelap seperti sidebar, dashboard hub, dan panel fitur. Ini adalah penggunaan surface per fungsi, bukan bukti dukungan dua theme.

Jangan menambah theme toggle atau mengklaim dark mode support tanpa implementasi dan verifikasi semua komponen, state, kontras, serta breakpoint.

## Implementation guidance

- Stack UI saat ini Next.js App Router, React, TypeScript, Tailwind CSS 4, dan CSS global. Ikuti pola serta dependency yang sudah tersedia.
- Semantic color/font/spacing variables berada di `app/globals.css`. Periksa definisi dan pemakaian aktual sebelum memakai custom property baru.
- Komponen shared berada di `components/ui/`; modul dashboard, chat, dan scanner berada di `components/`.
- Gunakan semantic HTML, native link/button/form controls, nama aksesibel, alt gambar, dan state error/loading/empty yang nyata.
- Bedakan **Current** dari **Recommended** dalam keputusan desain. Jangan menulis rekomendasi seolah token/component sudah ada; jangan menambah token, color, breakpoint, icon set, dependency, atau theme tanpa scope dan persetujuan yang sesuai.
- Validasi halaman setelah perubahan pada ukuran mobile dan desktop, keyboard, reduced-motion, serta state data yang relevan. Jangan mengklaim contrast, accessibility, atau performance lulus tanpa pengukuran/pengujian.