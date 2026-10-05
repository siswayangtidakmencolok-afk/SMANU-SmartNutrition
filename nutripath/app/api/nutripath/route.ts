import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  retrieveRelevantChunks,
  buildKnowledgeContext,
  buildSystemPrompt,
  UserContext,
} from "@/lib/rag-retrieval";

// Use Node.js runtime for better compatibility

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { situation, availableFoods, budget, question } = body;

    if (!question || !situation) {
      return new Response(JSON.stringify({ error: "Missing required fields: situation and question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userContext: UserContext = {
      situation,
      availableFoods,
      budget,
      question,
    };

    // ── RAG Step 1: Retrieve relevant knowledge chunks ──
    const retrievedChunks = retrieveRelevantChunks(userContext, 5);

    // ── RAG Step 2: Build knowledge context string ──
    const knowledgeContext = buildKnowledgeContext(retrievedChunks);

    // ── RAG Step 3: Build system prompt with context ──
    const systemPrompt = buildSystemPrompt(userContext, knowledgeContext);

    // ── RAG Step 4: Stream LLM response ──
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Demo mode: return mock structured response
      const mockResponse = buildMockResponse(userContext, retrievedChunks);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const metaPayload = JSON.stringify({
            type: "meta",
            chunks: retrievedChunks.map((c) => ({
              id: c.entry.id,
              category: c.entry.category,
              title: c.entry.title,
              matchedTerms: c.matchedTerms,
              score: Math.round(c.score * 10) / 10,
            })),
          });
          controller.enqueue(encoder.encode(`data: ${metaPayload}\n\n`));

          // Stream mock response word by word
          const words = mockResponse.split(" ");
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const chunk = JSON.stringify({ type: "token", content: words[i] + " " });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
              controller.close();
              clearInterval(interval);
            }
          }, 30);
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const openai = new OpenAI({ apiKey });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // First, send metadata about retrieved chunks
        const metaPayload = JSON.stringify({
          type: "meta",
          chunks: retrievedChunks.map((c) => ({
            id: c.entry.id,
            category: c.entry.category,
            title: c.entry.title,
            matchedTerms: c.matchedTerms,
            score: Math.round(c.score * 10) / 10,
          })),
        });
        controller.enqueue(encoder.encode(`data: ${metaPayload}\n\n`));

        // Stream the LLM response
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `My situation: ${situation}\nAvailable foods: ${availableFoods || "not specified"}\nBudget: ${budget || "not specified"}\nMy question: ${question}`,
            },
          ],
          stream: true,
          max_tokens: 1200,
          temperature: 0.4,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            const payload = JSON.stringify({ type: "token", content });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("NutriPath API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Demo mode: mock response when no OpenAI key is present
// ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildMockResponse(ctx: UserContext, chunks: any[]): string {
  const topChunk = chunks[0]?.entry;
  const foodList = ctx.availableFoods || "pilihan yang ada";
  const budget = ctx.budget ? ` dengan budget ${ctx.budget}` : "";

  return `**Main Answer**
Berdasarkan situasi kamu (${ctx.situation}) dan pilihan makanan yang tersedia (${foodList})${budget}, berikut rekomendasi yang sesuai dari knowledge base NutriPath.

Dari informasi gizi yang tersedia [Knowledge 1], pilihan terbaik adalah mengombinasikan sumber karbohidrat, protein, dan sayuran untuk membentuk piring makan yang seimbang. Ini membantu mempertahankan energi dan konsentrasi sepanjang hari sekolah.

**Why This Matters**
Menurut Pedoman Gizi Seimbang Kemenkes RI [Knowledge 1], sebuah makanan yang seimbang harus mengandung: ½ piring sayur dan buah, ¼ piring karbohidrat kompleks, dan ¼ piring protein. Kombinasi ini memastikan kamu mendapatkan energi yang stabil, bukan lonjakan gula yang cepat habis.

${topChunk ? `Informasi dari knowledge base tentang "${topChunk.title}" menunjukkan bahwa [Knowledge 2]: ${topChunk.content.substring(0, 200)}...` : ""}

**Practical Suggestion**
Dengan pilihan yang kamu sebutkan${budget}, prioritaskan: (1) Pilih sumber protein seperti telur, tahu, atau tempe — terjangkau dan bergizi tinggi. (2) Tambahkan sayuran jika tersedia, meski hanya porsi kecil. (3) Pilih air putih daripada minuman manis untuk tetap terhidrasi tanpa tambahan gula berlebih.

**What to Watch For**
- Hindari mengganti makan siang dengan jajanan gorengan saja — kandungan gizi rendah dan energi cepat habis [Knowledge 3].
- Jika mengonsumsi mie instan, tambahkan telur dan sayuran untuk meningkatkan nilai gizinya [Knowledge 2].

**Responsible AI Note**
ℹ️ Informasi ini bersifat edukatif dan bukan nasihat medis. NutriPath membantu kamu memahami prinsip gizi umum berdasarkan knowledge base yang terstruktur. Untuk kondisi kesehatan khusus atau kebutuhan gizi spesifik, konsultasikan dengan ahli gizi atau dokter yang berkualifikasi.`;
}
