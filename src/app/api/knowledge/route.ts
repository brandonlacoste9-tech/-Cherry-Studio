import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { knowledgeBases, knowledgeDocuments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bases = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.userId, session.user.id))
      .orderBy(desc(knowledgeBases.createdAt));

    return NextResponse.json(bases);
  } catch (error) {
    console.error("Error fetching knowledge bases:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [kb] = await db
      .insert(knowledgeBases)
      .values({
        userId: session.user.id,
        name,
        description: description || null,
      })
      .returning();

    return NextResponse.json(kb, { status: 201 });
  } catch (error) {
    console.error("Error creating knowledge base:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.knowledgeBaseId, id));
    await db.delete(knowledgeBases).where(eq(knowledgeBases.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge base:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
