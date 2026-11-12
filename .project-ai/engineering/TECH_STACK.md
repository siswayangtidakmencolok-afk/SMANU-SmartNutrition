# Tech Stack

**Pembaruan:** 2026-11-12<br>
Versi berikut diambil dari root `package.json`, bukan perkiraan.

| Komponen | Versi/teknologi |
|---|---|
| Runtime framework | Next.js `16.3.8`, App Router |
| UI | React/React DOM `19.2.8` |
| Bahasa | TypeScript `^5`, strict mode |
| CSS | Tailwind CSS `^4`, `@tailwindcss/postcss` |
| Lint | ESLint `^9`, `eslint-config-next` `16.3.8` |
| Auth | `next-auth` `^5.0.0-beta.32`, Credentials, JWT |
| ORM/database | Drizzle ORM `^0.45.4`, Neon serverless `^1.2.0`, PostgreSQL |
| AI SDK | `@google/generative-ai` `^0.24.1`, OpenAI `^7.28.0` |
| Utilities | `bcryptjs`, `clsx`, `lucide-react`, dotenv |
| Hosting config | Vercel config; actual deployment UNKNOWN |

Script package: `dev`, `build`, `start`, `lint`. Tidak ada `test` script pada manifest yang diperiksa. Dependensi production tidak sama dengan bukti provider/account aktif.
