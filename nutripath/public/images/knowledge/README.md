# Gambar Artikel Nutrition Knowledge

Taruh gambar artikel di folder ini.

## Format yang didukung
- `.jpg` / `.jpeg`
- `.png`  
- `.webp`

## Ukuran yang disarankan
- Lebar minimal: 800px
- Rasio: 16:9 (misalnya 800×450 px atau 1200×675 px)
- Ukuran file: < 300 KB untuk performa optimal

## Nama file (cocokkan dengan field `image` di nutrition-knowledge-data.ts)

| ID Artikel          | Nama File                     |
|---------------------|-------------------------------|
| nutrition-basics    | nutrition-basics.jpg          |
| glycemic-index      | glycemic-index.jpg            |
| protein-sources     | protein-sources.jpg           |
| vegetable-fiber     | vegetable-fiber.jpg           |
| hydration           | hydration.jpg                 |
| food-choices        | food-choices.jpg              |
| food-labels         | food-labels.jpg               |
| student-meals       | student-meals.jpg             |
| budget-meals        | budget-meals.jpg              |
| food-safety         | food-safety.jpg               |

## Cara menambah gambar artikel baru

1. Taruh file ke folder ini dengan nama yang cocok.
2. Di `lib/nutrition-knowledge-data.ts`, isi field `image` dengan:
   `/images/knowledge/nama-file.jpg`
3. Gambar akan otomatis tampil di kartu dan halaman detail artikel.
4. Jika file tidak ada atau gagal dimuat, warna aksen artikel akan ditampilkan sebagai fallback.
