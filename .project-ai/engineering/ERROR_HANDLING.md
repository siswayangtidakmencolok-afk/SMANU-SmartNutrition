# Error Handling dan Logging

**Pembaruan:** 2026-11-12

## Pola yang ditemukan

- API JSON umumnya mengembalikan `{ error }` dengan HTTP status 4xx/5xx.
- `/api/nutripath` dapat mengembalikan JSON error sebelum SSE; success stream memuat event `meta`, `token`, `done`.
- `/api/ai-chat` mengembalikan `{ reply }` atau status error JSON.
- Provider calls memiliki timeout di beberapa route; scanner/UI menampilkan error dan retry/ulang.
- Server logs memakai prefix fitur seperti `[auth]`, `[food-scanner]`, `[leaderboard]`.

## Panduan

- Pertahankan status code, kontrak SSE/JSON, dan error yang dapat dipahami user.
- Log kategori dan status/provider tanpa key, token, prompt berisi PII, atau gambar.
- Jangan diam-diam mengubah error menjadi jawaban sukses, nol, atau mock.
- Pastikan `AbortController` timeout dibersihkan, reader/stream ditangani, dan UI tidak terjebak loading pada kegagalan.
- Catch error localStorage secara diam-diam adalah pola legacy yang perlu dipertimbangkan saat menyentuh store; jangan menganggap persistence berhasil.

## Batas audit

Dokumen ini merangkum pola source, bukan hasil uji observability/log production.
