# Langflow RAG

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED — production configuration invalid

## 1. Purpose

Menjalankan knowledge retrieval/answering pada flow Langflow untuk Ask SMANU dan permintaan konten Nutrition Knowledge.

## 2. Current Implementation

`/api/nutripath` membangun URL `/api/v1/run/{flowId}`, mengirim `input_value`, `input_type: chat`, `output_type: chat`, dan `session_id`, memakai header `x-api-key`, timeout 120 detik, dan mengekstrak teks dari beberapa struktur JSON Langflow yang dikenal serta pencarian teks recursive.

`/api/knowledge` memiliki mapping topic/section ke query dan path Langflow terpisah; ada fallback ke knowledge base lokal.

## 3. Directory and Files

- `app/api/nutripath/route.ts`
- `app/api/knowledge/route.ts`
- `app/(main)/ask-smanu/page.tsx`
- `app/(main)/nutrition-knowledge/[id]/page.tsx`
- `.env.local.example` — nama/format template; jangan salin nilai secret.

## 4. Architecture

Ask SMANU menggunakan Langflow hanya bila tiga variable konfigurasi lengkap. URL diperiksa untuk skema HTTP(S); production memerlukan HTTPS dan menolak host lokal/private. Langflow yang sudah dipilih tetapi gagal tidak memicu fallback provider.

## 5. Data Flow

Ask SMANU menggabungkan konteks user dengan question menjadi input teks. Knowledge endpoint memakai query statis berdasarkan topic/section. Kedua endpoint melakukan fetch server-to-server dan tidak mengirim API key ke browser.

## 6. API Endpoints

- `POST /api/nutripath` — request/response SSE.
- `POST /api/knowledge` — topic/section → content JSON; Langflow lalu fallback lokal.

## 7. Database Dependencies

Tidak ada koneksi langsung ke Neon pada provider request. Retrieval Langflow internal/knowledge store tidak dapat dipastikan dari repository.

## 8. External Dependencies

Langflow server, flow aktif, API key, network egress dari environment aplikasi. Referensi export/import flow yang disediakan pengguna bukan bukti flow terdeploy/aktif.

## 9. Current Status

POST production Ask SMANU pada 2026-11-12 mengembalikan 503 `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` Ini menunjukkan server/flow/key configuration cukup lengkap untuk memilih Langflow, tetapi URL yang dipakai bukan HTTPS. Validitas Flow ID, API key, flow aktif, output aktual, dan keterjangkauan upstream belum diuji karena validasi lokal menolak request sebelum fetch.

## 10. Known Bugs

Production config dapat terblokir bila `LANGFLOW_SERVER_URL` memakai HTTP atau skema selain HTTPS. Route Knowledge memakai konfigurasi dan timeout sendiri. Struktur output provider dapat berubah; `extractLangflowAnswer` memiliki candidate paths dan fallback recursive, tetapi teks salah/ambigu masih perlu integration test.

## 11. Limitations

Kredensial lingkungan tidak disimpan dalam dokumen. Keberadaan nama env lokal bukan bukti deployment/configuration Langflow Cloud.

## 12. Pending Improvements

Tambahkan smoke test provider tanpa log credential, validasi response fixture representatif, dan checklist flow/session di Cloud.

## 13. Testing

Production API diuji dan berhenti sebelum fetch Langflow; koneksi provider live belum berhasil diuji. Panduan repo `.bob/artifacts/cara-export-import-flow-ke-langflow-cloud.html` menyebut base URL HTTPS `https://api.langflow.astra.datastax.com`; konfirmasi endpoint yang berlaku untuk deployment sebelum mengubah environment. Vercel CLI tidak terautentikasi dan tidak ada project link lokal.

## 14. Related Tasks

[Ask SMANU](ASK_SMANU.md), [Integrations](../architecture/INTEGRATIONS.md), [Deployment](../engineering/DEPLOYMENT.md), [NEXT_TASK](../project-management/NEXT_TASK.md).
