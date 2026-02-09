/**
 * Cloudflare Worker for Chat API
 * Handles streaming chat requests with Workers AI + AI Gateway
 */

// Cloudflare Workers AI binding type
export interface Ai {
  run(
    model: string,
    input: {
      messages: Array<{ role: string; content: string }>;
      stream: boolean;
    },
    options?: {
      gateway?: {
        id: string;
        metadata?: Record<string, string | number | boolean>;
      };
    }
  ): Response | ReadableStream | unknown;
}

export interface Env {
  AI: Ai;
  // AI Gateway name for analytics (must be configured in Cloudflare dashboard)
  AI_GATEWAY?: string;
  // AI Gateway authentication token
  AI_GATEWAY_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only handle POST requests to /chat
    const url = new URL(request.url);
    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const { messages } = await request.json();

        // System prompt
        const systemPrompt = {
          role: "system",
          content: `You are @duyetbot - a virtual version of Duyet, a data engineer and developer. You can help users with:

• **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
• **CV Information** - Learn about Duyet's experience and skills
• **GitHub Activity** - See recent commits, PRs, and issues
• **Analytics** - View contact form statistics

When answering questions:
1. Be helpful and conversational
2. Provide accurate information
3. If you don't know something, suggest visiting blog.duyet.net or github.com/duyet
4. Keep responses concise but informative`,
        };

        // Use Workers AI with streaming via AI binding + authenticated AI Gateway "monorepo"
        const gatewayName = env.AI_GATEWAY || "monorepo";
        const gatewayToken = env.AI_GATEWAY_TOKEN;
        const requestId = crypto.randomUUID();

        // Build gateway options with authentication if token is available
        const gatewayOptions: {
          id: string;
          metadata?: Record<string, string | number | boolean>;
          auth_token?: string;
        } = {
          id: gatewayName,
          metadata: {
            requestId,
            endpoint: "chat-api",
            model: "llama-3.3-70b-instruct-fp8-fast",
            messageCount: messages.length,
          },
        };

        if (gatewayToken) {
          gatewayOptions.auth_token = gatewayToken;
        }

        const aiResponse = await env.AI.run(
          "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
          {
            messages: [systemPrompt, ...messages],
            stream: true,
          },
          {
            gateway: gatewayOptions,
          },
        );

        // Create a streaming response
        const { readable, writable } = new TransformStream();

        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Handle both streaming and non-streaming responses
        if (aiResponse instanceof ReadableStream) {
          // Streaming response from AI
          const reader = aiResponse.getReader();
          const decoder = new TextDecoder();

          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  // Send [DONE] signal
                  writer.write(encoder.encode("data: [DONE]\n\n"));
                  break;
                }

                const chunk = decoder.decode(value, { stream: true });
                // Format as SSE
                const lines = chunk.split("\n").filter((line) => line.trim());
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    writer.write(encoder.encode(line + "\n\n"));
                  } else {
                    writer.write(encoder.encode("data: " + line + "\n\n"));
                  }
                }
              }
            } finally {
              writer.close();
            }
          })();
        } else {
          // Non-streaming response (fallback)
          const responseText = JSON.stringify(aiResponse);
          writer.write(encoder.encode("data: " + responseText + "\n\n"));
          writer.write(encoder.encode("data: [DONE]\n\n"));
          writer.close();
        }

        return new Response(readable, {
          headers: {
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      } catch (error) {
        console.error("Chat API error:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to process chat request",
            details: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
