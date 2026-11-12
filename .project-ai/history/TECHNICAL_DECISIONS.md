# Keputusan Teknis dan Observasi

**Pembaruan:** 2026-11-12

## Keputusan/kontrak yang terlihat di source

| Keputusan | Bukti | Dampak |
|---|---|---|
| Auth menggunakan JWT Credentials | `auth.ts` | Endpoint menentukan sesi dari Auth.js, bukan record session DB untuk login inti. |
| Neon diakses dengan HTTP Drizzle dan init lazy | `lib/db/index.ts` | Jangan menganggap DB siap saat build; runtime request yang memerlukan DB perlu diuji. |
| Ask SMANU punya jalur Langflow dan jalur direct RAG | `/api/nutripath/route.ts` | Langflow dipilih bila config lengkap; error Langflow terpilih tidak fallback otomatis. |
| Floating AI chat terpisah dari Ask SMANU | `AiChatWidget.tsx`, `/api/ai-chat` | Gemini chat memiliki contract/riwayat terpisah. |
| Data nutrisi membedakan rujukan dan AI estimate | Scanner route/schema/UI | Jangan satukan source yang punya tingkat keyakinan berbeda. |
| League menerima hanya server-verified activity | activity route, ledger, migration 0006 | Legacy/default unverified tidak dihitung; periksa idempotency saat perubahan. |
| Sebagian history/results tetap lokal | history/quest/challenge stores | Bukan sumber lintas perangkat atau leaderboard authoritative. |

## Ketidaksesuaian dokumentasi yang sudah ada

- Root README menyebut Next.js 15, struktur di subfolder, demo/mock mode dan OpenAI langsung sebagai aplikasi umum; root manifest/source kini menunjukkan Next 16.3.8 dan integrasi yang lebih beragam.
- `smanu-production-plan.md` adalah rencana, bukan dokumentasi keadaan implementasi.
- Beberapa komentar pada source masih menyebut path `nutripath/...` walau package root adalah repository root.

Observasi ini membantu perubahan berikutnya; tidak ada perubahan aplikasi dilakukan sebagai bagian dokumentasi ini.
