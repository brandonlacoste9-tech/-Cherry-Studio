import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getProviderForModel, PROVIDER_CONFIGS } from "@/lib/ai/providers";

// ============================================
// AdgenAI — Chat Completion API Route
// Supports streaming for all 5 providers via OpenAI-compatible SDK
// ============================================

export const runtime = "edge";

interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>;
  model: string;
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

function getApiKeyForProvider(provider: string, userApiKey?: string): string {
  if (userApiKey) return userApiKey;

  const envMap: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    moonshot: "MOONSHOT_API_KEY",
  };

  const key = process.env[envMap[provider] || ""];
  if (!key && provider !== "ollama") {
    throw new Error(`No API key configured for ${provider}`);
  }
  return key || "ollama";
}

function getBaseUrlForProvider(provider: string, userBaseUrl?: string): string {
  if (userBaseUrl) return userBaseUrl;

  const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  if (provider === "ollama") {
    return (process.env.OLLAMA_BASE_URL || "http://localhost:11434") + "/v1";
  }

  return config.baseUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, apiKey, baseUrl, temperature = 0.7, maxTokens } = body;

    if (!messages || !model) {
      return new Response(JSON.stringify({ error: "Messages and model are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const provider = body.provider || getProviderForModel(model) || "openai";

    let resolvedApiKey: string;
    let resolvedBaseUrl: string;

    try {
      resolvedApiKey = getApiKeyForProvider(provider, apiKey);
      resolvedBaseUrl = getBaseUrlForProvider(provider, baseUrl);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create OpenAI-compatible client
    const client = new OpenAI({
      apiKey: resolvedApiKey,
      baseURL: resolvedBaseUrl,
      ...(provider === "anthropic" && {
        defaultHeaders: {
          "anthropic-version": "2023-06-01",
          "x-api-key": resolvedApiKey,
        },
      }),
    });

    // Streaming response
    const stream = await client.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      stream: true,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
    });

    // Convert to ReadableStream for edge runtime
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
              const data = JSON.stringify({
                type: "content",
                content: delta.content,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            // Handle thinking/reasoning tokens (DeepSeek R1, etc.)
            const reasoning = (delta as Record<string, unknown>)?.reasoning_content;
            if (reasoning) {
              const data = JSON.stringify({
                type: "thinking",
                content: reasoning,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Stream error";
          const data = JSON.stringify({ type: "error", content: errMsg });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
