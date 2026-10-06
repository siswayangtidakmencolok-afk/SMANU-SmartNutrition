import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// Langflow configuration
// ─────────────────────────────────────────────────────────────

// Selalu set LANGFLOW_SERVER_URL di .env.local
// Default: localhost — tapi perilaku resolve IPv4/IPv6 tergantung sistem
const LANGFLOW_SERVER_URL =
  process.env.LANGFLOW_SERVER_URL || "http://localhost:7860";

const LANGFLOW_FLOW_ID =
  process.env.LANGFLOW_FLOW_ID ||
  "1a3246ec-c6c7-44d5-9509-66a623466633";

// ─────────────────────────────────────────────────────────────
// POST /api/nutripath
//
// Browser → Next.js API → Langflow → Astra DB RAG → LLM → Browser
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      situation,
      availableFoods,
      budget,
      question,
      sessionId,
      session_id,
    } = body;

    // ─────────────────────────────────────────────────────────
    // Validate request
    // ─────────────────────────────────────────────────────────

    if (!question || !situation) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: situation and question",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Validate Langflow API key
    // ─────────────────────────────────────────────────────────

    const apiKey = process.env.LANGFLOW_API_KEY;

    if (!apiKey) {
      console.error("LANGFLOW_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          error: "LANGFLOW_API_KEY belum dikonfigurasi di environment server.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Session ID
    // ─────────────────────────────────────────────────────────

    const currentSessionId = sessionId || session_id || crypto.randomUUID();

    // ─────────────────────────────────────────────────────────
    // Build input_value — gabungkan context siswa ke dalam
    // satu pesan untuk Langflow ChatInput
    // ─────────────────────────────────────────────────────────

    const inputValue = `
Konteks siswa:
- Situasi: ${situation}
- Makanan yang tersedia: ${availableFoods || "tidak disebutkan"}
- Budget: ${budget || "tidak disebutkan"}

Pertanyaan siswa:
${question}

Jawablah pertanyaan berdasarkan knowledge base SMANU SmartNutrition yang tersedia pada RAG flow. Gunakan informasi yang ditemukan melalui retrieval Astra DB. Jika informasi yang dibutuhkan tidak tersedia dalam knowledge base, katakan dengan jelas bahwa informasi tersebut tidak ditemukan.
`.trim();

    // ─────────────────────────────────────────────────────────
    // Langflow endpoint
    // ─────────────────────────────────────────────────────────

    const langflowUrl = `${LANGFLOW_SERVER_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;

    console.log("────────────────────────────────────────────");
    console.log("SMANU → Langflow");
    console.log("URL:", langflowUrl);
    console.log("Flow ID:", LANGFLOW_FLOW_ID);
    console.log("Session:", currentSessionId);
    console.log("Situation:", situation, "| Budget:", budget);
    console.log("────────────────────────────────────────────");

    // ─────────────────────────────────────────────────────────
    // Call Langflow
    // ─────────────────────────────────────────────────────────

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    let langflowResponse: Response;

    try {
      langflowResponse = await fetch(langflowUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          input_value: inputValue,
          input_type: "chat",
          output_type: "chat",
          session_id: currentSessionId,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    // ─────────────────────────────────────────────────────────
    // Handle Langflow HTTP error
    // ─────────────────────────────────────────────────────────

    if (!langflowResponse.ok) {
      const errorText = await langflowResponse.text();
      console.error("Langflow HTTP error:", {
        status: langflowResponse.status,
        body: errorText,
      });
      return new Response(
        JSON.stringify({
          error: "Langflow gagal memproses pertanyaan.",
          status: langflowResponse.status,
          details: errorText,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Parse Langflow response
    // ─────────────────────────────────────────────────────────

    const langflowData = await langflowResponse.json();
    const answer = extractLangflowAnswer(langflowData);

    if (!answer) {
      console.error(
        "Tidak menemukan text jawaban di response Langflow:",
        JSON.stringify(langflowData, null, 2)
      );
      return new Response(
        JSON.stringify({
          error:
            "Langflow berhasil dipanggil, tetapi ChatOutput tidak mengandung jawaban yang dapat dibaca.",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ─────────────────────────────────────────────────────────
    // Stream SSE response ke frontend
    //
    // Protocol:
    //   data: { type: "meta", source: "langflow", chunks: [], sessionId }
    //   data: { type: "token", content: "<full answer>" }
    //   data: { type: "done" }
    // ─────────────────────────────────────────────────────────

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(ctrl) {
        try {
          // META — beri tahu frontend bahwa ini dari Langflow
          ctrl.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "meta",
                source: "langflow",
                orchestration: "Langflow RAG",
                flowId: LANGFLOW_FLOW_ID,
                sessionId: currentSessionId,
                // chunks kosong agar frontend lama tidak crash pada .map()
                chunks: [],
              })}\n\n`
            )
          );

          // TOKEN — kirim full answer
          ctrl.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "token", content: answer })}\n\n`
            )
          );

          // DONE
          ctrl.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );

          ctrl.close();
        } catch (streamError) {
          console.error("SSE stream error:", streamError);
          ctrl.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    // Log detail error di server untuk debugging
    console.error("SMANU Langflow API error:", error);

    // Tentukan pesan yang tepat berdasarkan jenis error
    let userMessage = "Tidak dapat terhubung ke SMANU AI. Silakan coba lagi.";

    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
        userMessage = "Tidak dapat terhubung ke Langflow. Pastikan Langflow Desktop sedang berjalan.";
      } else if (error.message.includes("ABORT_ERR") || error.message.includes("aborted")) {
        userMessage = "Permintaan melebihi batas waktu. Silakan coba lagi.";
      } else if (error.message.includes("LANGFLOW_API_KEY")) {
        userMessage = "Konfigurasi server belum lengkap. Hubungi administrator.";
      }
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Extract answer text from Langflow /api/v1/run/{flow_id} response
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLangflowAnswer(data: any): string {
  // Format utama Langflow v1.12
  const candidates = [
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text,
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.content,
    data?.outputs?.[0]?.outputs?.[0]?.results?.text,
    data?.outputs?.[0]?.outputs?.[0]?.message?.text,
    data?.outputs?.[0]?.outputs?.[0]?.message?.content,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  // Fallback recursive search jika struktur berubah
  return findTextRecursively(data) || "";
}

function findTextRecursively(value: unknown, depth = 0): string {
  if (depth > 8) return "";

  if (typeof value === "string") {
    const text = value.trim();
    return text.length > 20 ? text : "";
  }

  if (!value || typeof value !== "object") return "";

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTextRecursively(item, depth + 1);
      if (found) return found;
    }
    return "";
  }

  const obj = value as Record<string, unknown>;

  // Prioritaskan field yang biasanya mengandung output Langflow
  for (const key of ["text", "content", "message"]) {
    if (key in obj) {
      const found = findTextRecursively(obj[key], depth + 1);
      if (found) return found;
    }
  }

  for (const key of Object.keys(obj)) {
    const found = findTextRecursively(obj[key], depth + 1);
    if (found) return found;
  }

  return "";
}
