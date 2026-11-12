# Konteks Proyek

**Pembaruan:** 2026-11-12

## Identitas

- **Nama produk:** SMANU — SmartNutrition for Students (terverifikasi dari metadata aplikasi dan konten UI).
- **Nama package:** `nutripath` versi `0.1.0` pada `package.json`; nama ini bukan path project root.
- **Tujuan:** edukasi dan dukungan keputusan nutrisi bagi pelajar dengan konteks makanan, situasi, dan budget.
- **Target pengguna:** pelajar SMA dan mahasiswa Indonesia (dinyatakan dalam prompt AI/UI; demografi pemakai nyata tidak diukur).
- **Repository:** `siswayangtidakmencolok-afk/SMANU-SmartNutrition`.
- **Deployment:** ada konfigurasi Vercel di `vercel.json`; deployment aktif tidak diverifikasi.

## Masalah dan pendekatan produk

Pengguna muda memerlukan edukasi nutrisi praktis untuk pilihan makanan sehari-hari. Aplikasi menyediakan Ask SMANU, materi Nutrition Knowledge, pengenalan gambar makanan dan estimasi nutrisi, aktivitas belajar, serta League. Sebagian alur memakai Neon/Postgres; beberapa histori hasil juga tetap disimpan di `localStorage`.

## Fitur inti dan bukti

- Ask SMANU: halaman `/ask-smanu` memanggil `/api/nutripath`; route mendukung Langflow serta jalur OpenAI/Gemini tertentu. Ketersediaan layanan runtime belum dikonfirmasi dalam audit ini.
- AI Assistant bubble: komponen terpisah memanggil `/api/ai-chat` dan Gemini; bukan jalur Langflow.
- Nutrition Knowledge: daftar/detail topik memakai data statis lokal; API dapat meminta bagian konten ke Langflow dan memiliki fallback lokal.
- Food Scanner: Gemini Vision mengusulkan nama kandidat, API nutrisi memakai data lokal TKPI atau DB, dan Gemini menghasilkan estimasi jika data rujukan tidak tersedia.
- NutriQuest/Food Challenge: bank soal, skenario, dan penilaian berada di source. Hasil browser lokal; endpoint server menghitung ulang aktivitas terverifikasi bagi akun masuk.
- Student Nutrition League: EXP/level/tier berasal dari ledger verified dan endpoint profil/leaderboard; membutuhkan migration database.

Status dan batas bukti rinci berada di [PROJECT_STATUS.md](PROJECT_STATUS.md) dan dokumen [modul](modules/).

## Prinsip responsible AI dan batas sistem

- Produk edukasi, bukan layanan medis, diagnosis, atau resep klinis; aturan ini muncul pada prompt AI dan UI.
- Hasil visi hanya mengidentifikasi kandidat visual. Foto tidak membuktikan berat, resep, atau bahan tersembunyi.
- Bedakan data rujukan terverifikasi dari estimasi model; skala porsi adalah input/asumsi.
- Harga pada Food Challenge adalah simulasi, bukan harga pasar aktual.
- Jangan menyimpan foto asli tanpa consent dan implementasi storage yang benar. Route kontribusi saat ini mencatat metadata; object storage belum dibuktikan aktif.
- Data nyata dan status akun tidak boleh digantikan mock untuk membuat tampilan tampak berhasil.

## Teknologi terverifikasi dari manifest/source

Next.js 16.3.8 App Router, React 19.2.8, TypeScript 5, Tailwind CSS 4, Auth.js v5 beta, Drizzle ORM, Neon serverless Postgres, Gemini SDK, OpenAI SDK, dan Vercel config. Versi tersebut adalah deklarasi manifest; perilaku layanan production tetap memerlukan tes runtime.

## Batasan dan sumber kebenaran

Source root dan migration adalah bukti implementasi. Root `README.md` masih memuat informasi scaffold lama (Next.js 15, lokasi `nutripath/`, demo/mock) dan `smanu-production-plan.md` masih berisi rencana OpenAI/Langflow yang belum tentu sama dengan route aktif. Jangan gunakan keduanya sebagai bukti kondisi production tanpa verifikasi.
