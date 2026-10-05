"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

const categories = ["All", "Fundamentals", "Wellness", "Lifestyle", "Practical Skills", "Quick Recipes"];

const topics = [
  {
    id: "nutrition-basics",
    category: "Fundamentals",
    title: "Nutrition Basics",
    desc: "Understand macronutrients (carbohydrates, protein, fats), micronutrients, and how daily energy balance works.",
    tags: ["Macronutrients", "Energy", "Vitamins"],
    readTime: "5 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
  },
  {
    id: "hydration",
    category: "Wellness",
    title: "Hydration",
    desc: "Learn about daily fluid requirements, the role of electrolytes, and how staying hydrated improves focus and study performance.",
    tags: ["Water", "Electrolytes", "Focus"],
    readTime: "4 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDokmBnYHi2Ic_u0ydRXzupJ05RGD8K803wEpfrftCAq55TemP-8aOlYem89VMfp0meWUt6LvLyDiCqUOvbuBkdg_oo1f_WHcSmWeJR96zS2tnAQbTeGQZXKlgqVBcR6C2KTg5NIyzRKlemEA2rcKqeuLVgkUvtSNbIcWp4BgH_4inZLsWTvou2GJ1deiD0R9Ua3kojuk0BmaYM1ZD_Ge6HK9KehQSbi_iwGN_oT_AB-_Tm4UdgNLG4XQ",
  },
  {
    id: "food-choices",
    category: "Lifestyle",
    title: "Food Choices",
    desc: "Build balanced plates using accessible campus cafeteria staples and common dormitory kitchen ingredients.",
    tags: ["Balanced Meals", "Campus Food", "Plate Method"],
    readTime: "6 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Q-3EdSXm0YUU3KJkqJxZeCBYFLp9eB1qnJqCfdxkh2iGmMoPKiYlAJhm9pn3KSCTmz2DaGPcuPbkzHuiuF9U3qc8PqLfAJtpAxyXY7lecDnvoMhwT5yMaUAYO8YxtOs6ok6g7vZeSES0WXR-t_2T4dSndacJ96SjrGUb7wbNzRcoYheVGKJDKmUnkkRX6ao0SjLn7JP_dmH5we8AmY4e0R31Cl7Sm1H07IjN_wsTj2cB65zcyjuuMA",
  },
  {
    id: "food-labels",
    category: "Practical Skills",
    title: "Reading Food Labels",
    desc: "Decode serving sizes, % Daily Values, hidden sugars, sodium content, and what ingredient lists really mean.",
    tags: ["Food Labels", "Daily Value", "Sugar"],
    readTime: "7 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa75cS2cUFHSvjEpeUbYIrdzjXFnJ9Rj30VFm_N6pvFUrdtbd625gNfN9-ExuO5DblAE-dTZ6ZPHugg0YMKYbLaqi_ttkTmhg5Hx4HZc1KmXmE7-c1YEOBaAO49Zy_K7zPAnP_L5rwhbkx4vsfvssRSS-TusOOFSp4wujUyVlOcbvDDpNM4S-rGq-DZzhmba4dajYusXG-Z3rIa3gueKXx8qYFXzoV4vbU4VTsYHm66zm7W-X10LGGNQ",
  },
  {
    id: "student-meals",
    category: "Quick Recipes",
    title: "Student Meals",
    desc: "Nutritious and practical meal combinations you can prepare using common dormitory supplies and minimal equipment.",
    tags: ["Meal Prep", "Budget Friendly", "Dorm Kitchen"],
    readTime: "5 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjtvvpr25li5JQiJxBFy0Q3GEF-xWEKaIYDI4IYkPLsD83d3_-Cn7irz3rFHnDynC37GKEEWx3_8Z7IvZLlNonPHewZ4pGzeeOFmwN2gr-P8gzdi8siD0ADsS_eNdWJzwnlytSw2_VBQMGOYxy0W6VJO3zKp6bB0ujbZY7_Spd1qwGyPuUms6FRcebMpTxSKWCuB9gzu1Fbk_0iAzpXYOov_skDjSpgRIE7l0vwZU62FtcRvGUfJqBfQ",
  },
  {
    id: "glycemic-index",
    category: "Fundamentals",
    title: "Glycemic Index",
    desc: "Understand how different carbohydrates affect blood sugar and energy levels — important for sustained concentration during long study sessions.",
    tags: ["GI", "Blood Sugar", "Energy"],
    readTime: "5 min read",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4_xhMZUHUsrtu4J49rfK1lD8Diw53z6_mhgPCwAapfsD3ZhlTS1RMd1XcjwVtFCGSOhnPmUuqRKxuubtmgjLGTB23-5xEzq3VIod1XoMfGgWtGJw4pDT3RBzM12U9pwgfJ9Od1IH8MfPYr0PGcMleo-NfDWFmyRJ4ywvReJ7ShPqmkLN-uMNs-YjZYfuwP8MqLl43BvhURGq03ll7vpcC3B4QopR18RKrUJzzJQlFDqjb-7j8mpq2bg",
  },
];

export default function NutritionKnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = topics.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge="Knowledge Base"
        title="Nutrition Knowledge"
        subtitle="Core scientific modules cataloged for query indexing and student study."
      />

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[--color-on-surface-variant] text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search topics, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[--color-outline-variant] bg-[--color-surface-container-lowest] pl-9 pr-4 py-2.5 text-sm text-[--color-on-surface] placeholder:text-[--color-outline] outline-none focus:border-[--color-secondary] focus:ring-2 focus:ring-[--color-secondary]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-[--color-surface-container-lowest] border border-[--color-outline-variant] rounded-lg text-xs text-[--color-on-surface-variant]">
          <span className="material-symbols-outlined text-[16px]">library_books</span>
          <span>{topics.length} topics</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-[--color-primary] text-[--color-on-primary] shadow-sm"
                : "bg-[--color-surface-container-lowest] text-[--color-on-surface-variant] border border-[--color-outline-variant] hover:bg-[--color-surface-container-high]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <span className="material-symbols-outlined text-[40px] text-[--color-on-surface-variant] block mb-3">
            search_off
          </span>
          <p className="text-sm font-medium text-[--color-on-surface]">No topics found</p>
          <p className="text-xs text-[--color-on-surface-variant] mt-1">
            Try adjusting your search or selecting a different category.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((topic) => (
            <Card
              key={topic.id}
              padding="none"
              className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
            >
              {/* Image */}
              <div className="h-36 overflow-hidden bg-[--color-surface-container] relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={topic.imgUrl}
                  alt={topic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs font-semibold text-[--color-on-surface]">
                  {topic.category}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[--color-surface]/90 backdrop-blur text-xs text-[--color-on-surface-variant]">
                  {topic.readTime}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 p-4 flex-1">
                <h3 className="text-base font-semibold text-[--color-on-surface] group-hover:text-[--color-secondary] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-[--color-on-surface-variant] line-clamp-3 leading-relaxed flex-1">
                  {topic.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-[--color-surface-container] text-[--color-on-surface-variant] text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between pt-3 border-t border-[--color-outline-variant]/50">
                  <span className="text-xs font-semibold text-[--color-secondary] flex items-center gap-1">
                    Coming soon
                    <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                  </span>
                  <Badge variant="neutral">Knowledge Base</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom info */}
      <Card variant="low" className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[--color-secondary] text-[20px]">verified</span>
        <p className="text-xs text-[--color-on-surface-variant]">
          All knowledge topics are sourced from peer-reviewed nutrition literature and will be
          available for AI-assisted exploration when the RAG pipeline is connected.
        </p>
      </Card>
    </div>
  );
}
