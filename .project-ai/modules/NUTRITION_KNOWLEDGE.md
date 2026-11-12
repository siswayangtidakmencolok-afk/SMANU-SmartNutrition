# Nutrition Knowledge

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED

## 1. Purpose

Menyajikan artikel edukasi nutrisi, pencarian lokal, dan konten per bagian.

## 2. Current Implementation

Daftar dan halaman detail menggunakan `lib/nutrition-knowledge-data.ts` sebagai katalog topik UI. `POST /api/knowledge` menyediakan respons per topic/section dengan query ke Langflow jika konfigurasi dan mapping tersedia, lalu fallback lokal. Knowledge Base Explorer dan pencarian lain memakai dataset terpisah `lib/knowledge-base.ts`.

## 3. Directory and Files

- `app/(main)/nutrition-knowledge/page.tsx`
- `app/(main)/nutrition-knowledge/[id]/page.tsx`
- `components/KnowledgeBaseExplorer.tsx`, `components/StreamingResponse.tsx`
- `lib/nutrition-knowledge-data.ts`, `lib/knowledge-base.ts`, `lib/search.ts`
- `app/api/knowledge/route.ts`, `app/api/search/route.ts`

## 4. Architecture

UI katalog topik dan KB retrieval lokal adalah dataset/type yang berbeda; jangan mengasumsikan isinya sinkron.

## 5. Data Flow

List/detail render data statis. Detail dapat mengirim request untuk konten tiap section ke `/api/knowledge`. Search memanggil `/api/search?q=...`, yang menggunakan search helper lokal.

## 6. API Endpoints

`POST /api/knowledge` topicId/section; `GET /api/search?q=` dengan batas panjang query 200 karakter.

## 7. Database Dependencies

Artikel tidak disimpan pada schema Neon yang diperiksa.

## 8. External Dependencies

Langflow untuk konten dinamis per bagian jika tersedia; local fallback/data tetap berada di source.

## 9. Current Status

UI, local datasets, dan API ditemukan. Konten Langflow runtime tidak diuji.

## 10. Known Bugs

Dokumentasi root lama menjelaskan knowledge base tunggal 20 item dan RAG OpenAI, sedangkan source memiliki dua struktur data; perbedaan harus dipertahankan jelas.

## 11. Limitations

Nilai edukasi statis dan materi generatif memerlukan review sumber; bukan konsultasi klinis.

## 12. Pending Improvements

Catat provenance/review konten dan tambah tes untuk fallback lokal serta output per section.

## 13. Testing

Tidak ada unit/integration test project tercatat pada manifest.

## 14. Related Tasks

[Langflow RAG](LANGFLOW_RAG.md), [Search API](../architecture/API_ARCHITECTURE.md).
