# Arsitektur AI

**Pembaruan:** 2026-11-12

## Jalur aktual yang berbeda

1. **Ask SMANU:** `app/(main)/ask-smanu/page.tsx` memanggil `/api/nutripath`. Route mencoba Langflow ketika seluruh tiga env Langflow tersedia. Jika tidak ada config Langflow, OpenAI dicoba lalu Gemini. Kesalahan pemanggilan Langflow yang sudah terpilih menghasilkan error, tidak otomatis pindah provider. Production test 2026-11-12 berhenti di HTTP 503 karena URL Langflow bukan HTTPS, sebelum provider dipanggil.
2. **AI Assistant bubble:** `components/AiChatWidget.tsx` memanggil `/api/ai-chat`, yang menggunakan Gemini chat history. Jalur ini terpisah.
3. **Nutrition Knowledge:** `/api/knowledge` menanyakan Langflow untuk topik/section yang dipetakan, dengan fallback `lib/knowledge-base.ts`.
4. **Food Scanner:** Gemini Vision memberi nama kandidat dari image; backend mencocokkan katalog lokal. Endpoint `/nutrition` memberi data referensi atau `/explain` meminta estimasi Gemini. Estimasi diberi status terpisah dari verified data.

```mermaid
flowchart TD
  Ask[Ask SMANU page] --> N[/api/nutripath]
  N -->|config lengkap| LF[Langflow run API]
  N -->|Langflow tidak dikonfigurasi| OAI[OpenAI + local retrieval]
  N -->|OpenAI tidak tersedia/gagal| GR[Gemini + local retrieval]
  Bubble[AI chat widget] --> AC[/api/ai-chat]
  AC --> GEM[Gemini multi-turn]
  Knowledge[Knowledge detail] --> K[/api/knowledge]
  K -->|configured| LF
  K -->|unavailable/error| Local[Static knowledge fallback]
  Scanner[Food Scanner] --> Vision[/api/food-scanner]
  Vision --> GEM
  Vision --> Match[Local food catalog match]
  Match --> Nutrition[/api/food-scanner/nutrition]
  Nutrition -->|not found| Explain[/api/food-scanner/explain]
  Explain --> GEM
```

## Batas RAG dan verifikasi

Retrieval lokal `lib/rag-retrieval.ts` menilai token/kategori pada KB lokal dan dipakai jalur OpenAI/Gemini pada `/api/nutripath`. Jalur Langflow mengirim gabungan konteks siswa/question dan mengharapkan response dari flow; daftar chunks lokal tidak menjadi bukti retrieval AstraDB runtime. Isi/keaktifan Langflow flow dan layanan provider harus diuji terpisah. API keys server-side saja.
