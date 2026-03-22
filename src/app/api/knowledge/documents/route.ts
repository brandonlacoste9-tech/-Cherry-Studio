import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { knowledgeDocuments, knowledgeBases } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// Simple text chunking for RAG pipeline
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const knowledgeBaseId = formData.get("knowledgeBaseId") as string;

    if (!file || !knowledgeBaseId) {
      return NextResponse.json(
        { error: "File and knowledge base ID are required" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    const chunks = chunkText(text);

    // Create document record
    const [doc] = await db
      .insert(knowledgeDocuments)
      .values({
        knowledgeBaseId,
        name: file.name,
        type: file.type || "text/plain",
        size: file.size,
        chunks: chunks.length,
        content: text,
        status: "ready",
      })
      .returning();

    // Update document count
    await db
      .update(knowledgeBases)
      .set({
        documentCount: sql`${knowledgeBases.documentCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeBases.id, knowledgeBaseId));

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");

    if (!knowledgeBaseId) {
      return NextResponse.json({ error: "Knowledge base ID required" }, { status: 400 });
    }

    const docs = await db
      .select({
        id: knowledgeDocuments.id,
        name: knowledgeDocuments.name,
        type: knowledgeDocuments.type,
        size: knowledgeDocuments.size,
        chunks: knowledgeDocuments.chunks,
        status: knowledgeDocuments.status,
        createdAt: knowledgeDocuments.createdAt,
      })
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.knowledgeBaseId, knowledgeBaseId));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
