# Arsitektur AI

**Pembaruan:** 2026-11-12

## Jalur aktual yang berbeda

1. **Ask SMANU:** `app/(main)/ask-smanu/page.tsx` memanggil `/api/nutripath`. Route mencoba Langflow ketika seluruh tiga env Langflow tersedia. Jika tidak ada config Langflow, OpenAI dicoba lalu Gemini. Kesalahan pemanggilan Langflow yang sudah terpilih menghasilkan error, tidak otomatis pindah provider. Production test 2026-11-12 berhenti di HTTP 503 karena URL Langflow bukan HTTPS, sebelum provider dipanggil.
2. **AI Assistant bubble:** `components/AiChatWidget.tsx` memanggil `/api/ai-chat`, yang menggunakan Gemini chat history. Jalur ini terpisah.
3. **Nutrition Knowledge:** `/api/knowledge` menanyakan Langflow untuk topik/section yang dipetakan, dengan fallback `lib/knowledge-base.ts`.
4. **Food Scanner:** Gemini Vision memberi nama kandidat dari image; backend mencocokkan katalog lokal. Endpoint `/nutrition` memberi data referensi atau `/explain` meminta estimasi Gemini. Estimasi diberi status terpisah dari verified data.

```mermaid
flowchart TD
  Ask[Ask SMANU page] --> N[/api/nutripath]
  N -->|config lengkap| LF[Langflow run API]
  N -->|Langflow tidak dikonfigurasi| OAI[OpenAI + local retrieval]
  N -->|OpenAI tidak tersedia/gagal| GR[Gemini + local retrieval]
  Bubble[AI chat widget] --> AC[/api/ai-chat]
  AC --> GEM[Gemini multi-turn]
  Knowledge[Knowledge detail] --> K[/api/knowledge]
  K -->|configured| LF
  K -->|unavailable/error| Local[Static knowledge fallback]
  Scanner[Food Scanner] --> Vision[/api/food-scanner]
  Vision --> GEM
  Vision --> Match[Local food catalog match]
  Match --> Nutrition[/api/food-scanner/nutrition]
  Nutrition -->|not found| Explain[/api/food-scanner/explain]
  Explain --> GEM
```

## Batas RAG dan verifikasi

Retrieval lokal `lib/rag-retrieval.ts` menilai token/kategori pada KB lokal dan dipakai jalur OpenAI/Gemini pada `/api/nutripath`. Jalur Langflow mengirim gabungan konteks siswa/question dan mengharapkan response dari flow; daftar chunks lokal tidak menjadi bukti retrieval AstraDB runtime. Isi/keaktifan Langflow flow dan layanan provider harus diuji terpisah. API keys server-side saja.

## Status komponen AI — audit source 2026-11-12

| Komponen | Status source | Catatan yang belum dibuktikan |
|---|---|---|
| Langflow | Terintegrasi untuk Ask SMANU dan section Nutrition Knowledge | Flow produksi, retrieval, model di dalam flow, API key, dan akses dari Vercel belum terverifikasi. Smoke test terdahulu ke production berhenti pada validasi `LANGFLOW_SERVER_URL` (HTTP 503 sebelum upstream). |
| Gemini | Terintegrasi pada AI Assistant, Food Scanner, estimasi, dan path RAG tertentu | Model/config terlihat di source; ketersediaan, biaya, latency, retensi data, dan pembatasan akun provider belum diuji ulang. |
| OpenAI | Terintegrasi sebagai jalur langsung Ask SMANU tanpa konfigurasi Langflow | Model `gpt-4o-mini` terlihat di source; request runtime dan data handling provider belum diuji. |
| Retrieval lokal | `lib/rag-retrieval.ts` memeringkat entri knowledge lokal berbasis token/kategori | Bukan vector search. Belum ditemukan dependency embedding/vector DB atau implementasi ingest/indexing di repository. |
| Astra DB | Disebut dalam copy lama dan prompt Langflow | Tidak ada koneksi Astra langsung yang dibuktikan dalam source aktif. Astra/vektor yang mungkin digunakan di dalam flow eksternal tetap UNKNOWN. |
| Anthropic Claude / model open-weight | Tidak terintegrasi | Kandidat evaluasi, bukan provider yang tersedia di runtime. |
| MCP / Mastra | Tidak terintegrasi | Tidak ditemukan dependency atau kode MCP/Mastra. Tidak ada koneksi MCP yang boleh dianggap aktif. |

### Perbandingan provider untuk keputusan berikutnya

Ini perbandingan kualitatif untuk penyaringan arsitektur, bukan benchmark atau rekomendasi model produksi. Harga, latency, batas penggunaan, ketersediaan regional, terms pemrosesan/retensi, dan fitur model berubah; verifikasi dokumentasi resmi provider pada tanggal procurement dan jalankan benchmark dengan prompt SMANU sebelum memilih model.

| Provider/opsi | Bukti saat ini | Modalitas/tools | Kekuatan untuk dievaluasi | Biaya, latency, privasi |
|---|---|---|---|---|
| Google Gemini | Sudah dipakai chat, vision scanner, dan RAG path | Text dan image pada alur scanner; tool/function support tergantung model/API | Satu integrasi yang sudah digunakan untuk chat dan visi | Tidak ada angka terverifikasi. Periksa model-specific pricing, regional availability, data-use/retention terms, quota, serta batas multimodal. |
| OpenAI | SDK dan direct RAG route tersedia | Text pada route Ask saat ini; tool/vision support bergantung model dan perlu integrasi eksplisit | Pilihan jalur teks alternatif yang sudah ada | Tidak ada angka terverifikasi. Periksa harga, region, retention/training controls, quota dan latency aktual. |
| Anthropic Claude | Belum ada SDK atau route di manifest/source | Model tertentu mendukung tool use dan image input; belum di-wire ke aplikasi | Kandidat pembanding untuk kualitas jawaban panjang, kebijakan, dan tool reliability | Belum dievaluasi terhadap kontrak data, region, latency dan biaya SMANU. Jangan tambahkan sebelum threat/privacy review. |
| Open-weight/self-hosted | Belum ada runtime/model-serving stack di repository | Capability bergantung model dan serving stack | Kontrol deployment/data dapat lebih besar jika hosting, patching, GPU, observability, dan kapasitas dikelola sendiri | Biaya infrastruktur dan operasi belum dihitung; jangan mengasumsikan lebih murah atau lebih privat tanpa threat model. |
| Langflow | Integrasi workflow eksternal, bukan model provider | Request flow chat; kemampuan bergantung graph yang dideploy | Mempertahankan RAG/workflow yang sudah digunakan Ask | Graph, model downstream, vector store, credentials, region dan availability belum diperiksa. |

## Arsitektur evolusi yang disarankan

**Jangan migrasi provider atau menambah framework sebagai langkah awal.** Pertahankan endpoint Next.js sebagai boundary dan integrasi Langflow yang ada sampai production URL/flow dapat diuji. Secara bertahap, refactor hanya bila dibutuhkan:

1. **API gateway/policy boundary:** route server memvalidasi session/akses, ukuran dan tipe input, kuota per-user/IP, batas biaya/token, timeout, provider allowlist, dan observability tersanitasi. Identitas tidak berasal dari prompt atau argument model.
2. **Provider adapter kecil:** kontrak internal untuk provider terpilih (misalnya `generateAnswer`), metadata provider/model, cancellation/timeout, klasifikasi error, dan limit output. Jangan menyebarkan branching env/provider ke UI.
3. **RAG interface:** pertahankan local keyword retriever sebagai implementasi aktual sampai retrieval evaluation membuktikan kebutuhan hybrid/vector. RAG eksternal Langflow harus punya ingestion/versioning, metadata access boundary, evaluation set, citation/provenance, dan observability sebelum dianggap grounded.
4. **Deterministic nutrition tools:** lookup dan kalkulasi nutrisi harus mengambil sumber data/rumus server-side; model hanya menjelaskan hasil terverifikasi/estimasi dengan provenance. Jangan minta LLM menghitung ulang angka kanonik.
5. **Fallback eksplisit:** kebijakan provider per task harus ditetapkan konfigurasi server dan diuji. Hindari fallback otomatis pada auth, invalid configuration, atau jawaban yang berbeda kualitasnya; jangan mengirim seluruh konteks ke beberapa vendor sebagai percobaan.

### Pemilihan orchestrator

Untuk sistem saat ini, **Next.js route tetap menjadi gateway dan pemilik auth/business logic; Langflow tetap workflow/RAG eksternal yang sudah ada**. Belum ada dasar untuk mengadopsi Mastra, LangGraph, dan LlamaIndex sekaligus.

- Pertimbangkan **Mastra** hanya bila SMANU benar-benar memerlukan workflow agent dan/atau MCP client yang persistent, setelah pembuktian kemampuan, keamanan tool, runtime/hosting, dan overhead dependency. Status sekarang PLANNED/EVALUATION ONLY.
- Langflow menangani graph yang dideploy; tidak menggantikan otorisasi/API gateway SMANU.
- Custom retrieval saat ini cukup sederhana dan sudah ada; LlamaIndex baru dipertimbangkan bila kebutuhan ingest/evaluasi/retrieval tidak praktis dipenuhi komponen lokal.
- LangGraph tidak diadopsi bersama Mastra kecuali satu kebutuhan terukur tidak terpenuhi oleh pilihan yang ada.
- Auth, identitas, ownership, database, serta business rules tetap di backend SMANU; tidak dipindahkan ke agent/framework.

## MCP: status dan rencana batas izin

**MCP melalui Mastra belum pernah diintegrasikan.** Belum ada MCP client/server, tools, resources, connection lifecycle, maupun tool auth pada source/dependency yang diaudit. Rencana awal berupa pilot read-only; jangan menghubungkan database langsung ke model.

Kandidat tool dan batasannya:

| Tool kandidat | Sumber dan batas izin |
|---|---|
| `nutrition_lookup` | Allowlist lookup makanan; sumber + status verified/estimate wajib dikembalikan. |
| `food_comparison` | Hanya data lookup terverifikasi/estimasi yang memiliki provenance; tanpa akses seluruh DB. |
| `nutrition_calculator` | Kalkulasi deterministik dengan input/unit/rentang tervalidasi. |
| `knowledge_search` | Search terbatas pada dokumen yang disetujui; konten retrieval diperlakukan sebagai untrusted input. |
| `food_scanner_context` | Baca hanya hasil milik user yang identitasnya diberikan backend, bukan model. |
| `meal_recommendation` | Read-only dan menggunakan konteks minimum yang disetujui user. |
| `learning_progress` | Hanya data progres user pemilik sesi. |
| `nutrition_history` | Hanya data milik user pemilik sesi; field sensitif diminimalkan. |

Setiap tool nantinya memerlukan schema input/output, allowlist, timeout, quota, audit event tanpa payload sensitif, deny-by-default, dan pengujian cross-user. Tool tulis memerlukan intent/konfirmasi dan pemeriksaan ulang oleh backend. MCP server eksternal tidak boleh menerima credential database atau token sesi pengguna secara langsung.

## RAG, provenance, dan data minimization

- Jalur lokal memakai KB yang terdefinisi di source dan retrieval berbasis keyword/category; tidak ada embedding/vector index di source aktif.
- Penyebutan “Astra DB/vector retrieval” pada halaman/about lama atau prompt bukan bukti koneksi/ingestion aktif.
- Jalur Langflow mengirim pertanyaan dan konteks situasi/pangan/budget; isi graph/retrieval upstream belum diperiksa. Jangan mengklaim citation/chunks terverifikasi jika response path tidak mengembalikannya.
- Sebelum vector store dipilih: tetapkan pemilik/otoritas sumber, ingestion validation, parser/chunking, metadata/version, retrieval eval, freshness, deletion, dan access filtering.
- Data TKPI/USDA yang dipetakan harus dibedakan dari `ai_estimate`; hasil AI bukan data referensi terverifikasi. Scanner photo tidak membuktikan porsi/resep/bahan tersembunyi.
- Hanya kirim konteks yang diperlukan. Hindari identitas, riwayat kesehatan, dan histori personal ke provider kecuali dibutuhkan, disetujui, serta terms-nya diperiksa.

## Metrik dan keputusan yang belum tersedia

Belum ada benchmark source/repository untuk answer quality, groundedness, latency, cost per request, provider failure rate, retrieval precision/recall, atau quota enforcement. Tetapkan evaluation dataset sintetis/berizin dan target p95/error/cost sebelum routing multi-model atau klaim dukungan ribuan pengguna. Harga dan data-policy harus dicatat sebagai keputusan bertanggal di review deployment, bukan angka statis dalam source.
