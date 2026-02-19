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

// Set runtime to edge for Cloudflare Workers compatibility
export const runtime = "edge";

/**
 * POST handler for chat requests
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Create Workers AI provider
    // The AI binding is automatically injected in Cloudflare Pages Functions
    const env = process.env as { CLOUDFLARE_ACCOUNT_ID?: string; CLOUDFLARE_API_KEY?: string };

    const workersai = createWorkersAI({
      accountId: env.CLOUDFLARE_ACCOUNT_ID || "",
      apiKey: env.CLOUDFLARE_API_KEY || "",
    });

    // System prompt
    const systemPrompt = `You are Duyet's AI assistant. You can help users with:

- **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
- **CV Information** - Learn about Duyet's experience and skills
- **GitHub Activity** - See recent commits, PRs, and issues
- **Analytics** - View contact form statistics

When answering questions:
1. Use available tools to get accurate, up-to-date information
2. Always cite sources when referencing blog posts or data
3. Be helpful and conversational
4. Format sources as markdown links at the end of your response

Example response with sources:
"Based on the blog posts, here's what I found...

**Sources:**
- [Blog Post Title](https://blog.duyet.net/post-url)"`;

    // Stream the response using Workers AI
    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
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
