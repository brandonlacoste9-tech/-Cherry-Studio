import { NextRequest } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { knowledgeDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

// Simple keyword-based retrieval (production would use vector embeddings)
function retrieveRelevantChunks(
  query: string,
  content: string,
  chunkSize: number = 1000,
  topK: number = 3
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < content.length) {
    chunks.push(content.slice(start, start + chunkSize));
    start += chunkSize - 200;
  }

  // Score chunks by keyword overlap
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const scored = chunks.map((chunk) => {
    const lowerChunk = chunk.toLowerCase();
    const score = queryWords.reduce(
      (acc, word) => acc + (lowerChunk.includes(word) ? 1 : 0),
      0
    );
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

export async function POST(request: NextRequest) {
  try {
    const { message, knowledgeBaseId, model, provider } = await request.json();

    if (!message || !knowledgeBaseId) {
      return new Response(
        JSON.stringify({ error: "Message and knowledge base ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all documents in the knowledge base
    const docs = await db
      .select({ content: knowledgeDocuments.content, name: knowledgeDocuments.name })
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.knowledgeBaseId, knowledgeBaseId));

    // Retrieve relevant chunks
    const allContent = docs.map((d) => d.content || "").join("\n\n---\n\n");
    const relevantChunks = retrieveRelevantChunks(message, allContent);

    const contextText = relevantChunks.join("\n\n---\n\n");

    const systemPrompt = `You are a helpful assistant that answers questions based on the provided documents. Use the following context to answer the user's question. If the answer is not in the context, say so.

Context from documents:
${contextText}`;

    const resolvedModel = model || "gpt-4.1-mini";
    const apiKey = process.env.OPENAI_API_KEY || "";

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: resolvedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
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
                encoder.encode(`data: ${JSON.stringify({ type: "content", content: delta })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", content: msg })}\n\n`)
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
    console.error("Knowledge chat error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
