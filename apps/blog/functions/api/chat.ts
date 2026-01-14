import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

interface ChatRequest {
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: string;
  mode?: "chat" | "tldr";
}

interface CloudflareContext {
  request: Request;
  env: {
    OPENROUTER_API_KEY?: string;
    CLOUDFLARE_ACCOUNT_ID?: string;
  };
}

export const onRequest = async (context: CloudflareContext) => {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages = [], context: postContext, mode = "chat" } = (await context.request.json()) as ChatRequest;

    const openRouterApiKey = context.env.OPENROUTER_API_KEY;
    const cloudflareAccountId = context.env.CLOUDFLARE_ACCOUNT_ID;

    if (!openRouterApiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create OpenRouter provider with Cloudflare AI Gateway
    const openrouter = createOpenRouter({
      apiKey: openRouterApiKey,
      // Route through Cloudflare AI Gateway for caching and analytics
      baseURL: cloudflareAccountId
        ? `https://gateway.ai.cloudflare.com/v1/${cloudflareAccountId}/monorepo/openrouter`
        : undefined,
    });

    // Build system prompt based on mode
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

    // Use AI SDK streamText with OpenRouter
    const result = streamText({
      model: openrouter("xiaomi/mimo-v2-flash:free"),
      system: systemPrompt,
      messages: messages.length > 0
        ? messages
        : [{ role: "user" as const, content: mode === "tldr" ? "Generate TL;DR summary" : "Hello" }],
    });

    // Return streaming response compatible with Cloudflare Pages
    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/x-unknown",
        "content-encoding": "identity",
        "transfer-encoding": "chunked",
        "X-Model": "xiaomi/mimo-v2-flash:free",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: `Internal server error: ${errorMessage}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
