import { config } from "dotenv";
config({ path: ".env.local" });

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const key = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(key);

  // 1x1 transparent PNG
  const img1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=";

  const modelsToTest = ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-2.0-flash-exp"];

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.1, maxOutputTokens: 50 },
      });
      const result = await model.generateContent([
        { inlineData: { data: img1x1, mimeType: "image/png" } },
        { text: "What color is this tiny image? One word answer." },
      ]);
      const text = result.response.text().trim();
      console.log(`✅ ${modelName}: vision OK — "${text.slice(0, 60)}"`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`❌ ${modelName}: ${msg.slice(0, 120)}`);
    }
  }
}

main().catch(console.error);
