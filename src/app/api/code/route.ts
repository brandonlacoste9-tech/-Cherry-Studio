import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getProviderForModel, PROVIDER_CONFIGS } from "@/lib/ai/providers";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are an expert frontend developer. You create React components using Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

Rules:
- Output ONLY the complete React component code, no explanations
- Use "use client" directive when needed
- Import from @/components/ui/ for shadcn components
- Use Tailwind CSS for all styling
- Make components responsive and accessible
- Use lucide-react for icons
- Export the component as default
- Include all necessary imports
- The code must be self-contained and ready to render`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, provider: providerName, apiKey, imageUrl } = await request.json();

    if (!prompt && !imageUrl) {
      return new Response(JSON.stringify({ error: "Prompt or image required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resolvedModel = model || "gpt-4.1-mini";
    const provider = providerName || getProviderForModel(resolvedModel) || "openai";

    const envMap: Record<string, string> = {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      deepseek: "DEEPSEEK_API_KEY",
      moonshot: "MOONSHOT_API_KEY",
    };

    const resolvedKey = apiKey || process.env[envMap[provider] || ""] || "";
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    const baseURL = provider === "ollama"
      ? (process.env.OLLAMA_BASE_URL || "http://localhost:11434") + "/v1"
      : config?.baseUrl;

    const client = new OpenAI({
      apiKey: resolvedKey || "ollama",
      baseURL,
    });

    type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
    const userContent: ContentPart[] = [];

    if (imageUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
      userContent.push({
        type: "text",
        text: prompt || "Convert this screenshot/design into a React component using Next.js, TypeScript, Tailwind CSS, and shadcn/ui. Make it pixel-perfect.",
      });
    } else {
      userContent.push({ type: "text", text: prompt });
    }

    const stream = await client.chat.completions.create({
      model: resolvedModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      stream: true,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
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
    console.error("Code generation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
