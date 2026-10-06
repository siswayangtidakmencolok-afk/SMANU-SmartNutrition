import { NextRequest } from "next/server";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// Langflow configuration
// ─────────────────────────────────────────────────────────────

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
      // Log only on server — never expose to client
      console.error("[nutripath] LANGFLOW_API_KEY is not set in environment");
      return new Response(
        JSON.stringify({
          error: "AI service belum dikonfigurasi di server. Hubungi administrator.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate that LANGFLOW_SERVER_URL is set and is not a localhost URL
    // when running on a hosted environment (Vercel / production)
    const serverUrl = process.env.LANGFLOW_SERVER_URL;
    if (!serverUrl) {
      console.error("[nutripath] LANGFLOW_SERVER_URL is not set in environment");
      return new Response(
        JSON.stringify({
          error: "AI service belum dikonfigurasi di server. Hubungi administrator.",
        }),
        {
          status: 503,
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

    const langflowUrl = `${serverUrl}/api/v1/run/${LANGFLOW_FLOW_ID}`;

    // Log non-secret diagnostic info only (no API key, no URL with embedded credentials)
    console.log("[nutripath] request →", LANGFLOW_FLOW_ID, "| session:", currentSessionId, "| situation:", situation);

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
      // Log status on server only — never forward raw Langflow body to client
      // (it may contain internal credentials, headers, or token details)
      console.error("[nutripath] Langflow HTTP error:", langflowResponse.status);
      return new Response(
        JSON.stringify({
          error: "Maaf, SMANU AI sedang mengalami masalah. Silakan coba lagi.",
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
