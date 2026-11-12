# Environment Variables

**Pembaruan:** 2026-11-12<br>
Nilai rahasia sengaja tidak dicatat. Nama lokal diperiksa tanpa mencetak value.

| Nama | Fungsi/source | Catatan bukti |
|---|---|---|
| `DATABASE_URL` | Neon connection string; `lib/db/index.ts`, Drizzle config/scripts | Dibutuhkan operasi DB; hanya server/script. |
| `AUTH_SECRET` | Auth.js secret; middleware juga membacanya | Nama terdeteksi lokal; nilainya tidak diperiksa. |
| `AUTH_URL` | Nama tersedia pada `.env.local` | Tidak ditemukan pembacaan eksplisit di source yang dicari; perilaku runtime Auth.js terpasang perlu diuji. |
| `NEXTAUTH_SECRET` | Fallback secret di `middleware.ts` | Nama kompatibilitas di source; tidak terdeteksi pada nama local env saat audit. |
| `LANGFLOW_SERVER_URL` | Base URL Langflow di Ask/Knowledge API | Harus dapat dicapai server; route Ask membatasi HTTPS dan host production. |
| `LANGFLOW_API_KEY` | Header `x-api-key` server-to-server | Secret; jangan kirim ke browser atau log. |
| `LANGFLOW_FLOW_ID` | ID flow pada URL Langflow | Ask mensyaratkan jika URL/key tersedia; Knowledge memakai konfigurasi flow. |
| `OPENAI_API_KEY` | Path langsung `/api/nutripath` dengan local RAG | Dicoba jika Langflow tidak dipilih; bukan fallback saat Langflow terkonfigurasi gagal. |
| `GEMINI_API_KEY` | `/api/ai-chat`, scanner/explain, legacy RAG | Secret server-side; digunakan beberapa fitur berbeda. |
| `BLOB_READ_WRITE_TOKEN` | Dicek oleh route photo contribution | Tidak terdeteksi di nama `.env.local`; route yang diperiksa belum meng-upload gambar walau status token berubah. |
| `NODE_ENV` | Kondisi runtime auth/Langflow URL | Dikelola environment framework. |

## Audit lokal dan production

Pada audit 2026-11-12, nama yang terdeteksi di `.env.local`: `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `GEMINI_API_KEY`, `LANGFLOW_API_KEY`, `LANGFLOW_FLOW_ID`, `LANGFLOW_SERVER_URL`, `OPENAI_API_KEY`. Value tidak dibaca/dicetak.

Nama pada lokal tidak membuktikan nilai valid atau tersetel di Vercel. Production API smoke test mengembalikan `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.`, yang mengonfirmasi URL Langflow production tidak lolos pemeriksaan protokol. Vercel CLI tidak terautentikasi dan project belum di-link; nilai/env deployment tidak dapat diperiksa atau diubah dari workspace. Panduan proyek menyebut `https://api.langflow.astra.datastax.com` sebagai base URL yang dimaksud; konfirmasi endpoint sebelum pembaruan Production/Preview. Jangan memakai prefix `NEXT_PUBLIC_` untuk key, secret, token, atau connection string.
