import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

interface ChatRequest {
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: string;
  mode?: "chat" | "tldr";
}

export async function POST(request: Request) {
  try {
    const { messages = [], context: postContext, mode = "chat" } = (await request.json()) as ChatRequest;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openrouter = createOpenRouter({
      apiKey: openRouterApiKey,
    });

    let systemPrompt = "";
    if (mode === "tldr") {
      systemPrompt = `Summarize this blog post in exactly 4-5 bullet points.
Each bullet should be:
- One concise sentence (max 15 words)
- Actionable or insightful
- Start with a key takeaway

Return ONLY bullet points starting with •, no intro or outro.

POST CONTENT:
---
${postContext}
---`;
    } else {
      systemPrompt = `You are a helpful AI assistant on duyet's tech blog.
You have context about the current post the reader is viewing.
Answer questions concisely and helpfully.
Reference specific sections when relevant.
If asked about something not in the post, say so.

${postContext ? `POST CONTENT:\n---\n${postContext}\n---` : ""}`;
    }

    const result = streamText({
      model: openrouter("xiaomi/mimo-v2-flash:free"),
      system: systemPrompt,
      messages: messages.length > 0
        ? messages
        : [{ role: "user" as const, content: mode === "tldr" ? "Generate TL;DR summary" : "Hello" }],
    });

    return result.toTextStreamResponse({
      headers: {
        "X-Model": "xiaomi/mimo-v2-flash:free",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: `Internal server error: ${errorMessage}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
