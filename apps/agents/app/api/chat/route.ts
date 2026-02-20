/**
 * Chat API Route - Cloudflare Pages Function
 *
 * This route handles chat requests using:
 * - Workers AI via workers-ai-provider
 * - Tool calling for blog search, CV, GitHub, analytics
 * - Streaming responses via Vercel AI SDK
 */

import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { SYSTEM_PROMPT, FAST_SYSTEM_PROMPT } from "../../../lib/agent";

// Set runtime to edge for Cloudflare Workers compatibility
export const runtime = "edge";

/**
 * POST handler for chat requests
 */
export async function POST(req: Request) {
  try {
    const { messages, mode = 'agent' } = await req.json();

    // Create Workers AI provider
    // The AI binding is automatically injected in Cloudflare Pages Functions
    const env = process.env as { CLOUDFLARE_ACCOUNT_ID?: string; CLOUDFLARE_API_KEY?: string };

    const workersai = createWorkersAI({
      accountId: env.CLOUDFLARE_ACCOUNT_ID || "",
      apiKey: env.CLOUDFLARE_API_KEY || "",
    });

    const system = mode === 'fast' ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;

    // Stream the response using Workers AI
    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system,
      messages,
      temperature: mode === 'fast' ? 0.3 : 0.7,
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
