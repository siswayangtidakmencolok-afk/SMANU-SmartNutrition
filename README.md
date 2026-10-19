# NutriPath 🥗

**Personal Nutrition Navigator for Students**

NutriPath is a RAG-powered educational nutrition assistant that helps students make better food decisions based on their real situation, available foods, and budget.

---

## Features

- **Structured Knowledge Base**: 20 curated nutrition entries across 6 categories (Basic Nutrition, Hydration, Food Choices, Student Context, Food Label Literacy, Nutrition Education)
- **RAG Pipeline**: TF-IDF keyword retrieval + situation-category bias mapping — every answer is grounded in retrieved knowledge
- **Personalized Context**: User-defined situation, available foods, budget — no health data assumed
- **Streaming Responses**: Real-time SSE streaming from the API
- **Structured Output**: 5-section response format (Main Answer, Why It Matters, Practical Suggestion, What to Watch For, Responsible AI Note)
- **Knowledge Base Explorer**: Browse and search all knowledge entries with source citations
- **Responsible AI**: Educational disclaimers, no medical claims, no assumed health conditions
- **Demo Mode**: Works without an OpenAI API key (uses mock responses)

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional — demo mode works without it)
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your OPENAI_API_KEY
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
nutripath/
├── app/
│   ├── api/nutripath/route.ts   # RAG API endpoint (SSE streaming)
│   ├── page.tsx                 # Main NutriPath app (Navigate/Knowledge/About tabs)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── SituationSelector.tsx    # Step 1: User context cards
│   ├── StreamingResponse.tsx    # Response renderer + RAG source panel
│   └── KnowledgeBaseExplorer.tsx # Browsable knowledge base
└── lib/
    ├── knowledge-base.ts        # 20 structured nutrition entries
    ├── rag-retrieval.ts         # Retrieval engine + prompt builder
    └── types.ts                 # Shared TypeScript types
```

---

## RAG Architecture

```
User Context (situation + foods + budget)
         +
     User Question
           ↓
   Keyword Tokenization
   + Stopword Filtering
           ↓
  TF-IDF Scoring against
  20 Knowledge Base Entries
   + Category Bias Boost
           ↓
   Top-5 Relevant Chunks
           ↓
  System Prompt Construction
  (context + knowledge + rules)
           ↓
   GPT-4o-mini (streaming)
           ↓
  Structured 5-Section Response
  + Source Citations
```

---

## Responsible AI

NutriPath is an **educational decision-support tool**, not a medical service.

- ❌ Never diagnoses health conditions
- ❌ Never requests medical history or personal ID
- ✅ All answers grounded in knowledge base (cited)
- ✅ Always includes educational disclaimer
- ✅ User provides own context — AI never assumes health status
- ✅ Recommends healthcare professionals for medical concerns

---

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **OpenAI GPT-4o-mini** (streaming)
- **Custom RAG Engine** (keyword retrieval, no external vector DB required)
- Deployable on **Vercel** with zero configuration

---

## Knowledge Base Categories

| Category | Entries | Coverage |
|---|---|---|
| 🥗 Basic Nutrition | 6 | Carbs, protein, fat, fiber, vitamins, balanced meals |
| 💧 Hydration | 3 | Water needs, beverages, dehydration |
| 🍽️ Food Choices | 3 | Food groups, common foods, meal composition |
| 🎒 Student Context | 4 | Affordable meals, canteen, meal timing, planning |
| 🏷️ Food Label Literacy | 5 | Serving size, calories, sugar, sodium, protein |
| 📚 Nutrition Education | 5 | Definitions, GI, Indonesian foods, myths vs facts |

Sources: WHO, FAO, Kemenkes RI (AKG 2019), BPOM RI, PERSAGI, DKBM Indonesia, Harvard T.H. Chan, EFSA
