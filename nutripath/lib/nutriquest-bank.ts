/**
 * NutriQuest Question Bank
 *
 * Scalable structure: tambah soal baru di array QUESTION_BANK.
 * Setiap soal memiliki: id, domain, question, options, correctAnswer, explanation.
 *
 * Untuk menambah soal baru:
 * 1. Copy satu blok soal
 * 2. Ubah id, domain, question, options, correctAnswer, explanation
 * 3. Simpan — langsung aktif di Quest
 *
 * Untuk mengubah jumlah soal per sesi: ubah QUEST_QUESTION_COUNT
 */

// ── Config ─────────────────────────────────────────────────────────────────
export const QUEST_QUESTION_COUNT = 15; // ubah ke 20 atau lebih kapanpun

// ── Types ───────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  domain: string;
  question: string;
  options: [string, string, string, string]; // selalu 4 pilihan
  correctAnswer: string; // harus sama persis dengan salah satu nilai di options
  explanation: string;
}

// ── All domains (derived from data, not hardcoded separately) ─────────────
export const ALL_DOMAINS_LABEL = "Semua Domain";

export function getDomains(bank: QuizQuestion[]): string[] {
  const set = new Set(bank.map((q) => q.domain));
  return [ALL_DOMAINS_LABEL, ...Array.from(set).sort()];
}

// ── Randomize helpers ──────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns new shuffled array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` unique random questions from the bank.
 * Shuffles options per question while keeping correctAnswer correct.
 */
export function pickQuestions(
  bank: QuizQuestion[],
  domain: string,
  count: number
): QuizQuestion[] {
  const pool =
    domain === ALL_DOMAINS_LABEL
      ? bank
      : bank.filter((q) => q.domain === domain);

  const selected = shuffle(pool).slice(0, count);

  // Shuffle options for each question (correctAnswer stays intact)
  return selected.map((q) => ({
    ...q,
    options: shuffle(q.options) as [string, string, string, string],
  }));
}

// ── Question Bank ──────────────────────────────────────────────────────────
// Tambah soal baru di sini. Tidak ada perubahan lain yang diperlukan.
export const QUESTION_BANK: QuizQuestion[] = [
  // ── Gizi Dasar ──────────────────────────────────────────────────────────
  {
    id: "gizi-001",
    domain: "Gizi Dasar",
    question: "Zat gizi makro yang berfungsi sebagai sumber energi utama tubuh adalah?",
    options: ["Protein", "Karbohidrat", "Vitamin", "Mineral"],
    correctAnswer: "Karbohidrat",
    explanation:
      "Karbohidrat adalah sumber energi utama tubuh. Setiap 1 gram karbohidrat menghasilkan 4 kkal energi yang digunakan untuk aktivitas sehari-hari termasuk belajar.",
  },
  {
    id: "gizi-002",
    domain: "Gizi Dasar",
    question: "Berapa persen kalori harian yang idealnya berasal dari karbohidrat?",
    options: ["10–20%", "45–65%", "30–35%", "70–80%"],
    correctAnswer: "45–65%",
    explanation:
      "Pedoman gizi menyarankan 45–65% total kalori harian berasal dari karbohidrat, untuk mendukung fungsi otak dan energi fisik yang optimal.",
  },
  {
    id: "gizi-003",
    domain: "Gizi Dasar",
    question: "Zat gizi mikro yang berfungsi membantu penyerapan kalsium adalah?",
    options: ["Vitamin C", "Vitamin D", "Vitamin A", "Vitamin B12"],
    correctAnswer: "Vitamin D",
    explanation:
      "Vitamin D sangat penting untuk membantu penyerapan kalsium di usus. Kekurangan vitamin D dapat menyebabkan tulang rapuh meski asupan kalsium cukup.",
  },
  {
    id: "gizi-004",
    domain: "Gizi Dasar",
    question: "Metode piring makan seimbang merekomendasikan komposisi mana?",
    options: [
      "½ karbohidrat, ½ protein",
      "½ sayur & buah, ¼ karbohidrat, ¼ protein",
      "¾ sayur, ¼ protein",
      "⅓ karbohidrat, ⅓ protein, ⅓ lemak",
    ],
    correctAnswer: "½ sayur & buah, ¼ karbohidrat, ¼ protein",
    explanation:
      "Metode piring seimbang: setengah piring diisi sayur dan buah, seperempat karbohidrat kompleks, seperempat protein. Ini memastikan asupan serat, energi, dan protein yang seimbang.",
  },
  {
    id: "gizi-005",
    domain: "Gizi Dasar",
    question: "Energi yang dibutuhkan remaja aktif perempuan per hari sekitar?",
    options: ["1.200 kkal", "1.600 kkal", "2.000–2.200 kkal", "3.000 kkal"],
    correctAnswer: "2.000–2.200 kkal",
    explanation:
      "Remaja perempuan aktif usia 14–18 tahun membutuhkan sekitar 2.000–2.200 kkal per hari sesuai Angka Kecukupan Gizi (AKG) Indonesia 2019.",
  },

  // ── Protein ─────────────────────────────────────────────────────────────
  {
    id: "protein-001",
    domain: "Protein",
    question: "Bahan pangan berikut yang merupakan sumber protein lengkap (complete protein) adalah?",
    options: ["Nasi putih", "Singkong", "Telur ayam", "Ubi jalar"],
    correctAnswer: "Telur ayam",
    explanation:
      "Telur mengandung semua asam amino esensial yang dibutuhkan tubuh sehingga disebut protein lengkap. Nasi, singkong, dan ubi jalar adalah sumber karbohidrat.",
  },
  {
    id: "protein-002",
    domain: "Protein",
    question: "Kebutuhan protein harian untuk pelajar aktif sekitar?",
    options: [
      "0,1–0,3 g per kg berat badan",
      "0,8–1,2 g per kg berat badan",
      "3–5 g per kg berat badan",
      "10 g per kg berat badan",
    ],
    correctAnswer: "0,8–1,2 g per kg berat badan",
    explanation:
      "Pelajar aktif membutuhkan 0,8–1,2 gram protein per kilogram berat badan per hari. Untuk siswa 60 kg, berarti sekitar 48–72 gram protein sehari.",
  },
  {
    id: "protein-003",
    domain: "Protein",
    question: "Tempe 100 gram mengandung protein sekitar?",
    options: ["5 gram", "10 gram", "19 gram", "35 gram"],
    correctAnswer: "19 gram",
    explanation:
      "Tempe mengandung sekitar 19 gram protein per 100 gram, menjadikannya sumber protein nabati yang sangat baik dan terjangkau bagi pelajar.",
  },
  {
    id: "protein-004",
    domain: "Protein",
    question: "Fungsi utama protein dalam tubuh adalah?",
    options: [
      "Menyimpan energi jangka panjang",
      "Membangun dan memperbaiki jaringan tubuh",
      "Melarutkan vitamin A dan D",
      "Menjaga keseimbangan cairan saja",
    ],
    correctAnswer: "Membangun dan memperbaiki jaringan tubuh",
    explanation:
      "Protein berfungsi sebagai bahan pembangun dan perbaikan jaringan tubuh, termasuk otot, kulit, dan organ. Protein juga membentuk enzim dan antibodi.",
  },

  // ── Karbohidrat ──────────────────────────────────────────────────────────
  {
    id: "karbo-001",
    domain: "Karbohidrat",
    question: "Karbohidrat kompleks yang baik dikonsumsi pelajar untuk energi tahan lama adalah?",
    options: ["Gula pasir", "Minuman manis", "Nasi merah dan oat", "Permen"],
    correctAnswer: "Nasi merah dan oat",
    explanation:
      "Karbohidrat kompleks seperti nasi merah dan oat dicerna lebih lambat sehingga memberikan energi yang tahan lama. Gula dan minuman manis memberikan energi cepat tapi tidak bertahan.",
  },
  {
    id: "karbo-002",
    domain: "Karbohidrat",
    question: "Indeks Glikemik (IG) yang tinggi pada makanan berarti?",
    options: [
      "Makanan dicerna lambat",
      "Makanan meningkatkan gula darah dengan cepat",
      "Makanan kaya serat",
      "Makanan tidak mengandung kalori",
    ],
    correctAnswer: "Makanan meningkatkan gula darah dengan cepat",
    explanation:
      "Indeks Glikemik (IG) tinggi artinya makanan tersebut cepat menaikkan kadar gula darah. Makanan ber-IG tinggi seperti roti putih dan minuman manis bisa menyebabkan lonjakan energi lalu kelelahan.",
  },
  {
    id: "karbo-003",
    domain: "Karbohidrat",
    question: "Serat pangan termasuk jenis karbohidrat yang baik karena?",
    options: [
      "Mengandung banyak kalori",
      "Meningkatkan gula darah secara instan",
      "Mendukung kesehatan pencernaan dan rasa kenyang lebih lama",
      "Tidak perlu dikonsumsi",
    ],
    correctAnswer: "Mendukung kesehatan pencernaan dan rasa kenyang lebih lama",
    explanation:
      "Serat pangan mendukung kesehatan usus, memperlambat penyerapan gula, dan membuat kenyang lebih lama. Asupan serat yang cukup (25–30 g/hari) penting untuk pelajar.",
  },

  // ── Vitamin & Mineral ────────────────────────────────────────────────────
  {
    id: "vitmin-001",
    domain: "Vitamin & Mineral",
    question: "Mineral yang paling penting untuk kesehatan tulang dan gigi adalah?",
    options: ["Zat besi", "Kalsium", "Magnesium", "Natrium"],
    correctAnswer: "Kalsium",
    explanation:
      "Kalsium adalah mineral utama untuk pembentukan dan pemeliharaan tulang serta gigi. Sumber kalsium baik antara lain susu, tahu, tempe, dan sayuran hijau.",
  },
  {
    id: "vitmin-002",
    domain: "Vitamin & Mineral",
    question: "Kekurangan zat besi pada pelajar dapat menyebabkan?",
    options: [
      "Tulang keropos",
      "Buta warna",
      "Anemia sehingga mudah lelah dan sulit konsentrasi",
      "Obesitas",
    ],
    correctAnswer: "Anemia sehingga mudah lelah dan sulit konsentrasi",
    explanation:
      "Kekurangan zat besi menyebabkan anemia yang ditandai dengan mudah lelah, pucat, dan sulit berkonsentrasi. Ini sangat berdampak pada performa belajar pelajar.",
  },
  {
    id: "vitmin-003",
    domain: "Vitamin & Mineral",
    question: "Vitamin C selain untuk imunitas juga berfungsi?",
    options: [
      "Menyimpan energi",
      "Meningkatkan penyerapan zat besi non-heme",
      "Membentuk tulang langsung",
      "Melarutkan lemak",
    ],
    correctAnswer: "Meningkatkan penyerapan zat besi non-heme",
    explanation:
      "Vitamin C meningkatkan penyerapan zat besi non-heme (dari tanaman). Konsumsi buah atau sayur kaya Vitamin C bersamaan dengan sumber zat besi nabati sangat dianjurkan.",
  },

  // ── Hidrasi ──────────────────────────────────────────────────────────────
  {
    id: "hidrasi-001",
    domain: "Hidrasi",
    question: "Jumlah air putih yang direkomendasikan untuk remaja aktif per hari adalah?",
    options: ["500 ml", "1 liter", "2–2,5 liter (8–10 gelas)", "5 liter"],
    correctAnswer: "2–2,5 liter (8–10 gelas)",
    explanation:
      "Remaja aktif dianjurkan minum 2–2,5 liter atau sekitar 8–10 gelas per hari. Dehidrasi ringan sudah dapat menurunkan konsentrasi dan performa akademik.",
  },
  {
    id: "hidrasi-002",
    domain: "Hidrasi",
    question: "Tanda awal tubuh kekurangan cairan (dehidrasi ringan) adalah?",
    options: [
      "Kram otot parah",
      "Demam tinggi",
      "Haus, urin berwarna kuning pekat",
      "Tekanan darah naik drastis",
    ],
    correctAnswer: "Haus, urin berwarna kuning pekat",
    explanation:
      "Dehidrasi ringan ditandai dengan rasa haus dan urin berwarna kuning pekat atau keruh. Warna urin yang ideal adalah kuning muda hingga bening.",
  },
  {
    id: "hidrasi-003",
    domain: "Hidrasi",
    question: "Minuman yang paling direkomendasikan untuk kebutuhan hidrasi sehari-hari adalah?",
    options: ["Minuman energi", "Kopi manis", "Air putih", "Jus kemasan bergula"],
    correctAnswer: "Air putih",
    explanation:
      "Air putih adalah minuman terbaik untuk hidrasi karena tidak mengandung gula, kafein, atau zat tambahan yang dapat mengganggu keseimbangan tubuh.",
  },

  // ── Makanan Sehat ────────────────────────────────────────────────────────
  {
    id: "maksehat-001",
    domain: "Makanan Sehat",
    question: "Lemak sehat yang baik untuk tubuh banyak ditemukan pada?",
    options: ["Gorengan", "Margarin trans", "Alpukat dan kacang-kacangan", "Keripik kemasan"],
    correctAnswer: "Alpukat dan kacang-kacangan",
    explanation:
      "Alpukat dan kacang-kacangan kaya lemak tak jenuh (unsaturated fat) yang baik untuk kesehatan jantung dan otak. Lemak trans dari gorengan dan margarin justru berbahaya.",
  },
  {
    id: "maksehat-002",
    domain: "Makanan Sehat",
    question: "Berikut adalah contoh sarapan bergizi seimbang untuk pelajar?",
    options: [
      "Mie instan tanpa sayur",
      "Minuman manis + roti putih",
      "Nasi + telur + sayur + buah",
      "Hanya kopi",
    ],
    correctAnswer: "Nasi + telur + sayur + buah",
    explanation:
      "Sarapan ideal mengandung karbohidrat (nasi), protein (telur), vitamin & mineral (sayur & buah). Ini memberikan energi dan nutrisi yang cukup untuk belajar hingga siang.",
  },

  // ── Pola Makan ───────────────────────────────────────────────────────────
  {
    id: "polamakan-001",
    domain: "Pola Makan",
    question: "Kenapa melewatkan sarapan tidak dianjurkan bagi pelajar?",
    options: [
      "Karena sarapan wajib menurut hukum",
      "Karena tanpa sarapan otak kekurangan glukosa sehingga sulit konsentrasi",
      "Karena sarapan menurunkan berat badan",
      "Karena tanpa sarapan tubuh lebih berenergi",
    ],
    correctAnswer: "Karena tanpa sarapan otak kekurangan glukosa sehingga sulit konsentrasi",
    explanation:
      "Setelah tidur malam, kadar glukosa darah turun. Melewatkan sarapan membuat otak kekurangan bahan bakar yang menyebabkan sulit fokus, mudah mengantuk, dan performa belajar menurun.",
  },
  {
    id: "polamakan-002",
    domain: "Pola Makan",
    question: "Berapa kali makan utama per hari yang direkomendasikan untuk remaja?",
    options: ["1 kali sehari", "2 kali sehari", "3 kali sehari", "5 kali sehari"],
    correctAnswer: "3 kali sehari",
    explanation:
      "Tiga kali makan utama per hari (pagi, siang, malam) ditambah 1–2 camilan sehat adalah pola yang direkomendasikan untuk remaja agar energi dan nutrisi terpenuhi sepanjang hari.",
  },

  // ── Keamanan Makanan ─────────────────────────────────────────────────────
  {
    id: "keamanan-001",
    domain: "Keamanan Makanan",
    question: "Batas aman penyimpanan makanan matang di suhu ruangan adalah?",
    options: ["24 jam", "12 jam", "Maksimal 2 jam", "1 minggu"],
    correctAnswer: "Maksimal 2 jam",
    explanation:
      "Makanan matang sebaiknya tidak dibiarkan di suhu ruang lebih dari 2 jam karena bakteri dapat berkembang biak dengan cepat antara suhu 5–60°C (zona bahaya).",
  },
  {
    id: "keamanan-002",
    domain: "Keamanan Makanan",
    question: "Cara terbaik mencuci buah dan sayur sebelum dikonsumsi adalah?",
    options: [
      "Tidak perlu dicuci jika sudah dikupas",
      "Dicuci dengan air mengalir secara menyeluruh",
      "Direndam sabun makan 30 menit",
      "Cukup dilap kain kering",
    ],
    correctAnswer: "Dicuci dengan air mengalir secara menyeluruh",
    explanation:
      "Mencuci buah dan sayur dengan air mengalir secara menyeluruh adalah cara paling efektif dan aman untuk menghilangkan kotoran, pestisida, dan bakteri di permukaan.",
  },

  // ── Mitos & Fakta Nutrisi ────────────────────────────────────────────────
  {
    id: "mitos-001",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Mengonsumsi karbohidrat di malam hari selalu menyebabkan gemuk.'",
    options: [
      "Fakta — karbohidrat malam selalu jadi lemak",
      "Mitos — yang menentukan berat badan adalah total kalori harian, bukan waktu makan",
      "Fakta — tubuh tidak bisa membakar kalori malam hari",
      "Mitos — karbohidrat tidak mengandung kalori",
    ],
    correctAnswer:
      "Mitos — yang menentukan berat badan adalah total kalori harian, bukan waktu makan",
    explanation:
      "Ini adalah mitos. Yang menentukan berat badan adalah keseimbangan kalori total (kalori masuk vs kalori keluar), bukan jam berapa kamu makan karbohidrat.",
  },
  {
    id: "mitos-002",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Semua lemak dalam makanan buruk bagi kesehatan.'",
    options: [
      "Fakta — semua lemak harus dihindari",
      "Mitos — lemak tak jenuh dari ikan, alpukat, dan kacang justru bermanfaat untuk kesehatan",
      "Fakta — lemak tidak dibutuhkan tubuh",
      "Mitos — tubuh tidak bisa mencerna lemak",
    ],
    correctAnswer:
      "Mitos — lemak tak jenuh dari ikan, alpukat, dan kacang justru bermanfaat untuk kesehatan",
    explanation:
      "Ini mitos. Lemak tak jenuh (dari ikan, alpukat, kacang) justru baik untuk jantung dan otak. Yang harus dibatasi adalah lemak jenuh berlebihan dan lemak trans.",
  },
  {
    id: "mitos-003",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Suplemen vitamin selalu lebih baik dari makan sayur dan buah.'",
    options: [
      "Fakta — suplemen lebih efisien",
      "Mitos — sayur dan buah mengandung kombinasi nutrisi dan serat yang tidak bisa digantikan suplemen",
      "Fakta — tubuh lebih mudah menyerap suplemen",
      "Mitos — suplemen tidak berguna sama sekali",
    ],
    correctAnswer:
      "Mitos — sayur dan buah mengandung kombinasi nutrisi dan serat yang tidak bisa digantikan suplemen",
    explanation:
      "Sayur dan buah mengandung vitamin, mineral, serat, antioksidan, dan fitokimia dalam kombinasi alami yang tidak bisa sepenuhnya digantikan suplemen. Suplemen hanya pelengkap, bukan pengganti.",
  },
];
