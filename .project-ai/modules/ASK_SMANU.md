# Ask SMANU

**Pembaruan:** 2026-11-12<br>
**Status:** PARTIALLY VERIFIED — production blocker teridentifikasi

## 1. Purpose

Chat edukasi nutrisi dengan konteks situasi, budget, makanan tersedia, dan session flow.

## 2. Current Implementation

Halaman client `app/(main)/ask-smanu/page.tsx` mengirim `situation`, `availableFoods`, `budget`, `question`, dan `sessionId` ke `POST /api/nutripath`. API menunggu jawaban provider lalu mengemasnya ke SSE; jawaban dikirim sebagai satu event token penuh, bukan token streaming model incremental.

## 3. Directory and Files

- `app/(main)/ask-smanu/page.tsx` — UI, status loading/streaming/done/error dan parsing.
- `app/api/nutripath/route.ts` — pemilihan provider, Langflow/OpenAI/Gemini, error dan SSE.
- `lib/rag-retrieval.ts`, `lib/knowledge-base.ts` — retrieval lokal dan prompt jalur langsung.
- `context/HistoryContext.tsx`, `lib/history-store.ts` — histori browser.

## 4. Architecture

Provider selection: Langflow bila server URL, API key, dan flow ID semuanya tersedia. Bila konfigurasi Langflow tidak lengkap, route dapat menggunakan OpenAI, lalu Gemini. Jika Langflow sudah terpilih tetapi request-nya gagal, route membalas error 502 dan tidak menjalankan provider fallback.

## 5. Data Flow

Halaman mengirim POST JSON ke `/api/nutripath`; server menjawab JSON error untuk kegagalan request/provider atau SSE `meta`, `token`, `done` saat berhasil. UI menyimpan conversation history ke localStorage melalui provider context.

## 6. API Endpoints

`POST /api/nutripath`: body mencakup situation dan question wajib, serta availableFoods/budget/sessionId opsional.

## 7. Database Dependencies

Ask/history tidak menulis conversation ke Neon. `HistoryContext` menyimpan maksimal 50 sesi di browser.

## 8. External Dependencies

Langflow API, OpenAI, atau Gemini sesuai konfigurasi server. Lihat [LANGFLOW_RAG.md](LANGFLOW_RAG.md).

## 9. Current Status

Production smoke test 2026-11-12 ke `https://smanu-smart-nutrition.vercel.app/api/nutripath` mengembalikan HTTP 503 JSON `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` Error terjadi sebelum request upstream; provider Langflow dipilih oleh production config tetapi belum ada jawaban AI yang berhasil diuji. Request validasi awal ini bukan acceptance test sukses.

## 10. Known Bugs

- Parser client menggabungkan event `token`, berhenti memproses batch saat `done`, dan mengabaikan event `error`; server saat ini membuat error utama sebagai JSON status non-2xx, bukan SSE error event.
- Environment production Langflow memiliki URL yang terdeteksi bukan HTTPS; route menolak dengan 503 sebelum provider call. Vercel environment belum dapat diperiksa atau diubah dari workspace.
- History localStorage bersifat per browser/per perangkat dan error storage ditangani diam-diam.
- UI/route perlu tetap selaras bila kontrak event berubah.

## 11. Limitations

Langflow session ID ada di request, tetapi penyimpanan historinya bukan server-side. Jawaban Langflow belum tentu memuat citation/chunk; route SSE dapat mengembalikan array chunks kosong.

## 12. Pending Improvements

Perbarui `LANGFLOW_SERVER_URL` di Vercel Production ke URL HTTPS yang benar, lalu redeploy dan uji SSE success serta provider metadata. Verifikasi Flow ID dan flow setelah koneksi berhasil. Tambah uji kontrak SSE untuk provider error, stream terputus, retry, dan status UI. Jangan mengubah prioritas provider tanpa keputusan pengguna.

## 13. Testing

Production API request diuji dan gagal pada validasi URL (HTTP 503); bukan kegagalan jaringan upstream. SSE jawaban nyata, flow ID, Langflow accessibility dari Vercel, dan Gemini fallback belum diuji.

## 14. Related Tasks

[NEXT_TASK.md](../project-management/NEXT_TASK.md), [AI_ARCHITECTURE.md](../architecture/AI_ARCHITECTURE.md), [ENVIRONMENT_VARIABLES.md](../engineering/ENVIRONMENT_VARIABLES.md).
