/**
 * lib/nutrition-knowledge-engine.ts
 *
 * SMANU Nutrition Knowledge Engine
 * =================================
 * Provides structured, source-cited nutritional knowledge for:
 *   - Explaining functions of macronutrients and micronutrients.
 *   - Contextualising scan results with educational content.
 *   - Answering "what does this nutrient do?" questions.
 *   - Generating human-readable summaries of food scan results.
 *
 * DATA SOURCES (embedded, not LLM-generated):
 *   - Kemenkes RI — Pedoman Gizi Seimbang (PGS) 2014 & revisi 2019
 *   - WHO — Nutrition for Health and Development
 *   - FAO — Human Vitamin and Mineral Requirements
 *   - TKPI-2017 — Tabel Komposisi Pangan Indonesia, Kemenkes RI
 *
 * CONSTRAINTS:
 *   - No medical diagnoses.
 *   - No individual health condition assessment.
 *   - All reference values are population-level guidelines, not prescriptions.
 *   - Designed for school-age students (13–18), general educational context.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface NutrientInfo {
  /** Canonical name in Indonesian */
  namePrimary: string;
  /** English name */
  nameEnglish: string;
  /** Unit of measurement */
  unit: string;
  /** Short one-sentence function */
  functionShort: string;
  /** Longer educational explanation (2–4 sentences) */
  functionDetail: string;
  /** Indonesian food sources rich in this nutrient */
  foodSources: string[];
  /** Approximate daily reference intake for school-age adolescents (13–18) */
  dri: {
    amount: number;
    unit: string;
    note: string;
    source: string;
  };
  /** What happens if intake is too low (educational, not clinical) */
  deficiencyNote: string;
  /** Cited reference */
  reference: string;
}

export interface ScanNutritionSummary {
  /** Food name confirmed by user */
  foodName: string;
  /** Portion size in grams */
  portionG: number;
  /** Portion label */
  portionLabel: string;
  /** Energy in kcal */
  energyKcal: number | null;
  /** Protein in grams */
  proteinG: number | null;
  /** Fat in grams */
  fatG: number | null;
  /** Carbohydrates in grams */
  carbG: number | null;
  /** Dietary fiber in grams */
  fiberG: number | null;
  /** Data source */
  dataSource: string;
  /** Whether values are estimated */
  isEstimate: boolean;
  /** Assumptions string from estimateNutrition() */
  assumptions: string;
}

export interface NutritionInsight {
  /** Which nutrient this insight is about */
  nutrient: string;
  /** Educational insight text */
  insight: string;
  /** Contribution percentage vs DRI (only shown if computable) */
  driPct: number | null;
  /** Label: "Tinggi", "Sedang", "Rendah", "Tidak diketahui" */
  level: "Tinggi" | "Sedang" | "Rendah" | "Tidak diketahui";
}

// ── Nutrient Knowledge Base ─────────────────────────────────────────────────

export const NUTRIENT_KNOWLEDGE: Record<string, NutrientInfo> = {
  energy: {
    namePrimary: "Energi",
    nameEnglish: "Energy",
    unit: "kkal",
    functionShort: "Bahan bakar utama tubuh untuk semua aktivitas fisik dan fungsi otak.",
    functionDetail:
      "Energi diukur dalam kilokalori (kkal) dan diperoleh dari karbohidrat, lemak, dan protein. " +
      "Tubuh menggunakan energi secara terus-menerus — mulai dari detak jantung hingga berpikir dan bergerak. " +
      "Asupan energi yang cukup penting agar konsentrasi belajar tetap optimal. " +
      "Kelebihan energi disimpan sebagai cadangan lemak; kekurangan energi membuat tubuh lemas dan sulit fokus.",
    foodSources: ["Nasi putih", "Ubi", "Singkong", "Roti", "Mie", "Pisang", "Tempe", "Ayam"],
    dri: {
      amount: 2100,
      unit: "kkal/hari",
      note: "Estimasi kebutuhan energi remaja 13–18 tahun (aktivitas sedang). Kebutuhan individu bervariasi.",
      source: "Permenkes RI No. 28 Tahun 2019 tentang Angka Kecukupan Gizi (AKG)",
    },
    deficiencyNote:
      "Asupan energi kurang dari kebutuhan menyebabkan tubuh lemas, sulit konsentrasi, dan penurunan berat badan tidak sehat.",
    reference: "Kemenkes RI, AKG 2019 | WHO, Energy and Protein Requirements 1985",
  },

  protein: {
    namePrimary: "Protein",
    nameEnglish: "Protein",
    unit: "gram",
    functionShort: "Membangun dan memperbaiki sel tubuh, termasuk otot, enzim, dan hormon.",
    functionDetail:
      "Protein terdiri dari asam amino yang digunakan tubuh untuk membangun otot, jaringan, enzim pencernaan, dan hormon. " +
      "Pada remaja yang sedang tumbuh, kebutuhan protein relatif tinggi karena tubuh aktif berkembang. " +
      "Protein juga berperan dalam sistem imun — membentuk antibodi melawan infeksi. " +
      "Kekurangan protein dalam jangka panjang berdampak pada pertumbuhan, imunitas, dan pemulihan tubuh setelah sakit.",
    foodSources: [
      "Telur rebus/dadar", "Tahu", "Tempe", "Ayam", "Ikan", "Daging sapi",
      "Susu", "Kacang-kacangan", "Edamame",
    ],
    dri: {
      amount: 65,
      unit: "gram/hari",
      note: "AKG protein remaja laki-laki 13–15 tahun. Perempuan ~65 g/hari. Nilai dapat berbeda per usia.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Kekurangan protein (kwashiorkor) menyebabkan pertumbuhan terhambat, perut buncit, mudah sakit, dan rambut rapuh.",
    reference: "Kemenkes RI, AKG 2019 | FAO/WHO/UNU, Protein and Amino Acid Requirements 2007",
  },

  fat: {
    namePrimary: "Lemak",
    nameEnglish: "Fat / Lipids",
    unit: "gram",
    functionShort: "Sumber energi padat, membantu penyerapan vitamin larut lemak, dan pelindung organ.",
    functionDetail:
      "Lemak adalah makronutrien dengan kandungan energi tertinggi (9 kkal per gram). " +
      "Fungsinya tidak hanya sebagai cadangan energi — lemak juga dibutuhkan untuk menyerap vitamin A, D, E, K, " +
      "membentuk membran sel, dan memproduksi hormon. " +
      "Tidak semua lemak sama: lemak tidak jenuh (dari ikan, kacang, minyak zaitun) lebih baik untuk kesehatan " +
      "jantung dibanding lemak jenuh (dari gorengan berlebihan, jeroan) atau lemak trans.",
    foodSources: [
      "Ikan laut (omega-3)", "Kacang tanah", "Alpukat",
      "Minyak kelapa sawit (gunakan secukupnya)", "Telur", "Susu",
    ],
    dri: {
      amount: 75,
      unit: "gram/hari",
      note: "Anjuran 20–35% dari total energi. Untuk energi 2100 kkal → ~47–82 g lemak.",
      source: "Kemenkes RI, Pedoman Gizi Seimbang (PGS) 2014",
    },
    deficiencyNote:
      "Kekurangan lemak menyebabkan defisiensi vitamin A, D, E, K — yang penting untuk penglihatan, tulang, sistem imun, dan pembekuan darah.",
    reference: "Kemenkes RI, PGS 2014 | WHO, Diet, Nutrition and the Prevention of Chronic Diseases 2003",
  },

  carbohydrate: {
    namePrimary: "Karbohidrat",
    nameEnglish: "Carbohydrate",
    unit: "gram",
    functionShort: "Sumber energi utama otak dan otot — terutama untuk belajar dan aktivitas fisik.",
    functionDetail:
      "Karbohidrat dipecah menjadi glukosa — bahan bakar utama otak. " +
      "Selama jam pelajaran, otak membutuhkan pasokan glukosa yang stabil agar tetap fokus. " +
      "Karbohidrat kompleks (nasi, ubi, oat) dicerna lebih lambat dibanding karbohidrat sederhana (gula, minuman manis), " +
      "sehingga menjaga kadar gula darah lebih stabil dan menghindari rasa ngantuk mendadak. " +
      "Anjuran: pilih sumber karbohidrat kompleks dengan serat tinggi untuk energi yang tahan lama.",
    foodSources: [
      "Nasi putih", "Nasi merah", "Ubi jalar", "Singkong", "Roti gandum",
      "Jagung", "Oat", "Kentang",
    ],
    dri: {
      amount: 300,
      unit: "gram/hari",
      note: "Anjuran 45–65% dari total energi. Untuk 2100 kkal → ~236–341 g karbohidrat.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Asupan karbohidrat sangat rendah menyebabkan tubuh membakar protein dan lemak untuk energi, yang dalam jangka panjang tidak ideal untuk pertumbuhan remaja.",
    reference: "Kemenkes RI, AKG 2019 | FAO/WHO, Carbohydrates in Human Nutrition 1998",
  },

  fiber: {
    namePrimary: "Serat Pangan",
    nameEnglish: "Dietary Fiber",
    unit: "gram",
    functionShort: "Menjaga kesehatan pencernaan dan membantu rasa kenyang lebih lama.",
    functionDetail:
      "Serat pangan tidak dicerna oleh usus halus, tetapi difermentasi oleh bakteri baik di usus besar. " +
      "Serat membantu pergerakan usus, mencegah sembelit, dan memberi rasa kenyang lebih lama sehingga tidak mudah lapar. " +
      "Serat larut (dari buah, kacang) membantu mengontrol kadar gula dan kolesterol darah. " +
      "Banyak pelajar yang kurang serat karena pola makan tinggi nasi dan gorengan tanpa sayur dan buah.",
    foodSources: [
      "Sayuran hijau (bayam, kangkung, brokoli)", "Buah (apel, pepaya, pisang)",
      "Kacang-kacangan", "Tempe", "Tahu", "Nasi merah", "Oat",
    ],
    dri: {
      amount: 32,
      unit: "gram/hari",
      note: "AKG serat remaja 13–18 tahun.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Asupan serat rendah dikaitkan dengan sembelit, peningkatan risiko gangguan pencernaan, dan rasa lapar cepat kembali.",
    reference: "Kemenkes RI, AKG 2019 | WHO, Diet, Nutrition and Prevention of Chronic Diseases 2003",
  },

  sodium: {
    namePrimary: "Natrium (Garam)",
    nameEnglish: "Sodium",
    unit: "mg",
    functionShort: "Mengatur keseimbangan cairan tubuh dan transmisi sinyal saraf.",
    functionDetail:
      "Natrium adalah elektrolit utama cairan ekstraseluler. Bersama kalium, natrium mengatur keseimbangan cairan, " +
      "tekanan darah, dan transmisi sinyal saraf ke otot. " +
      "Kebutuhan natrium sebenarnya kecil — tubuh hanya memerlukan sekitar 500 mg/hari untuk fungsi dasar. " +
      "Namun, konsumsi natrium (garam) berlebih dari makanan olahan, mie instan, dan snack kemasan " +
      "dikaitkan dengan peningkatan tekanan darah dalam jangka panjang.",
    foodSources: ["Garam dapur (gunakan secukupnya)", "Ikan asin", "Kecap", "Mie instan (tinggi)", "Kerupuk"],
    dri: {
      amount: 1500,
      unit: "mg/hari",
      note: "Batas kecukupan (Adequate Intake). Batas aman: <2000 mg/hari untuk remaja.",
      source: "Kemenkes RI — Batas GGL: <2000 mg natrium/hari",
    },
    deficiencyNote:
      "Kekurangan natrium jarang terjadi pada kondisi normal. Kelebihan natrium lebih umum dan berdampak pada tekanan darah jangka panjang.",
    reference: "Kemenkes RI, Panduan GGL (Gula Garam Lemak) 2018 | WHO, Sodium intake for adults 2012",
  },

  calcium: {
    namePrimary: "Kalsium",
    nameEnglish: "Calcium",
    unit: "mg",
    functionShort: "Membangun dan memperkuat tulang dan gigi, serta mendukung kerja otot dan saraf.",
    functionDetail:
      "Kalsium adalah mineral paling melimpah di tubuh — 99% tersimpan di tulang dan gigi. " +
      "Masa remaja adalah periode kritis pembentukan kepadatan tulang; kalsium yang cukup sekarang " +
      "melindungi dari osteoporosis di masa tua. " +
      "Selebihnya (1%), kalsium berperan dalam kontraksi otot, pembekuan darah, dan transmisi sinyal saraf. " +
      "Pelajar yang jarang mengonsumsi susu, ikan kecil bertulang, atau sayuran hijau berisiko kekurangan kalsium.",
    foodSources: [
      "Susu dan produk susu", "Ikan teri (dimakan dengan tulangnya)", "Tahu (diproses dengan garam kalsium)",
      "Tempe", "Bayam", "Brokoli", "Kedelai",
    ],
    dri: {
      amount: 1200,
      unit: "mg/hari",
      note: "AKG kalsium remaja 13–18 tahun (kebutuhan tertinggi sepanjang hidup).",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Kekurangan kalsium jangka panjang pada remaja menyebabkan kepadatan tulang tidak optimal (peak bone mass rendah), " +
      "meningkatkan risiko patah tulang dan osteoporosis di kemudian hari.",
    reference: "Kemenkes RI, AKG 2019 | FAO/WHO, Human Vitamin and Mineral Requirements 2002",
  },

  iron: {
    namePrimary: "Zat Besi",
    nameEnglish: "Iron",
    unit: "mg",
    functionShort: "Membawa oksigen ke seluruh tubuh melalui hemoglobin dalam sel darah merah.",
    functionDetail:
      "Zat besi adalah komponen utama hemoglobin — protein dalam sel darah merah yang membawa oksigen dari paru-paru ke seluruh jaringan. " +
      "Kekurangan zat besi menyebabkan anemia — kondisi umum pada remaja, terutama perempuan. " +
      "Gejala anemia: lemas, pusing, pucat, dan sulit berkonsentrasi saat belajar. " +
      "Zat besi dari sumber hewani (heme iron) diserap 2–3x lebih efisien dibanding sumber nabati (non-heme). " +
      "Konsumsi vitamin C bersamaan membantu penyerapan zat besi nabati.",
    foodSources: [
      "Daging sapi merah", "Hati ayam", "Ikan", "Telur",
      "Tempe", "Tahu", "Bayam", "Kacang merah", "Biji wijen",
    ],
    dri: {
      amount: 15,
      unit: "mg/hari",
      note: "AKG zat besi remaja perempuan 13–15 tahun. Laki-laki: ~13 mg/hari.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Anemia defisiensi besi adalah masalah gizi terbanyak pada remaja Indonesia — menyebabkan kelelahan, " +
      "penurunan konsentrasi belajar, dan penurunan imunitas.",
    reference: "Kemenkes RI, AKG 2019 | WHO, Iron deficiency anaemia 2001",
  },

  vitaminC: {
    namePrimary: "Vitamin C",
    nameEnglish: "Vitamin C (Ascorbic Acid)",
    unit: "mg",
    functionShort: "Antioksidan kuat, membantu imunitas, dan mempercepat penyerapan zat besi.",
    functionDetail:
      "Vitamin C adalah vitamin larut air yang tidak dapat disimpan tubuh dalam jumlah besar — harus dikonsumsi setiap hari. " +
      "Fungsinya meliputi: memperkuat sistem imun, membentuk kolagen (untuk kulit, tulang, dan pembuluh darah), " +
      "serta membantu penyerapan zat besi non-heme dari sayuran dan kacang. " +
      "Vitamin C juga bertindak sebagai antioksidan yang melindungi sel dari kerusakan akibat radikal bebas. " +
      "Buah dan sayur segar adalah sumber terbaik — pemanasan berlebih merusak vitamin C.",
    foodSources: [
      "Jambu biji (tertinggi di buah lokal: ~228 mg/100g)",
      "Pepaya", "Jeruk", "Mangga", "Tomat", "Cabai merah",
      "Brokoli", "Bayam", "Kangkung",
    ],
    dri: {
      amount: 75,
      unit: "mg/hari",
      note: "AKG vitamin C remaja 13–18 tahun.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Kekurangan parah vitamin C menyebabkan scurvy (gusi berdarah, luka sulit sembuh). " +
      "Kekurangan ringan berdampak pada imunitas yang menurun.",
    reference: "Kemenkes RI, AKG 2019 | FAO/WHO, Human Vitamin and Mineral Requirements 2002",
  },

  water: {
    namePrimary: "Air",
    nameEnglish: "Water",
    unit: "gram",
    functionShort: "Komponen utama tubuh — mengatur suhu, mengangkut zat gizi, dan membuang racun.",
    functionDetail:
      "Sekitar 60% tubuh manusia terdiri dari air. Air mengangkut zat gizi dan oksigen ke sel, " +
      "membuang sisa metabolisme melalui urin dan keringat, serta mengatur suhu tubuh. " +
      "Kekurangan cairan ringan (1–2% berat badan) sudah cukup menurunkan konsentrasi, daya ingat, dan performa fisik. " +
      "Remaja aktif membutuhkan lebih banyak air — terutama saat olahraga atau cuaca panas. " +
      "Air yang terkandung dalam makanan (buah, sayur, sup) juga berkontribusi pada total asupan cairan.",
    foodSources: [
      "Air putih (sumber terbaik)", "Buah-buahan (semangka, melon ~90% air)",
      "Sayuran hijau", "Sup bening", "Susu",
    ],
    dri: {
      amount: 2000,
      unit: "mL/hari",
      note: "AKG total cairan remaja. Dari air minum + minuman lain + kandungan air makanan.",
      source: "Permenkes RI No. 28 Tahun 2019 (AKG)",
    },
    deficiencyNote:
      "Dehidrasi ringan menyebabkan sakit kepala, kelelahan, dan penurunan konsentrasi belajar. " +
      "Tanda: urin berwarna kuning pekat atau gelap.",
    reference: "Kemenkes RI, AKG 2019 | EFSA, Dietary Reference Values for Water 2010",
  },
};

// ── DRI reference values for calculation ────────────────────────────────────

const DRI_KCAL = 2100;   // kcal/day, adolescents ~15 y
const DRI_PROTEIN_G = 65;
const DRI_FAT_G = 70;
const DRI_CARB_G = 300;
const DRI_FIBER_G = 32;
const DRI_SODIUM_MG = 1500;
const DRI_CALCIUM_MG = 1200;
const DRI_IRON_MG = 15;
const DRI_VITAMINC_MG = 75;

// ── Functions ────────────────────────────────────────────────────────────────

/** Return the NutrientInfo for a given nutrient key */
export function getNutrientInfo(key: string): NutrientInfo | null {
  return NUTRIENT_KNOWLEDGE[key] ?? null;
}

/** Look up all available nutrient info objects */
export function listNutrients(): string[] {
  return Object.keys(NUTRIENT_KNOWLEDGE);
}

/**
 * Generate insights from a scan result.
 * Returns an array of human-readable insights per nutrient, with
 * DRI contribution percentage and level label.
 */
export function generateScanInsights(summary: ScanNutritionSummary): NutritionInsight[] {
  const insights: NutritionInsight[] = [];

  function pct(value: number | null | undefined, dri: number): number | null {
    if (value === null || value === undefined || dri === 0) return null;
    return Math.round((value / dri) * 100);
  }

  function level(p: number | null): NutritionInsight["level"] {
    if (p === null) return "Tidak diketahui";
    if (p >= 20) return "Tinggi";
    if (p >= 10) return "Sedang";
    return "Rendah";
  }

  // Energy
  if (summary.energyKcal !== null) {
    const p = pct(summary.energyKcal, DRI_KCAL);
    insights.push({
      nutrient: "Energi",
      insight:
        `${summary.portionLabel} ${summary.foodName} mengandung ` +
        `${Math.round(summary.energyKcal)} kkal — ` +
        (p !== null ? `sekitar ${p}% dari kebutuhan energi harian.` : ""),
      driPct: p,
      level: level(p),
    });
  }

  // Protein
  if (summary.proteinG !== null) {
    const p = pct(summary.proteinG, DRI_PROTEIN_G);
    insights.push({
      nutrient: "Protein",
      insight:
        `Kandungan protein ${summary.proteinG.toFixed(1)} g` +
        (p !== null ? ` (≈${p}% AKG)` : "") +
        ` — membantu pembentukan otot dan jaringan yang sedang aktif tumbuh.`,
      driPct: p,
      level: level(p),
    });
  }

  // Fat
  if (summary.fatG !== null) {
    const p = pct(summary.fatG, DRI_FAT_G);
    insights.push({
      nutrient: "Lemak",
      insight:
        `Lemak ${summary.fatG.toFixed(1)} g` +
        (p !== null ? ` (≈${p}% AKG)` : "") +
        `. Penting untuk penyerapan vitamin A, D, E, K.`,
      driPct: p,
      level: level(p),
    });
  }

  // Carbohydrate
  if (summary.carbG !== null) {
    const p = pct(summary.carbG, DRI_CARB_G);
    insights.push({
      nutrient: "Karbohidrat",
      insight:
        `Karbohidrat ${summary.carbG.toFixed(1)} g` +
        (p !== null ? ` (≈${p}% AKG)` : "") +
        ` — bahan bakar utama otak untuk konsentrasi belajar.`,
      driPct: p,
      level: level(p),
    });
  }

  // Fiber
  if (summary.fiberG !== null) {
    const p = pct(summary.fiberG, DRI_FIBER_G);
    insights.push({
      nutrient: "Serat",
      insight:
        `Serat ${summary.fiberG.toFixed(1)} g` +
        (p !== null ? ` (≈${p}% AKG)` : "") +
        ` — membantu pencernaan dan rasa kenyang lebih lama.`,
      driPct: p,
      level: level(p),
    });
  }

  return insights;
}

/**
 * Generate a plain-text educational summary of a scan result.
 * This is suitable for display below the nutrition table in FoodScannerModal.
 */
export function generateScanSummaryText(summary: ScanNutritionSummary): string {
  const lines: string[] = [];

  lines.push(`📊 Estimasi Nutrisi — ${summary.foodName}`);
  lines.push(`Porsi: ${summary.portionLabel}`);
  lines.push(`Sumber data: ${summary.dataSource}${summary.isEstimate ? " (estimasi)" : " (terukur)"}`);
  lines.push("");
  lines.push(
    "Nilai di atas adalah estimasi edukatif berdasarkan data komposisi pangan. " +
      "Kandungan aktual dapat berbeda bergantung pada resep, bahan, dan cara memasak."
  );

  return lines.join("\n");
}

/**
 * Look up DRI-based percentage for a single nutrient value.
 * Returns null if DRI is unknown for the nutrient key.
 */
export function nutrientDriPct(key: string, amount: number): number | null {
  const driMap: Record<string, number> = {
    energyKcal: DRI_KCAL,
    proteinG: DRI_PROTEIN_G,
    fatG: DRI_FAT_G,
    carbG: DRI_CARB_G,
    fiberG: DRI_FIBER_G,
    sodiumMg: DRI_SODIUM_MG,
    calciumMg: DRI_CALCIUM_MG,
    ironMg: DRI_IRON_MG,
    vitaminCMg: DRI_VITAMINC_MG,
  };
  const dri = driMap[key];
  if (!dri) return null;
  return Math.round((amount / dri) * 100);
}

/**
 * Disclaimer text to always show alongside scan results.
 * Prevents misuse as clinical nutrition advice.
 */
export const SCAN_DISCLAIMER =
  "Hasil ini adalah estimasi edukatif — bukan pengganti konsultasi ahli gizi klinis. " +
  "Kandungan nutrisi aktual bergantung pada resep, bahan, dan metode memasak yang digunakan. " +
  "SMANU tidak memberikan saran medis atau diagnosis kondisi kesehatan.";
