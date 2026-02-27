/**
 * Title Generation API — Cloudflare Pages Function
 *
 * Generates a short conversation title from the first user message + assistant reply.
 * Uses the fast model via Workers AI + AI Gateway for low latency.
 */

import { generateText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { FAST_MODEL } from "../../lib/agent";

interface Env {
  AI: Ai;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { AI } = context.env;
  if (!AI) {
    return new Response(JSON.stringify({ title: "New chat" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { userMessage, assistantMessage } = await context.request.json();

    if (!userMessage) {
      return new Response(JSON.stringify({ title: "New chat" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const workersai = createWorkersAI({ binding: AI, gateway: { id: "monorepo" } });

    const { text } = await generateText({
      model: workersai(FAST_MODEL),
      messages: [
        {
          role: "system",
          content:
            "Generate a short title (3-6 words) for this conversation. Return ONLY the title, no quotes, no punctuation at the end.",
        },
        { role: "user", content: userMessage },
        ...(assistantMessage
          ? [{ role: "assistant" as const, content: assistantMessage }]
          : []),
        {
          role: "user",
          content: "Generate a short title for the conversation above.",
        },
      ],
      temperature: 0.3,
      maxTokens: 20,
    });

    const title = text.trim().replace(/^["']|["']$/g, "").slice(0, 60) || "New chat";

    return new Response(JSON.stringify({ title }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Title API] Error:", error);
    return new Response(JSON.stringify({ title: "New chat" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
