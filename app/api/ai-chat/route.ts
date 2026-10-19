import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// POST /api/ai-chat
//
// SMANU AI Assistant — Gemini multi-turn nutrition chat.
// Completely separate from /api/nutripath (Langflow path).
// GEMINI_API_KEY is read server-side only — never reaches browser.
//
// Request body:
//   { message: string, history?: { role: "user"|"model", content: string }[] }
//
// Response (200):
//   { reply: string }
// ─────────────────────────────────────────────────────────────

// Hard server-side limits — client cannot override these
const MAX_HISTORY_TURNS = 10;    // max prior turns included in context
const MAX_USER_MSG_CHARS = 800;  // max characters per user message

const SYSTEM_INSTRUCTION = `Kamu adalah SMANU AI Assistant — asisten edukasi nutrisi untuk pelajar dan mahasiswa Indonesia.

IDENTITAS:
- Nama: SMANU AI Assistant
- Peran: Asisten edukasi nutrisi, bukan dokter atau ahli gizi klinis
- Nada: Ramah, jelas, singkat, tidak kekanak-kanakan, tidak terlalu formal

FOKUS TOPIK:
- Nutrisi pelajar sehari-hari
- Pilihan makanan berdasarkan budget dan ketersediaan
- Kebiasaan makan yang praktis
- Pemahaman dasar nutrisi (makronutrien, hidrasi, label makanan)
- Pilihan makanan di kantin sekolah/kampus

ATURAN WAJIB:
1. JANGAN membuat diagnosis medis atau klaim kesehatan klinis
2. JANGAN mengasumsikan kondisi kesehatan user yang tidak disebutkan
3. JANGAN mengarang harga makanan yang pasti — gunakan "tergantung harga kantin/warung sekitar" jika tidak yakin
4. JANGAN mengulangi pertanyaan user — langsung berikan respons yang relevan
5. JANGAN selalu menggunakan template yang sama — variasikan gaya respons
6. Gunakan konteks percakapan sebelumnya untuk menjawab pertanyaan lanjutan
7. Jika topik di luar nutrisi, jawab singkat lalu arahkan kembali ke konteks SMANU
8. Minta konteks (budget, makanan tersedia) hanya ketika memang diperlukan untuk menjawab
9. Berikan alasan singkat ketika memberi rekomendasi
10. Berikan alternatif jika pilihan utama tidak tersedia

FORMAT RESPONS:
- Jawaban pendek untuk pertanyaan sederhana (2–4 kalimat)
- Jawaban lebih detail hanya untuk pertanyaan kompleks
- Gunakan bullet point hanya jika ada beberapa item yang perlu didaftarkan
- Satu kalimat disclaimer di akhir hanya jika benar-benar diperlukan
- Respons dalam Bahasa Indonesia kecuali user menulis dalam Bahasa Inggris`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
}

export async function POST(req: NextRequest) {
  // ── 1. Server-side API key check ──────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[ai-chat] GEMINI_API_KEY is not configured");
    return Response.json(
      { error: "AI Assistant belum tersedia saat ini. Coba lagi nanti." },
      { status: 503 }
    );
  }

  // ── 2. Parse and validate request ────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  const rawMessage = (body.message ?? "").trim();
  if (!rawMessage) {
    return Response.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  // Enforce server-side limits — client values are untrusted
  const message = rawMessage.slice(0, MAX_USER_MSG_CHARS);

  // Sanitise and cap history — only allow valid role values
  const rawHistory: ChatMessage[] = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory
    .filter(
      (m) =>
        (m.role === "user" || m.role === "model") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-(MAX_HISTORY_TURNS * 2))
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 600), // truncate individual history messages
    }));

  // ── 3. Call Gemini ────────────────────────────────────────
  let reply: string;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // gemini-flash-lite-latest: stable, fast, supports AQ. keys, confirmed working
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    });

    // Convert to Gemini SDK history format
    const geminiHistory = history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    reply = result.response.text().trim();

    if (!reply) throw new Error("Empty response from Gemini");
  } catch (err) {
    // Log server-side only — never expose raw error or API key to client
    console.error("[ai-chat] Gemini error:", err instanceof Error ? err.message : String(err));
    return Response.json(
      { error: "SMANU AI Assistant sedang mengalami gangguan. Silakan coba lagi." },
      { status: 502 }
    );
  }

  return Response.json({ reply });
}
