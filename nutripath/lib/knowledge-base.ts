// NutriPath Knowledge Base
// Structured nutrition knowledge for RAG retrieval
// Each entry has: id, category, title, content, tags, source

export type KBCategory =
  | "basic_nutrition"
  | "hydration"
  | "food_choices"
  | "student_context"
  | "food_label"
  | "nutrition_education";

export interface KBEntry {
  id: string;
  category: KBCategory;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

export const knowledgeBase: KBEntry[] = [
  // ─────────────────────────────────────────────
  // A. BASIC NUTRITION
  // ─────────────────────────────────────────────
  {
    id: "bn-001",
    category: "basic_nutrition",
    title: "Carbohydrates: The Body's Primary Energy Source",
    content:
      "Carbohydrates are the main energy source for the body and brain. They are broken down into glucose, which fuels physical activity and cognitive function. Complex carbohydrates (found in rice, bread, potatoes, corn) provide sustained energy with slower digestion, while simple carbohydrates (sugar, white bread) provide quick but short-lived energy. Students who skip carbohydrates may experience fatigue, poor concentration, and reduced academic performance. Recommended intake: carbohydrates should make up 45–65% of daily caloric intake.",
    tags: ["carbohydrate", "energy", "rice", "glucose", "complex carb", "simple carb", "concentration", "student energy"],
    source: "WHO Nutrition Guidelines 2023 & Indonesian Ministry of Health (Kemenkes RI) Dietary Reference",
  },
  {
    id: "bn-002",
    category: "basic_nutrition",
    title: "Protein: Building and Repairing the Body",
    content:
      "Protein is essential for building muscle, repairing tissues, producing enzymes and hormones, and supporting the immune system. Complete proteins (eggs, chicken, fish, tofu, tempeh) contain all essential amino acids. Students need adequate protein for growth, especially during adolescence. A serving of chicken (100g) provides approximately 27g protein; one egg provides about 6g protein; tempeh (100g) provides about 19g protein. Protein also helps with satiety — it keeps you full longer compared to carbohydrates alone.",
    tags: ["protein", "chicken", "egg", "tofu", "tempeh", "muscle", "growth", "satiety", "amino acid"],
    source: "FAO/WHO Protein and Amino Acid Requirements in Human Nutrition (2007)",
  },
  {
    id: "bn-003",
    category: "basic_nutrition",
    title: "Fats: Essential Nutrients, Not the Enemy",
    content:
      "Dietary fat is essential for absorbing fat-soluble vitamins (A, D, E, K), brain development, hormone production, and long-term energy. Healthy unsaturated fats are found in avocado, nuts, seeds, and cooking oils like olive oil. Saturated fats (coconut oil, animal fat) should be limited. Trans fats (found in fried snacks, margarine, ultra-processed food) should be avoided. Fat should make up 20–35% of daily caloric intake. Avoiding all fat is harmful — the goal is choosing the right types of fat.",
    tags: ["fat", "healthy fat", "unsaturated", "saturated", "trans fat", "fried food", "vitamin absorption", "brain"],
    source: "WHO Fats and Fatty Acids in Human Nutrition (2010)",
  },
  {
    id: "bn-004",
    category: "basic_nutrition",
    title: "Dietary Fiber: Gut Health and Satiety",
    content:
      "Dietary fiber supports digestive health, regulates blood sugar, lowers cholesterol, and promotes satiety. Soluble fiber (oats, beans, fruits) slows digestion and stabilizes blood sugar. Insoluble fiber (vegetables, whole grains) supports bowel regularity. Recommended daily intake: 25–30g for adolescents. Vegetables, fruits, and legumes are excellent fiber sources. Students who consume enough fiber tend to feel full longer and have more stable energy throughout the school day.",
    tags: ["fiber", "vegetable", "fruit", "digestive health", "satiety", "blood sugar", "gut health", "beans"],
    source: "EFSA Dietary Reference Values for Dietary Fibre (2017)",
  },
  {
    id: "bn-005",
    category: "basic_nutrition",
    title: "Vitamins and Minerals: Micronutrients for Optimal Function",
    content:
      "Vitamins and minerals support immune function, bone health, nerve function, and energy metabolism. Key micronutrients for students: Iron (red meat, spinach, tempeh) prevents anemia and supports cognitive function. Calcium (milk, tofu, green vegetables) builds strong bones. Vitamin C (fruits, tomatoes) enhances iron absorption and immunity. Vitamin A (carrots, eggs, sweet potatoes) supports vision and immunity. Zinc (meat, legumes, seeds) supports growth and immune defense. Eating a variety of colorful foods is the best way to obtain adequate micronutrients.",
    tags: ["vitamins", "minerals", "iron", "calcium", "vitamin C", "vitamin A", "zinc", "immunity", "bone health", "anemia"],
    source: "Indonesian Ministry of Health Recommended Dietary Allowance (AKG 2019)",
  },
  {
    id: "bn-006",
    category: "basic_nutrition",
    title: "Balanced Meals: The Plate Composition Guide",
    content:
      "A balanced meal should contain: ½ plate of vegetables and fruits (varied colors for micronutrients), ¼ plate of complex carbohydrates (rice, potato, corn, whole grain bread), ¼ plate of protein (eggs, chicken, fish, tofu, tempeh, legumes). Add a small amount of healthy fat and limit added sugar and salt. For Indonesian students, a balanced meal can be: 1 cup rice + 1 piece of protein (tofu/tempeh/egg/chicken) + 1 serving of vegetables. This provides carbohydrates for energy, protein for growth, fiber and micronutrients from vegetables.",
    tags: ["balanced meal", "plate method", "rice", "vegetable", "protein", "meal planning", "portion"],
    source: "Kemenkes RI Pedoman Gizi Seimbang (2014) & Indonesian Balanced Nutrition Guidelines",
  },

  // ─────────────────────────────────────────────
  // B. HYDRATION
  // ─────────────────────────────────────────────
  {
    id: "hy-001",
    category: "hydration",
    title: "Daily Water Needs for Students",
    content:
      "Adolescents and students need approximately 1.5–2.5 liters (6–10 glasses) of water per day, depending on activity level, climate, and body size. Even mild dehydration (1–2% body weight) can impair concentration, memory, and mood. Students in tropical climates like Indonesia should drink more, especially during physical activity. Plain water is the best choice. Signs of adequate hydration: pale yellow urine, no frequent headaches, good energy levels.",
    tags: ["water", "hydration", "dehydration", "concentration", "glasses", "daily water", "student hydration"],
    source: "European Food Safety Authority (EFSA) Adequate Water Intake Reference (2010)",
  },
  {
    id: "hy-002",
    category: "hydration",
    title: "Beverages to Choose and Limit at School",
    content:
      "Best beverage choices for students: plain water, plain milk, unsweetened herbal tea. Beverages to limit: sugary drinks (bottled tea, soda, energy drinks, sweetened juice) — one can of soda contains 30–40g of sugar, far exceeding recommended added sugar limits. Sweet beverages cause quick blood sugar spikes followed by crashes, leading to fatigue and reduced focus in class. If budget is limited, plain water is always the best choice. Bringing a reusable water bottle to school is a practical and affordable hydration strategy.",
    tags: ["beverages", "soda", "sugary drink", "energy drink", "milk", "water", "school", "sugar", "blood sugar"],
    source: "WHO Guideline: Sugars Intake for Adults and Children (2015)",
  },
  {
    id: "hy-003",
    category: "hydration",
    title: "Signs of Dehydration and How to Stay Hydrated",
    content:
      "Signs of dehydration include: dark yellow urine, headache, dry mouth, dizziness, fatigue, difficulty concentrating. Students often become dehydrated during school because they forget to drink or don't have access to water. Strategies: drink a glass of water before school, carry a water bottle, drink during breaks, eat water-rich foods (watermelon, cucumber, tomato). Thirst is a late signal — don't wait until you're thirsty to drink.",
    tags: ["dehydration", "signs", "headache", "fatigue", "water bottle", "school", "hydration tips", "urine"],
    source: "Mayo Clinic Dehydration Symptoms & Prevention Guidelines",
  },

  // ─────────────────────────────────────────────
  // C. FOOD CHOICES
  // ─────────────────────────────────────────────
  {
    id: "fc-001",
    category: "food_choices",
    title: "Understanding Food Groups",
    content:
      "Foods are grouped into: (1) Grains and starches — rice, bread, noodles, corn, potato — primary energy sources. (2) Proteins — eggs, chicken, fish, tofu, tempeh, legumes — for growth and repair. (3) Vegetables — all types, especially colorful ones — for vitamins, minerals, fiber. (4) Fruits — for vitamins, fiber, and natural sugars. (5) Dairy or calcium-rich foods — milk, cheese, yogurt, tofu — for bone health. (6) Fats and oils — cooking oil, avocado, nuts — for energy and nutrient absorption. A meal that includes 3–4 of these groups is considered nutritionally diverse.",
    tags: ["food groups", "grains", "protein", "vegetables", "fruits", "dairy", "fats", "meal diversity"],
    source: "Indonesian 'Tumpeng Gizi Seimbang' (Balanced Nutrition Pyramid) 2014",
  },
  {
    id: "fc-002",
    category: "food_choices",
    title: "Comparing Common Student Food Choices",
    content:
      "Nasi + telur + sayur (Rice + Egg + Vegetables): Balanced meal. Provides carbs, protein, fiber, and micronutrients. Affordable (~Rp8,000–12,000). Recommended as baseline lunch. | Mie instan (Instant noodle): High in sodium (>1000mg per pack), low in protein, low in fiber. If eaten, add an egg and vegetables to improve nutritional value. | Gorengan (Fried snacks): High in trans fat and calories, low in nutrients. Not a meal replacement, but occasional consumption is acceptable. | Nasi + ayam goreng (Rice + Fried Chicken): Good protein and carbs but high in fat. Balance by adding vegetables. | Roti + selai (Bread + Jam): Simple carbs, low in protein. Add a boiled egg or peanut butter for better balance.",
    tags: ["nasi telur", "instant noodle", "mie instan", "gorengan", "fried chicken", "comparison", "school food", "roti"],
    source: "USDA Food Composition Data & Nutrisurvey Indonesia Database",
  },
  {
    id: "fc-003",
    category: "food_choices",
    title: "Meal Composition Principles",
    content:
      "Good meal composition follows the principle: energy + protein + color. Energy comes from carbohydrates (rice, bread, noodles). Protein comes from eggs, tofu, tempeh, chicken, fish. Color comes from vegetables and fruits, providing vitamins and minerals. A practical test: does the meal have more than one color? A plate of only rice and a single fried food is typically nutritionally incomplete. Adding even one vegetable portion (spinach soup, gado-gado, or raw cucumber) significantly improves nutritional quality.",
    tags: ["meal composition", "energy", "protein", "color", "vegetables", "nutritional balance", "gado-gado"],
    source: "Kemenkes RI Pedoman Gizi Seimbang & Harvard Healthy Eating Plate",
  },

  // ─────────────────────────────────────────────
  // D. STUDENT CONTEXT
  // ─────────────────────────────────────────────
  {
    id: "sc-001",
    category: "student_context",
    title: "Affordable Nutritious Meals for Students",
    content:
      "Budget-conscious nutritious meals in Indonesia: Nasi + telur rebus + tempe goreng + sayur (Rp8,000–15,000): Excellent balance of carbs, protein, and fiber. Nasi + tahu goreng + lalapan (Rp7,000–12,000): Affordable plant-based protein with vegetables. Bubur ayam (Rp8,000–15,000): Rice porridge with chicken, egg, and toppings — good for easy digestion. Gado-gado (Rp10,000–18,000): Vegetables with peanut sauce — high fiber, moderate protein. Nasi uduk + tempe (Rp8,000–14,000): Decent carb and protein combination. Most important: avoid skipping meals to save money. Skipping meals impairs concentration and academic performance.",
    tags: ["affordable", "budget", "student meal", "nasi telur", "tempe", "tahu", "gado-gado", "bubur", "Indonesia", "cheap", "murah"],
    source: "Indonesian Nutritionists Association (PERSAGI) Student Nutrition Guidelines",
  },
  {
    id: "sc-002",
    category: "student_context",
    title: "School Cafeteria and Canteen Food Choices",
    content:
      "School canteens typically offer: rice-based meals, fried snacks, noodles, beverages. Strategy for choosing well at a school canteen: (1) Choose a meal with rice/carbs + a protein source + at least one vegetable. (2) Opt for boiled/steamed/grilled proteins over heavily fried options when available. (3) Choose water or plain milk over sugary drinks. (4) Avoid buying only snacks as a meal replacement. If the canteen options are limited, prioritize protein and carbs over snacks. A balanced meal supports focus for afternoon classes.",
    tags: ["canteen", "kantin", "school cafeteria", "school food", "choices", "strategy", "snack", "beverages"],
    source: "Kemenkes RI Panduan Gizi di Sekolah (School Nutrition Guidelines)",
  },
  {
    id: "sc-003",
    category: "student_context",
    title: "Meal Timing and School Schedule",
    content:
      "Breakfast is critical for students. Skipping breakfast is associated with lower concentration, worse memory, and reduced academic performance in the morning. A light breakfast (bread + egg, or rice + side dish) is better than skipping. Lunch should be eaten during school break — delayed lunch leads to blood sugar drops and fatigue. An afternoon snack (fruit, biscuit with milk, or a small balanced snack) is appropriate if dinner is late. Irregular meal timing, common in students with busy schedules, can contribute to overeating and poor food choices later.",
    tags: ["breakfast", "meal timing", "school schedule", "lunch", "snack", "blood sugar", "concentration", "afternoon"],
    source: "Journal of School Health: Breakfast and Academic Performance Meta-Analysis (2019)",
  },
  {
    id: "sc-004",
    category: "student_context",
    title: "Simple Meal Planning for Students",
    content:
      "Simple meal planning principle for students: 3 main meals + 1–2 snacks per day. Breakfast: carbs + protein (e.g., bread + egg, nasi + tempe). Lunch: balanced plate (carbs + protein + vegetable). Afternoon snack: fruit or biscuit with milk. Dinner: similar to lunch composition. Students with limited time or cooking access can use: boiled eggs, ready-to-eat tempeh, instant noodles improved with added egg and vegetables, or purchased meals from canteen/warung. Planning ahead — even knowing what you'll buy the next day — reduces impulsive choices.",
    tags: ["meal planning", "breakfast", "lunch", "dinner", "snack", "student", "simple", "3 meals"],
    source: "FAO School Food and Nutrition Framework (2019)",
  },

  // ─────────────────────────────────────────────
  // E. FOOD LABEL LITERACY
  // ─────────────────────────────────────────────
  {
    id: "fl-001",
    category: "food_label",
    title: "Reading Serving Size on Nutrition Labels",
    content:
      "The serving size on a nutrition label defines the quantity for which all nutrient values are listed. If a label says '1 serving = 30g' and the package contains 90g, all values must be multiplied by 3 to get the total nutritional content of the product. This is a common source of confusion — many students think the label shows totals for the whole product. Always check: (1) the serving size, (2) the number of servings per package. This is particularly important for calorie and sugar awareness in packaged drinks and snacks.",
    tags: ["serving size", "nutrition label", "package", "label reading", "food label", "portion"],
    source: "BPOM RI Peraturan Label Pangan (Indonesian Food and Drug Authority Label Regulation)",
  },
  {
    id: "fl-002",
    category: "food_label",
    title: "Understanding Calories on Food Labels",
    content:
      "Calories (kalori / kkal) measure the energy provided by food. Average adolescent caloric needs: 2,000–2,600 kcal per day, depending on age, sex, and activity level. One meal should provide roughly 500–700 kcal. A single packaged snack providing 400 kcal is significant in the context of daily intake. Using calorie information: if choosing between two similar snacks, the lower-calorie option with more protein and fiber is generally preferable. Calories alone don't tell the whole story — the source of calories (protein vs. sugar) also matters.",
    tags: ["calories", "kcal", "energy", "food label", "daily intake", "snack", "caloric needs", "adolescent"],
    source: "BPOM RI Label Pangan & AKG (Angka Kecukupan Gizi) 2019",
  },
  {
    id: "fl-003",
    category: "food_label",
    title: "Sugar Content: What Labels Tell You",
    content:
      "Added sugar is listed under 'total sugars' or 'gula' on Indonesian food labels. WHO recommends less than 10% of daily energy from added sugars — approximately 50g/day for an average adult. For context: one can of soda contains ~35–40g sugar; one sachet of sweetened instant coffee contains ~15–20g; one packaged sweet beverage can contain 25–30g. Students who frequently consume sweetened drinks and snacks may easily exceed this limit. High sugar intake is associated with energy crashes, dental health issues, and over time, metabolic risk factors.",
    tags: ["sugar", "gula", "food label", "added sugar", "soda", "sweet drink", "WHO limit", "snack"],
    source: "WHO Guideline Sugars Intake (2015) & BPOM RI",
  },
  {
    id: "fl-004",
    category: "food_label",
    title: "Sodium on Food Labels",
    content:
      "Sodium (natrium / garam) is essential but excess sodium contributes to high blood pressure over time. The WHO recommended limit is under 2,000mg sodium per day (equivalent to about 5g of salt). One pack of instant noodles contains approximately 1,000–1,500mg sodium — already 50–75% of the daily limit in one meal. High-sodium foods include: instant noodles, chips/crisps, canned food, fast food, soy sauce. Students who eat instant noodles frequently should balance with low-sodium meals and adequate water intake.",
    tags: ["sodium", "natrium", "salt", "food label", "instant noodle", "mie instan", "blood pressure", "WHO limit"],
    source: "WHO Global Action Plan for NCDs & BPOM RI Labeling Regulation",
  },
  {
    id: "fl-005",
    category: "food_label",
    title: "Protein and Fiber on Food Labels",
    content:
      "Protein and fiber content on labels help identify more filling and nutritious products. A good packaged meal or snack should have: at least 5g protein per serving (keeps you fuller longer), at least 2–3g fiber per serving (supports gut health and satiety). Low-protein + low-fiber products (e.g., most chips, sweet wafers, plain crackers) provide mostly empty calories. When comparing two snack products, choose the one with higher protein and fiber per serving for better nutritional value.",
    tags: ["protein", "fiber", "food label", "snack", "comparison", "satiety", "nutritional value", "packaged food"],
    source: "USDA Food Composition & EFSA Dietary Reference Values",
  },

  // ─────────────────────────────────────────────
  // F. NUTRITION EDUCATION
  // ─────────────────────────────────────────────
  {
    id: "ne-001",
    category: "nutrition_education",
    title: "What is a Nutrient? Key Definitions",
    content:
      "Nutrients are substances in food that the body uses for energy, growth, and vital functions. There are six classes: (1) Carbohydrates — energy. (2) Proteins — structure and function. (3) Fats — energy storage, cell structure. (4) Vitamins — regulatory functions. (5) Minerals — structural and regulatory. (6) Water — transport and temperature regulation. Macronutrients (carbs, proteins, fats) are needed in larger quantities. Micronutrients (vitamins, minerals) are needed in smaller amounts but are equally essential. Deficiency in any nutrient can impair body function.",
    tags: ["nutrient", "definition", "macronutrient", "micronutrient", "carbohydrate", "protein", "fat", "vitamin", "mineral", "water"],
    source: "FAO Introduction to Human Nutrition (2nd Ed.) & Kemenkes RI",
  },
  {
    id: "ne-002",
    category: "nutrition_education",
    title: "Glycemic Index: How Foods Affect Blood Sugar",
    content:
      "The Glycemic Index (GI) measures how quickly a food raises blood sugar. High-GI foods (white rice, white bread, sugary drinks) cause rapid blood sugar spikes followed by crashes — leading to fatigue and hunger. Low-GI foods (oats, sweet potato, legumes, most vegetables) raise blood sugar gradually, providing sustained energy. For students: eating low-to-medium GI foods at breakfast and lunch helps maintain concentration and energy throughout the school day. Combining high-GI food with protein and fat also slows absorption and moderates the blood sugar response.",
    tags: ["glycemic index", "GI", "blood sugar", "energy", "white rice", "oats", "concentration", "sustained energy"],
    source: "Harvard T.H. Chan School of Public Health — Glycemic Index & Glycemic Load",
  },
  {
    id: "ne-003",
    category: "nutrition_education",
    title: "Indonesian Common Foods: Nutritional Overview",
    content:
      "Common Indonesian foods and their key nutritional highlights: Nasi putih (white rice, 100g cooked): ~130 kcal, 28g carbs, 2.7g protein. Telur ayam (1 large egg): ~70 kcal, 6g protein, 5g fat. Tempe goreng (50g): ~100 kcal, 9.5g protein, 4g fat, good fiber. Tahu (100g): ~76 kcal, 8g protein, 4.8g fat. Ayam goreng (1 piece, ~100g): ~230 kcal, 27g protein, 13g fat. Sayur bayam (100g cooked): ~20 kcal, 2g protein, high iron and vitamin A. Pisang (1 medium banana): ~90 kcal, 23g carbs, 1.1g protein, good potassium. Jeruk (1 orange): ~45 kcal, high vitamin C.",
    tags: ["nasi", "telur", "tempe", "tahu", "ayam", "sayur", "bayam", "pisang", "jeruk", "Indonesian food", "calorie", "nutritional content"],
    source: "DKBM (Daftar Komposisi Bahan Makanan) Indonesia — Nutritional Composition Database",
  },
  {
    id: "ne-004",
    category: "nutrition_education",
    title: "Nutrition Myths and Facts for Students",
    content:
      "Common nutrition myths debunked: MYTH: 'Eating rice makes you fat.' FACT: Rice is a carbohydrate — excess calories from any source cause weight gain, not rice specifically. Portion and balance matter more than eliminating rice. | MYTH: 'Skipping meals helps you lose weight.' FACT: Skipping meals often leads to overeating later and impairs concentration. | MYTH: 'Supplements replace food.' FACT: Whole foods provide thousands of beneficial compounds that supplements cannot replicate. | MYTH: 'Fried food is always bad.' FACT: Cooking method matters, but the type of food and frequency are more important. Occasional fried food in a balanced diet is fine. | MYTH: 'Eating late at night always causes weight gain.' FACT: Total daily calorie balance matters more than exact timing.",
    tags: ["myth", "fact", "rice", "skipping meal", "supplement", "fried food", "weight", "nutrition myth"],
    source: "British Nutrition Foundation Nutrition Myths & Academy of Nutrition and Dietetics",
  },
  {
    id: "ne-005",
    category: "nutrition_education",
    title: "Responsible Nutrition Information: What NutriPath Can and Cannot Tell You",
    content:
      "NutriPath is an educational decision-support tool, not a medical or clinical nutrition service. What NutriPath can help with: understanding general nutrition principles, comparing food choices based on nutritional content, providing context-aware food suggestions based on situation and available options, explaining food labels and nutrition concepts, helping with meal planning ideas. What NutriPath CANNOT do: diagnose nutritional deficiencies or health conditions, prescribe dietary treatment for medical conditions, replace personalized advice from a registered dietitian or doctor, make any clinical determination about your health. If you have medical conditions, food allergies, or specific health concerns, always consult a qualified healthcare professional.",
    tags: ["disclaimer", "responsible AI", "educational", "not medical advice", "dietitian", "doctor", "limitations", "AI ethics"],
    source: "NutriPath System Documentation — Responsible AI Principles",
  },
];

// Category metadata for UI display
export const categoryMeta: Record<KBCategory, { label: string; icon: string; color: string }> = {
  basic_nutrition: { label: "Basic Nutrition", icon: "🥗", color: "green" },
  hydration: { label: "Hydration", icon: "💧", color: "blue" },
  food_choices: { label: "Food Choices", icon: "🍽️", color: "orange" },
  student_context: { label: "Student Context", icon: "🎒", color: "purple" },
  food_label: { label: "Food Label Literacy", icon: "🏷️", color: "yellow" },
  nutrition_education: { label: "Nutrition Education", icon: "📚", color: "teal" },
};
