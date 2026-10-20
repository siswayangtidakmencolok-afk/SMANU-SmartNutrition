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
  // ── Sumber karbohidrat ──────────────────────────────────────────
  {
    id: "nasi-putih",
    name: "Nasi Putih (1 porsi ~150g)",
    price: 3000,
    calories: 195,
    proteinG: 3.6,
    carbsG: 43,
    fatG: 0.4,
    foodGroup: "carbs",
    availabilityNote: "Umum tersedia di kantin sekolah. Harga estimasi, dapat berbeda per kantin.",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "nasi-goreng",
    name: "Nasi Goreng Telur (1 porsi)",
    price: 8000,
    calories: 380,
    proteinG: 11,
    carbsG: 58,
    fatG: 14,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di warteg/kantin. Estimasi per porsi standar.",
    scenarioTags: ["school-day", "exam-week", "budget"],
  },
  {
    id: "nasi-uduk",
    name: "Nasi Uduk (1 porsi ~150g)",
    price: 5000,
    calories: 230,
    proteinG: 4,
    carbsG: 44,
    fatG: 4,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di kantin/warung. Estimasi, santan menambah lemak.",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "lontong",
    name: "Lontong (2 biji)",
    price: 2000,
    calories: 140,
    proteinG: 2,
    carbsG: 31,
    fatG: 0.5,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di warung/pedagang kaki lima. Estimasi per 2 biji lontong.",
    scenarioTags: ["school-day", "budget"],
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
    availabilityNote: "Tersedia di minimarket. Estimasi per 2 lembar standar.",
    scenarioTags: ["school-day", "busy", "budget"],
  },
  {
    id: "kentang-rebus",
    name: "Kentang Rebus (2 biji sedang)",
    price: 3000,
    calories: 170,
    proteinG: 4,
    carbsG: 37,
    fatG: 0.2,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di kantin/warung. Alternatif karbohidrat GI sedang.",
    scenarioTags: ["school-day", "sport", "budget"],
  },
  {
    id: "mie-goreng-instan",
    name: "Mie Goreng Instan (1 bungkus)",
    price: 3500,
    calories: 355,
    proteinG: 8,
    carbsG: 52,
    fatG: 13,
    foodGroup: "carbs",
    availabilityNote: "Umum tersedia. Natrium tinggi (~1.300mg/bungkus). Estimasi.",
    scenarioTags: ["budget", "busy", "dorm"],
  },
  {
    id: "mie-rebus",
    name: "Mie Rebus Kuah (1 porsi)",
    price: 7000,
    calories: 280,
    proteinG: 9,
    carbsG: 47,
    fatG: 7,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di kantin/warteg. Lebih rendah lemak dibanding mie goreng.",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "jagung-rebus",
    name: "Jagung Rebus (1 tongkol)",
    price: 3000,
    calories: 130,
    proteinG: 4,
    carbsG: 27,
    fatG: 1.5,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di pedagang kaki lima. Sumber karbohidrat berserat.",
    scenarioTags: ["school-day", "budget", "sport"],
  },
  {
    id: "ubi-rebus",
    name: "Ubi Jalar Rebus (1 biji sedang)",
    price: 2500,
    calories: 130,
    proteinG: 2,
    carbsG: 29,
    fatG: 0.1,
    foodGroup: "carbs",
    availabilityNote: "Tersedia di pedagang kaki lima. GI sedang, kaya beta-karoten.",
    scenarioTags: ["school-day", "budget", "sport"],
  },
  // ── Sumber protein ──────────────────────────────────────────────
  {
    id: "telur-ceplok",
    name: "Telur Ceplok (1 butir)",
    price: 2500,
    calories: 90,
    proteinG: 7,
    carbsG: 0.6,
    fatG: 7,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia di kantin sekolah. Estimasi per 1 telur ~55g.",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "telur-rebus",
    name: "Telur Rebus (1 butir)",
    price: 2000,
    calories: 77,
    proteinG: 6.5,
    carbsG: 0.6,
    fatG: 5.3,
    foodGroup: "protein",
    availabilityNote: "Mudah dibuat sendiri atau beli di warung. Lebih rendah lemak dari telur ceplok.",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "tempe-goreng",
    name: "Tempe Goreng (2 potong ~50g)",
    price: 2000,
    calories: 100,
    proteinG: 9.5,
    carbsG: 5,
    fatG: 5,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia di warung/kantin. Estimasi, kandungan gizi berdasarkan DKBM.",
    scenarioTags: ["school-day", "budget", "vegetarian"],
  },
  {
    id: "tempe-bacem",
    name: "Tempe Bacem (2 potong ~50g)",
    price: 3000,
    calories: 120,
    proteinG: 9,
    carbsG: 9,
    fatG: 5,
    foodGroup: "protein",
    availabilityNote: "Tersedia di warung nasi Jawa. Estimasi, gula lebih tinggi dari tempe goreng biasa.",
    scenarioTags: ["school-day", "budget", "vegetarian"],
  },
  {
    id: "ayam-goreng",
    name: "Ayam Goreng (1 potong ~100g)",
    price: 8000,
    calories: 280,
    proteinG: 27,
    carbsG: 2,
    fatG: 18,
    foodGroup: "protein",
    availabilityNote: "Tersedia di kantin/warung nasi. Estimasi per 1 potong paha/dada.",
    scenarioTags: ["school-day", "exam-week", "sport"],
  },
  {
    id: "ayam-bakar",
    name: "Ayam Bakar (1 potong ~100g)",
    price: 10000,
    calories: 220,
    proteinG: 28,
    carbsG: 2,
    fatG: 11,
    foodGroup: "protein",
    availabilityNote: "Tersedia di warung nasi. Lebih rendah lemak dari ayam goreng. Estimasi.",
    scenarioTags: ["school-day", "exam-week", "sport"],
  },
  {
    id: "tahu-goreng",
    name: "Tahu Goreng (2 potong ~100g)",
    price: 1500,
    calories: 150,
    proteinG: 12,
    carbsG: 4,
    fatG: 9,
    foodGroup: "protein",
    availabilityNote: "Umum tersedia. Salah satu sumber protein nabati termurah. Estimasi.",
    scenarioTags: ["budget", "school-day", "vegetarian"],
  },
  {
    id: "ikan-goreng",
    name: "Ikan Goreng (1 ekor kecil ~80g)",
    price: 6000,
    calories: 160,
    proteinG: 22,
    carbsG: 1,
    fatG: 8,
    foodGroup: "protein",
    availabilityNote: "Tersedia di warung nasi. Estimasi ikan laut kecil goreng.",
    scenarioTags: ["school-day", "exam-week"],
  },
  {
    id: "bakso-sapi",
    name: "Bakso Sapi (5 biji, kuah)",
    price: 8000,
    calories: 200,
    proteinG: 12,
    carbsG: 18,
    fatG: 7,
    foodGroup: "protein",
    availabilityNote: "Tersedia di kantin/warteg. Estimasi. Natrium cukup tinggi dari kuah.",
    scenarioTags: ["school-day", "budget"],
  },
  // ── Sayuran ─────────────────────────────────────────────────────
  {
    id: "sayur-kangkung",
    name: "Tumis Kangkung (1 porsi)",
    price: 3000,
    calories: 45,
    proteinG: 3,
    carbsG: 5,
    fatG: 2,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di warung nasi. Estimasi.",
    scenarioTags: ["school-day", "budget", "sport"],
  },
  {
    id: "sayur-bayam",
    name: "Sayur Bayam (sup/bening, 1 porsi)",
    price: 3000,
    calories: 25,
    proteinG: 2.5,
    carbsG: 3.5,
    fatG: 0.3,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di warung nasi. Kaya zat besi dan kalsium. Estimasi.",
    scenarioTags: ["school-day", "budget", "exam-week"],
  },
  {
    id: "capcay",
    name: "Capcay (tumis sayur campur)",
    price: 5000,
    calories: 60,
    proteinG: 3.5,
    carbsG: 8,
    fatG: 2.5,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di kantin/warteg. Lebih beragam nutrisi. Estimasi.",
    scenarioTags: ["school-day", "exam-week"],
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
    availabilityNote: "Tersedia di warung nasi Sunda/Jawa. Harga estimasi.",
    scenarioTags: ["budget", "school-day"],
  },
  {
    id: "gado-gado",
    name: "Gado-gado (porsi sedang)",
    price: 12000,
    calories: 280,
    proteinG: 10,
    carbsG: 28,
    fatG: 14,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di kantin/warung. Tinggi serat, protein dari bumbu kacang. Estimasi.",
    scenarioTags: ["school-day", "exam-week", "vegetarian"],
  },
  {
    id: "pecel",
    name: "Pecel (sayuran + bumbu kacang)",
    price: 10000,
    calories: 220,
    proteinG: 8,
    carbsG: 22,
    fatG: 11,
    foodGroup: "vegetable",
    availabilityNote: "Tersedia di kantin Jawa/warung. Kaya serat dan nabati. Estimasi.",
    scenarioTags: ["school-day", "budget", "vegetarian"],
  },
  // ── Buah ────────────────────────────────────────────────────────
  {
    id: "pisang",
    name: "Pisang (1 buah sedang ~100g)",
    price: 2000,
    calories: 89,
    proteinG: 1.1,
    carbsG: 23,
    fatG: 0.3,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di pedagang kaki lima/kantin. Harga bervariasi. Estimasi DKBM.",
    scenarioTags: ["sport", "school-day", "budget", "exam-week"],
  },
  {
    id: "pepaya",
    name: "Pepaya (1 potong ~150g)",
    price: 3000,
    calories: 55,
    proteinG: 0.6,
    carbsG: 14,
    fatG: 0.1,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di warung/pasar. Kaya vitamin C dan serat. Estimasi.",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "jeruk",
    name: "Jeruk (1 buah sedang)",
    price: 3000,
    calories: 45,
    proteinG: 0.9,
    carbsG: 11,
    fatG: 0.1,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di minimarket/kantin. Sumber vitamin C baik. Estimasi.",
    scenarioTags: ["school-day", "exam-week"],
  },
  {
    id: "semangka",
    name: "Semangka (2 potong ~200g)",
    price: 4000,
    calories: 60,
    proteinG: 1.2,
    carbsG: 15,
    fatG: 0.2,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di pedagang kaki lima. Tinggi air, membantu hidrasi. Estimasi.",
    scenarioTags: ["school-day", "sport"],
  },
  {
    id: "salad-buah",
    name: "Salad Buah (cup kantin)",
    price: 7000,
    calories: 120,
    proteinG: 1,
    carbsG: 28,
    fatG: 0.5,
    foodGroup: "fruit",
    availabilityNote: "Tersedia di kantin swalayan. Estimasi tanpa saus tambahan.",
    scenarioTags: ["school-day", "sport"],
  },
  // ── Minuman ─────────────────────────────────────────────────────
  {
    id: "air-putih",
    name: "Air Putih (600ml)",
    price: 3000,
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Tersedia di mana saja. Minuman terbaik. Tanpa gula.",
    scenarioTags: ["school-day", "exam-week", "sport", "budget"],
  },
  {
    id: "susu-uht",
    name: "Susu UHT Plain (200ml)",
    price: 5000,
    calories: 120,
    proteinG: 6,
    carbsG: 14,
    fatG: 5,
    foodGroup: "dairy",
    availabilityNote: "Tersedia di minimarket/kantin. Pilih yang plain/tanpa rasa untuk lebih sehat.",
    scenarioTags: ["school-day", "exam-week", "sport"],
  },
  {
    id: "teh-tawar",
    name: "Teh Tawar (gelas)",
    price: 1000,
    calories: 2,
    proteinG: 0,
    carbsG: 0.5,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Umum tersedia di kantin. Tanpa gula tambahan. Estimasi.",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "teh-manis",
    name: "Teh Manis (gelas, ~2 sdt gula)",
    price: 2000,
    calories: 80,
    proteinG: 0,
    carbsG: 20,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Umum tersedia di kantin. Mengandung ~20g gula (perlu dibatasi).",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "minuman-energi",
    name: "Minuman Energi (kaleng 250ml)",
    price: 10000,
    calories: 110,
    proteinG: 0,
    carbsG: 28,
    fatG: 0,
    foodGroup: "beverage",
    availabilityNote: "Tersedia di minimarket. Tinggi kafein dan gula, bukan untuk pelajar sehari-hari.",
    scenarioTags: ["sport", "exam-week"],
  },
  // ── Makanan kantin populer ──────────────────────────────────────
  {
    id: "soto-ayam",
    name: "Soto Ayam (mangkok sedang)",
    price: 10000,
    calories: 180,
    proteinG: 14,
    carbsG: 15,
    fatG: 6,
    foodGroup: "protein",
    availabilityNote: "Tersedia di kantin/warung. Estimasi tanpa nasi. Kuah bening lebih rendah lemak.",
    scenarioTags: ["school-day", "exam-week"],
  },
  {
    id: "siomay",
    name: "Siomay (5 biji porsi kecil)",
    price: 8000,
    calories: 220,
    proteinG: 11,
    carbsG: 22,
    fatG: 10,
    foodGroup: "protein",
    availabilityNote: "Tersedia di kantin/pedagang kaki lima. Estimasi dengan bumbu kacang.",
    scenarioTags: ["school-day", "budget"],
  },
  {
    id: "batagor",
    name: "Batagor (porsi sedang)",
    price: 8000,
    calories: 250,
    proteinG: 10,
    carbsG: 25,
    fatG: 12,
    foodGroup: "snack",
    availabilityNote: "Tersedia di kantin/pedagang kaki lima. Estimasi dengan bumbu kacang.",
    scenarioTags: ["school-day", "budget"],
  },
  // ── Camilan ─────────────────────────────────────────────────────
  {
    id: "keripik-singkong",
    name: "Keripik Singkong (bungkus kecil ~30g)",
    price: 3000,
    calories: 150,
    proteinG: 1,
    carbsG: 20,
    fatG: 8,
    foodGroup: "snack",
    availabilityNote: "Tersedia di minimarket/kantin. Estimasi per 30g.",
    scenarioTags: ["budget", "school-day"],
  },
  {
    id: "kacang-rebus",
    name: "Kacang Tanah Rebus (1 bungkus ~50g)",
    price: 3000,
    calories: 285,
    proteinG: 13,
    carbsG: 9,
    fatG: 22,
    foodGroup: "snack",
    availabilityNote: "Tersedia di pedagang kaki lima. Kaya protein dan lemak sehat. Estimasi.",
    scenarioTags: ["sport", "budget", "exam-week"],
  },
  {
    id: "kacang-hijau-bubur",
    name: "Bubur Kacang Hijau (mangkok kecil)",
    price: 5000,
    calories: 200,
    proteinG: 8,
    carbsG: 35,
    fatG: 2,
    foodGroup: "snack",
    availabilityNote: "Tersedia di kantin/warung. Kaya protein nabati dan serat. Estimasi.",
    scenarioTags: ["school-day", "budget", "exam-week"],
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

// ── Search utility ────────────────────────────────────────────────────────────

/**
 * Cari makanan berdasarkan kata kunci nama, kelompok, atau tag.
 * Digunakan oleh Food Challenge dan Knowledge Base.
 */
export function searchFoodOptions(query: string): FoodOption[] {
  if (!query.trim()) return FOOD_OPTIONS;
  const q = query.toLowerCase();
  return FOOD_OPTIONS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.foodGroup.toLowerCase().includes(q) ||
      f.availabilityNote.toLowerCase().includes(q) ||
      f.scenarioTags.some((t) => t.toLowerCase().includes(q))
  );
}

/**
 * Peta ID makanan → ID artikel Knowledge Base yang relevan.
 * Digunakan untuk membuat tautan kontekstual dari Food Challenge ke artikel.
 */
export const FOOD_KB_LINKS: Record<string, string[]> = {
  "nasi-putih":      ["nutrition-basics", "glycemic-index"],
  "nasi-goreng":     ["nutrition-basics", "food-choices"],
  "nasi-uduk":       ["nutrition-basics", "food-choices"],
  "lontong":         ["nutrition-basics"],
  "roti-tawar":      ["nutrition-basics", "glycemic-index"],
  "kentang-rebus":   ["nutrition-basics", "glycemic-index"],
  "mie-goreng-instan": ["food-labels", "food-choices"],
  "mie-rebus":       ["food-labels", "food-choices"],
  "jagung-rebus":    ["nutrition-basics"],
  "ubi-rebus":       ["nutrition-basics", "glycemic-index"],
  "telur-ceplok":    ["nutrition-basics"],
  "telur-rebus":     ["nutrition-basics", "student-meals"],
  "tempe-goreng":    ["nutrition-basics", "student-meals"],
  "tempe-bacem":     ["nutrition-basics"],
  "ayam-goreng":     ["nutrition-basics"],
  "ayam-bakar":      ["nutrition-basics"],
  "tahu-goreng":     ["nutrition-basics", "student-meals"],
  "ikan-goreng":     ["nutrition-basics"],
  "bakso-sapi":      ["food-labels"],
  "sayur-kangkung":  ["nutrition-basics"],
  "sayur-bayam":     ["nutrition-basics"],
  "capcay":          ["nutrition-basics", "food-choices"],
  "lalapan":         ["nutrition-basics"],
  "gado-gado":       ["nutrition-basics", "student-meals", "food-choices"],
  "pecel":           ["nutrition-basics", "food-choices"],
  "pisang":          ["nutrition-basics", "hydration"],
  "pepaya":          ["nutrition-basics"],
  "jeruk":           ["nutrition-basics", "hydration"],
  "semangka":        ["hydration"],
  "salad-buah":      ["nutrition-basics"],
  "air-putih":       ["hydration"],
  "susu-uht":        ["nutrition-basics", "hydration"],
  "teh-tawar":       ["hydration"],
  "teh-manis":       ["hydration", "food-labels"],
  "minuman-energi":  ["hydration", "food-labels"],
  "soto-ayam":       ["nutrition-basics", "food-choices"],
  "siomay":          ["nutrition-basics"],
  "batagor":         ["food-choices"],
  "keripik-singkong": ["food-labels"],
  "kacang-rebus":    ["nutrition-basics"],
  "kacang-hijau-bubur": ["nutrition-basics", "glycemic-index"],
};
