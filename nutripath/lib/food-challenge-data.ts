/**
 * food-challenge-data.ts
 *
 * Static data for Food Challenge scenarios, food options, and scoring rules.
 *
 * PENTING:
 * - Harga adalah HARGA SIMULASI, bukan harga pasar nyata.
 * - Nilai gizi adalah ESTIMASI EDUKATIF berdasarkan referensi umum, bukan data klinis.
 * - Jangan gunakan data ini sebagai rekomendasi kesehatan.
 * - Scoring mengukur kualitas keputusan terhadap tujuan skenario, bukan menghakimi makanan.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FoodOption {
  id: string;
  name: string;
  /** Harga simulasi dalam Rupiah */
  price: number;
  /** Estimasi kalori — null jika data tidak tersedia */
  calories: number | null;
  /** Estimasi protein gram — null jika data tidak tersedia */
  proteinG: number | null;
  /** Estimasi karbohidrat gram — null jika data tidak tersedia */
  carbsG: number | null;
  /** Estimasi lemak gram — null jika data tidak tersedia */
  fatG: number | null;
  /** Kelompok makanan */
  foodGroup: "carbs" | "protein" | "vegetable" | "fruit" | "dairy" | "snack" | "beverage";
  /** Catatan ketersediaan */
  availabilityNote: string;
  /** Tag skenario yang cocok */
  scenarioTags: string[];
}

export interface ScenarioRule {
  /** Budget maksimum dalam Rupiah */
  maxBudget: number;
  /** Kelompok makanan yang direkomendasikan */
  recommendedGroups: FoodOption["foodGroup"][];
  /** Minimum protein gram yang dianjurkan */
  minProteinG: number | null;
  /** Minimum kalori yang dianjurkan */
  minCalories: number | null;
  /** Maksimum kalori yang dianjurkan */
  maxCalories: number | null;
  /** Jumlah porsi yang harus dipilih */
  portionCount: number;
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  context: string;
  rule: ScenarioRule;
  /** Domain NutriQuest/learning yang relevan */
  relatedDomains: string[];
  /** ID topik Nutrition Knowledge yang relevan */
  relatedKnowledgeIds: string[];
}

export interface ChallengeScore {
  /** Skor 0–100 */
  score: number;
  /** Apakah budget terpenuhi */
  withinBudget: boolean;
  /** Total harga pilihan */
  totalPrice: number;
  /** Apakah rekomendasi kelompok makanan terpenuhi */
  hasRecommendedGroups: boolean;
  /** Kelompok makanan yang terpilih */
  selectedGroups: FoodOption["foodGroup"][];
  /** Apakah protein minimum terpenuhi (null = tidak bisa dievaluasi) */
  meetsProtein: boolean | null;
  /** Apakah kalori dalam rentang (null = tidak bisa dievaluasi) */
  caloriesInRange: boolean | null;
  /** Total protein terpilih (null jika ada item tanpa data) */
  totalProtein: number | null;
  /** Total kalori terpilih (null jika ada item tanpa data) */
  totalCalories: number | null;
  /** Pesan evaluasi edukatif */
  feedback: string[];
  /** Saran alternatif */
  alternatives: string[];
  /** Apakah data gizi lengkap untuk semua pilihan */
  dataComplete: boolean;
}

// ── Food Options ──────────────────────────────────────────────────────────────
// CATATAN: Semua nilai gizi adalah ESTIMASI EDUKATIF

export const FOOD_OPTIONS: FoodOption[] = [
  // Sumber karbohidrat
  {
    id: "nasi-putih",
    name: "Nasi Putih (1 porsi)",
    price: 3000,
    calories: 240,
    proteinG: 4,
    carbsG: 53,
    fatG: 0.5,
    foodGroup: "carbs",
    availabilityNote: "Umum tersedia di kantin sekolah",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "nasi-goreng",
    name: "Nasi Goreng Telur",
    price: 8000,
    calories: 380,
    proteinG: 11,
    carbsG: 58,
    fatG: 14,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di warteg/kantin",
    scenarioTags: ["school-day", "exam-week", "budget"],
  },
  {
    id: "roti-tawar",
    name: "Roti Tawar (2 lembar)",
    price: 3500,
    calories: 140,
    proteinG: 4,
    carbsG: 26,
    fatG: 2,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di minimarket",
    scenarioTags: ["school-day", "busy", "budget"],
  },
  {
    id: "mie-goreng-instan",
    name: "Mie Goreng Instan",
    price: 3500,
    calories: 355,
    proteinG: 8,
    carbsG: 52,
    fatG: 13,
    foodGroup: "carbs",
    availabilityNote: "Umum tersedia",
    scenarioTags: ["budget", "busy", "dorm"],
  },
  // Sumber protein
  {
    id: "telur-ceplok",
    name: "Telur Ceplok (1 butir)",
    price: 2500,
    calories: 90,
    proteinG: 7,
    carbsG: 1,
    fatG: 7,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia di kantin sekolah",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "tempe-goreng",
    name: "Tempe Goreng (2 potong)",
    price: 2000,
    calories: 80,
    proteinG: 8,
    carbsG: 4,
    fatG: 4,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia di warung/kantin",
    scenarioTags: ["school-day", "budget", "vegetarian"],
  },
  {
    id: "ayam-goreng",
    name: "Ayam Goreng (1 potong)",
    price: 8000,
    calories: 280,
    proteinG: 28,
    carbsG: 2,
    fatG: 18,
    foodGroup: "protein",
    availabilityNote: "Tersedia di kantin/warung nasi",
    scenarioTags: ["school-day", "exam-week", "sport"],
  },
  {
    id: "tahu-goreng",
    name: "Tahu Goreng (2 potong)",
    price: 1500,
    calories: 70,
    proteinG: 6,
    carbsG: 2,
    fatG: 4,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia",
    scenarioTags: ["budget", "school-day", "vegetarian"],
  },
  {
    id: "ikan-goreng",
    name: "Ikan Goreng (1 ekor kecil)",
    price: 6000,
    calories: 160,
    proteinG: 22,
    carbsG: 1,
    fatG: 8,
    foodGroup: "protein",
    availabilityNote: "Tersedia di warung nasi",
    scenarioTags: ["school-day", "exam-week"],
  },
  // Sayuran
  {
    id: "sayur-kangkung",
    name: "Tumis Kangkung",
    price: 3000,
    calories: 45,
    proteinG: 3,
    carbsG: 5,
    fatG: 2,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di warung nasi",
    scenarioTags: ["school-day", "budget", "sport"],
  },
  {
    id: "lalapan",
    name: "Lalapan Segar (timun, kol, kemangi)",
    price: 1000,
    calories: 20,
    proteinG: 1,
    carbsG: 4,
    fatG: 0,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di warung nasi",
    scenarioTags: ["budget", "school-day"],
  },
  {
    id: "salad-buah",
    name: "Salad Buah",
    price: 7000,
    calories: 120,
    proteinG: 1,
    carbsG: 28,
    fatG: 0.5,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di kantin swalayan",
    scenarioTags: ["school-day", "sport"],
  },
  // Minuman
  {
    id: "air-putih",
    name: "Air Putih (600ml)",
    price: 3000,
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Tersedia di mana saja",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "susu-uht",
    name: "Susu UHT (200ml)",
    price: 5000,
    calories: 120,
    proteinG: 6,
    carbsG: 14,
    fatG: 5,
    foodGroup: "dairy",
    availabilityNote: "Tersedia di minimarket/kantin",
    scenarioTags: ["school-day", "exam-week", "sport"],
  },
  {
    id: "teh-manis",
    name: "Teh Manis (gelas)",
    price: 2000,
    calories: 80,
    proteinG: 0,
    carbsG: 20,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Umum tersedia di kantin",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "minuman-energi",
    name: "Minuman Energi (kaleng)",
    price: 10000,
    calories: 110,
    proteinG: 0,
    carbsG: 28,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Tersedia di minimarket",
    scenarioTags: ["sport", "exam-week"],
  },
  // Snack
  {
    id: "pisang",
    name: "Pisang (1 buah sedang)",
    price: 2000,
    calories: 90,
    proteinG: 1,
    carbsG: 23,
    fatG: 0.3,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di pedagang kaki lima",
    scenarioTags: ["sport", "school-day", "budget", "exam-week"],
  },
  {
    id: "keripik-singkong",
    name: "Keripik Singkong (bungkus kecil)",
    price: 3000,
    calories: 150,
    proteinG: 1,
    carbsG: 20,
    fatG: 8,
    foodGroup: "snack",
    availabilityNote: "Tersedia di minimarket/kantin",
    scenarioTags: ["budget", "school-day"],
  },
  {
    id: "kacang-rebus",
    name: "Kacang Rebus (1 bungkus)",
    price: 3000,
    calories: 120,
    proteinG: 7,
    carbsG: 10,
    fatG: 5,
    foodGroup: "snack",
    availabilityNote: "Tersedia di pedagang kaki lima",
    scenarioTags: ["sport", "budget", "exam-week"],
  },
];

// ── Scenarios ─────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    id: "school-day-budget",
    title: "Hari Sekolah — Budget Terbatas",
    emoji: "🏫",
    desc: "Kamu punya Rp 15.000 untuk makan siang di kantin. Pilih 3 item yang memberikan energi dan nutrisi terbaik dalam budget.",
    context:
      "Situasi umum pelajar: aktivitas seharian di sekolah, perlu energi untuk belajar hingga sore. Budget kantin terbatas tapi harus cukup bergizi.",
    rule: {
      maxBudget: 15000,
      recommendedGroups: ["carbs", "protein", "vegetable"],
      minProteinG: 15,
      minCalories: 350,
      maxCalories: 700,
      portionCount: 3,
    },
    relatedDomains: ["Gizi Dasar", "Pola Makan Sehat"],
    relatedKnowledgeIds: ["nutrition-basics", "food-choices", "student-meals"],
  },
  {
    id: "exam-week-focus",
    title: "Minggu Ujian — Fokus Optimal",
    emoji: "📚",
    desc: "Ujian besok pagi. Pilih 3 item untuk makan malam yang mendukung fokus belajar dan tidak membuat mengantuk.",
    context:
      "Minggu ujian: butuh konsentrasi tinggi, hindari makanan yang terlalu berat. Protein dan karbohidrat kompleks membantu kinerja otak.",
    rule: {
      maxBudget: 20000,
      recommendedGroups: ["protein", "carbs", "vegetable"],
      minProteinG: 20,
      minCalories: 400,
      maxCalories: 650,
      portionCount: 3,
    },
    relatedDomains: ["Gizi Dasar", "Hidrasi & Performa"],
    relatedKnowledgeIds: ["nutrition-basics", "hydration", "glycemic-index"],
  },
  {
    id: "sport-activity",
    title: "Sebelum Kegiatan Olahraga",
    emoji: "⚽",
    desc: "Ada latihan olahraga sore ini. Pilih 3 item makan siang yang memberi energi tanpa membuat perut terlalu kenyang.",
    context:
      "Sebelum aktivitas fisik: perlu energi yang cukup dari karbohidrat, protein untuk otot, dan hidrasi. Hindari makanan terlalu berlemak.",
    rule: {
      maxBudget: 18000,
      recommendedGroups: ["carbs", "protein", "beverage"],
      minProteinG: 18,
      minCalories: 350,
      maxCalories: 600,
      portionCount: 3,
    },
    relatedDomains: ["Gizi Olahraga", "Hidrasi & Performa"],
    relatedKnowledgeIds: ["nutrition-basics", "hydration"],
  },
  {
    id: "busy-dorm-morning",
    title: "Pagi Sibuk — Asrama/Kos",
    emoji: "⏰",
    desc: "Terlambat! Hanya punya 5 menit dan Rp 10.000. Pilih 2 item sarapan cepat yang tetap bergizi.",
    context:
      "Sarapan dengan waktu terbatas: perlu sesuatu yang mudah didapat, mengenyangkan, dan memberi energi untuk aktivitas pagi.",
    rule: {
      maxBudget: 10000,
      recommendedGroups: ["carbs", "protein"],
      minProteinG: 10,
      minCalories: 200,
      maxCalories: 500,
      portionCount: 2,
    },
    relatedDomains: ["Gizi Dasar", "Pola Makan Sehat"],
    relatedKnowledgeIds: ["student-meals", "nutrition-basics"],
  },
];

// ── Scoring engine ────────────────────────────────────────────────────────────

/**
 * Hitung skor tantangan berdasarkan pilihan makanan dan aturan skenario.
 * Semua perhitungan deterministik — tidak menggunakan AI.
 */
export function scoreChallengeSelection(
  selectedIds: string[],
  scenario: Scenario
): ChallengeScore {
  const selected = selectedIds.map((id) => FOOD_OPTIONS.find((f) => f.id === id)).filter(Boolean) as FoodOption[];

  const totalPrice = selected.reduce((sum, f) => sum + f.price, 0);
  const withinBudget = totalPrice <= scenario.rule.maxBudget;

  const selectedGroups = [...new Set(selected.map((f) => f.foodGroup))];
  const hasRecommendedGroups = scenario.rule.recommendedGroups.every((g) =>
    selectedGroups.includes(g)
  );

  // Gizi — null jika ada item tanpa data
  const hasAllNutritionData = selected.every(
    (f) => f.calories !== null && f.proteinG !== null
  );
  const dataComplete = hasAllNutritionData;

  const totalCalories = hasAllNutritionData
    ? selected.reduce((sum, f) => sum + (f.calories ?? 0), 0)
    : null;

  const totalProtein = hasAllNutritionData
    ? selected.reduce((sum, f) => sum + (f.proteinG ?? 0), 0)
    : null;

  const meetsProtein =
    scenario.rule.minProteinG !== null && totalProtein !== null
      ? totalProtein >= scenario.rule.minProteinG
      : null;

  const caloriesInRange =
    totalCalories !== null &&
    scenario.rule.minCalories !== null &&
    scenario.rule.maxCalories !== null
      ? totalCalories >= scenario.rule.minCalories &&
        totalCalories <= scenario.rule.maxCalories
      : null;

  // ── Scoring algorithm (deterministic) ────────────────────────
  // Budget (30 pts): terpenuhi = 30, melebihi = 0
  // Kelompok makanan (30 pts): tiap kelompok rekomendasi = 10 pt (max 30)
  // Protein (20 pts): terpenuhi = 20, tidak cukup = partial, tidak ada data = 0
  // Kalori (20 pts): dalam rentang = 20, di luar = partial, tidak ada data = 0

  let score = 0;

  if (withinBudget) score += 30;

  const groupScore = scenario.rule.recommendedGroups.filter((g) =>
    selectedGroups.includes(g)
  ).length;
  score += Math.min(30, groupScore * 10);

  if (meetsProtein === true) {
    score += 20;
  } else if (meetsProtein === false && totalProtein !== null && scenario.rule.minProteinG) {
    // Partial: proporsi dari target
    score += Math.round((totalProtein / scenario.rule.minProteinG) * 20 * 0.7);
  }

  if (caloriesInRange === true) {
    score += 20;
  } else if (caloriesInRange === false && totalCalories !== null) {
    const { minCalories, maxCalories } = scenario.rule;
    if (minCalories && maxCalories) {
      const midTarget = (minCalories + maxCalories) / 2;
      const diff = Math.abs(totalCalories - midTarget);
      const range = (maxCalories - minCalories) / 2;
      const proximity = Math.max(0, 1 - diff / (range * 2));
      score += Math.round(proximity * 20);
    }
  }

  score = Math.min(100, Math.max(0, score));

  // ── Feedback ────────────────────────────────────────────────
  const feedback: string[] = [];
  const alternatives: string[] = [];

  if (!withinBudget) {
    feedback.push(
      `Total harga Rp ${totalPrice.toLocaleString("id-ID")} melebihi budget Rp ${scenario.rule.maxBudget.toLocaleString("id-ID")}. Coba pilih opsi yang lebih hemat.`
    );
    alternatives.push("Tempe goreng dan tahu goreng adalah sumber protein murah yang baik.");
  } else {
    const sisa = scenario.rule.maxBudget - totalPrice;
    feedback.push(
      `Budget digunakan Rp ${totalPrice.toLocaleString("id-ID")} dari Rp ${scenario.rule.maxBudget.toLocaleString("id-ID")} (sisa Rp ${sisa.toLocaleString("id-ID")}).`
    );
  }

  if (!hasRecommendedGroups) {
    const missing = scenario.rule.recommendedGroups.filter(
      (g) => !selectedGroups.includes(g)
    );
    const groupNames: Record<string, string> = {
      carbs: "karbohidrat",
      protein: "protein",
      vegetable: "sayuran",
      fruit: "buah",
      dairy: "susu/produk susu",
      snack: "camilan",
      beverage: "minuman",
    };
    feedback.push(
      `Pilihan kurang lengkap — belum ada: ${missing.map((g) => groupNames[g] ?? g).join(", ")}.`
    );
    alternatives.push(
      "Piring makan seimbang idealnya mencakup karbohidrat, protein, dan sayuran/buah."
    );
  }

  if (meetsProtein === false && totalProtein !== null && scenario.rule.minProteinG) {
    feedback.push(
      `Protein hanya ${totalProtein}g dari target minimum ${scenario.rule.minProteinG}g. Tambahkan sumber protein seperti telur, tempe, atau ikan.`
    );
  } else if (meetsProtein === true) {
    feedback.push(`Protein mencukupi (${totalProtein}g). Bagus!`);
  } else if (meetsProtein === null) {
    feedback.push("Data protein tidak lengkap untuk beberapa pilihan — evaluasi protein tidak bisa dilakukan.");
  }

  if (caloriesInRange === true && totalCalories !== null) {
    feedback.push(`Kalori total ${totalCalories} kcal — dalam rentang yang sesuai untuk skenario ini.`);
  } else if (caloriesInRange === false && totalCalories !== null) {
    const { minCalories } = scenario.rule;
    if (totalCalories < (minCalories ?? 0)) {
      feedback.push(`Kalori ${totalCalories} kcal mungkin kurang mencukupi energi untuk aktivitas ini.`);
      alternatives.push("Pertimbangkan menambah nasi atau sumber karbohidrat untuk energi lebih.");
    } else {
      feedback.push(`Kalori ${totalCalories} kcal agak lebih dari yang dianjurkan untuk skenario ini.`);
      alternatives.push("Pilih porsi yang lebih kecil atau kurangi satu item yang tinggi lemak.");
    }
  }

  if (!dataComplete) {
    feedback.push("Catatan: data gizi tidak tersedia untuk semua pilihan. Evaluasi nutrisi bersifat sebagian.");
  }

  return {
    score,
    withinBudget,
    totalPrice,
    hasRecommendedGroups,
    selectedGroups,
    meetsProtein,
    caloriesInRange,
    totalProtein,
    totalCalories,
    feedback,
    alternatives,
    dataComplete,
  };
}

// ── Comparator helpers ────────────────────────────────────────────────────────

export interface ComparisonResult {
  foodA: FoodOption;
  foodB: FoodOption;
  priceDiff: number; // positive = A lebih mahal
  proteinDiff: number | null;
  caloriesDiff: number | null;
  dataNote: string;
  considerations: string[];
}

export function compareFoodOptions(idA: string, idB: string): ComparisonResult | null {
  const a = FOOD_OPTIONS.find((f) => f.id === idA);
  const b = FOOD_OPTIONS.find((f) => f.id === idB);
  if (!a || !b) return null;

  const priceDiff = a.price - b.price;
  const proteinDiff =
    a.proteinG !== null && b.proteinG !== null ? a.proteinG - b.proteinG : null;
  const caloriesDiff =
    a.calories !== null && b.calories !== null ? a.calories - b.calories : null;

  const considerations: string[] = [];

  if (proteinDiff !== null) {
    if (Math.abs(proteinDiff) >= 5) {
      considerations.push(
        proteinDiff > 0
          ? `${a.name} mengandung ${proteinDiff}g protein lebih banyak dari ${b.name}.`
          : `${b.name} mengandung ${Math.abs(proteinDiff)}g protein lebih banyak dari ${a.name}.`
      );
    }
  }

  if (caloriesDiff !== null) {
    if (Math.abs(caloriesDiff) >= 30) {
      considerations.push(
        caloriesDiff > 0
          ? `${a.name} memiliki ${caloriesDiff} kcal lebih dari ${b.name}.`
          : `${b.name} memiliki ${Math.abs(caloriesDiff)} kcal lebih dari ${a.name}.`
      );
    }
  }

  if (Math.abs(priceDiff) > 0) {
    const cheaper = priceDiff > 0 ? b.name : a.name;
    const diff = Math.abs(priceDiff);
    considerations.push(
      `${cheaper} lebih hemat Rp ${diff.toLocaleString("id-ID")}.`
    );
  }

  if (a.foodGroup !== b.foodGroup) {
    considerations.push(
      `Keduanya dari kelompok berbeda (${a.foodGroup} vs ${b.foodGroup}) — perbandingan langsung perlu mempertimbangkan konteks skenario.`
    );
  }

  const dataNote =
    a.proteinG === null || b.proteinG === null || a.calories === null || b.calories === null
      ? "Data gizi tidak tersedia untuk satu atau lebih pilihan. Perbandingan nutrisi bersifat sebagian."
      : "Semua data estimasi gizi tersedia. Nilai merupakan estimasi edukatif, bukan data klinis.";

  return { foodA: a, foodB: b, priceDiff, proteinDiff, caloriesDiff, dataNote, considerations };
}
