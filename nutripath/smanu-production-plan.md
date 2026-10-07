# SMANU Production Plan
# Responsive Mobile + AI Chat Production

## Overview

Two independent goals. Both can be implemented in any order — no cross-dependencies.

**Goal 1 — Responsive Mobile:** Fix specific layout issues found in the audit that cause
horizontal overflow, clipped text, and broken grids on mobile viewports (< 640px).
Desktop layout must be preserved exactly. No `overflow-x-hidden` band-aids.

**Goal 2 — AI Chat Production:** Replace the Langflow-only dependency with a dual-path
architecture. Path A: OpenAI direct API (active now, works on Vercel immediately).
Path B: Langflow Cloud (connected later, same env var pattern). The route auto-selects
which path is available. API key stays server-side only.

---

## Sub-Task 1 — Fix Header Mobile Layout

**Status:** [ ] pending

### Intent
The Header component has a `w-52` (208px fixed) element that takes over 50% of the viewport
width on phones, causing horizontal overflow and clipping of the page title / nav area.

### Expected Outcomes
- No horizontal overflow from the header on any screen width >= 320px
- Title / branding area is not clipped on mobile
- Desktop header appearance is unchanged (lg breakpoint)

### Todo List
1. Read `nutripath/components/layout/Header.tsx` in full
2. Identify the `w-52` element on line ~30 and its parent flex container
3. Replace `w-52` with `flex-1 min-w-0` so it shrinks instead of overflowing
4. Verify that flex layout wraps correctly when space is constrained
5. Run `npx tsc --noEmit` to check types

### Relevant Context
- File: `nutripath/components/layout/Header.tsx` line ~30
- Pattern: the element using `w-52` is a flex child; removing the fixed width and
  using `flex-1 min-w-0` follows Tailwind's standard approach for flex overflow prevention

---

## Sub-Task 2 — Fix History Page Search Input Mobile

**Status:** [ ] pending

### Intent
The history page search input has `w-48` (192px fixed width) which overflows on
phones narrower than ~240px and breaks the flex row layout.

### Expected Outcomes
- Search input takes full width on mobile, fixed `w-48` only on sm+ screens
- No horizontal scroll on the history page on any mobile device

### Todo List
1. Read `nutripath/app/(main)/history/page.tsx` lines 225–245
2. Find the `w-48` on the search input (line ~239)
3. Change to `w-full sm:w-48`
4. Verify the surrounding flex container handles this gracefully (likely `flex-col sm:flex-row`)

### Relevant Context
- File: `nutripath/app/(main)/history/page.tsx` line ~239
- The parent flex is already `flex-col sm:flex-row` so the input going full-width on
  mobile is correct and consistent

---

## Sub-Task 3 — Fix About Page Fixed Grid Columns

**Status:** [ ] pending

### Intent
Three `grid-cols-2` grids in the About page have no mobile variant, causing cramped
2-column layouts on phones where a 1-column stacked layout is more appropriate.

### Expected Outcomes
- "Generic AI vs SMANU" comparison grid stacks to 1 column on mobile
- "Technical Architecture" grid stacks to 1 column on mobile
- "Knowledge Base Categories" grid stacks to 1 column on mobile
- On sm+ screens (>= 640px) the 2-column layout is restored

### Todo List
1. Read `nutripath/app/(main)/about/page.tsx` lines 55–142
2. Change `grid grid-cols-2` → `grid grid-cols-1 sm:grid-cols-2` on lines ~57, ~101, ~125
3. Verify card content is readable at single-column width

### Relevant Context
- File: `nutripath/app/(main)/about/page.tsx`
- All three grids follow the same pattern; a single consistent fix applies to all

---

## Sub-Task 4 — Fix Intermediate Grid Breakpoints

**Status:** [ ] pending

### Intent
Two locations use `grid-cols-1` → `sm:grid-cols-4` which jumps abruptly from
1 column to 4 columns at 640px, causing cramped 4-column grids on tablets/small laptops.
The my-context dietary preference grid also misses an intermediate step.

### Expected Outcomes
- Pipeline overview (how-it-works) uses 1 → 2 → 4 column progression
- Nutrition Knowledge [id] pipeline section uses 1 → 2 → 4 column progression
- My Context dietary preferences grid uses 1 → 2 → 3 → 4 column progression (or 1 → 2 → 4)

### Todo List
1. Read `nutripath/app/(main)/how-it-works/page.tsx` line ~102
2. Change `grid-cols-1 sm:grid-cols-4` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
3. Read `nutripath/app/(main)/nutrition-knowledge/[id]/page.tsx` line ~102
4. Apply same change to the pipeline overview grid there
5. Read `nutripath/app/(main)/my-context/page.tsx` line ~160
6. Change `grid-cols-2 sm:grid-cols-4` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`

### Relevant Context
- Files: `how-it-works/page.tsx`, `nutrition-knowledge/[id]/page.tsx`, `my-context/page.tsx`
- The fix is the same pattern: add an intermediate `sm:` or `md:` step

---

## Sub-Task 5 — Fix Ask SMANU Chat Mobile Layout

**Status:** [ ] pending

### Intent
The Ask SMANU chat page has a right context sidebar with no explicit width constraint,
and message bubbles may overflow on very narrow viewports if long words or URLs appear.
The toolbar chips at the bottom may also overflow on phones.

### Expected Outcomes
- Chat messages do not cause horizontal scroll (long words wrap)
- Right context sidebar has a defined max-width and is hidden/collapsed appropriately on mobile
- Bottom toolbar chips wrap or scroll without causing page overflow
- Chat input area stays within viewport bounds

### Todo List
1. Read `nutripath/app/(main)/ask-smanu/page.tsx` in full — focus on the layout
   structure (lines 230–500), right sidebar (lines ~400–460), and toolbar (lines ~460–500)
2. Add `break-words` or `overflow-wrap: break-word` to message bubble containers
3. Check right sidebar: if it renders alongside chat on mobile, it should be
   `hidden lg:flex` or collapsed to an accordion — audit actual rendering
4. Ensure toolbar chip container uses `flex-wrap` so chips don't overflow
5. Add `min-w-0` to any flex children in the chat area that may expand unexpectedly

### Relevant Context
- File: `nutripath/app/(main)/ask-smanu/page.tsx`
- The page uses fullscreen layout (set in layout.tsx FULLSCREEN_PAGES array)
- The layout is `flex` with a potential right panel — if right panel is visible on mobile
  alongside the chat, that is the root of the overflow issue

---

## Sub-Task 6 — AI Chat Production: OpenAI Direct Fallback

**Status:** [ ] pending

### Intent
The current `/api/nutripath` route only calls Langflow. When Langflow is unavailable
(which it always is on Vercel right now), the chat returns a hard error.

This sub-task adds a **direct OpenAI path** that activates automatically when
Langflow is unavailable or not configured. The selection logic:

  1. If `LANGFLOW_SERVER_URL` and `LANGFLOW_API_KEY` are set → try Langflow first
  2. If Langflow fails or env vars not set → fall back to OpenAI direct API
  3. If neither is configured → return a clear configuration error

The OpenAI path uses the same input format (situation, foods, budget, question),
the same RAG knowledge base retrieval (TF-IDF from `lib/rag-retrieval.ts`), the
same system prompt structure (from `lib/rag-retrieval.ts:buildSystemPrompt`), and
the same SSE output format so the frontend requires zero changes.

The result: chat works on Vercel immediately using `OPENAI_API_KEY`. When Langflow
Cloud is ready, adding `LANGFLOW_SERVER_URL` and `LANGFLOW_API_KEY` to Vercel env
vars will automatically switch to Langflow.

### Expected Outcomes
- Chat works on Vercel with only `OPENAI_API_KEY` set
- Setting `LANGFLOW_SERVER_URL` + `LANGFLOW_API_KEY` makes it use Langflow instead
- API key (`OPENAI_API_KEY` and `LANGFLOW_API_KEY`) stays server-side only
- SSE response format is identical to what the frontend already parses
- Error messages are user-friendly, no credentials leaked
- `retrieveRelevantChunks()` and `buildSystemPrompt()` from `lib/rag-retrieval.ts`
  are used to ground the OpenAI call in the knowledge base (real RAG, not generic)

### Todo List
1. Read `nutripath/app/api/nutripath/route.ts` in full (current state)
2. Read `nutripath/lib/rag-retrieval.ts` in full — understand `retrieveRelevantChunks`,
   `buildKnowledgeContext`, `buildSystemPrompt`, `UserContext`
3. Install `openai` npm package IF not already in package.json
   (audit found `openai@7.28.0` already present — verify it is actually installed)
4. Write new `callOpenAI()` helper inside the route file:
   - Takes `UserContext` and `systemPrompt` as input
   - Calls `openai.chat.completions.create()` with `gpt-4o-mini`
   - Uses `stream: false` (response already full-text; SSE is handled by our own
     ReadableStream wrapper, not the OpenAI SDK stream)
   - Model: `gpt-4o-mini` (affordable, fast, appropriate for educational content)
   - Temperature: 0.3 (factual/educational, low creativity)
5. Refactor `POST` handler to:
   a. Try Langflow if both `LANGFLOW_SERVER_URL` and `LANGFLOW_API_KEY` are set
   b. On Langflow error OR if env vars not present, call `callOpenAI()` instead
   c. Wrap OpenAI answer in the same SSE format (meta → token → done)
   d. If both fail, return a single clear error
6. Update `.env.local.example` to document `OPENAI_API_KEY`
7. Run `npx tsc --noEmit` and `npx next build`

### Relevant Context
- File to modify: `nutripath/app/api/nutripath/route.ts`
- Reuse from: `nutripath/lib/rag-retrieval.ts` — functions `retrieveRelevantChunks`,
  `buildKnowledgeContext`, `buildSystemPrompt`
- Package: `openai` v7.28.0 already in dependencies
- The SSE output format is:
  `data: {type:"meta",...}\n\n` → `data: {type:"token",content:"..."}\n\n` → `data: {type:"done"}\n\n`
- Frontend `handleSend()` in `ask-smanu/page.tsx` requires zero changes

### Environment Variables Required After This Sub-Task
| Variable | Required for | Notes |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI path (new) | Server-side only |
| `LANGFLOW_SERVER_URL` | Langflow path (existing) | Optional; if set, Langflow tried first |
| `LANGFLOW_API_KEY` | Langflow path (existing) | Optional; must pair with SERVER_URL |
| `LANGFLOW_FLOW_ID` | Langflow path (existing) | Optional; has hardcoded default |

---

## Sub-Task 7 — Update .env.local.example and Deployment Docs

**Status:** [ ] pending

### Intent
After sub-task 6, the `.env.local.example` file needs updating to document the new
`OPENAI_API_KEY` variable, clarify which variables are required vs optional, and
explain the dual-path selection logic so the next developer understands the setup.

### Expected Outcomes
- `.env.local.example` documents all 4 variables with clear comments
- Describes which combinations activate which AI path
- Does not contain any real secret values

### Todo List
1. Read current `nutripath/.env.local.example`
2. Rewrite to document: `OPENAI_API_KEY` (required for fallback path),
   `LANGFLOW_SERVER_URL` (optional, activates Langflow), `LANGFLOW_API_KEY` (optional),
   `LANGFLOW_FLOW_ID` (optional, has default)
3. Add a comment block explaining the AI path selection logic

### Relevant Context
- File: `nutripath/.env.local.example`
- Current state: documents `LANGFLOW_SERVER_URL`, `LANGFLOW_API_KEY`, `LANGFLOW_FLOW_ID`

---

## Vercel Environment Variables — Final State After All Sub-Tasks

After all sub-tasks are implemented, the only env var needed for Vercel to work:

| Variable | Required | Value source |
|---|---|---|
| `OPENAI_API_KEY` | **Yes** | OpenAI dashboard → API keys |
| `LANGFLOW_SERVER_URL` | No (optional) | Langflow Cloud base URL |
| `LANGFLOW_API_KEY` | No (optional) | Langflow Cloud API key |
| `LANGFLOW_FLOW_ID` | No (optional) | Flow ID from Langflow Cloud URL |

Chat works on Vercel immediately once `OPENAI_API_KEY` is set.
When Langflow Cloud is ready, adding the three Langflow vars switches the primary path.
