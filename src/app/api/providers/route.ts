import { NextResponse } from "next/server";
import { AI_MODELS, PROVIDER_CONFIGS } from "@/lib/ai/providers";

export async function GET() {
  const providers = Object.entries(PROVIDER_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name,
    baseUrl: config.baseUrl,
    models: AI_MODELS.filter((m) => m.provider === id),
    hasKey: id === "ollama" ? true : !!process.env[
      {
        openai: "OPENAI_API_KEY",
        anthropic: "ANTHROPIC_API_KEY",
        deepseek: "DEEPSEEK_API_KEY",
        moonshot: "MOONSHOT_API_KEY",
      }[id] || ""
    ],
  }));

  return NextResponse.json(providers);
}
