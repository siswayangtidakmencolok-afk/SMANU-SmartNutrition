"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────────
// Topic metadata — mirrors the grid page topics array
// ─────────────────────────────────────────────────────────────────

interface TopicMeta {
  id: string;
  title: string;
  category: string;
  desc: string;
  tags: string[];
  readTime: string;
  imgUrl: string;
  color: string;           // tailwind accent class (bg colour)
  iconEmoji: string;
}

const TOPICS: TopicMeta[] = [
  {
    id: "nutrition-basics",
    title: "Nutrition Basics",
    category: "Fundamentals",
    desc: "Understand macronutrients (carbohydrates, protein, fats), micronutrients, and how daily energy balance works.",
    tags: ["Macronutrients", "Energy", "Vitamins"],
    readTime: "5 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
    color: "bg-emerald-500",
    iconEmoji: "🥗",
  },
  {
    id: "hydration",
    title: "Hydration",
    category: "Wellness",
    desc: "Learn about daily fluid requirements, the role of electrolytes, and how staying hydrated improves focus and study performance.",
    tags: ["Water", "Electrolytes", "Focus"],
    readTime: "4 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDokmBnYHi2Ic_u0ydRXzupJ05RGD8K803wEpfrftCAq55TemP-8aOlYem89VMfp0meWUt6LvLyDiCqUOvbuBkdg_oo1f_WHcSmWeJR96zS2tnAQbTeGQZXKlgqVBcR6C2KTg5NIyzRKlemEA2rcKqeuLVgkUvtSNbIcWp4BgH_4inZLsWTvou2GJ1deiD0R9Ua3kojuk0BmaYM1ZD_Ge6HK9KehQSbi_iwGN_oT_AB-_Tm4UdgNLG4XQ",
    color: "bg-sky-500",
    iconEmoji: "💧",
  },
  {
    id: "food-choices",
    title: "Food Choices",
    category: "Lifestyle",
    desc: "Build balanced plates using accessible campus cafeteria staples and common dormitory kitchen ingredients.",
    tags: ["Balanced Meals", "Campus Food", "Plate Method"],
    readTime: "6 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Q-3EdSXm0YUU3KJkqJxZeCBYFLp9eB1qnJqCfdxkh2iGmMoPKiYlAJhm9pn3KSCTmz2DaGPcuPbkzHuiuF9U3qc8PqLfAJtpAxyXY7lecDnvoMhwT5yMaUAYO8YxtOs6ok6g7vZeSES0WXR-t_2T4dSndacJ96SjrGUb7wbNzRcoYheVGKJDKmUnkkRX6ao0SjLn7JP_dmH5we8AmY4e0R31Cl7Sm1H07IjN_wsTj2cB65zcyjuuMA",
    color: "bg-orange-500",
    iconEmoji: "🍽️",
  },
  {
    id: "food-labels",
    title: "Reading Food Labels",
    category: "Practical Skills",
    desc: "Decode serving sizes, % Daily Values, hidden sugars, sodium content, and what ingredient lists really mean.",
    tags: ["Food Labels", "Daily Value", "Sugar"],
    readTime: "7 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCa75cS2cUFHSvjEpeUbYIrdzjXFnJ9Rj30VFm_N6pvFUrdtbd625gNfN9-ExuO5DblAE-dTZ6ZPHugg0YMKYbLaqi_ttkTmhg5Hx4HZc1KmXmE7-c1YEOBaAO49Zy_K7zPAnP_L5rwhbkx4vsfvssRSS-TusOOFSp4wujUyVlOcbvDDpNM4S-rGq-DZzhmba4dajYusXG-Z3rIa3gueKXx8qYFXzoV4vbU4VTsYHm66zm7W-X10LGGNQ",
    color: "bg-yellow-500",
    iconEmoji: "🏷️",
  },
  {
    id: "student-meals",
    title: "Student Meals",
    category: "Quick Recipes",
    desc: "Nutritious and practical meal combinations you can prepare using common dormitory supplies and minimal equipment.",
    tags: ["Meal Prep", "Budget Friendly", "Dorm Kitchen"],
    readTime: "5 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjtvvpr25li5JQiJxBFy0Q3GEF-xWEKaIYDI4IYkPLsD83d3_-Cn7irz3rFHnDynC37GKEEWx3_8Z7IvZLlNonPHewZ4pGzeeOFmwN2gr-P8gzdi8siD0ADsS_eNdWJzwnlytSw2_VBQMGOYxy0W6VJO3zKp6bB0ujbZY7_Spd1qwGyPuUms6FRcebMpTxSKWCuB9gzu1Fbk_0iAzpXYOov_skDjSpgRIE7l0vwZU62FtcRvGUfJqBfQ",
    color: "bg-purple-500",
    iconEmoji: "🎒",
  },
  {
    id: "glycemic-index",
    title: "Glycemic Index",
    category: "Fundamentals",
    desc: "Understand how different carbohydrates affect blood sugar and energy levels — important for sustained concentration during long study sessions.",
    tags: ["GI", "Blood Sugar", "Energy"],
    readTime: "5 min read",
    imgUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
    color: "bg-rose-500",
    iconEmoji: "📈",
  },
];

// ─────────────────────────────────────────────────────────────────
// Tab definitions — 6 sections per topic
// ─────────────────────────────────────────────────────────────────

interface Tab {
  id: string;
  label: string;
  icon: string;        // material symbol name
  description: string;
}

const TABS: Tab[] = [
  { id: "overview",  label: "Overview",       icon: "overview",           description: "What this topic is about" },
  { id: "nutrients", label: "Key Nutrients",  icon: "nutrition",          description: "The science behind it" },
  { id: "benefits",  label: "Benefits",       icon: "favorite",           description: "Why it matters for you" },
  { id: "sources",   label: "Food Sources",   icon: "restaurant",         description: "Where to find them" },
  { id: "tips",      label: "Practical Tips", icon: "tips_and_updates",   description: "What you can do today" },
  { id: "summary",   label: "Summary",        icon: "summarize",          description: "Key takeaways" },
];

// ─────────────────────────────────────────────────────────────────
// Static fallback content — used while loading / if API is down
// ─────────────────────────────────────────────────────────────────

const STATIC_CONTENT: Record<string, Record<string, string>> = {
  "nutrition-basics": {
    overview:
      "Nutrition is the foundation of your health, energy, and ability to focus during school. Your body needs a variety of nutrients — macronutrients for energy and structure, and micronutrients for supporting thousands of body processes.\n\nMacronutrients include carbohydrates (your body's primary energy source), proteins (builders and repairers), and fats (energy reserves, brain function, vitamin absorption). Micronutrients include vitamins and minerals that support immunity, bone health, and nerve function.",
    nutrients:
      "**Carbohydrates** — 45–65% of daily calories. Best sources: rice, potatoes, bread, corn. Provide glucose for your brain and muscles.\n\n**Protein** — Needed for growth and repair. 1 egg = ~6g protein; 100g chicken = ~27g protein; 100g tempeh = ~19g protein.\n\n**Fats** — 20–35% of daily calories. Healthy unsaturated fats from avocado, nuts, and fish. Limit saturated and avoid trans fats.\n\n**Fiber** — 25–30g per day from vegetables, fruits, and legumes. Supports digestion and keeps you full longer.\n\n**Vitamins & Minerals** — Iron, Calcium, Vitamin C, Vitamin A, Zinc — all essential. Eat a variety of colorful foods.",
    benefits:
      "A nutritionally balanced diet gives you:\n\n• **Sustained energy** throughout the school day — no mid-afternoon crashes\n• **Better concentration and memory** — your brain runs on glucose and micronutrients\n• **Stronger immunity** — fewer sick days and faster recovery\n• **Healthy growth** — especially important during adolescence\n• **Stable mood** — nutrient deficiencies are linked to irritability and fatigue",
    sources:
      "**For carbohydrates:** Rice, bread, noodles, potatoes, corn — affordable and widely available.\n\n**For protein:** Eggs, tempeh, tofu, chicken, fish, legumes (kacang, kedelai). Tempeh and tofu are excellent, affordable plant proteins.\n\n**For healthy fats:** Avocado, nuts (kacang tanah, almond), seeds, and cooking oils (olive, canola).\n\n**For fiber:** Any vegetable and fruit. Spinach, kangkung, tomato, carrot, banana, papaya.\n\n**For vitamins/minerals:** Colorful vegetables and fruits, eggs, milk, tempeh.",
    tips:
      "• **Every meal: carbs + protein + color** — even a simple meal of rice + egg + one vegetable counts.\n• Carry a water bottle — dehydration impairs nutrient transport.\n• Don't skip breakfast — it fuels your morning classes.\n• Tempeh and tofu are your best-value protein sources as a student.\n• One serving of vegetables at every main meal is the single highest-impact habit.",
    summary:
      "The core of good student nutrition is balance — not perfection. Every meal should have an energy source (carbs), a builder (protein), and micronutrients (vegetables/fruits). You don't need supplements or expensive food — affordable Indonesian staples like nasi + telur + sayur already provide excellent nutrition. Start with one improvement at a time.",
  },
  hydration: {
    overview:
      "Water is your body's most essential nutrient. Every cell, tissue, and organ depends on water to function properly. For students, proper hydration directly affects your ability to concentrate, memorize information, and perform academically.\n\nEven mild dehydration — losing just 1–2% of your body weight in water — can impair short-term memory, attention, and reaction time. This means a student who isn't drinking enough water is already working at reduced cognitive capacity.",
    nutrients:
      "**Water** — 1.5–2.5 liters per day (6–10 glasses) depending on activity and climate.\n\n**Electrolytes** — Minerals like sodium, potassium, magnesium, and chloride dissolved in body fluids. They regulate nerve signals and muscle function.\n\n**Sodium** — Needed for water balance but most students get more than enough from food. The concern is excess, not deficiency.\n\n**Potassium** — Found in bananas, oranges, and potatoes. Helps regulate fluid balance inside cells.",
    benefits:
      "Proper hydration helps you:\n\n• **Focus and retain information** — even 2% dehydration impairs cognitive performance\n• **Prevent headaches** — dehydration headache is one of the most common student complaints\n• **Maintain energy** — fatigue is often caused by insufficient water, not sleep alone\n• **Support digestion** — water is essential for processing every meal you eat\n• **Regulate body temperature** — critical in Indonesia's tropical climate during outdoor activities",
    sources:
      "**Best choices:**\n• Plain water — always the best and most affordable option\n• Plain milk — provides water + calcium + protein\n• Unsweetened herbal tea — water with minimal added benefit\n\n**Limit or avoid:**\n• Sugary bottled beverages (minuman manis) — spike then crash your blood sugar\n• Soda — 1 can = 35–40g sugar, phosphoric acid harmful for calcium absorption\n• Energy drinks — high caffeine + sugar, not appropriate for students\n• Sweetened instant coffee sachets — 15–20g sugar each",
    tips:
      "• Drink 1 glass of water before leaving home in the morning.\n• Carry a reusable water bottle to school — it's your best daily hydration tool.\n• Drink during every break, not just when thirsty — thirst is a late signal.\n• Check your urine color: pale yellow = good; dark yellow = drink more.\n• Water-rich foods (watermelon, cucumber, tomatoes) contribute to daily intake.",
    summary:
      "Hydration is simple but often overlooked. As a student, your target is 6–10 glasses of water per day. Plain water is always the best choice. The single most impactful habit: carry a water bottle to school every day. Avoid sugary drinks — they cause energy crashes that affect your afternoon study performance.",
  },
  "food-choices": {
    overview:
      "Every meal is an opportunity to fuel your body and brain for the next few hours. The challenge for students is making good choices within real constraints: limited budget, limited options at the canteen, and limited time.\n\nThe plate method is your simplest guide: ½ plate vegetables/fruits, ¼ plate carbohydrates, ¼ plate protein. You don't need to follow this exactly — but this mental model helps you assess whether a meal is balanced.",
    nutrients:
      "When choosing food, prioritize these nutrients:\n\n**Protein** — Keeps you full, supports concentration. Always include a protein source: egg, chicken, tofu, tempeh.\n\n**Fiber** — Slows digestion, stabilizes blood sugar. At least one vegetable serving per meal.\n\n**Complex carbohydrates** — Sustained energy. Rice and bread are fine; avoid meals that are only simple carbs.\n\n**Iron** — Prevents fatigue and anemia. Common in Indonesian students, especially girls. Get it from tempeh, spinach, and red meat.",
    benefits:
      "Smart food choices give you:\n\n• **Longer-lasting energy** — balanced meals prevent energy crashes between classes\n• **Better food value for money** — nutrient-dense affordable foods beat expensive snacks\n• **Reduced risk of afternoon fatigue** — protein + fiber at lunch keeps you going until evening\n• **Healthier body weight** — understanding food composition helps prevent overeating processed snacks",
    sources:
      "**Best canteen/warung choices (affordable + nutritious):**\n\n• Nasi + telur rebus + sayur: ~Rp 8,000–12,000. Excellent protein, carbs, fiber.\n• Nasi + tahu/tempe + lalapan: ~Rp 7,000–12,000. Great plant-based option.\n• Gado-gado: ~Rp 10,000–18,000. High fiber, moderate protein.\n• Bubur ayam: ~Rp 8,000–15,000. Good for easy digestion.\n\n**Foods to limit:** Instant noodles alone (high sodium, low protein/fiber), gorengan only as meal (trans fat, low nutrition).",
    tips:
      "• Use the **3-check rule** before buying: (1) Does it have protein? (2) Does it have a vegetable or fruit? (3) Is it affordable today?\n• At a canteen with limited options, add an egg to anything to improve protein.\n• Don't make snacks your main meal — they don't have enough nutrients for sustained energy.\n• Bring fruit from home as an afternoon snack — cheap, portable, nutritious.",
    summary:
      "You don't need perfect meals — you need consistently better ones. Apply the simple rule: every meal should have protein + carbs + at least one vegetable. For Indonesian students, nasi + telur + sayur is a near-perfect student meal that costs under Rp 15,000. Start there and build from it.",
  },
  "food-labels": {
    overview:
      "Nutrition labels are one of the most powerful tools for making informed food choices — but most people never learn to read them properly. A label tells you exactly what's in the food before you eat it.\n\nIn Indonesia, food labels are regulated by BPOM RI and must show: serving size, calories, fat, sodium, carbohydrates, sugar, and protein per serving. The key insight: all numbers refer to the serving size listed, not the whole package.",
    nutrients:
      "**Serving Size** — Everything else on the label is measured per serving. If you eat the whole bag (multiple servings), multiply all numbers.\n\n**Calories (kkal)** — Energy per serving. One meal should be ~500–700 kcal. If a snack has 400 kcal, it's a significant portion of your day.\n\n**Sugar (Gula)** — WHO recommends <10% of daily energy from added sugar (~50g/day max). 1 can of soda = 35–40g.\n\n**Sodium (Natrium)** — <2,000mg per day (WHO). 1 pack instant noodles = 1,000–1,500mg (50–75% of daily limit).\n\n**Protein** — Look for at least 5g per serving for a meaningful protein contribution.\n\n**Fiber** — At least 2–3g per serving is a good target for packaged foods.",
    benefits:
      "Learning to read labels helps you:\n\n• **Compare products** — choose the better snack in seconds\n• **Understand what you're eating** — no more guessing about sugar or sodium content\n• **Make smarter budget decisions** — higher-protein foods often give better satiety per rupiah\n• **Spot misleading marketing** — \"low fat\" might still be high in sugar\n• **Control your sodium intake** — especially important for students eating lots of instant noodles",
    sources:
      "**Where to practice reading labels:**\n• Any packaged snack (keripik, biskuit, wafer)\n• Instant noodles — always read the sodium content\n• Bottled beverages — check sugar content per bottle, not per serving\n• Packaged milk and dairy products — compare protein and calcium\n• Canned goods — check sodium\n\nAsk yourself when reading: How many servings? What's the sugar? What's the sodium? Is there any protein or fiber?",
    tips:
      "• **Step 1:** Find serving size first — it unlocks all other numbers.\n• **Step 2:** Check if sugar exceeds 10g per serving (moderate) or 20g (high).\n• **Step 3:** Check sodium — anything above 600mg per serving is high.\n• **Step 4:** Look for protein and fiber — low in both? It's mostly empty calories.\n• **Tip:** When comparing two products, choose the one with more protein + more fiber + less sugar + less sodium.",
    summary:
      "Four numbers to always check on any food label: (1) Serving size, (2) Sugar, (3) Sodium, (4) Protein. High sugar + high sodium + low protein = low nutritional value. A good snack has moderate calories, meaningful protein (5g+), some fiber (2g+), and limited sugar and sodium. This habit takes 30 seconds and pays off every time you shop.",
  },
  "student-meals": {
    overview:
      "As a student, your meal environment is shaped by real constraints: limited money, limited time, canteen options, and sometimes no cooking facilities. The goal of student meal planning is not perfection — it's maximizing nutritional quality within those real constraints.\n\nThe key principle: never skip a main meal to save money. Skipping meals causes blood sugar drops, impairs concentration, and often leads to worse impulsive food choices later.",
    nutrients:
      "**Priority nutrients for student meals:**\n\n**Iron** — Critical for energy and preventing anemia. Many students, especially girls, are iron-deficient. Eat tempeh, spinach, red meat.\n\n**Protein** — Needed for growth and keeping you full. Eggs and tempeh are the best budget sources.\n\n**Fiber** — Slows digestion, helps concentration. At least one vegetable serving per meal.\n\n**B Vitamins** — Support energy metabolism. Found in whole grains, eggs, tempeh.\n\n**Calcium** — Bone health. Milk, tofu, and green vegetables.",
    benefits:
      "Consistent simple meal planning gives you:\n\n• **Academic performance** — breakfast alone improves morning concentration and test results\n• **Financial savings** — planning ahead reduces impulsive expensive purchases\n• **Physical energy** — regular balanced meals prevent afternoon slumps\n• **Reduced sick days** — adequate nutrition supports immunity\n• **Lower stress** — knowing what you'll eat reduces daily decision fatigue",
    sources:
      "**Best budget-friendly student meals in Indonesia:**\n\n| Meal | Price | Nutrition |\n|---|---|---|\n| Nasi + telur rebus + tempe + sayur | Rp 8,000–15,000 | Excellent — carbs, protein, fiber |\n| Nasi + tahu goreng + lalapan | Rp 7,000–12,000 | Good plant-based option |\n| Gado-gado | Rp 10,000–18,000 | High fiber, moderate protein |\n| Bubur ayam (with egg + toppings) | Rp 8,000–15,000 | Good for digestion |\n| Nasi uduk + tempe | Rp 8,000–14,000 | Good carb + protein combo |",
    tips:
      "• **Breakfast rule:** Something is always better than nothing. Even just bread + egg before school is enough.\n• **Improve instant noodles:** Always add 1 egg + 1 handful of vegetables. This transforms a nutritionally poor meal into an acceptable one.\n• **Protein at every meal:** Eggs are the most affordable complete protein — always have some available.\n• **Batch-buy:** Buy eggs, tempeh, and tofu in larger quantities — they're cheaper per unit and last.\n• **Afternoon snack:** A banana or an orange is the best cheap portable snack.",
    summary:
      "The student meal formula: 3 main meals + 1–2 snacks per day. Breakfast = carbs + protein. Lunch = plate method (carbs + protein + vegetable). Dinner = similar to lunch. Snacks = fruit or biscuit + milk. The most impactful change for most students: don't skip breakfast, and add a protein source (egg/tempeh) to every meal.",
  },
  "glycemic-index": {
    overview:
      "The Glycemic Index (GI) measures how quickly different carbohydrate-containing foods raise your blood sugar after eating. This matters for students because rapid blood sugar spikes from high-GI foods are followed by crashes — leaving you tired, hungry, and unable to focus in class.\n\nGI scale: Low GI (≤55) → Moderate (56–69) → High (≥70). Low-GI foods release energy gradually, providing sustained concentration for hours.",
    nutrients:
      "**High-GI foods (avoid or pair with protein/fat):**\n• White rice (GI ~72) — staple, but pair with protein + fat to lower overall response\n• White bread (GI ~75)\n• Sugary drinks (GI >70)\n• Instant noodles (~55-65 depending on type)\n\n**Low-to-Medium GI foods (prefer):**\n• Sweet potato (~50)\n• Oats (~55)\n• Whole grain bread (~50)\n• Legumes/kacang-kacangan (~30–45)\n• Most vegetables (~15–30)\n• Tempeh and tofu (~15)\n\n**Key insight:** Combining high-GI foods with protein, fat, or fiber significantly slows absorption and moderates the blood sugar response.",
    benefits:
      "Choosing lower-GI foods or combining high-GI foods wisely gives you:\n\n• **Longer-lasting energy** — no mid-class energy crash\n• **Better focus during afternoon classes** — the hardest time for students to concentrate\n• **Reduced hunger between meals** — low-GI foods keep you full longer\n• **More stable mood** — blood sugar swings affect irritability and anxiety\n• **Better long-term metabolic health** — consistently high-GI diets are associated with metabolic risk factors",
    sources:
      "**Smart swaps for lower GI meals:**\n\n• Instead of white rice alone → white rice + protein (egg/tempeh) + vegetables\n• Instead of plain white bread → whole grain bread or bread + peanut butter + egg\n• Instead of sugary drinks → plain water or plain milk\n• Instead of sweetened porridge → oatmeal with minimal sugar\n\n**Naturally low-GI foods available to students:**\nTempeh (15), tofu (15), kacang tanah (14), kacang merah (28), ubi jalar (50), pisang hijau (unripe banana ~45)",
    tips:
      "• **Pair rule:** High-GI carb + protein + fat = much lower blood sugar impact. Rice + egg + vegetables is already a good combination.\n• **Don't avoid rice** — the Indonesian diet is rice-based and that's fine. The key is what you eat with it.\n• **Breakfast GI matters most** — a high-GI breakfast alone (sweet bread + sweet drink) sets you up for a late-morning crash.\n• **Legumes are underused** — kacang hijau, kacang merah, and tempe are all low GI and very affordable.\n• **Test yourself** — notice if you feel tired and hungry 1–2 hours after a meal. That's often a GI response.",
    summary:
      "You don't need to memorize GI numbers. Apply two rules: (1) Always pair carbs with protein and vegetables — this naturally lowers the GI impact. (2) Avoid carb-only meals (plain white bread, plain noodles, sweetened drinks alone). For Indonesian students, the best low-GI habits are: adding tempeh or egg to every meal, choosing plain water over sweet drinks, and eating vegetables at every lunch and dinner.",
  },
};

// ─────────────────────────────────────────────────────────────────
// Simple markdown-to-JSX renderer (bold + bullets + newlines)
// ─────────────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  if (!text) return null;
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[--color-on-surface]">
      {text.split("\n\n").map((para, pi) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Table detection (starts with | )
        if (trimmed.startsWith("|")) {
          const rows = trimmed.split("\n").filter((r) => r.trim() && !r.match(/^\|[-\s|]+\|$/));
          return (
            <div key={pi} className="overflow-x-auto rounded-lg border border-[--color-outline-variant]">
              <table className="w-full text-xs">
                <tbody>
                  {rows.map((row, ri) => {
                    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
                    return (
                      <tr key={ri} className={ri === 0 ? "bg-[--color-surface-container-high] font-semibold" : "border-t border-[--color-outline-variant]/40"}>
                        {cells.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Bullet list
        if (trimmed.includes("\n•") || trimmed.startsWith("•")) {
          const items = trimmed.split("\n").filter((l) => l.trim());
          return (
            <ul key={pi} className="space-y-1.5">
              {items.map((item, ii) => {
                const clean = item.replace(/^[•\-*]\s*/, "");
                return (
                  <li key={ii} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-secondary] flex-shrink-0" />
                    <span>{renderInline(clean)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return <p key={pi}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  // Split on **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-[--color-on-surface]">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main detail page component
// ─────────────────────────────────────────────────────────────────

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const topic = TOPICS.find((t) => t.id === id);
  const topicIndex = TOPICS.findIndex((t) => t.id === id);
  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;

  const [activeTab, setActiveTab] = useState("overview");
  const [loadingTab, setLoadingTab] = useState<string | null>(null);
  const [contentCache, setContentCache] = useState<Record<string, { text: string; source: string }>>({});
  const [ragError, setRagError] = useState<string | null>(null);

  // ── Fetch section content from API ────────────────────────────
  const fetchSection = useCallback(
    async (section: string) => {
      if (!topic) return;
      if (contentCache[section]) return; // already loaded

      setLoadingTab(section);
      setRagError(null);

      try {
        const res = await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId: topic.id, section }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { content: string; source: string };

        setContentCache((prev) => ({
          ...prev,
          [section]: { text: data.content, source: data.source },
        }));
      } catch {
        // On error, fall back to static content
        const fallback = STATIC_CONTENT[topic.id]?.[section] ?? "Content is being prepared.";
        setContentCache((prev) => ({
          ...prev,
          [section]: { text: fallback, source: "static" },
        }));
        setRagError("Could not reach AI backend — showing curated knowledge base content.");
      } finally {
        setLoadingTab(null);
      }
    },
    [topic, contentCache]
  );

  // Load the first tab on mount
  useEffect(() => {
    fetchSection("overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Tab switch ────────────────────────────────────────────────
  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    fetchSection(tabId);
  }

  // ── Not found ─────────────────────────────────────────────────
  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="material-symbols-outlined text-[48px] text-[--color-on-surface-variant]">
          search_off
        </span>
        <p className="text-base font-semibold text-[--color-on-surface]">Topic not found</p>
        <Link
          href="/nutrition-knowledge"
          className="text-sm text-[--color-secondary] underline underline-offset-2"
        >
          ← Back to Knowledge Base
        </Link>
      </div>
    );
  }

  const currentContent = contentCache[activeTab];
  const isLoading = loadingTab === activeTab;
  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-[--color-on-surface-variant]">
        <Link
          href="/nutrition-knowledge"
          className="hover:text-[--color-secondary] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">library_books</span>
          Knowledge Base
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[--color-on-surface] font-medium">{topic.title}</span>
      </nav>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={topic.imgUrl}
          alt={topic.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end gap-3">
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0",
                topic.color
              )}
            >
              {topic.iconEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold uppercase tracking-wide">
                  {topic.category}
                </span>
                <span className="text-[10px] text-white/70">{topic.readTime}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{topic.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Description + tags row ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <p className="text-sm text-[--color-on-surface-variant] leading-relaxed max-w-2xl">
          {topic.desc}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:flex-shrink-0">
          {topic.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[--color-secondary]/10 text-[--color-secondary] text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── Left: Tab panel ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tab bar */}
          <div className="flex overflow-x-auto gap-1 bg-[--color-surface-container-lowest] rounded-xl p-1 border border-[--color-outline-variant] mb-4 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-[--color-secondary] text-white shadow-sm"
                    : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
                )}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                {tab.label}
                {contentCache[tab.id] && activeTab !== tab.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* RAG error banner */}
          {ragError && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5">info</span>
              <span>{ragError}</span>
            </div>
          )}

          {/* Content card */}
          <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[--color-outline-variant] bg-[--color-surface-container-low]">
              <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", topic.color)}>
                <span className="material-symbols-outlined text-white text-[16px]">
                  {activeTabMeta.icon}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[--color-on-surface]">
                  {activeTabMeta.label}
                </h2>
                <p className="text-[11px] text-[--color-on-surface-variant]">
                  {activeTabMeta.description}
                </p>
              </div>

              {/* Source badge */}
              {currentContent && (
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium flex-shrink-0
                  border-[--color-outline-variant] text-[--color-on-surface-variant]">
                  {currentContent.source === "langflow" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      RAG — Live
                    </>
                  ) : currentContent.source === "local" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      RAG — Local KB
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Curated Content
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content body */}
            <div className="p-5">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-3/4" />
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-full" />
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-5/6" />
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-2/3" />
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-full" />
                  <div className="h-4 bg-[--color-surface-container-high] rounded w-4/5" />
                </div>
              ) : currentContent ? (
                renderMarkdown(currentContent.text)
              ) : (
                <div className="flex flex-col items-center py-10 gap-2 text-[--color-on-surface-variant]">
                  <span className="material-symbols-outlined text-[32px]">pending</span>
                  <p className="text-sm">Loading content…</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[--color-outline-variant] bg-[--color-surface-container-low] flex items-center justify-between gap-3 text-[11px] text-[--color-on-surface-variant]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                Educational information only. Not medical advice.
              </div>
              <button
                onClick={() => {
                  // Remove cached content for this tab to force re-fetch
                  setContentCache((prev) => {
                    const next = { ...prev };
                    delete next[activeTab];
                    return next;
                  });
                  fetchSection(activeTab);
                }}
                className="flex items-center gap-1 hover:text-[--color-secondary] transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">refresh</span>
                Refresh
              </button>
            </div>
          </div>

          {/* ── Section pagination ──────────────────────────────── */}
          <div className="flex justify-between mt-3 gap-3">
            {(() => {
              const idx = TABS.findIndex((t) => t.id === activeTab);
              const prevTab = idx > 0 ? TABS[idx - 1] : null;
              const nextTab = idx < TABS.length - 1 ? TABS[idx + 1] : null;
              return (
                <>
                  {prevTab ? (
                    <button
                      onClick={() => handleTabChange(prevTab.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--color-surface-container-lowest] border border-[--color-outline-variant] text-xs text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                      {prevTab.label}
                    </button>
                  ) : (
                    <div />
                  )}
                  {nextTab ? (
                    <button
                      onClick={() => handleTabChange(nextTab.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--color-secondary] text-white text-xs font-medium hover:bg-[--color-secondary]/90 transition-colors"
                    >
                      {nextTab.label}
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  ) : (
                    <div />
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* ── Right: Sidebar ───────────────────────────────────── */}
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 flex-shrink-0">
          {/* Outline / progress */}
          <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] p-4">
            <p className="text-xs font-semibold text-[--color-on-surface] mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[--color-secondary]">
                format_list_bulleted
              </span>
              Sections
            </p>
            <div className="space-y-1">
              {TABS.map((tab, ti) => {
                const done = !!contentCache[tab.id];
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={clsx(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-all",
                      active
                        ? "bg-[--color-secondary]/10 text-[--color-secondary] font-medium"
                        : "text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] hover:text-[--color-on-surface]"
                    )}
                  >
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                        active
                          ? "bg-[--color-secondary] text-white"
                          : done
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-[--color-surface-container-high] text-[--color-on-surface-variant]"
                      )}
                    >
                      {done && !active ? "✓" : ti + 1}
                    </span>
                    <span className="truncate">{tab.label}</span>
                    {loadingTab === tab.id && (
                      <span className="ml-auto w-3 h-3 border border-[--color-secondary] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RAG info card */}
          <div className="bg-[--color-surface-container-lowest] rounded-xl border border-[--color-outline-variant] p-4">
            <p className="text-xs font-semibold text-[--color-on-surface] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-500">
                database
              </span>
              RAG Pipeline
            </p>
            <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed mb-3">
              Content is retrieved via the NutriPath RAG knowledge base using Langflow + Astra DB. Local knowledge base is used as fallback.
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Flow", value: "SMANU SmartNutrition" },
                { label: "Backend", value: "Langflow v1.12" },
                { label: "Fallback", value: "Local KB (20 entries)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[11px]">
                  <span className="text-[--color-on-surface-variant]">{label}</span>
                  <span className="text-[--color-on-surface] font-medium truncate max-w-[120px] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ask SMANU CTA */}
          <Link
            href={`/ask-smanu?topic=${topic.id}&question=Tell me more about ${encodeURIComponent(topic.title)}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-[--color-secondary] to-[--color-primary] text-white hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[22px] flex-shrink-0">
              psychology
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold">Ask SMANU</p>
              <p className="text-[10px] text-white/75 leading-tight">
                Have a question about {topic.title}? Get a personalized answer.
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">
              arrow_forward
            </span>
          </Link>

          {/* Responsible AI notice */}
          <div className="rounded-xl border border-[--color-outline-variant] bg-[--color-surface-container-lowest] p-4">
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-500 flex-shrink-0 mt-0.5">
                policy
              </span>
              <div>
                <p className="text-xs font-semibold text-[--color-on-surface] mb-1">
                  Responsible AI
                </p>
                <p className="text-[11px] text-[--color-on-surface-variant] leading-relaxed">
                  NutriPath provides educational information only. Always consult a qualified nutritionist or healthcare professional for personal health decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic navigation (prev / next topic) ────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-[--color-outline-variant]">
        {prevTopic ? (
          <Link
            href={`/nutrition-knowledge/${prevTopic.id}`}
            className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-[--color-surface-container-lowest] border border-[--color-outline-variant] hover:border-[--color-secondary] hover:bg-[--color-surface-container-low] transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] text-[--color-on-surface-variant] group-hover:text-[--color-secondary] transition-colors">
              arrow_back
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-[--color-on-surface-variant] mb-0.5">Previous</p>
              <p className="text-xs font-semibold text-[--color-on-surface] truncate group-hover:text-[--color-secondary] transition-colors">
                {prevTopic.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextTopic ? (
          <Link
            href={`/nutrition-knowledge/${nextTopic.id}`}
            className="flex-1 flex items-center justify-end gap-3 p-4 rounded-xl bg-[--color-surface-container-lowest] border border-[--color-outline-variant] hover:border-[--color-secondary] hover:bg-[--color-surface-container-low] transition-all group text-right"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-[--color-on-surface-variant] mb-0.5">Next</p>
              <p className="text-xs font-semibold text-[--color-on-surface] truncate group-hover:text-[--color-secondary] transition-colors">
                {nextTopic.title}
              </p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[--color-on-surface-variant] group-hover:text-[--color-secondary] transition-colors flex-shrink-0">
              arrow_forward
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
