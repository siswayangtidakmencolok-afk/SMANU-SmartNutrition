# PHASE 03 — AI and RAG

**Status:** BLOCKED — Langflow production URL gagal validasi HTTPS.

## Tujuan

Menjaga Ask SMANU, Langflow RAG, Gemini chat bubble, dan Nutrition Knowledge content.

## Kondisi awal

Kode provider dan routing ditemukan. Production POST 2026-11-12 mengembalikan HTTP 503 `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` Langflow dipilih tetapi route berhenti sebelum fetch. OpenAI/Gemini direct RAG dipakai hanya tanpa Langflow config; Gemini juga menjadi fallback jika OpenAI gagal. URL production perlu diperbaiki terlebih dahulu.

Audit source 2026-11-12 juga mengonfirmasi tidak ada implementasi Mastra/MCP, vector dependency/embedding/index, provider benchmark, atau evaluation suite di repository. Retrieval lokal saat ini berbasis token/category; Astra/vector disebut pada copy/prompt tetapi belum dibuktikan aktif. Jangan ubah arsitektur produksi hanya untuk mengejar daftar framework.

## Ruang lingkup dan file terkait

`app/api/nutripath/route.ts`, `app/api/knowledge/route.ts`, `app/api/ai-chat/route.ts`, Ask page, AI widget, knowledge datasets.

## Dependensi

Vercel Production environment, endpoint HTTPS yang benar, Langflow flow/API key sah, egress network; jangan salin nilainya.

## Acceptance/testing

Setelah Vercel URL diperbaiki dan deployment aktif, uji request/response aktual, Flow ID/flow, parse SSE/JSON, timeout/provider errors dan UI. Jangan mengklaim provider hidup dari build.

## Risiko

Mengganti provider/fallback tanpa persetujuan, prompt/data bocor ke log, jawaban medis palsu, atau redeploy tanpa izin.

## Exit criteria

Environment Langflow Production memakai URL HTTPS yang benar; Flow ID dan koneksi diuji end-to-end di deployment sah; kontrak dan batas RAG terdokumentasi.

Untuk pekerjaan evolusi berikutnya, tambahkan acceptance terukur untuk grounding/provenance, latency/cost, privacy/data minimization, serta fallback policy. MCP/Mastra tetap optional evaluation; sebelum pilot harus ada tool allowlist, server-side authorization, timeout/quota, dan tes cross-user.
