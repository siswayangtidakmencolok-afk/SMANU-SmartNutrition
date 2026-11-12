# Keamanan dan Privasi

**Pembaruan:** 2026-11-12

## Kontrol yang tampak pada source

- Password registration di-hash bcrypt; hash dikecualikan dari response profile.
- Auth.js memakai JWT dan credentials. Route user-specific mengambil session di server.
- Activity API menghitung ulang skor quest/challenge dan memeriksa ownership scan; idempotency key dan ledger verified mencegah duplikasi normal.
- Admin ML stats mengecek role dari tabel users dan membatasi field scan yang dipulangkan.
- Food recognition memiliki batas tipe dan ukuran gambar; source menyatakan gambar diproses in-memory.
- Secret provider dibaca via env server-side; tidak diletakkan di bundle client.
- Foto kontribusi mewajibkan auth dan consent di route.

## Batas dan hal yang harus diverifikasi

- Middleware hanya matcher `/login` dan `/register`; authorization tetap harus ditegakkan tiap API.
- Belum ada audit penetrasi atau pengujian production pada pekerjaan dokumentasi.
- Route photo contribution yang diperiksa menyimpan metadata, bukan bytes gambar. Jangan klaim object storage aman/aktif hanya dari nama environment.
- Log/error harus disanitasi: jangan mencatat key, token, connection string, gambar, password, atau payload pribadi.
- Nilai environment lokal tidak ditampilkan dalam audit dan tidak boleh didokumentasikan.
- Data nutrisi hasil AI adalah estimate; jangan menampilkan sebagai nilai klinis terverifikasi.

Laporan ini ringkasan kontrol source, bukan security review penuh. Lihat [AUTHENTICATION.md](../modules/AUTHENTICATION.md), [FOOD_SCANNER.md](../modules/FOOD_SCANNER.md), dan [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

## Audit source dan risiko tindak lanjut (2026-11-12)

Audit ini membaca source/config yang ada; bukan penetration test, dependency vulnerability scan, atau audit Vercel/Neon. Prioritas di bawah adalah urutan kerja, bukan jaminan eksploitabilitas. Jangan melakukan pengujian terhadap production tanpa otorisasi dan test plan.

| Prioritas | Area dan bukti source | Risiko | Tindak lanjut defensif |
|---|---|---|---|
| P1 | Public paid-model routes: `/api/nutripath`, `/api/ai-chat`, `/api/food-scanner`, `/api/food-scanner/explain`, `/api/knowledge`; tidak tampak quota/rate limiter bersama pada source yang diaudit. | Resource/cost exhaustion dan abuse provider. | Tambahkan batas per IP dan akun saat autentikasi tersedia, request/token/image quotas, batas concurrency, provider budget alert, serta response `429`; uji guest abuse secara terisolasi. |
| P1 | `/api/nutripath` menerima input context/question tanpa panjang maksimum yang terlihat sebelum dikirim ke provider. `/api/ai-chat` membatasi karakter pesan dan jumlah turn sesudah JSON diparse. Scanner mengecek batas 4 MiB setelah `req.json()`. | Parsing body besar, token cost, memory/time pressure; batas setelah parsing bukan batas transport/body. | Terapkan request-body limit pada ingress/route sebelum parse, schema + max lengths + enum allowlist, jumlah/ukuran history limit, output/token ceiling, timeout konsisten, dan quota. |
| P1 | `/api/food-scanner/photo-contribute` mengautentikasi user dan meminta consent, tetapi source tidak memperlihatkan pemeriksaan bahwa `scanLogId` dimiliki user sebelum menghubungkan contribution. | Relasi lintas akun/BOLA dan consent/data association yang tidak sesuai pemilik. | Sebelum menyimpan, validasi scan record ada dan `foodScanLogs.userId === session.user.id`; buat query ownership atomik serta tes user A tidak dapat mengaitkan scan user B. |
| P1 | `/api/auth/register` membalas conflict berbeda untuk email dan username; source register dan Credentials login tidak menunjukkan rate limiting. | Account enumeration, brute-force, spam registrasi, dan biaya hashing/DB. | Rate limit register dan login, respons konflik yang tidak membuka identifier bila threat model menghendaki, monitoring abuse, dan kebijakan password yang sesuai pengguna muda; pertahankan generic login response. |
| P1 | `/api/food-scanner/save` memakai session owner, tetapi menerima nilai nutrition, provenance, model, candidates dan explanation dari browser sebagai snapshot. | Integritas data/provenance: client dapat mengirim nilai yang tidak cocok dengan hasil server/model. | Hitung ulang atau verifikasi field kritis server-side; validasi schema dan nilai finite/rentang, `dataStatus` enum, relationship food ownership/validity, dan batas ukuran JSON fields. |
| P1 | Endpoint public Langflow memakai URL dari environment dan memanggil server dari backend; validasi production menolak non-HTTPS dan literal local/private host. | SSRF/egress risk bila environment atau DNS/provider boundary salah konfigurasi. | Tetapkan host allowlist sesuai penyedia/tenant, validasi DNS/IP hasil resolusi dan redirect policy, batasi egress di platform bila tersedia; jangan menerima URL upstream dari pengguna. |
| P2 | `middleware.ts` memakai `AUTH_SECRET ?? NEXTAUTH_SECRET ?? ""`; middleware hanya redirect pada halaman login/register. Auth.js config memakai default secret resolution. | Secret kosong/tidak konsisten dapat membuat perilaku JWT berbeda; middleware tidak merupakan authorization boundary untuk API. | Fail closed pada deployment tanpa secret kuat yang konsisten; pastikan Auth.js dan middleware memakai konfigurasi yang sama; protected handler tetap wajib `auth()` dan ownership checks. Jangan hardcode atau mengganti secret aktif tanpa prosedur rotasi. |
| P2 | Route mutasi aplikasi yang memakai Auth.js session cookie tidak menunjukkan validasi Origin/CSRF khusus yang konsisten pada source review; Auth.js protocol routes memiliki mekanisme CSRF sendiri. | Perlindungan CSRF pada endpoint mutasi custom belum terverifikasi; status session cookie saja bukan bukti semua write route aman. | Inventarisasi metode mutasi dan browser origin; uji proteksi CSRF pada preview. Tambah token/Origin checks sesuai threat model tanpa menonaktifkan mekanisme Auth.js. |
| P2 | Tidak ditemukan schema-validation package seperti Zod pada manifest; beberapa route melakukan pemeriksaan manual/cast body. | Perbedaan validasi, type confusion, field yang tidak dikenal/oversized, dan perilaku error tidak konsisten. | Terapkan schema validation terpusat per kontrak endpoint dan tolak unknown/invalid fields dengan error generik yang jelas. |
| P2 | `next.config.ts` hanya mengatur remote image host; tidak ada header keamanan yang terlihat pada konfigurasi repository. | CSP, frame, MIME sniffing, referrer, dan transport policy belum dapat dibuktikan dari repository. | Tinjau header di Next/Vercel berdasarkan kebutuhan UI; test report-only CSP sebelum enforcement dan verifikasi header melalui preview. |
| P2 | Tidak ditemukan CI workflow di `.github/workflows` dan `package.json` tidak memiliki test runner/script. | Perubahan dapat masuk tanpa regression/security checks otomatis. | Tambah CI lint/typecheck/build/unit contract; pisahkan test DB/provider memakai sandbox/mock resmi, bukan production credential. |
| P2 | Admin ML stats membatasi role lewat query DB dan menghilangkan user ID dari scan output, tetapi menyajikan nama makanan/porsi dan aggregate data. | Kebocoran data agregat atau perubahan asumsi privasi melalui admin UI/log. | Batasi role admin melalui proses operasional, minimalkan field, catat akses tanpa payload sensitif, dan definisikan retensi/audit. |
| P2 | Neon memakai serverless HTTP client + Drizzle; migrasi/schema memperlihatkan FK/index untuk sebagian relasi. Tidak tampak kebijakan RLS atau pembagian DB role pada source/migrations yang diperiksa. | Perlindungan terhadap kesalahan query bergantung pada scope aplikasi dan privilege connection. | Verifikasi role DB least-privilege dan backup/restore pada console dengan izin; pertimbangkan RLS hanya setelah rencana kompatibilitas Neon/driver dan test ownership. |

### Kontrol yang terbukti dan batas klaim

- Query Drizzle membatasi parameter lewat ORM; raw SQL yang tampak pada leaderboard menggunakan interpolasi `sql` bertipe, tetapi semua query baru tetap harus direview.
- Profile/scan/history dan learning endpoints mengambil user ID dari sesi server serta sebagian besar query user-scoped. Ini bukti pola source, bukan pengujian menyeluruh BOLA.
- Activity API menghitung ulang aktivitas server-side dan memakai idempotency ledger untuk jenis aktivitas yang didukung; race/concurrency tests belum ditemukan.
- Food recognition menolak MIME yang tidak diizinkan, membatasi perkiraan image payload menjadi 4 MiB dan tidak menyimpan bytes pada route pengenalan; batas request ingress sebelum parse tetap belum terlihat.
- `photo-contribute` hanya menulis metadata pada source saat ini. Kehadiran `BLOB_READ_WRITE_TOKEN` mengubah flag/message, tetapi tidak membuktikan bytes foto diunggah atau storage berjalan.
- Provider keys dan database URL dibaca server-side. Nilai lokal/production tidak dibuka atau dicatat dalam dokumen.
- Tidak ada bukti source tentang penghapusan akun end-to-end, user data retention schedule, backup restore test, incident response, atau peninjauan akses production. Statusnya UNKNOWN, bukan dianggap aman/aktif.

## Minimum security baseline sebelum ekspansi

1. Tutup P1 ownership, untrusted input/body size, dan provider quota; uji lewat automated tests pada test environment.
2. Pastikan secrets dan DB credentials berbeda per environment, disimpan di secret manager/platform, least privilege, dan ada prosedur rotasi/revokasi.
3. Terapkan endpoint inventory/auth matrix di [API_ARCHITECTURE.md](../architecture/API_ARCHITECTURE.md); setiap perubahan route harus menguji guest, owner, other-user, dan admin cases.
4. Tambahkan dependency and static checks ke CI dengan proses triage; hasil audit dependency belum dijalankan pada sesi ini.
5. Tetapkan audit event, redaction, alerting, retention, incident response, backup/restore dan target RPO/RTO sebelum menyebut production-ready.
6. Untuk AI, ikuti allowlist/data-minimization pada [AI_ARCHITECTURE.md](../architecture/AI_ARCHITECTURE.md); jangan berikan akses database langsung kepada model atau MCP server.

## Referensi standar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — kategori risiko aplikasi web; gunakan versi yang ditetapkan organisasi saat review.
- [OWASP ASVS 5.0.0](https://asvs.owasp.org/) — persyaratan verifikasi teknis, rilis stabil yang tercantum pada situs resmi saat audit.
- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) — terutama BOLA, broken authentication, property/function authorization, resource consumption, misconfiguration, inventory, dan unsafe API consumption.
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework) — GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER sebagai kerangka program risiko, bukan sertifikasi.
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25) — hanya relevan jika MCP dipilih; threat model tool/consent/credential boundary wajib dibuat sebelum pilot.
