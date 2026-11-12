# Arsitektur Sistem

**Pembaruan:** 2026-11-12

## Ringkasan aktual

Satu aplikasi Next.js App Router pada root repository menyajikan UI React, route API server, auth, dan akses Neon. Integrasi model berjalan dari route server-side; API key tidak dimaksudkan dikirim browser. Provider eksternal dianggap PARTIALLY VERIFIED sampai smoke test runtime.

```mermaid
flowchart LR
  Browser[Browser: App Router UI]
  Next[Next.js 16 server]
  Auth[Auth.js v5 JWT]
  DB[(Neon Postgres via Drizzle)]
  LF[Langflow]
  OAI[OpenAI API]
  GEM[Gemini API]
  Browser --> Next
  Next --> Auth
  Next --> DB
  Next --> LF
  Next --> OAI
  Next --> GEM
```

## Batas runtime

- UI utama: `app/(main)/`; autentikasi: `app/(auth)/`.
- Handler server: `app/api/**/route.ts`. Middleware hanya memeriksa halaman `/login` dan `/register`; bukan middleware proteksi umum.
- Neon adapter berada di `lib/db/index.ts`; URL dibaca server-side dari `DATABASE_URL`.
- `/api/nutripath` menjalankan Langflow jika konfigurasi Langflow lengkap. Tanpa Langflow config, OpenAI dicoba sebelum Gemini. Jika Langflow config ada namun panggilan gagal, route merespons error alih-alih beralih ke provider lain.
- `/api/ai-chat` adalah Gemini multi-turn terpisah.

## Yang belum dapat dipastikan

Aktivasi provider, status flow Langflow Cloud, deployment Vercel, data aktual production, dan konfigurasi runtime tidak dibuktikan oleh file konfigurasi saja. Lihat [INTEGRATIONS.md](INTEGRATIONS.md) dan [PROJECT_STATUS.md](../PROJECT_STATUS.md).

## Jalur scale dan kontrol lintas komponen

Untuk pertumbuhan, pertahankan Next.js sebagai boundary untuk autentikasi, validasi, ownership, kuota, dan routing provider; model/flow tidak menjadi pemilik identitas atau business rules. Gunakan Neon melalui query yang terukur, user-scoped dan bounded. Tambahkan cache, queue, vector store, atau service terpisah hanya bila workload dan benchmark membuktikannya.

Belum ada bukti load-test hingga ribuan pengguna, target p95/error/cost, shared API rate limit, backup restore drill, atau provider budget monitoring. Dengan demikian skalabilitas target tetap UNKNOWN; deployment serverless dan database terkelola saja tidak membuktikan kapasitas. Temuan source review security ada di [SECURITY.md](../engineering/SECURITY.md), dan langkah validasinya ada di [ROADMAP.md](../project-management/ROADMAP.md).
