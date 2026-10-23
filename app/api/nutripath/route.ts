import { NextRequest } from "next/server";
import { isIP } from "node:net";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import {
  retrieveRelevantChunks,
  buildKnowledgeContext,
  buildSystemPrompt,
  type UserContext,
} from "@/lib/rag-retrieval";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

// Path A — Langflow
const LANGFLOW_TIMEOUT_MS = 120_000;

// Path B — OpenAI direct API
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_TEMPERATURE = 0.3;
const OPENAI_MAX_TOKENS = 800;
const OPENAI_TIMEOUT_MS = 60_000;

// Path C — Gemini
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_TEMPERATURE = 0.35;
const GEMINI_MAX_TOKENS = 800;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Result of a single provider attempt.
 * `chunks` holds the titles of the knowledge-base entries that were
 * retrieved and injected into the prompt (used for the SSE `meta` event).
 */
type ProviderResult =
  | { ok: true; answer: string; chunks: string[] }
  | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────
// POST /api/nutripath
//
// Browser → Next.js API → provider → SSE → Browser
//
// Provider selection (the first path that answers wins):
//   A. Langflow  — used when server URL, API key, and Flow ID are set
//   B. OpenAI    — direct API, works on Vercel with only OPENAI_API_KEY
//   C. Gemini    — legacy fallback for existing deployments
//
// Every API key is read server-side only and is never sent to the browser.
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ─────────────────────────────────────────────────────────
  // 1. Parse and validate request
  // ─────────────────────────────────────────────────────────

  let body: {
    situation?: string;
    availableFoods?: string;
    budget?: string;
    question?: string;
    sessionId?: string;
    session_id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Format request tidak valid." }, 400);
  }

  const {
    situation,
    availableFoods,
    budget,
    question,
    sessionId,
    session_id,
  } = body;

  if (!question || !situation) {
    return jsonResponse(
      { error: "Missing required fields: situation and question" },
      400
    );
  }

  // Shared context object — consumed identically by every provider path
  const ctx: UserContext = {
    situation,
    availableFoods: availableFoods || undefined,
    budget: budget || undefined,
    question,
  };

  const currentSessionId = sessionId || session_id || crypto.randomUUID();

  // ─────────────────────────────────────────────────────────
  // 2. Provider availability
  // ─────────────────────────────────────────────────────────

  // Read the provider credentials. Values are trimmed so that a stray
  // whitespace-only or trailing-space env var (e.g. "KEY= " in a shell)
  // is treated as "not configured" instead of producing a malformed URL
  // or an "unauthorized" request.
  const langflowApiKey = process.env.LANGFLOW_API_KEY?.trim();
  const langflowServerUrl = process.env.LANGFLOW_SERVER_URL?.trim();
  const langflowFlowId = process.env.LANGFLOW_FLOW_ID?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (langflowApiKey && langflowServerUrl && !langflowFlowId) {
    return jsonResponse(
      { error: "LANGFLOW_FLOW_ID belum dikonfigurasi di server." },
      503
    );
  }

  const langflowConfig =
    langflowApiKey && langflowServerUrl && langflowFlowId
      ? {
          apiKey: langflowApiKey,
          serverUrl: langflowServerUrl,
          flowId: langflowFlowId,
        }
      : null;

  if (langflowConfig) {
    const configurationError = getLangflowConfigurationError(
      langflowConfig.serverUrl
    );
    if (configurationError) {
      return jsonResponse({ error: configurationError }, 503);
    }
  }

  if (!langflowConfig && !openaiApiKey && !geminiApiKey) {
    console.error(
      "[nutripath] No AI provider configured (need LANGFLOW_SERVER_URL + LANGFLOW_API_KEY, or OPENAI_API_KEY, or GEMINI_API_KEY)"
    );
    return jsonResponse(
      { error: "AI service belum dikonfigurasi di server. Hubungi administrator." },
      503
    );
  }

  // ─────────────────────────────────────────────────────────
  // 3. Path A — Langflow (primary when fully configured)
  // ─────────────────────────────────────────────────────────

  if (langflowConfig) {
    const result = await callLangflow({
      ...langflowConfig,
      ctx,
      sessionId: currentSessionId,
    });

    if (result.ok) {
      return sseResponse({
        source: "langflow",
        orchestration: "Langflow RAG",
        answer: result.answer,
        chunks: result.chunks,
        extra: { flowId: langflowFlowId, sessionId: currentSessionId },
      });
    }

    console.error("[nutripath] Langflow path failed:", result.error);
    return jsonResponse({ error: getLangflowFailureMessage(result.error) }, 502);
  }

  // ─────────────────────────────────────────────────────────
  // 4. Path B — OpenAI direct API (RAG-grounded)
  // ─────────────────────────────────────────────────────────

  if (openaiApiKey) {
    const result = await callOpenAI(ctx, openaiApiKey);

    if (result.ok) {
      return sseResponse({
        source: "openai",
        orchestration: "OpenAI + Local KB",
        answer: result.answer,
        chunks: result.chunks,
        extra: { sessionId: currentSessionId },
      });
    }

    console.error("[nutripath] OpenAI path failed:", result.error);
  }

  // ─────────────────────────────────────────────────────────
  // 5. Path C — Gemini (legacy fallback)
  // ─────────────────────────────────────────────────────────

  if (geminiApiKey) {
    const result = await callGeminiRag(ctx, geminiApiKey);

    if (result.ok) {
      return sseResponse({
        source: "gemini-rag-fallback",
        orchestration: "Gemini + Local KB",
        answer: result.answer,
        chunks: result.chunks,
        extra: { sessionId: currentSessionId },
      });
    }

    console.error("[nutripath] Gemini path failed:", result.error);
  }

  // ─────────────────────────────────────────────────────────
  // 6. Every configured provider failed
  // ─────────────────────────────────────────────────────────

  return jsonResponse(
    { error: "Maaf, SMANU AI sedang mengalami masalah. Silakan coba lagi." },
    502
  );
}

// ─────────────────────────────────────────────────────────────
// Path A — Langflow
// ─────────────────────────────────────────────────────────────

async function callLangflow(params: {
  apiKey: string;
  serverUrl: string;
  flowId: string;
  ctx: UserContext;
  sessionId: string;
}): Promise<ProviderResult> {
  const { apiKey, serverUrl, flowId, ctx, sessionId } = params;
  const langflowUrl = new URL(
    `api/v1/run/${encodeURIComponent(flowId)}`,
    `${serverUrl.replace(/\/+$/, "")}/`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LANGFLOW_TIMEOUT_MS);

  try {
    const langflowResponse = await fetch(langflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        input_value: buildLangflowInput(ctx),
        input_type: "chat",
        output_type: "chat",
        session_id: sessionId,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!langflowResponse.ok) {
      return { ok: false, error: `HTTP ${langflowResponse.status}` };
    }

    const langflowData: unknown = await langflowResponse.json();
    const answer = extractLangflowAnswer(langflowData);
    if (!answer) {
      return { ok: false, error: "ChatOutput did not contain a readable answer" };
    }

    return { ok: true, answer, chunks: [] };
  } catch (err) {
    if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
      return { ok: false, error: "timeout" };
    }

    if (err instanceof SyntaxError) {
      return { ok: false, error: "Invalid JSON response" };
    }

    const cause = err instanceof Error ? err.cause : undefined;
    const causeCode =
      typeof cause === "object" &&
      cause !== null &&
      "code" in cause &&
      typeof cause.code === "string"
        ? cause.code
        : null;
    return {
      ok: false,
      error: causeCode ? `network:${causeCode}` : "network:unknown",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getLangflowConfigurationError(serverUrl: string): string | null {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(serverUrl);
  } catch {
    return "LANGFLOW_SERVER_URL bukan URL yang valid.";
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    return "LANGFLOW_SERVER_URL harus berupa URL HTTP(S) dasar tanpa kredensial atau query.";
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsedUrl.protocol !== "https:"
  ) {
    return "LANGFLOW_SERVER_URL di production harus menggunakan HTTPS.";
  }

  if (process.env.NODE_ENV === "production" && isLocalOrPrivateHost(parsedUrl.hostname)) {
    return "LANGFLOW_SERVER_URL production tidak boleh mengarah ke localhost atau jaringan lokal. Gunakan endpoint Langflow yang dapat dijangkau publik.";
  }

  return null;
}

function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    !host.includes(".")
  ) {
    return true;
  }

  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    const [first, second] = host.split(".").map(Number);
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 100 && second >= 64 && second <= 127)
    );
  }

  if (ipVersion === 6) {
    return (
      host === "::" ||
      host === "::1" ||
      /^f[cd]/.test(host) ||
      /^fe[89ab]/.test(host) ||
      /^::ffff:(127\.|10\.|192\.168\.|169\.254\.)/.test(host)
    );
  }

  return false;
}

function getLangflowFailureMessage(error: string): string {
  if (error.startsWith("network:")) {
    return "Server Langflow tidak dapat dijangkau. Periksa URL dan pastikan server Langflow aktif.";
  }
  if (error === "timeout") {
    return "Langflow tidak merespons tepat waktu. Coba lagi beberapa saat.";
  }
  if (error === "HTTP 401" || error === "HTTP 403") {
    return "Akses Langflow ditolak. Periksa konfigurasi kunci API di server.";
  }
  if (error === "HTTP 404") {
    return "Flow Langflow tidak ditemukan. Periksa konfigurasi ID flow di server.";
  }
  if (error === "HTTP 429") {
    return "Batas permintaan Langflow tercapai. Coba lagi beberapa saat.";
  }
  if (/^HTTP 5\d\d$/.test(error)) {
    return "Server Langflow sedang mengalami gangguan. Coba lagi beberapa saat.";
  }
  if (error === "Invalid JSON response" || error === "ChatOutput did not contain a readable answer") {
    return "Langflow mengirim respons yang tidak dapat dibaca. Periksa output flow.";
  }
  return "Langflow gagal memproses pertanyaan. Periksa log server lalu coba lagi.";
}

// ─────────────────────────────────────────────────────────────
// Path B — OpenAI direct API
//
// Uses the same RAG pipeline as the other providers: retrieveRelevantChunks()
// → buildKnowledgeContext() → buildSystemPrompt(). The model is grounded in
// the local knowledge base rather than answering from general knowledge.
// ─────────────────────────────────────────────────────────────

async function callOpenAI(
  ctx: UserContext,
  apiKey: string
): Promise<ProviderResult> {
  try {
    const chunks = retrieveRelevantChunks(ctx, 5);
    const knowledgeContext = buildKnowledgeContext(chunks);
    const systemPrompt = buildSystemPrompt(ctx, knowledgeContext);

    const client = new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 1,
    });

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      max_completion_tokens: OPENAI_MAX_TOKENS,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Pertanyaan siswa: ${ctx.question}` },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) {
      return { ok: false, error: "Empty response from OpenAI" };
    }

    return {
      ok: true,
      answer,
      chunks: chunks.map((c) => c.entry.title),
    };
  } catch (err) {
    // Log server-side only — never expose raw error details to the client
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Path C — Gemini (legacy fallback)
// ─────────────────────────────────────────────────────────────

async function callGeminiRag(
  ctx: UserContext,
  apiKey: string
): Promise<ProviderResult> {
  try {
    const chunks = retrieveRelevantChunks(ctx, 5);
    const knowledgeContext = buildKnowledgeContext(chunks);
    const systemPrompt = buildSystemPrompt(ctx, knowledgeContext);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        maxOutputTokens: GEMINI_MAX_TOKENS,
      },
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Pertanyaan siswa: ${ctx.question}` },
    ]);

    const answer = result.response.text().trim();
    if (!answer) {
      return { ok: false, error: "Empty response from Gemini" };
    }

    return {
      ok: true,
      answer,
      chunks: chunks.map((c) => c.entry.title),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────────────────────

/** JSON error response with the given status code. */
function jsonResponse(payload: { error: string }, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Wrap an answer in the SSE envelope the frontend already parses:
 *   data: { type: "meta",  source, orchestration, chunks, ... }
 *   data: { type: "token", content: "<full answer>" }
 *   data: { type: "done" }
 */
function sseResponse(params: {
  source: string;
  orchestration: string;
  answer: string;
  chunks: string[];
  extra?: Record<string, unknown>;
}): Response {
  const { source, orchestration, answer, chunks, extra } = params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(ctrl) {
      try {
        // META — tell the frontend which provider answered
        ctrl.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "meta",
              source,
              orchestration,
              // chunks kosong agar frontend lama tidak crash pada .map()
              chunks,
              ...extra,
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
}

/** Gabungkan context siswa ke dalam satu pesan untuk Langflow ChatInput. */
function buildLangflowInput(ctx: UserContext): string {
  return `
Konteks siswa:
- Situasi: ${ctx.situation}
- Makanan yang tersedia: ${ctx.availableFoods || "tidak disebutkan"}
- Budget: ${ctx.budget || "tidak disebutkan"}

Pertanyaan siswa:
${ctx.question}

Jawablah pertanyaan berdasarkan knowledge base SMANU SmartNutrition yang tersedia pada RAG flow. Gunakan informasi yang ditemukan melalui retrieval Astra DB. Jika informasi yang dibutuhkan tidak tersedia dalam knowledge base, katakan dengan jelas bahwa informasi tersebut tidak ditemukan.
  `.trim();
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
