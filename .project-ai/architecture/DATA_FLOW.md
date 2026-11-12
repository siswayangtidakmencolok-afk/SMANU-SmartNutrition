# Alur Data

**Pembaruan:** 2026-11-12

## Sistem

```mermaid
sequenceDiagram
  actor U as Pengguna
  participant UI as Next.js UI
  participant API as Route API
  participant S as Auth.js/Neon
  participant AI as AI eksternal
  U->>UI: Aksi dan input
  UI->>API: HTTP request
  API->>S: Validasi session / data bila dibutuhkan
  API->>AI: Prompt/API request pada fitur AI
  AI-->>API: Hasil provider
  API-->>UI: JSON atau SSE
  UI-->>U: Status dan hasil
```

## Ask SMANU

```mermaid
sequenceDiagram
  actor U as Pelajar
  participant P as ask-smanu/page.tsx
  participant N as POST /api/nutripath
  participant F as Langflow
  U->>P: Question + situation/food/budget
  P->>N: JSON + sessionId
  N->>F: input_value + session_id, x-api-key
  F-->>N: JSON run output
  N-->>P: SSE meta, token (jawaban penuh), done
  P-->>U: Jawaban + local history
```

Route juga memiliki path OpenAI/Gemini lokal retrieval ketika Langflow tidak terkonfigurasi. Ini bukan jaminan semua jalur aktif; lihat [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md).

## Nutrition Knowledge

```mermaid
sequenceDiagram
  participant UI as Topic detail
  participant API as POST /api/knowledge
  participant LF as Langflow
  participant KB as Local knowledgeBase
  UI->>API: topicId + section
  API->>LF: mapped query bila config tersedia
  alt Langflow menjawab
    LF-->>API: text
  else tidak tersedia/gagal
    API->>KB: fallback content
    KB-->>API: local text
  end
  API-->>UI: JSON content
```

## Food Scanner

```mermaid
sequenceDiagram
  actor U as Pengguna
  participant UI as FoodScannerModal
  participant V as POST /api/food-scanner
  participant G as Gemini Vision
  participant D as /nutrition + DB/local catalog
  participant E as /explain
  participant S as /save
  U->>UI: Ambil/pilih gambar
  UI->>V: Base64 image + MIME
  V->>G: Recognition prompt
  G-->>V: Candidate names/quality
  V-->>UI: Matched candidate list
  UI->>D: Food ID + portion
  alt Food reference found
    D-->>UI: Scaled nutrition source
  else no verified catalog entry
    UI->>E: Food name + portion
    E-->>UI: Explicit AI estimate
  end
  opt Signed-in user confirms save
    UI->>S: Confirmed result snapshot
  end
```

Recognition is not proof of ingredients/weight. Scan image is documented in route as memory-only; photo contribution endpoint currently stores consent metadata.

## Authentication

```mermaid
sequenceDiagram
  actor U as User
  participant UI as Login UI/SessionProvider
  participant A as Auth.js handler
  participant DB as Neon users
  U->>UI: Email/username + password
  UI->>A: Credentials callback
  A->>DB: Find user
  A->>A: bcrypt compare; JWT session
  A-->>UI: Cookie/session
  UI->>A: GET /api/auth/session
  A-->>UI: Session JSON or empty session
```

JWT and user fields source are defined in `auth.ts`; do not store/report password hashes or token values.
