# Integrasi Eksternal

**Pembaruan:** 2026-11-12

| Integrasi | Lokasi source | Fungsi | Status bukti |
|---|---|---|---|
| Neon Postgres | `lib/db/index.ts` | Persistence melalui Neon HTTP + Drizzle | Kode terverifikasi; reachability live tidak diuji di audit ini. |
| Auth.js | `auth.ts`, `app/api/auth/` | Credentials/JWT session | Kode terverifikasi; environment production tidak dicek. |
| Langflow | `/api/nutripath`, `/api/knowledge` | Ask SMANU dan konten section knowledge | Request code terverifikasi; flow/cloud live tidak diuji. |
| OpenAI | `/api/nutripath` | Path langsung dengan retrieval lokal | Kode/config names ditemukan; request live tidak diuji. |
| Google Gemini | `/api/ai-chat`, food scanner routes, RAG fallback | Chat multi-turn, vision, explain, RAG | Kode/config names ditemukan; request live tidak diuji. |
| Vercel | `vercel.json` | Konfigurasi build/region | File ada; project, domain, env, deploy tidak diperiksa. |
| Vercel Blob | env check photo contribution | Potensi object storage | Route yang diperiksa hanya menyimpan metadata; upload tidak terbukti terimplementasi. |

## Aturan

- Semua secret digunakan server-side; jangan buat API key `NEXT_PUBLIC_*`.
- Pisahkan kredensial Auth, database, Langflow, Gemini/OpenAI, dan storage.
- Sebelum mengklaim integrasi aktif, lakukan request uji nyata dengan log tersanitasi dan izin lingkungan yang sesuai.
- Jangan menjalankan perubahan database atau deployment hanya karena konfigurasi terdeteksi.
