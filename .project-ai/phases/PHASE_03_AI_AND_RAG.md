# PHASE 03 — AI and RAG

**Status:** BLOCKED — Langflow production URL gagal validasi HTTPS.

## Tujuan

Menjaga Ask SMANU, Langflow RAG, Gemini chat bubble, dan Nutrition Knowledge content.

## Kondisi awal

Kode provider dan routing ditemukan. Production POST 2026-11-12 mengembalikan HTTP 503 `LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.` Langflow dipilih tetapi route berhenti sebelum fetch. OpenAI/Gemini direct RAG dipakai hanya tanpa Langflow config; Gemini juga menjadi fallback jika OpenAI gagal. URL production perlu diperbaiki terlebih dahulu.

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
