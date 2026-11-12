# Integrasi Eksternal

**Pembaruan:** 2026-11-12

| Integrasi | Lokasi source | Fungsi | Status bukti |
|---|---|---|---|
| Neon Postgres | `lib/db/index.ts` | Persistence melalui Neon HTTP + Drizzle | Kode terverifikasi; reachability live tidak diuji di audit ini. |
| Auth.js | `auth.ts`, `app/api/auth/` | Credentials/JWT session | Kode terverifikasi; environment production tidak dicek. |
| Langflow | `/api/nutripath`, `/api/knowledge` | Ask SMANU dan konten section knowledge | Request code terverifikasi; flow/cloud live tidak diuji. |
| OpenAI | `/api/nutripath` | Path langsung dengan retrieval lokal | Kode/config names ditemukan; request live tidak diuji. |
| Google Gemini | `/api/ai-chat`, food scanner routes, RAG fallback | Chat multi-turn, vision, explain, RAG | Kode/config names ditemukan; request live tidak diuji. |
| Anthropic / open-weight model | Tidak ditemukan pada manifest/runtime | Kandidat evaluasi masa depan | Tidak terintegrasi; kualitas, region, biaya, latensi dan privacy terms belum dibandingkan dengan benchmark SMANU. |
| MCP / Mastra | Tidak ditemukan pada manifest/runtime | Kandidat untuk interoperabilitas tools/workflow | Belum pernah diintegrasikan; tidak ada client/server/tool/resource yang aktif. |
| Vercel | `vercel.json` | Konfigurasi build/region | File ada; project, domain, env, deploy tidak diperiksa. |
| Vercel Blob | env check photo contribution | Potensi object storage | Route yang diperiksa hanya menyimpan metadata; upload tidak terbukti terimplementasi. |

## Aturan

- Semua secret digunakan server-side; jangan buat API key `NEXT_PUBLIC_*`.
- Pisahkan kredensial Auth, database, Langflow, Gemini/OpenAI, dan storage.
- Sebelum mengklaim integrasi aktif, lakukan request uji nyata dengan log tersanitasi dan izin lingkungan yang sesuai.
- Langflow merupakan workflow/RAG eksternal dan bukan provider model yang teridentifikasi; model/vector service di dalam flow belum diketahui.
- Evaluasi provider wajib memeriksa dokumentasi harga, batas, regional availability, dan pemrosesan data yang berlaku pada saat keputusan, lalu menguji dengan dataset yang sesuai.
- Jangan menjalankan perubahan database atau deployment hanya karena konfigurasi terdeteksi.
