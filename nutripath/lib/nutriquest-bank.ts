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

  // ── Gizi Dasar (tambahan) ───────────────────────────────────────────────
  {
    id: "gizi-006",
    domain: "Gizi Dasar",
    question: "Zat gizi yang membantu tubuh mengatur berbagai proses metabolisme adalah?",
    options: ["Vitamin dan mineral", "Gula saja", "Air saja", "Karbohidrat saja"],
    correctAnswer: "Vitamin dan mineral",
    explanation:
      "Vitamin dan mineral merupakan zat gizi mikro yang membantu berbagai proses tubuh, termasuk metabolisme, fungsi saraf, dan pemeliharaan jaringan.",
  },
  {
    id: "gizi-007",
    domain: "Gizi Dasar",
    question: "Apa fungsi utama air bagi tubuh manusia?",
    options: [
      "Menggantikan seluruh kebutuhan makanan",
      "Membantu mengatur suhu tubuh dan mengangkut zat",
      "Menyediakan semua vitamin",
      "Menggantikan fungsi protein",
    ],
    correctAnswer: "Membantu mengatur suhu tubuh dan mengangkut zat",
    explanation:
      "Air membantu mengatur suhu tubuh, mengangkut zat gizi, dan mendukung berbagai proses penting di dalam tubuh.",
  },
  {
    id: "gizi-008",
    domain: "Gizi Dasar",
    question: "Manakah contoh sumber energi sekaligus zat gizi yang juga dibutuhkan tubuh untuk membangun jaringan?",
    options: ["Protein", "Air putih", "Vitamin C saja", "Garam saja"],
    correctAnswer: "Protein",
    explanation:
      "Protein membantu membangun dan memperbaiki jaringan tubuh. Protein juga dapat digunakan sebagai sumber energi ketika diperlukan.",
  },
  {
    id: "gizi-009",
    domain: "Gizi Dasar",
    question: "Mengapa tubuh membutuhkan beragam jenis makanan?",
    options: [
      "Agar hanya mendapat satu jenis zat gizi",
      "Agar kebutuhan berbagai zat gizi dapat terpenuhi",
      "Agar tidak perlu minum air",
      "Agar semua makanan memiliki kandungan yang sama",
    ],
    correctAnswer: "Agar kebutuhan berbagai zat gizi dapat terpenuhi",
    explanation:
      "Tidak ada satu jenis makanan biasa yang menyediakan semua zat gizi dalam jumlah ideal. Variasi makanan membantu memenuhi kebutuhan tubuh.",
  },
  {
    id: "gizi-010",
    domain: "Gizi Dasar",
    question: "Manakah yang termasuk zat gizi makro?",
    options: ["Vitamin A", "Zat besi", "Karbohidrat", "Vitamin C"],
    correctAnswer: "Karbohidrat",
    explanation:
      "Karbohidrat, protein, dan lemak termasuk zat gizi makro karena dibutuhkan tubuh dalam jumlah relatif besar dibandingkan vitamin dan mineral.",
  },

  // ── Protein (tambahan) ──────────────────────────────────────────────────
  {
    id: "protein-005",
    domain: "Protein",
    question: "Manakah makanan berikut yang merupakan sumber protein nabati?",
    options: ["Tempe", "Gula pasir", "Minyak goreng", "Sirup"],
    correctAnswer: "Tempe",
    explanation:
      "Tempe dibuat dari kedelai dan merupakan sumber protein nabati yang mudah ditemukan serta dapat diolah menjadi beragam hidangan.",
  },
  {
    id: "protein-006",
    domain: "Protein",
    question: "Unit dasar yang menyusun protein disebut?",
    options: ["Asam amino", "Asam lemak", "Glukosa", "Serat pangan"],
    correctAnswer: "Asam amino",
    explanation:
      "Protein tersusun dari rangkaian asam amino. Tubuh menggunakan asam amino untuk membangun dan memperbaiki jaringan serta membuat berbagai molekul penting.",
  },
  {
    id: "protein-007",
    domain: "Protein",
    question: "Manakah kombinasi makanan yang menyediakan protein dari sumber hewani dan nabati?",
    options: [
      "Telur dan tempe",
      "Nasi putih dan gula",
      "Apel dan jeruk",
      "Minyak dan mentega",
    ],
    correctAnswer: "Telur dan tempe",
    explanation:
      "Telur merupakan sumber protein hewani, sedangkan tempe merupakan sumber protein nabati. Keduanya dapat menjadi bagian dari pola makan beragam.",
  },
  {
    id: "protein-008",
    domain: "Protein",
    question: "Selain membantu membangun jaringan, protein juga diperlukan untuk membentuk?",
    options: ["Enzim dan antibodi", "Air minum", "Serat buah", "Karbohidrat dalam nasi"],
    correctAnswer: "Enzim dan antibodi",
    explanation:
      "Protein menjadi bahan pembentuk banyak enzim yang membantu reaksi tubuh dan antibodi yang berperan dalam sistem kekebalan.",
  },
  {
    id: "protein-009",
    domain: "Protein",
    question: "Manakah contoh makanan yang dapat membantu memenuhi kebutuhan protein dengan biaya relatif terjangkau?",
    options: ["Tempe dan telur", "Permen dan sirup", "Kerupuk tanpa bahan lain", "Minuman bersoda"],
    correctAnswer: "Tempe dan telur",
    explanation:
      "Tempe dan telur merupakan pilihan sumber protein yang umum tersedia dan dapat disesuaikan dengan anggaran serta kebutuhan masing-masing orang.",
  },

  // ── Karbohidrat (tambahan) ──────────────────────────────────────────────
  {
    id: "karbo-004",
    domain: "Karbohidrat",
    question: "Manakah makanan yang secara alami mengandung karbohidrat?",
    options: ["Nasi", "Air putih", "Garam", "Minyak kelapa murni"],
    correctAnswer: "Nasi",
    explanation:
      "Nasi merupakan sumber karbohidrat yang banyak dikonsumsi sebagai sumber energi dalam pola makan sehari-hari.",
  },
  {
    id: "karbo-005",
    domain: "Karbohidrat",
    question: "Manakah pilihan yang umumnya menyediakan karbohidrat sekaligus serat?",
    options: ["Oat utuh", "Minyak goreng", "Garam dapur", "Air mineral"],
    correctAnswer: "Oat utuh",
    explanation:
      "Oat utuh mengandung karbohidrat dan serat. Serat membantu mendukung kesehatan pencernaan dan dapat membantu rasa kenyang bertahan lebih lama.",
  },
  {
    id: "karbo-006",
    domain: "Karbohidrat",
    question: "Apa yang terjadi pada karbohidrat yang dicerna tubuh?",
    options: [
      "Sebagian diuraikan menjadi gula sederhana untuk digunakan sebagai energi",
      "Semuanya berubah menjadi vitamin",
      "Semuanya langsung menjadi protein",
      "Tidak dapat digunakan oleh tubuh",
    ],
    correctAnswer: "Sebagian diuraikan menjadi gula sederhana untuk digunakan sebagai energi",
    explanation:
      "Pencernaan memecah banyak jenis karbohidrat menjadi gula sederhana, seperti glukosa, yang dapat digunakan sel sebagai sumber energi.",
  },
  {
    id: "karbo-007",
    domain: "Karbohidrat",
    question: "Manakah pilihan camilan yang dapat menyediakan karbohidrat dan serat?",
    options: ["Pisang", "Minyak goreng", "Permen keras saja", "Air putih"],
    correctAnswer: "Pisang",
    explanation:
      "Pisang mengandung karbohidrat dan serat. Buah juga menyediakan berbagai vitamin dan mineral.",
  },
  {
    id: "karbo-008",
    domain: "Karbohidrat",
    question: "Apa perbedaan umum antara biji-bijian utuh dan biji-bijian yang telah banyak dimurnikan?",
    options: [
      "Biji-bijian utuh umumnya mempertahankan lebih banyak serat",
      "Biji-bijian utuh tidak mengandung energi",
      "Biji-bijian yang dimurnikan selalu mengandung lebih banyak vitamin",
      "Keduanya selalu memiliki kandungan serat yang sama",
    ],
    correctAnswer: "Biji-bijian utuh umumnya mempertahankan lebih banyak serat",
    explanation:
      "Biji-bijian utuh mempertahankan bagian dedak dan lembaga sehingga umumnya mengandung lebih banyak serat daripada biji-bijian yang sangat dimurnikan.",
  },

  // ── Vitamin & Mineral (tambahan) ────────────────────────────────────────
  {
    id: "vitmin-004",
    domain: "Vitamin & Mineral",
    question: "Vitamin yang berperan penting dalam proses penglihatan normal adalah?",
    options: ["Vitamin A", "Vitamin C", "Vitamin B1", "Vitamin K"],
    correctAnswer: "Vitamin A",
    explanation:
      "Vitamin A dibutuhkan untuk penglihatan normal dan juga mendukung fungsi kekebalan serta pemeliharaan jaringan.",
  },
  {
    id: "vitmin-005",
    domain: "Vitamin & Mineral",
    question: "Manakah makanan yang dikenal sebagai sumber vitamin C?",
    options: ["Jambu biji", "Minyak goreng", "Garam dapur", "Gula pasir"],
    correctAnswer: "Jambu biji",
    explanation:
      "Jambu biji merupakan sumber vitamin C. Vitamin ini membantu pembentukan kolagen dan meningkatkan penyerapan zat besi non-heme.",
  },
  {
    id: "vitmin-006",
    domain: "Vitamin & Mineral",
    question: "Mineral yang dibutuhkan untuk membantu pembentukan hemoglobin adalah?",
    options: ["Zat besi", "Kalsium", "Natrium", "Fluorida"],
    correctAnswer: "Zat besi",
    explanation:
      "Zat besi merupakan bagian penting hemoglobin, protein dalam sel darah merah yang membantu membawa oksigen ke seluruh tubuh.",
  },
  {
    id: "vitmin-007",
    domain: "Vitamin & Mineral",
    question: "Vitamin yang membantu proses pembekuan darah normal adalah?",
    options: ["Vitamin K", "Vitamin C", "Vitamin D", "Vitamin B12"],
    correctAnswer: "Vitamin K",
    explanation:
      "Vitamin K diperlukan tubuh untuk membentuk beberapa protein yang berperan dalam proses pembekuan darah.",
  },
  {
    id: "vitmin-008",
    domain: "Vitamin & Mineral",
    question: "Manakah pilihan makanan yang dapat menjadi sumber kalsium?",
    options: ["Susu dan tahu yang diperkaya kalsium", "Sirup manis", "Minyak goreng", "Permen biasa"],
    correctAnswer: "Susu dan tahu yang diperkaya kalsium",
    explanation:
      "Susu dan tahu yang dibuat menggunakan bahan penggumpal berkalsium atau diperkaya kalsium dapat membantu memenuhi kebutuhan mineral ini.",
  },

  // ── Hidrasi (tambahan) ──────────────────────────────────────────────────
  {
    id: "hidrasi-004",
    domain: "Hidrasi",
    question: "Kapan kebutuhan cairan biasanya meningkat?",
    options: [
      "Saat berolahraga atau cuaca panas",
      "Saat duduk diam di ruangan sejuk saja",
      "Saat tidur tanpa berkeringat dalam kondisi normal",
      "Kebutuhan cairan tidak pernah berubah",
    ],
    correctAnswer: "Saat berolahraga atau cuaca panas",
    explanation:
      "Aktivitas fisik dan cuaca panas dapat meningkatkan kehilangan cairan melalui keringat. Kebutuhan minum perlu disesuaikan dengan keadaan.",
  },
  {
    id: "hidrasi-005",
    domain: "Hidrasi",
    question: "Apa kebiasaan yang membantu menjaga hidrasi selama belajar di sekolah?",
    options: [
      "Membawa botol air dan minum secara berkala",
      "Menunggu sampai sangat haus setiap hari",
      "Mengganti semua air dengan minuman bersoda",
      "Menghindari minum sepanjang jam sekolah",
    ],
    correctAnswer: "Membawa botol air dan minum secara berkala",
    explanation:
      "Membawa air minum dan minum secara berkala memudahkan pelajar memenuhi kebutuhan cairan sepanjang hari.",
  },
  {
    id: "hidrasi-006",
    domain: "Hidrasi",
    question: "Mengapa kehilangan banyak cairan perlu diganti?",
    options: [
      "Untuk menjaga keseimbangan cairan tubuh",
      "Agar tubuh tidak membutuhkan makanan",
      "Untuk menggantikan semua mineral dengan air saja",
      "Agar tubuh tidak pernah berkeringat",
    ],
    correctAnswer: "Untuk menjaga keseimbangan cairan tubuh",
    explanation:
      "Tubuh kehilangan cairan melalui urine, keringat, dan proses lainnya. Cairan yang cukup membantu mempertahankan fungsi tubuh secara normal.",
  },
  {
    id: "hidrasi-007",
    domain: "Hidrasi",
    question: "Manakah pilihan yang paling tepat untuk memenuhi kebutuhan minum sehari-hari?",
    options: [
      "Air putih sebagai pilihan utama",
      "Minuman energi setiap kali haus",
      "Sirup pekat sebagai satu-satunya minuman",
      "Minuman bersoda sebagai pengganti seluruh air",
    ],
    correctAnswer: "Air putih sebagai pilihan utama",
    explanation:
      "Air putih merupakan pilihan utama untuk hidrasi sehari-hari. Kebutuhan cairan dapat berbeda menurut aktivitas, cuaca, dan kondisi seseorang.",
  },
  {
    id: "hidrasi-008",
    domain: "Hidrasi",
    question: "Apa yang sebaiknya dilakukan ketika beraktivitas fisik dalam cuaca panas?",
    options: [
      "Minum secara berkala dan beristirahat bila diperlukan",
      "Sengaja menghindari semua cairan",
      "Hanya minum setelah aktivitas selesai berjam-jam",
      "Menggantikan air dengan makanan asin saja",
    ],
    correctAnswer: "Minum secara berkala dan beristirahat bila diperlukan",
    explanation:
      "Cuaca panas meningkatkan risiko kehilangan cairan. Minum secara berkala, beristirahat, dan mengurangi aktivitas saat kepanasan membantu menjaga keselamatan.",
  },

  // ── Makanan Sehat (tambahan) ────────────────────────────────────────────
  {
    id: "maksehat-003",
    domain: "Makanan Sehat",
    question: "Manakah pilihan yang menambah variasi sayur dalam menu sehari-hari?",
    options: ["Bayam dan wortel", "Permen dan cokelat saja", "Sirup dan soda", "Kerupuk saja"],
    correctAnswer: "Bayam dan wortel",
    explanation:
      "Sayuran seperti bayam dan wortel menyediakan serat serta beragam vitamin dan mineral. Mengonsumsi berbagai jenis sayuran membantu variasi asupan zat gizi.",
  },
  {
    id: "maksehat-004",
    domain: "Makanan Sehat",
    question: "Mengapa buah utuh sering menjadi pilihan yang baik dibandingkan minuman buah bergula?",
    options: [
      "Buah utuh umumnya menyediakan serat dan perlu dikunyah",
      "Semua buah utuh tidak mengandung gula alami",
      "Minuman buah selalu mengandung lebih banyak serat",
      "Buah utuh tidak mengandung air",
    ],
    correctAnswer: "Buah utuh umumnya menyediakan serat dan perlu dikunyah",
    explanation:
      "Buah utuh menyediakan serat dan berbagai zat gizi. Minuman buah bergula dapat mengandung tambahan gula dan biasanya tidak memberikan serat sebanyak buah utuh.",
  },
  {
    id: "maksehat-005",
    domain: "Makanan Sehat",
    question: "Apa yang dimaksud dengan pola makan beragam?",
    options: [
      "Mengonsumsi berbagai jenis makanan dari kelompok yang berbeda",
      "Makan satu jenis makanan setiap hari",
      "Hanya memilih makanan berdasarkan warna",
      "Menghindari seluruh sumber karbohidrat",
    ],
    correctAnswer: "Mengonsumsi berbagai jenis makanan dari kelompok yang berbeda",
    explanation:
      "Pola makan beragam membantu menyediakan kombinasi zat gizi yang lebih luas dari berbagai kelompok makanan.",
  },
  {
    id: "maksehat-006",
    domain: "Makanan Sehat",
    question: "Manakah contoh sumber lemak tak jenuh?",
    options: ["Kacang-kacangan", "Gula pasir", "Garam", "Air putih"],
    correctAnswer: "Kacang-kacangan",
    explanation:
      "Kacang-kacangan mengandung lemak tak jenuh, protein, dan zat gizi lainnya. Porsi konsumsinya dapat disesuaikan dengan kebutuhan dan kondisi masing-masing.",
  },
  {
    id: "maksehat-007",
    domain: "Makanan Sehat",
    question: "Bagaimana cara sederhana membuat makanan rumahan lebih beragam zat gizinya?",
    options: [
      "Menggabungkan sumber karbohidrat, protein, serta sayur atau buah",
      "Hanya mengonsumsi satu bahan makanan",
      "Menghilangkan semua sayur dari menu",
      "Mengganti semua makanan dengan minuman manis",
    ],
    correctAnswer: "Menggabungkan sumber karbohidrat, protein, serta sayur atau buah",
    explanation:
      "Menggabungkan kelompok makanan yang berbeda membantu menyediakan energi, protein, serat, vitamin, dan mineral dalam menu sehari-hari.",
  },

  // ── Pola Makan (tambahan) ───────────────────────────────────────────────
  {
    id: "polamakan-003",
    domain: "Pola Makan",
    question: "Apa manfaat merencanakan waktu makan ketika menjalani hari sekolah yang padat?",
    options: [
      "Membantu mengatur waktu untuk memenuhi kebutuhan makan",
      "Membuat tubuh tidak membutuhkan air",
      "Menjamin tidak akan pernah merasa lapar",
      "Menghilangkan kebutuhan variasi makanan",
    ],
    correctAnswer: "Membantu mengatur waktu untuk memenuhi kebutuhan makan",
    explanation:
      "Perencanaan waktu makan dapat membantu pelajar menyiapkan makanan dan mengurangi kemungkinan melewatkan waktu makan karena jadwal yang padat.",
  },
  {
    id: "polamakan-004",
    domain: "Pola Makan",
    question: "Apa yang dapat dilakukan jika tidak sempat makan besar sebelum berangkat sekolah?",
    options: [
      "Menyiapkan makanan praktis yang sesuai dan memakannya saat memungkinkan",
      "Sengaja tidak makan sepanjang hari",
      "Hanya minum minuman energi",
      "Menghindari semua makanan sampai malam",
    ],
    correctAnswer: "Menyiapkan makanan praktis yang sesuai dan memakannya saat memungkinkan",
    explanation:
      "Menyiapkan pilihan praktis seperti roti isi telur atau buah bersama sumber protein dapat membantu ketika waktu terbatas. Sesuaikan pilihan dengan ketersediaan makanan.",
  },
  {
    id: "polamakan-005",
    domain: "Pola Makan",
    question: "Apa yang sebaiknya diperhatikan ketika memilih camilan untuk menemani belajar?",
    options: [
      "Variasi zat gizi, rasa lapar, dan ketersediaan makanan",
      "Hanya warna kemasan",
      "Harga paling mahal selalu paling sehat",
      "Semua camilan harus dihindari",
    ],
    correctAnswer: "Variasi zat gizi, rasa lapar, dan ketersediaan makanan",
    explanation:
      "Camilan dapat menjadi bagian dari pola makan. Pilih sesuai kebutuhan dan situasi, misalnya buah, kacang, atau makanan lain yang tersedia dan cocok.",
  },
  {
    id: "polamakan-006",
    domain: "Pola Makan",
    question: "Mengapa jadwal makan dapat berbeda antara satu orang dan orang lainnya?",
    options: [
      "Rutinitas, kebutuhan, aktivitas, dan kondisi individu berbeda",
      "Semua orang memiliki kebutuhan yang persis sama setiap saat",
      "Jadwal makan hanya ditentukan oleh warna makanan",
      "Tubuh tidak membutuhkan energi pada hari sekolah",
    ],
    correctAnswer: "Rutinitas, kebutuhan, aktivitas, dan kondisi individu berbeda",
    explanation:
      "Jadwal dan kebutuhan makan dapat dipengaruhi aktivitas, rutinitas, usia, kondisi kesehatan, serta kebutuhan individu. Tidak ada satu jadwal yang harus sama untuk semua orang.",
  },
  {
    id: "polamakan-007",
    domain: "Pola Makan",
    question: "Apa pendekatan yang baik ketika merasa lapar di sela-sela waktu makan?",
    options: [
      "Mempertimbangkan camilan yang sesuai dengan kebutuhan dan situasi",
      "Selalu mengabaikan rasa lapar",
      "Hanya memilih minuman bersoda",
      "Menganggap semua camilan pasti buruk",
    ],
    correctAnswer: "Mempertimbangkan camilan yang sesuai dengan kebutuhan dan situasi",
    explanation:
      "Camilan dapat membantu memenuhi kebutuhan energi di antara waktu makan. Pilihan dan porsinya dapat disesuaikan dengan rasa lapar, aktivitas, serta makanan yang tersedia.",
  },

  // ── Keamanan Makanan (tambahan) ─────────────────────────────────────────
  {
    id: "keamanan-003",
    domain: "Keamanan Makanan",
    question: "Apa yang sebaiknya dilakukan sebelum menyiapkan makanan?",
    options: [
      "Mencuci tangan menggunakan sabun dan air mengalir",
      "Menyentuh makanan dengan tangan kotor",
      "Menggunakan alat masak yang belum dibersihkan",
      "Membiarkan sampah menempel pada meja",
    ],
    correctAnswer: "Mencuci tangan menggunakan sabun dan air mengalir",
    explanation:
      "Mencuci tangan dengan sabun dan air mengalir membantu mengurangi perpindahan kuman ke makanan dan peralatan dapur.",
  },
  {
    id: "keamanan-004",
    domain: "Keamanan Makanan",
    question: "Mengapa makanan mentah perlu dipisahkan dari makanan matang?",
    options: [
      "Untuk mengurangi risiko kontaminasi silang",
      "Agar makanan matang menjadi mentah kembali",
      "Agar semua makanan kehilangan rasa",
      "Supaya makanan tidak perlu disimpan dengan benar",
    ],
    correctAnswer: "Untuk mengurangi risiko kontaminasi silang",
    explanation:
      "Makanan mentah dapat membawa kuman yang berpindah ke makanan matang melalui tangan, talenan, pisau, atau permukaan yang sama.",
  },
  {
    id: "keamanan-005",
    domain: "Keamanan Makanan",
    question: "Apa cara yang tepat untuk menyimpan makanan matang yang akan dimakan nanti?",
    options: [
      "Segera simpan dalam lemari pendingin setelah tidak lagi diperlukan untuk penyajian",
      "Biarkan terbuka di meja sepanjang malam",
      "Letakkan di dekat tempat sampah",
      "Simpan di bawah sinar matahari",
    ],
    correctAnswer: "Segera simpan dalam lemari pendingin setelah tidak lagi diperlukan untuk penyajian",
    explanation:
      "Makanan mudah rusak sebaiknya segera didinginkan dan disimpan dalam lemari pendingin, bukan dibiarkan lama pada suhu ruang.",
  },
  {
    id: "keamanan-006",
    domain: "Keamanan Makanan",
    question: "Apa yang sebaiknya dilakukan jika kemasan makanan menunjukkan tanggal kedaluwarsa yang sudah lewat?",
    options: [
      "Ikuti petunjuk label dan jangan mengonsumsi produk yang sudah kedaluwarsa",
      "Selalu konsumsi karena bau normal menjamin keamanan",
      "Panaskan sebentar agar semua risiko hilang",
      "Campurkan dengan makanan lain agar aman",
    ],
    correctAnswer: "Ikuti petunjuk label dan jangan mengonsumsi produk yang sudah kedaluwarsa",
    explanation:
      "Tanggal pada label dan petunjuk penyimpanan perlu diperhatikan. Bau atau tampilan normal saja tidak selalu menjamin makanan aman dikonsumsi.",
  },
  {
    id: "keamanan-007",
    domain: "Keamanan Makanan",
    question: "Apa tindakan yang tepat sebelum membeli makanan kemasan?",
    options: [
      "Memeriksa kondisi kemasan, label, dan tanggal kedaluwarsa",
      "Memilih hanya berdasarkan warna kemasan",
      "Mengabaikan kemasan yang bocor",
      "Membeli produk tanpa memperhatikan cara penyimpanan",
    ],
    correctAnswer: "Memeriksa kondisi kemasan, label, dan tanggal kedaluwarsa",
    explanation:
      "Memeriksa kondisi kemasan, label, tanggal kedaluwarsa, dan petunjuk penyimpanan membantu konsumen membuat pilihan yang lebih aman.",
  },

  // ── Mitos & Fakta Nutrisi (tambahan) ────────────────────────────────────
  {
    id: "mitos-004",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Semua makanan yang berlabel alami pasti lebih bergizi.'",
    options: [
      "Fakta — label alami selalu menjamin kandungan gizi terbaik",
      "Mitos — kandungan gizi perlu dinilai dari bahan dan informasi produknya",
      "Fakta — semua produk alami bebas gula",
      "Mitos — makanan alami tidak mengandung zat gizi",
    ],
    correctAnswer: "Mitos — kandungan gizi perlu dinilai dari bahan dan informasi produknya",
    explanation:
      "Istilah 'alami' saja tidak menjamin bahwa suatu produk lebih bergizi. Perhatikan komposisi, informasi gizi, dan konteks pola makan secara keseluruhan.",
  },
  {
    id: "mitos-005",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Sarapan harus selalu berupa nasi agar bergizi.'",
    options: [
      "Fakta — hanya nasi yang cocok untuk sarapan",
      "Mitos — sarapan dapat menggunakan beragam makanan yang memenuhi kebutuhan gizi",
      "Fakta — semua makanan selain nasi tidak mengandung energi",
      "Mitos — sarapan tidak boleh mengandung karbohidrat",
    ],
    correctAnswer: "Mitos — sarapan dapat menggunakan beragam makanan yang memenuhi kebutuhan gizi",
    explanation:
      "Sarapan tidak harus selalu berupa nasi. Roti, oat, umbi, atau makanan lain dapat menjadi pilihan sesuai ketersediaan dan kebutuhan, dengan memperhatikan keseimbangan menu.",
  },
  {
    id: "mitos-006",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Minuman yang terasa manis pasti tidak mengandung air.'",
    options: [
      "Fakta — rasa manis berarti tidak ada air",
      "Mitos — minuman manis mengandung air, tetapi dapat memiliki tambahan gula",
      "Fakta — semua minuman manis adalah makanan padat",
      "Mitos — minuman manis tidak pernah mengandung gula",
    ],
    correctAnswer: "Mitos — minuman manis mengandung air, tetapi dapat memiliki tambahan gula",
    explanation:
      "Minuman manis tetap mengandung air, tetapi tambahan gula dapat meningkatkan asupan gula. Air putih tetap menjadi pilihan utama untuk hidrasi sehari-hari.",
  },
  {
    id: "mitos-007",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Makanan sehat selalu harus mahal.'",
    options: [
      "Fakta — makanan bergizi hanya tersedia dengan harga mahal",
      "Mitos — pilihan terjangkau seperti telur, tempe, dan sayuran dapat menjadi bagian menu bergizi",
      "Fakta — makanan lokal tidak mengandung zat gizi",
      "Mitos — harga adalah satu-satunya penentu kandungan gizi",
    ],
    correctAnswer: "Mitos — pilihan terjangkau seperti telur, tempe, dan sayuran dapat menjadi bagian menu bergizi",
    explanation:
      "Makanan bergizi dapat disesuaikan dengan anggaran. Bahan lokal seperti tempe, telur, kacang-kacangan, dan sayuran musiman dapat membantu membangun menu beragam.",
  },
  {
    id: "mitos-008",
    domain: "Mitos & Fakta Nutrisi",
    question: "MITOS atau FAKTA: 'Jika suatu produk mengandung vitamin, produk itu pasti sehat untuk dikonsumsi tanpa batas.'",
    options: [
      "Fakta — vitamin membuat semua produk aman tanpa batas",
      "Mitos — keseluruhan komposisi, jumlah konsumsi, dan kebutuhan tetap perlu diperhatikan",
      "Fakta — vitamin menghilangkan seluruh tambahan gula",
      "Mitos — tubuh tidak membutuhkan vitamin",
    ],
    correctAnswer: "Mitos — keseluruhan komposisi, jumlah konsumsi, dan kebutuhan tetap perlu diperhatikan",
    explanation:
      "Kandungan satu vitamin tidak otomatis menjadikan suatu produk pilihan terbaik untuk dikonsumsi tanpa batas. Perhatikan komposisi, porsi, dan pola makan secara keseluruhan.",
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
