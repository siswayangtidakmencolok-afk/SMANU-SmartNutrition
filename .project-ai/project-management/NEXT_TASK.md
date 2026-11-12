# NEXT TASK

## Active Phase

PHASE_03_AI_AND_RAG

## Task ID

SMANU-002

## Task Title

Restore Ask SMANU Production AI Connectivity

## Objective

Memulihkan koneksi AI Ask SMANU pada deployment Vercel dengan mempertahankan arsitektur RAG yang ada.

## Scope

- [x] Audit Langflow integration.
- [ ] Verify Flow ID.
- [ ] Verify Langflow server accessibility from production.
- [x] Audit Gemini fallback.
- [x] Test Production API (request uji awal).
- [x] Preserve existing RAG architecture.

## Constraints

- Jangan mengulang aplikasi dari nol.
- Jangan menghapus knowledge base.
- Jangan mengubah fitur scanner.
- Jangan mengubah database tanpa kebutuhan.
- Jangan mengekspos atau meminta secret/API key.
- Jangan mengubah Vercel environment atau redeploy tanpa akses dan persetujuan yang tepat.

## Findings

- POST ke `https://smanu-smart-nutrition.vercel.app/api/nutripath` membalas HTTP 503 JSON: `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.`
- Ini menunjukkan konfigurasi Langflow dipilih tetapi URL yang diberikan ke production tidak memakai HTTPS; panggilan Langflow belum dilakukan.
- Route tidak mencoba Gemini bila konfigurasi Langflow aktif tetapi invalid. Gemini hanya berjalan ketika Langflow tidak dipilih, atau OpenAI gagal pada path tanpa Langflow.
- Response error keluar sebelum `meta`, `token`, dan `done`; SSE sukses belum dapat diuji production.
- Respons API hanya membuktikan Flow ID terisi, bukan ID itu benar atau flow aktif.
- Vercel CLI tidak terautentikasi dan project belum terhubung di workspace ini.

## Acceptance Criteria

- [ ] Ask SMANU bisa mengirim pertanyaan.
- [x] Provider AI dapat diidentifikasi sebagai konfigurasi Langflow yang gagal validasi URL.
- [x] Error handling mengembalikan error JSON yang dapat ditampilkan client.
- [ ] Production berhasil diuji hingga menerima jawaban AI.
- [x] Dokumentasi diperbarui dengan bukti aktual.

## Required Tests

- [x] Production API smoke test (gagal pada validasi environment sebelum provider dipanggil).
- [ ] Production Langflow flow dan Flow ID diverifikasi setelah URL diperbaiki.
- [ ] Provider SSE success diuji dari Ask SMANU.
- [ ] Gemini path diuji terpisah hanya bila sesuai konfigurasi dan persetujuan.

## Status

BLOCKED

## Blocker / Next Action

Pemilik Vercel perlu memperbarui `LANGFLOW_SERVER_URL` untuk Production ke endpoint HTTPS Langflow yang benar (artefak konfigurasi proyek menyebut `https://api.langflow.astra.datastax.com`), lalu redeploy. Jangan mengubah `LANGFLOW_FLOW_ID` atau API key tanpa bukti provider setelah URL benar. Setelah redeploy, ulangi smoke test production tanpa menampilkan credential.

## Notes

Task dapat dilanjutkan setelah konfigurasi Vercel diperbarui atau akses deployment yang sah tersedia. Nilai environment tidak boleh ditempelkan ke chat.
