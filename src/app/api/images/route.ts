import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, size, quality, style, n } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const response = await client.images.generate({
      model: model || "dall-e-3",
      prompt,
      n: n || 1,
      size: size || "1024x1024",
      quality: quality || "standard",
      style: style || "vivid",
    });

    const images = response.data.map((img) => ({
      url: img.url,
      revisedPrompt: img.revised_prompt,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
