import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq, desc, or } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Get public agents + user's own agents
    const allAgents = userId
      ? await db
          .select()
          .from(agents)
          .where(or(eq(agents.isPublic, true), eq(agents.userId, userId)))
          .orderBy(desc(agents.createdAt))
      : await db
          .select()
          .from(agents)
          .where(eq(agents.isPublic, true))
          .orderBy(desc(agents.createdAt));

    return NextResponse.json(allAgents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, systemPrompt, model, provider, avatar, tools, isPublic } = body;

    if (!name || !systemPrompt || !model || !provider) {
      return NextResponse.json(
        { error: "Name, system prompt, model, and provider are required" },
        { status: 400 }
      );
    }

    const [agent] = await db
      .insert(agents)
      .values({
        userId: session.user.id,
        name,
        description: description || "",
        systemPrompt,
        model,
        provider,
        avatar,
        tools: tools || [],
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
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
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
    }

    await db.delete(agents).where(eq(agents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
