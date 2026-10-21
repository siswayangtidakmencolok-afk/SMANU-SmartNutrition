# SMANU Food Scanner — Dataset & ML Audit
**Date:** 2025 | **Status:** Fondasi selesai, zero-shot evaluation belum dilakukan

---

## 1. Arsitektur Saat Ini

Sistem Food Scanner SMANU menggunakan pendekatan **retrieval + zero-shot vision**, bukan model ML yang dilatih dari dataset sendiri:

```
Foto siswa
    │
    ▼
Gemini Vision (gemini-flash-lite-latest)
    │  Menganalisis tampilan visual gambar
    │  Menghasilkan 1-3 kandidat nama makanan
    │  Tidak dilatih oleh SMANU — model umum dari Google
    ▼
Pencarian database (dual-source)
    │  TKPI-2017 (in-memory) → prioritas utama untuk makanan Indonesia
    │  USDA FoodData Central (Neon PostgreSQL) → fallback
    ▼
Nutrition Knowledge Engine
    │  Menghitung estimasi nutrisi per porsi
    │  Menghasilkan penjelasan berbasis AKG (Angka Kecukupan Gizi 2019)
    ▼
Hasil untuk siswa
    Nama makanan, porsi, estimasi gizi, sumber data, peringatan
```

**Perbedaan penting:** Gemini Vision adalah model pra-latih umum dari Google. SMANU menggunakannya melalui API — bukan melatihnya. Database TKPI/USDA menyimpan *nilai gizi*, bukan mengajarkan model mengenali gambar.

---

## 2. Status Dataset

### MM-Food-100K (HuggingFace)
**Inspeksi dijalankan:** `python scripts/inspect-food-image-dataset.py`

| Atribut | Nilai |
|---|---|
| Jumlah record | 100.000 |
| Kolom | 10 (image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method, dll.) |
| Label unik (dish_name) | ~banyak, belum dihitung distribusi penuh |
| Makanan Indonesia terdeteksi | **0 baris (0%)** |
| Kolom nutrisi | `nutritional_profile` — JSON string, TIDAK diverifikasi |
| Lisensi | OpenRAIL-M — perlu konfirmasi untuk penggunaan komersial |
| Gambar diunduh | **Tidak** — hanya CSV |

**Kesimpulan:** Dataset ini **tidak langsung berguna** untuk evaluasi makanan Indonesia. Kandungan makanan lokal (nasi goreng, tempe, tahu, ayam goreng, dll.) tidak terdeteksi dalam 100.000 baris. Nilai nutrisi dalam dataset belum diverifikasi dan tidak boleh digunakan sebagai pengganti TKPI/USDA.

### Dataset SMANU Sendiri
| Atribut | Status |
|---|---|
| Gambar terkumpul | **0** |
| Target kelas | 8 (nasi putih, nasi goreng, telur dadar, telur rebus, tempe goreng, tahu goreng, ayam goreng, ikan goreng) |
| Target sampel per kelas | 50-60 |
| Manifest | `data/food-scanner/dataset-manifest.yaml` (sudah ada) |
| Label terverifikasi manusia | 0 |
| Fine-tuning diizinkan? | **Tidak** — gate belum terpenuhi |

---

## 3. Evaluasi Baseline (Zero-Shot)

### Status
**Belum dilakukan.** Script `scripts/eval-food-scanner-baseline.ts` sudah tersedia tetapi membutuhkan:
- File `data/food-scanner/eval-samples.json` dengan gambar berlabel
- Gambar food dengan `human_verified: true`
- Tidak ada gambar yang tersedia saat ini

### Yang Diperlukan untuk Baseline
1. Kumpulkan minimal 5-10 foto per kelas (8 kelas = 40-80 foto)
2. Beri label manual dengan `human_verified: true`
3. Simpan ke `data/food-scanner/images/` (git-ignored)
4. Buat `data/food-scanner/eval-samples.json`
5. Jalankan: `npx tsx scripts/eval-food-scanner-baseline.ts`

### Cara Mendapatkan Foto dengan Izin yang Benar
- **Own photos** (paling aman): foto sendiri di kantin/dapur
- **CC0/CC-BY dari Wikimedia Commons**: cari kategori makanan Indonesia
- **OpenFood Facts**: beberapa foto berlisensi CC-BY
- **JANGAN**: Google Images, Shutterstock, foto scraping tanpa verifikasi lisensi

---

## 4. Pengujian Gemini Vision dengan Foto Nyata

### Status
**Belum dilakukan secara otomatis.** Pengujian manual diperlukan.

### Cara Menguji
1. Buka `http://localhost:3000/nutrition-knowledge` (atau URL Vercel)
2. Login dengan akun terdaftar
3. Klik ikon scanner di samping kolom pencarian
4. Upload foto makanan nyata (JPEG, maks 4MB)
5. Amati:
   - Apakah kandidat muncul?
   - Apakah nama makanan masuk akal?
   - Apakah nilai gizi dihitung dari sumber yang benar (TKPI/USDA)?
   - Apakah hasil tersimpan setelah klik "Simpan ke Riwayat"?
   - Apakah hasil muncul di `/scan-history`?

### Skenario yang Harus Diuji Secara Manual
| Skenario | Cara menguji | Hasil yang diharapkan |
|---|---|---|
| Foto makanan jelas | Upload foto nasi putih | Kandidat muncul, gizi dari TKPI |
| Foto buram | Upload foto gelap/buram | Pesan "foto kurang jelas" |
| Bukan makanan | Upload foto benda/orang | Pesan "bukan makanan" |
| Makanan tidak dikenal | Upload makanan asing | "Tidak ada di database" + tombol lapor |
| Makanan USDA | Upload hummus/kacang | Kandidat muncul, gizi dari USDA-FDC |
| Simpan ke riwayat | Login lalu simpan hasil | Muncul di `/scan-history` |
| Login ulang | Logout → login → buka scan-history | Scan sebelumnya masih ada |

---

## 5. Gate Sebelum Fine-Tuning

Fine-tuning model **tidak diizinkan** sampai semua kondisi ini terpenuhi:

- [ ] Dataset: semua `human_verified = true`, min 20 sampel/kelas untuk test set
- [ ] Baseline: evaluasi zero-shot selesai dan terdokumentasi di `eval/results/`
- [ ] Lisensi: semua foto memiliki dokumentasi sumber yang valid
- [ ] Confusion matrix: menunjukkan fine-tuning benar-benar diperlukan
- [ ] Decision note: `eval/DECISION.md` ditandatangani

---

## 6. Rekomendasi Langkah Berikutnya

**Prioritas 1 — Validasi end-to-end dengan foto nyata (belum dilakukan)**
Ini adalah satu-satunya cara membuktikan sistem bekerja. Lakukan pengujian manual per skenario di atas.

**Prioritas 2 — Kumpulkan 40-80 foto berlabel**
Mulai dengan foto sendiri (kantin, rumah) untuk 8 kelas target. Beri label manual.

**Prioritas 3 — Jalankan baseline evaluation**
Setelah foto tersedia, jalankan `eval-food-scanner-baseline.ts` untuk mengukur akurasi Gemini pada makanan Indonesia.

**Prioritas 4 — Evaluasi apakah fine-tuning diperlukan**
Berdasarkan hasil baseline. Jangan mulai training sebelum baseline selesai.

---

*Dokumen ini dibuat berdasarkan inspeksi aktual dataset dan kode. Nilai yang belum diukur dinyatakan secara eksplisit sebagai "belum dilakukan".*
