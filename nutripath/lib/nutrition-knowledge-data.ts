/**
 * nutrition-knowledge-data.ts
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SUMBER DATA TUNGGAL — NUTRITION KNOWLEDGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * File ini adalah SATU-SATUNYA tempat untuk mengelola artikel Nutrition Knowledge.
 * Perubahan di sini akan otomatis tercermin di:
 *   - Halaman daftar topik     → /nutrition-knowledge
 *   - Halaman detail artikel   → /nutrition-knowledge/[id]
 *   - Widget sidebar Knowledge Base
 *
 * ───────────────────────────────────────────────────────────────────────────
 * CARA MENAMBAH ARTIKEL BARU
 * ───────────────────────────────────────────────────────────────────────────
 * 1. Taruh file gambar ke folder:  nutripath/public/images/knowledge/
 *    Format:  .jpg | .jpeg | .png | .webp
 *    Ukuran:  Lebar minimal 800px, rasio 16:9 disarankan (misal 800×450 px)
 *    Contoh:  nama-artikel.jpg
 *
 * 2. Tambahkan satu objek baru ke array KNOWLEDGE_TOPICS di bawah ini.
 *    Isi semua field yang wajib. Field opsional boleh tidak diisi.
 *
 * 3. Artikel langsung muncul tanpa mengubah komponen lain.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * KATEGORI YANG TERSEDIA
 * ───────────────────────────────────────────────────────────────────────────
 * "Dasar Gizi" | "Hidrasi" | "Pilihan Makanan" | "Keterampilan Praktis"
 * | "Konteks Pelajar" | "Keamanan Pangan"
 *
 * Untuk menambah kategori baru, tambahkan string ke KNOWLEDGE_CATEGORIES.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * FOTO DEVELOPER
 * ───────────────────────────────────────────────────────────────────────────
 * Taruh file ke:  nutripath/public/images/developer/developer-profile.jpg
 * Path di About:  /images/developer/developer-profile.jpg
 * ───────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipe data
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeCategory =
  | "Dasar Gizi"
  | "Hidrasi"
  | "Pilihan Makanan"
  | "Keterampilan Praktis"
  | "Konteks Pelajar"
  | "Keamanan Pangan";

/** Satu bagian konten dalam artikel (heading + body) */
export interface ContentSection {
  /** Judul subjudul artikel. Kosongkan jika tidak ada judul. */
  heading?: string;
  /** Isi teks. Mendukung markdown sederhana: **bold**, • bullet, baris baru. */
  body: string;
}

/** Tautan ke perbandingan makanan di Comparator */
export interface ComparatorLink {
  /** ID makanan A (dari FOOD_OPTIONS di food-challenge-data.ts) */
  foodAId: string;
  /** ID makanan B */
  foodBId: string;
  /** Label tombol yang ditampilkan */
  label: string;
}

/** Satu artikel/topik Knowledge Base */
export interface KnowledgeTopic {
  /**
   * ID unik artikel. Digunakan sebagai URL slug: /nutrition-knowledge/[id]
   * Gunakan huruf kecil dan tanda hubung, tanpa spasi.
   * Contoh: "gizi-seimbang", "vitamin-c"
   */
  id: string;

  /** Judul artikel (ditampilkan di kartu dan halaman detail) */
  title: string;

  /** Ringkasan singkat 1–2 kalimat (ditampilkan di kartu) */
  summary: string;

  /** Kategori artikel */
  category: KnowledgeCategory;

  /**
   * Path gambar artikel.
   *
   * GAMBAR LOKAL (disarankan):
   *   Taruh file ke  nutripath/public/images/knowledge/
   *   Isi path:      "/images/knowledge/nama-file.jpg"
   *
   * GAMBAR URL EKSTERNAL (sementara, tidak disarankan produksi):
   *   Isi path:      "https://..."
   *
   * Jika path kosong ("") atau file tidak ada, fallback warna akan ditampilkan.
   */
  image: string;

  /** Teks alt gambar untuk aksesibilitas */
  imageAlt: string;

  /** Estimasi waktu baca, contoh: "5 mnt baca" */
  readTime: string;

  /** Tag pencarian (maks 4 untuk tampilan kartu) */
  tags: string[];

  /**
   * Konten artikel dalam bentuk array bagian.
   * Setiap bagian memiliki heading opsional dan body teks.
   */
  content: ContentSection[];

  /**
   * Referensi/sumber informasi.
   * Format: "Nama Sumber (Tahun)" atau URL lengkap.
   */
  sources: string[];

  /**
   * ID makanan dari FOOD_OPTIONS (food-challenge-data.ts) yang relevan.
   * Digunakan untuk menampilkan link ke Food Challenge.
   */
  relatedFoodIds: string[];

  /**
   * Tautan ke halaman Comparator untuk perbandingan makanan terkait.
   * Set ke null jika tidak relevan.
   */
  comparatorLink: ComparatorLink | null;

  /**
   * Warna aksen kartu (kelas Tailwind bg-).
   * Contoh: "bg-emerald-500", "bg-sky-500", "bg-orange-500"
   */
  accentColor: string;

  /** Emoji ikon untuk artikel */
  iconEmoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Daftar kategori
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_CATEGORIES: string[] = [
  "Semua",
  "Dasar Gizi",
  "Hidrasi",
  "Pilihan Makanan",
  "Keterampilan Praktis",
  "Konteks Pelajar",
  "Keamanan Pangan",
];

// ─────────────────────────────────────────────────────────────────────────────
// Data artikel
// ─────────────────────────────────────────────────────────────────────────────
//
// CARA MENAMBAH ARTIKEL BARU:
//
//   1. Taruh gambar ke:  nutripath/public/images/knowledge/nama-file.jpg
//   2. Tambahkan objek baru di bawah ke dalam array KNOWLEDGE_TOPICS.
//   3. Selesai — artikel langsung tampil.
//
// Contoh minimal:
//
//   {
//     id: "contoh-artikel",
//     title: "Judul Artikel",
//     summary: "Ringkasan singkat.",
//     category: "Dasar Gizi",
//     image: "/images/knowledge/contoh-artikel.jpg",
//     imageAlt: "Deskripsi gambar",
//     readTime: "4 mnt baca",
//     tags: ["Tag1", "Tag2"],
//     content: [
//       { heading: "Subjudul Pertama", body: "Isi teks artikel..." },
//       { heading: "Tips Praktis", body: "• Tip satu\n• Tip dua" },
//     ],
//     sources: ["Kemenkes RI Pedoman Gizi Seimbang (2014)"],
//     relatedFoodIds: ["nasi-putih", "tempe-goreng"],
//     comparatorLink: { foodAId: "nasi-putih", foodBId: "mie-goreng-instan", label: "Bandingkan Nasi vs Mie" },
//     accentColor: "bg-emerald-500",
//     iconEmoji: "🥗",
//   },
//
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  // ──────────────────────────────────────────────────────────────
  // 1. DASAR GIZI
  // ──────────────────────────────────────────────────────────────
  {
    id: "nutrition-basics",
    title: "Dasar Gizi: Makronutrien & Mikronutrien",
    summary:
      "Pelajari karbohidrat, protein, lemak, serat, vitamin, dan mineral — serta bagaimana keseimbangan energi harian bekerja dalam tubuh.",
    category: "Dasar Gizi",
    image: "/images/knowledge/nutrition-basics.jpg",
    imageAlt: "Piring makan seimbang dengan berbagai kelompok makanan",
    readTime: "5 mnt baca",
    tags: ["Makronutrien", "Energi", "Vitamin", "Mineral"],
    content: [
      {
        heading: "Apa itu nutrisi?",
        body: "Nutrisi adalah zat dalam makanan yang digunakan tubuh untuk energi, pertumbuhan, dan fungsi vital. Ada enam kelas nutrisi: karbohidrat, protein, lemak, vitamin, mineral, dan air. Makronutrien (karbohidrat, protein, lemak) dibutuhkan dalam jumlah besar. Mikronutrien (vitamin, mineral) dibutuhkan dalam jumlah kecil tetapi sama pentingnya.",
      },
      {
        heading: "Karbohidrat — Sumber energi utama",
        body: "Karbohidrat menyediakan 45–65% kebutuhan energi harian. Sumber terbaik: nasi, roti, ubi, jagung, kentang. Karbohidrat kompleks (serat tinggi) memberi energi lebih stabil dibanding karbohidrat sederhana (gula). Pelajar yang melewatkan karbohidrat sering mengalami kelelahan dan sulit konsentrasi.",
      },
      {
        heading: "Protein — Pembangun dan perbaikan",
        body: "Protein membangun otot, memperbaiki jaringan, dan mendukung sistem imun. Kebutuhan: 0,8–1g per kg berat badan per hari (lebih tinggi selama masa pertumbuhan remaja). Sumber terjangkau: telur (~7g/butir), tempe (~9,5g/50g), tahu (~12g/100g), ayam goreng (~27g/potong). Protein juga membuat kenyang lebih lama.",
      },
      {
        heading: "Lemak — Bukan musuh",
        body: "Lemak penting untuk penyerapan vitamin A, D, E, K dan fungsi otak. Lemak sehat (tak jenuh) ada di alpukat, kacang, dan minyak zaitun. Batasi lemak jenuh (santan, gorengan berlebihan). Hindari lemak trans (jajanan kemasan berminyak). Lemak sebaiknya 20–35% dari total kalori harian.",
      },
      {
        heading: "Serat — Menjaga pencernaan",
        body: "Serat mendukung kesehatan usus, menstabilkan gula darah, dan memperpanjang rasa kenyang. Kebutuhan: 25–30g per hari untuk remaja. Sumber: sayuran, buah-buahan, kacang-kacangan, dan biji-bijian. Pelajar yang cukup serat cenderung memiliki energi lebih stabil sepanjang hari.",
      },
      {
        heading: "Vitamin & Mineral penting untuk pelajar",
        body: "• **Zat besi** (tempe, bayam): mencegah anemia dan mendukung fungsi kognitif\n• **Kalsium** (susu, tahu, sayur hijau): membangun tulang kuat\n• **Vitamin C** (buah-buahan, tomat): meningkatkan penyerapan zat besi dan imunitas\n• **Vitamin A** (wortel, telur, ubi): mendukung penglihatan dan imunitas\n• **Zinc** (daging, kacang, tempe): mendukung pertumbuhan dan imun",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Setiap makan: pastikan ada karbohidrat + protein + satu sayuran\n• Jangan lewatkan sarapan — ini memberi energi untuk pelajaran pagi\n• Tempe dan tahu adalah protein terjangkau terbaik untuk pelajar Indonesia\n• Satu porsi sayuran di setiap makan siang adalah kebiasaan paling berdampak",
      },
    ],
    sources: [
      "WHO Nutrition Guidelines (2023)",
      "Kemenkes RI Angka Kecukupan Gizi (AKG 2019)",
      "FAO Introduction to Human Nutrition (2nd Ed.)",
    ],
    relatedFoodIds: ["nasi-putih", "tempe-goreng", "sayur-bayam", "telur-ceplok"],
    comparatorLink: {
      foodAId: "nasi-putih",
      foodBId: "mie-goreng-instan",
      label: "Bandingkan Nasi vs Mie Instan",
    },
    accentColor: "bg-emerald-500",
    iconEmoji: "🥗",
  },
  {
    id: "glycemic-index",
    title: "Indeks Glikemik & Energi Belajar",
    summary:
      "Pahami bagaimana karbohidrat berbeda memengaruhi kadar gula darah dan energi — penting untuk konsentrasi sepanjang hari sekolah.",
    category: "Dasar Gizi",
    image: "/images/knowledge/glycemic-index.jpg",
    imageAlt: "Ilustrasi grafik gula darah dan pilihan makanan",
    readTime: "5 mnt baca",
    tags: ["Indeks Glikemik", "Gula Darah", "Energi", "Konsentrasi"],
    content: [
      {
        heading: "Apa itu Indeks Glikemik (GI)?",
        body: "Indeks Glikemik mengukur seberapa cepat makanan menaikkan kadar gula darah. Skala: Rendah ≤55, Sedang 56–69, Tinggi ≥70. Makanan ber-GI tinggi menyebabkan lonjakan cepat diikuti penurunan tajam — kamu jadi lemas dan lapar lebih cepat.",
      },
      {
        heading: "Makanan ber-GI tinggi vs rendah",
        body: "**GI tinggi (waspadai):** Nasi putih (~72), roti tawar putih (~75), minuman manis (>70), mie instan (~55–65)\n\n**GI rendah–sedang (lebih dianjurkan):** Ubi jalar (~50), oat (~55), kacang-kacangan (~30–45), sebagian besar sayuran (~15–30), tempe dan tahu (~15)",
      },
      {
        heading: "Trik menurunkan dampak GI",
        body: "**Aturan pasangan:** Karbohidrat ber-GI tinggi + protein + serat = dampak gula darah jauh lebih rendah. Nasi + telur + sayur sudah menjadi kombinasi yang sangat baik. Jangan hindari nasi — padukan dengan lauk dan sayur.",
      },
      {
        heading: "Kenapa ini penting untuk pelajar?",
        body: "• Sarapan ber-GI tinggi saja (roti manis + minuman manis) menyebabkan crash energi menjelang siang\n• Makan siang ber-GI seimbang membantu konsentrasi di kelas sore\n• Tempe, tahu, dan kacang hijau adalah makanan ber-GI rendah yang sangat terjangkau",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Selalu padukan nasi dengan protein dan sayuran\n• Hindari makan karbohidrat saja (roti polos atau mie tanpa isi)\n• Pilih air putih atau susu daripada minuman manis\n• Coba kacang hijau atau ubi sebagai camilan — keduanya ber-GI lebih rendah dari keripik",
      },
    ],
    sources: [
      "Harvard T.H. Chan School of Public Health — Glycemic Index & Load",
      "DKBM (Daftar Komposisi Bahan Makanan) Indonesia",
    ],
    relatedFoodIds: ["nasi-putih", "kentang-rebus", "ubi-rebus", "jagung-rebus", "tempe-goreng"],
    comparatorLink: {
      foodAId: "ubi-rebus",
      foodBId: "nasi-putih",
      label: "Bandingkan Ubi vs Nasi Putih",
    },
    accentColor: "bg-rose-500",
    iconEmoji: "📈",
  },
  {
    id: "protein-sources",
    title: "Sumber Protein untuk Pelajar",
    summary:
      "Bandingkan telur, tempe, tahu, ayam, dan ikan — sumber protein yang umum tersedia di kantin sekolah Indonesia.",
    category: "Dasar Gizi",
    image: "/images/knowledge/protein-sources.jpg",
    imageAlt: "Berbagai sumber protein: telur, tempe, tahu, dan ayam",
    readTime: "5 mnt baca",
    tags: ["Protein", "Tempe", "Tahu", "Telur", "Ayam"],
    content: [
      {
        heading: "Mengapa protein penting?",
        body: "Protein membangun otot, memperbaiki jaringan, dan membuat kenyang lebih lama. Selama masa remaja, kebutuhan protein lebih tinggi karena tubuh sedang dalam fase pertumbuhan aktif. Kekurangan protein menyebabkan pertumbuhan terlambat, mudah sakit, dan sulit konsentrasi.",
      },
      {
        heading: "Perbandingan sumber protein kantin (estimasi per porsi)",
        body: "| Makanan | Estimasi Protein | Harga Simulasi |\n|---|---|---|\n| Telur rebus (1 butir) | ~6,5g | Rp 2.000 |\n| Tempe goreng (2 potong) | ~9,5g | Rp 2.000 |\n| Tahu goreng (2 potong) | ~12g | Rp 1.500 |\n| Ikan goreng (1 ekor) | ~22g | Rp 6.000 |\n| Ayam goreng (1 potong) | ~27g | Rp 8.000 |\n\n*Semua nilai adalah estimasi edukatif berdasarkan DKBM, bukan data klinis.*",
      },
      {
        heading: "Protein nabati vs hewani",
        body: "Protein hewani (telur, ayam, ikan) mengandung semua asam amino esensial secara lengkap. Protein nabati (tempe, tahu) juga sangat baik — terutama tempe yang difermentasi dan memiliki profil nutrisi lebih kaya. Kombinasi tempe + tahu + telur memberikan protein yang cukup dengan biaya sangat rendah.",
      },
      {
        heading: "Rekomendasi untuk pelajar",
        body: "**Pilihan terjangkau terbaik:** Tempe goreng + tahu goreng (total ~21g protein seharga Rp 3.500)\n\n**Pilihan protein hewani hemat:** Telur rebus (6,5g protein seharga Rp 2.000)\n\n**Jika ada anggaran lebih:** Tambahkan ikan goreng untuk omega-3 yang baik untuk otak",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Setiap makan siang dan malam: minimal 1 sumber protein\n• Jangan makan nasi + gorengan saja tanpa protein\n• Telur adalah pilihan terbaik untuk sarapan cepat dan murah\n• Dua telur + dua potong tempe = ~25g protein seharga kurang dari Rp 7.000",
      },
    ],
    sources: [
      "FAO/WHO Protein and Amino Acid Requirements (2007)",
      "DKBM (Daftar Komposisi Bahan Makanan) Indonesia",
      "PERSAGI Student Nutrition Guidelines",
    ],
    relatedFoodIds: ["telur-ceplok", "telur-rebus", "tempe-goreng", "tahu-goreng", "ayam-goreng", "ikan-goreng"],
    comparatorLink: {
      foodAId: "ayam-goreng",
      foodBId: "tahu-goreng",
      label: "Bandingkan Ayam vs Tahu",
    },
    accentColor: "bg-blue-500",
    iconEmoji: "🥚",
  },
  {
    id: "vegetable-fiber",
    title: "Sayuran & Serat: Manfaat untuk Pelajar",
    summary:
      "Mengapa sayuran penting setiap hari? Pelajari peran serat, zat besi, dan vitamin dalam sayuran umum Indonesia.",
    category: "Dasar Gizi",
    image: "/images/knowledge/vegetable-fiber.jpg",
    imageAlt: "Berbagai sayuran segar Indonesia: bayam, kangkung, dan lalapan",
    readTime: "4 mnt baca",
    tags: ["Sayuran", "Serat", "Zat Besi", "Vitamin"],
    content: [
      {
        heading: "Mengapa sayuran sering diabaikan?",
        body: "Di kantin sekolah, sayuran sering menjadi pilihan terakhir — kalah dengan gorengan atau mie. Padahal, sayuran adalah sumber serat, vitamin, mineral, dan antioksidan yang tidak bisa digantikan suplemen. Hanya dengan Rp 1.000–3.000, kamu sudah bisa mendapatkan satu porsi sayuran di warung nasi.",
      },
      {
        heading: "Kandungan sayuran Indonesia (estimasi per porsi)",
        body: "• **Bayam sup bening**: zat besi tinggi, kalsium, vitamin A, ~25 kkal/porsi\n• **Tumis kangkung**: zat besi, vitamin C, serat, ~45 kkal/porsi\n• **Lalapan segar** (timun, kol): vitamin C, serat, sangat rendah kalori ~20 kkal\n• **Capcay tumis**: lebih beragam nutrisi karena multijenis sayuran\n• **Gado-gado**: sayuran rebus + bumbu kacang, tinggi serat dan protein nabati",
      },
      {
        heading: "Serat dan manfaatnya",
        body: "Serat memperlambat penyerapan karbohidrat (mencegah lonjakan gula darah), mendukung pencernaan, dan membuat kenyang lebih lama. Kebutuhan serat: 25–30g per hari. Satu porsi sayuran di setiap makan siang sudah berkontribusi ~3–5g serat.",
      },
      {
        heading: "Sayuran melindungi dari anemia",
        body: "Anemia (kurang zat besi) umum pada pelajar, terutama perempuan. Gejalanya: mudah lelah, pucat, sulit konsentrasi. Bayam dan kangkung mengandung zat besi non-heme. Konsumsi bersama makanan mengandung vitamin C (jeruk, tomat) untuk meningkatkan penyerapannya.",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• **Target minimal:** 1 porsi sayuran di setiap makan siang\n• Lalapan Rp 1.000 di warung sudah memberi serat dan vitamin\n• Coba makan 2 warna sayuran berbeda per hari (hijau + oranye/merah)\n• Tambahkan sayuran ke mie instan untuk meningkatkan nilai gizinya secara signifikan",
      },
    ],
    sources: [
      "Kemenkes RI Pedoman Gizi Seimbang (2014)",
      "EFSA Dietary Reference Values for Dietary Fibre (2017)",
    ],
    relatedFoodIds: ["sayur-bayam", "sayur-kangkung", "capcay", "lalapan", "gado-gado"],
    comparatorLink: {
      foodAId: "sayur-bayam",
      foodBId: "sayur-kangkung",
      label: "Bandingkan Bayam vs Kangkung",
    },
    accentColor: "bg-green-500",
    iconEmoji: "🥬",
  },

  // ──────────────────────────────────────────────────────────────
  // 2. HIDRASI
  // ──────────────────────────────────────────────────────────────
  {
    id: "hydration",
    title: "Hidrasi: Kebutuhan Air Harian Pelajar",
    summary:
      "Pelajari kebutuhan cairan harian, dampak dehidrasi ringan terhadap konsentrasi, dan pilihan minuman terbaik untuk pelajar.",
    category: "Hidrasi",
    image: "/images/knowledge/hydration.jpg",
    imageAlt: "Botol minum air putih dan gelas air segar",
    readTime: "4 mnt baca",
    tags: ["Air", "Konsentrasi", "Dehidrasi", "Minuman"],
    content: [
      {
        heading: "Mengapa air sangat penting?",
        body: "Air adalah nutrisi paling penting yang sering dilupakan. Setiap sel, jaringan, dan organ tubuh membutuhkan air. Dehidrasi ringan — kehilangan hanya 1–2% berat badan dalam air — sudah dapat mengganggu konsentrasi, memori jangka pendek, dan suasana hati.",
      },
      {
        heading: "Berapa kebutuhan air pelajar?",
        body: "Remaja dan pelajar membutuhkan sekitar 1,5–2,5 liter (6–10 gelas) per hari, tergantung aktivitas dan iklim. Di Indonesia yang tropis, terutama setelah olahraga atau hari panas, kebutuhan bisa lebih tinggi. Tanda hidrasi cukup: urin berwarna kuning pucat.",
      },
      {
        heading: "Minuman terbaik dan yang perlu dibatasi",
        body: "**Pilihan terbaik:** Air putih (selalu terbaik), susu plain (air + kalsium + protein), teh tawar\n\n**Batasi atau hindari:** Minuman manis dalam botol, soda (1 kaleng = 35–40g gula), minuman energi (kafein + gula tinggi, tidak cocok untuk pelajar), kopi sachet manis (15–20g gula per sachet)\n\nMinuman manis menyebabkan lonjakan gula darah diikuti crash — kamu jadi lemas dan sulit fokus.",
      },
      {
        heading: "Tanda dehidrasi yang perlu diwaspadai",
        body: "• Urin berwarna kuning gelap atau cokelat\n• Sakit kepala di tengah hari (sering karena kurang minum)\n• Mulut kering, pusing, atau sulit konsentrasi\n• Kelelahan yang tidak wajar\n\n**Penting:** Rasa haus adalah sinyal terlambat — jangan tunggu haus untuk minum.",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Minum 1 gelas air sebelum berangkat sekolah\n• Bawa botol minum ke sekolah setiap hari — ini kebiasaan terbaik\n• Minum di setiap istirahat, bukan hanya saat haus\n• Pilih air putih daripada minuman manis — hemat Rp 2.000–5.000 per hari\n• Makanan tinggi air (semangka, mentimun, tomat) juga membantu hidrasi",
      },
    ],
    sources: [
      "EFSA Adequate Water Intake Reference (2010)",
      "WHO Guideline: Sugars Intake for Adults and Children (2015)",
    ],
    relatedFoodIds: ["air-putih", "teh-tawar", "susu-uht", "teh-manis", "minuman-energi"],
    comparatorLink: {
      foodAId: "air-putih",
      foodBId: "teh-manis",
      label: "Bandingkan Air Putih vs Teh Manis",
    },
    accentColor: "bg-sky-500",
    iconEmoji: "💧",
  },

  // ──────────────────────────────────────────────────────────────
  // 3. PILIHAN MAKANAN
  // ──────────────────────────────────────────────────────────────
  {
    id: "food-choices",
    title: "Pilihan Makanan di Kantin Sekolah",
    summary:
      "Susun piring seimbang dengan makanan yang tersedia di kantin. Strategi memilih dengan budget terbatas dan waktu singkat.",
    category: "Pilihan Makanan",
    image: "/images/knowledge/food-choices.jpg",
    imageAlt: "Pilihan makanan di kantin sekolah Indonesia",
    readTime: "6 mnt baca",
    tags: ["Kantin", "Piring Seimbang", "Budget", "Makanan Sehari-hari"],
    content: [
      {
        heading: "Metode piring sederhana",
        body: "Panduan paling mudah: ½ piring sayur/buah, ¼ piring karbohidrat, ¼ piring protein. Kamu tidak harus mengikuti ini persis — tapi model mental ini membantu menilai apakah makan sudah seimbang.",
      },
      {
        heading: "Pilihan terbaik di kantin sekolah",
        body: "• **Nasi + telur + sayur** (~Rp 8.000–12.000): sangat seimbang — karbohidrat, protein, serat\n• **Nasi + tahu/tempe + lalapan** (~Rp 7.000–12.000): protein nabati yang baik\n• **Gado-gado** (~Rp 10.000–18.000): tinggi serat dan protein dari bumbu kacang\n• **Soto ayam** (~Rp 10.000): protein cukup, rendah lemak (kuah bening)\n• **Nasi + ayam goreng + sayur** (~Rp 11.000–16.000): protein tinggi, tambahkan sayuran",
      },
      {
        heading: "Makanan yang perlu diperhatikan",
        body: "• **Mie instan saja**: natrium tinggi (~1.300mg), protein rendah, serat rendah. Jika makan mie instan, selalu tambahkan telur dan sayuran.\n• **Gorengan saja sebagai makan**: lemak trans tinggi, nilai gizi rendah. Boleh sebagai camilan sesekali, bukan pengganti makan utama.\n• **Minuman manis dengan makanan**: menambah gula ekstra yang tidak perlu.",
      },
      {
        heading: "Strategi 3 pertanyaan sebelum membeli",
        body: "Sebelum membeli makanan di kantin, tanya dirimu:\n1. Apakah ada protein? (telur, tempe, tahu, ayam, ikan)\n2. Apakah ada sayuran atau buah?\n3. Apakah sesuai budget hari ini?\n\nJika dua dari tiga pertanyaan dijawab 'ya', pilihan tersebut sudah cukup baik.",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Pilih makan siang yang punya minimal 2 dari 3 komponen (karbohidrat, protein, sayuran)\n• Tambahkan telur rebus ke apapun untuk meningkatkan protein dengan cepat\n• Bawa buah dari rumah sebagai camilan sore — murah dan bergizi\n• Jangan jadikan gorengan atau keripik sebagai makan utama",
      },
    ],
    sources: [
      "Kemenkes RI Pedoman Gizi Seimbang (2014)",
      "Harvard Healthy Eating Plate",
    ],
    relatedFoodIds: ["nasi-putih", "telur-ceplok", "sayur-kangkung", "gado-gado", "bakso-sapi"],
    comparatorLink: {
      foodAId: "gado-gado",
      foodBId: "mie-goreng-instan",
      label: "Bandingkan Gado-gado vs Mie Goreng",
    },
    accentColor: "bg-orange-500",
    iconEmoji: "🍽️",
  },

  // ──────────────────────────────────────────────────────────────
  // 4. KETERAMPILAN PRAKTIS
  // ──────────────────────────────────────────────────────────────
  {
    id: "food-labels",
    title: "Membaca Label Pangan",
    summary:
      "Pahami ukuran saji, kandungan gula, natrium, kalori, dan cara membaca label kemasan dengan tepat.",
    category: "Keterampilan Praktis",
    image: "/images/knowledge/food-labels.jpg",
    imageAlt: "Label informasi nilai gizi pada kemasan produk makanan",
    readTime: "7 mnt baca",
    tags: ["Label Pangan", "Gula", "Natrium", "Kalori"],
    content: [
      {
        heading: "Mengapa membaca label itu penting?",
        body: "Label pangan memberitahu persis apa yang ada dalam makanan sebelum dikonsumsi. Di Indonesia, label diatur oleh BPOM RI dan wajib menampilkan ukuran saji, kalori, lemak, natrium, karbohidrat, gula, dan protein per sajian.",
      },
      {
        heading: "Langkah 1: Periksa ukuran saji",
        body: "Semua angka di label dihitung per UKURAN SAJI, bukan per kemasan penuh. Jika label menunjukkan '1 sajian = 30g' dan kemasan berisi 90g, kalikan semua angka dengan 3. Ini kesalahan paling umum: mengira angka label = seluruh kemasan.",
      },
      {
        heading: "Langkah 2: Cek gula",
        body: "WHO merekomendasikan kurang dari 50g gula tambahan per hari. Konteks nyata:\n• 1 kaleng soda: ~35–40g gula\n• 1 sachet kopi instan manis: ~15–20g gula\n• 1 botol minuman manis: 25–30g gula\n\nPelajar yang sering minum minuman manis mudah melampaui batas ini tanpa sadar.",
      },
      {
        heading: "Langkah 3: Periksa natrium",
        body: "WHO membatasi natrium di bawah 2.000mg per hari (~5g garam). Fakta mengejutkan: 1 bungkus mie instan mengandung 1.000–1.500mg natrium — sudah 50–75% dari batas harian dalam satu kali makan. Makanan tinggi natrium: mie instan, keripik, makanan kaleng, saus.",
      },
      {
        heading: "Langkah 4: Nilai protein dan serat",
        body: "Camilan yang baik memiliki minimal **5g protein** per sajian dan **2–3g serat** per sajian. Produk dengan protein dan serat rendah (keripik polos, wafer manis) memberi kalori tanpa nutrisi berarti.",
      },
      {
        heading: "Cara perbandingan cepat",
        body: "Ketika memilih antara dua produk serupa, pilih yang:\n• Lebih tinggi protein\n• Lebih tinggi serat\n• Lebih rendah gula\n• Lebih rendah natrium\n\nKebiasaan ini hanya butuh 30 detik dan sangat berdampak jangka panjang.",
      },
    ],
    sources: [
      "BPOM RI Peraturan Label Pangan",
      "WHO Guideline Sugars Intake (2015)",
      "WHO Global Action Plan for NCDs",
    ],
    relatedFoodIds: ["mie-goreng-instan", "keripik-singkong", "teh-manis", "minuman-energi"],
    comparatorLink: {
      foodAId: "mie-goreng-instan",
      foodBId: "mie-rebus",
      label: "Bandingkan Mie Goreng vs Mie Rebus",
    },
    accentColor: "bg-yellow-500",
    iconEmoji: "🏷️",
  },

  // ──────────────────────────────────────────────────────────────
  // 5. KONTEKS PELAJAR
  // ──────────────────────────────────────────────────────────────
  {
    id: "student-meals",
    title: "Makan Bergizi untuk Pelajar",
    summary:
      "Kombinasi makanan praktis dan hemat untuk sarapan, makan siang, dan camilan. Cocok untuk kantin, warung, dan asrama.",
    category: "Konteks Pelajar",
    image: "/images/knowledge/student-meals.jpg",
    imageAlt: "Makan siang bergizi mahasiswa/pelajar di kantin sekolah",
    readTime: "5 mnt baca",
    tags: ["Hemat", "Sarapan", "Bekal", "Kantin"],
    content: [
      {
        heading: "Prinsip utama makan pelajar",
        body: "Tujuan makan bukan sempurna — tapi konsisten lebih baik dari sebelumnya. Jangan lewatkan makan utama untuk menghemat uang: ini sering berujung membeli camilan lebih banyak dan lebih mahal, serta mengganggu konsentrasi.",
      },
      {
        heading: "Sarapan yang cukup sebelum sekolah",
        body: "Sarapan dikaitkan langsung dengan konsentrasi pagi, daya ingat, dan performa ujian. Sarapan minimal: sesuatu + sesuatu. Contoh:\n• Roti tawar + telur rebus\n• Nasi + tempe goreng\n• Bubur kacang hijau\n\nBahkan sarapan kecil selama 5 menit lebih baik daripada tidak sarapan.",
      },
      {
        heading: "Makan siang yang mengenyangkan",
        body: "Gunakan panduan sederhana: karbohidrat + protein + satu sayuran. Contoh terjangkau:\n\n| Kombinasi | Estimasi Harga |\n|---|---|\n| Nasi + telur + tempe + sayur | Rp 9.000–13.000 |\n| Nasi + tahu + lalapan | Rp 7.000–10.000 |\n| Gado-gado (porsi sedang) | Rp 10.000–15.000 |\n| Soto ayam + nasi | Rp 10.000–15.000 |",
      },
      {
        heading: "Camilan cerdas di antara jam pelajaran",
        body: "• Pisang (~Rp 2.000): kaya kalium, serat, dan gula alami yang melepas energi perlahan\n• Kacang rebus (~Rp 3.000): protein dan lemak sehat\n• Bubur kacang hijau (~Rp 5.000): protein nabati dan serat\n• Air putih: selalu lebih baik dari minuman manis",
      },
      {
        heading: "Kiat memperbaiki mie instan",
        body: "Mie instan adalah kenyataan bagi banyak pelajar. Cara memperbaiki nilai gizinya:\n1. Tambahkan 1 telur (protein +7g)\n2. Tambahkan segenggam sayuran (bayam, kangkung, atau wortel)\n3. Gunakan setengah bumbu untuk mengurangi natrium\n4. Tambahkan tahu atau tempe untuk protein lebih",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Rencanakan makan besok sebelum tidur — bahkan hanya tahu 'besok beli apa' sudah mengurangi pilihan impulsif\n• Beli telur, tempe, tahu dalam jumlah banyak — lebih hemat per unit\n• Bawa botol minum + satu buah ke sekolah setiap hari",
      },
    ],
    sources: [
      "FAO School Food and Nutrition Framework (2019)",
      "Journal of School Health: Breakfast and Academic Performance (2019)",
    ],
    relatedFoodIds: ["nasi-putih", "tempe-goreng", "tahu-goreng", "sayur-bayam", "telur-rebus", "pisang"],
    comparatorLink: {
      foodAId: "telur-ceplok",
      foodBId: "tempe-goreng",
      label: "Bandingkan Telur vs Tempe",
    },
    accentColor: "bg-purple-500",
    iconEmoji: "🎒",
  },
  {
    id: "budget-meals",
    title: "Makan Bergizi dengan Budget Terbatas",
    summary:
      "Strategi praktis memilih makanan bergizi di kantin, warung, atau toko dengan budget harian yang terbatas.",
    category: "Konteks Pelajar",
    image: "/images/knowledge/budget-meals.jpg",
    imageAlt: "Nasi dengan lauk tempe dan sayur — contoh makan bergizi dan hemat",
    readTime: "5 mnt baca",
    tags: ["Budget", "Hemat", "Tempe", "Tahu", "Kantin"],
    content: [
      {
        heading: "Nilai gizi per rupiah",
        body: "Kunci anggaran terbatas: cari makanan dengan nilai nutrisi tinggi per rupiah yang dikeluarkan, bukan yang paling mengenyangkan secara fisik. Tempe dan tahu adalah juara dalam kategori ini — protein tertinggi dengan harga terendah.",
      },
      {
        heading: "Perbandingan nilai gizi per harga (estimasi)",
        body: "| Pilihan | Estimasi Harga | Protein | Nilai Nutrisi |\n|---|---|---|---|\n| Nasi + telur + sayur | Rp 8.000–12.000 | ~11g | ⭐⭐⭐⭐⭐ |\n| Nasi + tempe + tahu | Rp 7.000–10.000 | ~21g | ⭐⭐⭐⭐⭐ |\n| Mie instan saja | Rp 3.500 | ~8g | ⭐⭐ |\n| Gorengan 3 biji | Rp 4.500 | ~3g | ⭐ |\n| Nasi + ayam | Rp 11.000–15.000 | ~31g | ⭐⭐⭐⭐ |",
      },
      {
        heading: "Pilihan terbaik untuk budget ketat",
        body: "• **Nasi + telur rebus + lalapan** (~Rp 7.000–9.000): ekonomis dan bergizi\n• **Nasi + tempe + tahu + air putih** (~Rp 8.000–10.000): protein ganda, sangat terjangkau\n• **Pisang** (~Rp 2.000): camilan murah kaya kalium\n• **Bubur kacang hijau** (~Rp 5.000): camilan bergizi tinggi\n• **Air putih** (bawa dari rumah): hidrasi gratis",
      },
      {
        heading: "Apa yang perlu dihindari",
        body: "Hindari mengisi hari dengan hanya camilan (keripik, wafer, minuman manis) sebagai pengganti makan. Ini lebih mahal per kalori dan jauh lebih rendah nutrisinya. Rp 10.000 untuk nasi + tempe + sayur lebih baik dari Rp 10.000 untuk berbagai jajanan.",
      },
      {
        heading: "Apa yang bisa kamu lakukan?",
        body: "• Pilih lauk protein tertinggi per harga: tempe dan tahu\n• Bawa telur rebus dari rumah — hemat Rp 2.000–2.500 vs beli di kantin\n• Jangan lewatkan makan siang demi hemat — ini sering berbalik lebih mahal\n• Air putih > minuman manis: hemat Rp 2.000–5.000 per hari",
      },
    ],
    sources: [
      "Indonesian Nutritionists Association (PERSAGI) Student Nutrition Guidelines",
      "DKBM Indonesia",
    ],
    relatedFoodIds: ["nasi-putih", "tempe-goreng", "tahu-goreng", "telur-rebus", "air-putih", "pisang"],
    comparatorLink: {
      foodAId: "tempe-goreng",
      foodBId: "ayam-goreng",
      label: "Bandingkan Tempe vs Ayam (Gizi per Harga)",
    },
    accentColor: "bg-amber-500",
    iconEmoji: "💰",
  },

  // ──────────────────────────────────────────────────────────────
  // 6. KEAMANAN PANGAN
  // ──────────────────────────────────────────────────────────────
  {
    id: "food-safety",
    title: "Keamanan Pangan & Kebersihan Makanan",
    summary:
      "Cara mengenali makanan yang aman, pentingnya kebersihan makanan, dan tips menghindari keracunan makanan.",
    category: "Keamanan Pangan",
    image: "/images/knowledge/food-safety.jpg",
    imageAlt: "Kebersihan makanan dan label BPOM RI pada produk kemasan",
    readTime: "4 mnt baca",
    tags: ["Keamanan Pangan", "Kebersihan", "BPOM", "Kantin Sekolah"],
    content: [
      {
        heading: "Mengapa keamanan pangan penting?",
        body: "Makanan yang tidak aman dapat menyebabkan keracunan makanan — gejala: mual, muntah, diare, demam — yang bisa membuat kamu absen sekolah beberapa hari. Pelajar yang makan di kantin atau warung kaki lima perlu tahu tanda-tanda makanan yang aman.",
      },
      {
        heading: "Risiko keamanan pangan yang umum",
        body: "• **Kontaminasi bakteri**: makanan tidak dimasak sempurna atau dibiarkan >4 jam di suhu ruang\n• **Bahan tambahan berbahaya**: pewarna rhodamin B (merah mencolok), boraks (pada bakso/mie), formalin\n• **Makanan kadaluarsa**: selalu periksa tanggal pada produk kemasan\n• **Penanganan tidak higienis**: penjual tidak cuci tangan, peralatan kotor\n• **Es batu atau air tidak bersih**: sumber kontaminasi yang sering diabaikan",
      },
      {
        heading: "Cara mengenali makanan yang aman",
        body: "• **Warna wajar**: hindari makanan berwarna sangat mencolok (merah terang, kuning terang) yang tidak alami — bisa jadi pewarna berbahaya\n• **Bau segar**: makanan basi biasanya berbau tidak sedap\n• **Tekstur normal**: daging yang rusak berubah tekstur dan warna\n• **Kantin bersih**: kebersihan tempat mencerminkan kualitas penanganan makanan\n• **Produk kemasan**: cek logo BPOM RI, tanggal kadaluarsa, dan kemasan tidak rusak",
      },
      {
        heading: "Tips praktis di kantin sekolah",
        body: "• Cuci tangan dengan sabun sebelum makan — cara paling sederhana mencegah kontaminasi\n• Hindari makanan yang sudah lama terbuka di suhu ruang\n• Bawa botol minum sendiri — lebih aman dari es atau air yang tidak jelas sumbernya\n• Pilih kantin yang terlihat bersih dan penjualnya memakai sarung tangan atau alat bantu\n• Jika ragu dengan keamanan makanan, pilih opsi lain",
      },
      {
        heading: "Jika mengalami keracunan makanan",
        body: "Tanda-tanda: mual, muntah, diare, kram perut, demam dalam 1–48 jam setelah makan. Yang harus dilakukan: minum banyak air untuk mencegah dehidrasi, istirahat, dan segera konsultasikan ke guru atau tenaga kesehatan. Jangan abaikan gejala keracunan pangan.",
      },
    ],
    sources: [
      "BPOM RI Peraturan Keamanan Pangan",
      "Kemenkes RI Panduan Keamanan Pangan di Sekolah",
      "WHO Food Safety Guidelines",
    ],
    relatedFoodIds: [],
    comparatorLink: null,
    accentColor: "bg-teal-500",
    iconEmoji: "🛡️",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

/** Cari topik berdasarkan ID */
export function findTopicById(id: string): KnowledgeTopic | undefined {
  return KNOWLEDGE_TOPICS.find((t) => t.id === id);
}

/** Filter topik berdasarkan kategori dan/atau kata kunci */
export function filterTopics(category: string, search: string): KnowledgeTopic[] {
  const q = search.trim().toLowerCase();
  return KNOWLEDGE_TOPICS.filter((t) => {
    const matchCat = category === "Semua" || t.category === category;
    const matchSearch =
      q === "" ||
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

/** Daftar topik sebelum/sesudah untuk navigasi artikel */
export function getAdjacentTopics(id: string): {
  prev: KnowledgeTopic | null;
  next: KnowledgeTopic | null;
} {
  const idx = KNOWLEDGE_TOPICS.findIndex((t) => t.id === id);
  return {
    prev: idx > 0 ? KNOWLEDGE_TOPICS[idx - 1] : null,
    next: idx < KNOWLEDGE_TOPICS.length - 1 ? KNOWLEDGE_TOPICS[idx + 1] : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget sidebar configuration
// ─────────────────────────────────────────────────────────────────────────────
//
// Tambahkan widget baru di sini.
// Setiap widget akan ditampilkan di sidebar halaman Knowledge Base.
//
// Type: "tip" | "fact" | "comparison" | "ai-question" | "related-articles"
//
// ─────────────────────────────────────────────────────────────────────────────

export type WidgetType = "tip" | "fact" | "comparison" | "ai-question" | "related-articles";

export interface KnowledgeWidget {
  id: string;
  type: WidgetType;
  title: string;
  /** Konten teks widget. Boleh menggunakan **bold**. */
  content?: string;
  /** Untuk type "comparison": ID makanan A */
  foodAId?: string;
  /** Untuk type "comparison": ID makanan B */
  foodBId?: string;
  /** Label tombol */
  actionLabel?: string;
  /** Link tombol (internal path) */
  actionHref?: string;
  /** Untuk type "ai-question": pertanyaan yang akan diisi ke chat */
  aiQuestion?: string;
  /** Untuk type "related-articles": daftar ID artikel terkait */
  relatedIds?: string[];
}

export const KNOWLEDGE_WIDGETS: KnowledgeWidget[] = [
  {
    id: "w-tip-1",
    type: "tip",
    title: "💡 Tips Gizi Cepat",
    content:
      "Aturan paling sederhana: setiap makan harus punya **protein + karbohidrat + satu sayuran**. Nasi + telur + lalapan sudah memenuhi ketiganya dengan harga di bawah Rp 10.000.",
  },
  {
    id: "w-fact-1",
    type: "fact",
    title: "📊 Fakta Gizi",
    content:
      "Satu bungkus mie instan mengandung sekitar **1.300mg natrium** — lebih dari 65% batas harian WHO (2.000mg). Selalu tambahkan sayuran dan telur untuk melengkapi nutrisinya.",
  },
  {
    id: "w-comparison-1",
    type: "comparison",
    title: "⚖️ Perbandingan Populer",
    content: "Mana yang lebih bergizi: tempe goreng atau ayam goreng?",
    foodAId: "tempe-goreng",
    foodBId: "ayam-goreng",
    actionLabel: "Bandingkan sekarang",
    actionHref: "/food-challenge/comparator",
  },
  {
    id: "w-ai-1",
    type: "ai-question",
    title: "🤖 Tanya AI SMANU",
    content: "Punya pertanyaan tentang gizi? Gunakan AI SMANU untuk penjelasan lebih lanjut.",
    aiQuestion: "Apa pilihan makan siang bergizi dengan budget Rp 15.000?",
    actionLabel: "Tanya AI SMANU",
  },
  {
    id: "w-tip-2",
    type: "tip",
    title: "💧 Hidrasi",
    content:
      "Dehidrasi ringan (kehilangan 1–2% berat badan dalam air) sudah cukup untuk mengganggu konsentrasi dan memori. **Bawa botol minum ke sekolah** setiap hari.",
  },
  {
    id: "w-comparison-2",
    type: "comparison",
    title: "⚖️ Pilihan Minuman",
    content: "Air putih vs teh manis — berapa perbedaan gulanya?",
    foodAId: "air-putih",
    foodBId: "teh-manis",
    actionLabel: "Lihat perbandingan",
    actionHref: "/food-challenge/comparator",
  },
];
