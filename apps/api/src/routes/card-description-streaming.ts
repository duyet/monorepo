/**
 * LLM Card Description API Route
 * Unified POST endpoint for AI-generated card descriptions
 * @module routes/card-description-streaming
 */

import { Hono } from "hono";
import type { Env } from "../env.js";
import { isAuthorizedApiRequest } from "../lib/auth.js";
import {
  consumeRateLimit,
  GENERATE_RATE_LIMIT,
  secondsUntil,
} from "../lib/rate-limit.js";

const cardDescriptionRouter = new Hono<{ Bindings: Env }>();

const LLMS_TXT_URL = "https://blog.duyet.net/llms.txt";
const LLMS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CONTENT_LENGTH = 3000;

let llmsCache: { body: string; at: number } | null = null;

export function resetLlmsCacheForTests(): void {
  llmsCache = null;
}

async function getLlmsHead(): Promise<string> {
  const now = Date.now();
  if (llmsCache && now - llmsCache.at < LLMS_CACHE_TTL_MS) {
    return llmsCache.body;
  }

  const response = await fetch(LLMS_TXT_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch blog content: ${response.status}`);
  }

  const body = (await response.text()).slice(0, MAX_CONTENT_LENGTH);
  llmsCache = { body, at: now };
  return body;
}

/**
 * Cloudflare sets this at the edge; client-controlled fallbacks would allow
 * bucket rotation when the header is absent (e.g. direct workers.dev access).
 */
export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

cardDescriptionRouter.use("*", async (c, next) => {
  if (!isAuthorizedApiRequest(c.req.raw, c.env)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const limit = consumeRateLimit(
    `llm-generate:${clientIp(c.req.raw)}`,
    Date.now(),
    GENERATE_RATE_LIMIT.max,
    GENERATE_RATE_LIMIT.windowMs
  );
  if (!limit.allowed) {
    c.header("Retry-After", String(secondsUntil(limit.resetAt)));
    return c.json({ error: "Too Many Requests" }, 429);
  }

  await next();
});

/**
 * Card type detection from prompt
 */
type CardType = "blog" | "featured";

/**
 * Request body for card description generation
 */
interface CardDescriptionRequest {
  prompt: string;
}

/**
 * Detect card type from user prompt
 */
function detectCardType(prompt: string): CardType | null {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes("blog card") ||
    lowerPrompt.includes("blogcard") ||
    lowerPrompt.includes("blog description") ||
    lowerPrompt.includes("describe the blog")
  ) {
    return "blog";
  }

  if (
    lowerPrompt.includes("featured posts") ||
    lowerPrompt.includes("featured card") ||
    lowerPrompt.includes("feature posts") ||
    lowerPrompt.includes("featured description")
  ) {
    return "featured";
  }

  return null;
}

/**
 * Get system prompt for card type
 */
function getSystemPrompt(cardType: CardType): string {
  if (cardType === "blog") {
    return "You're a witty, fun assistant. Summarize this blog in 1-2 sentences that would make someone smile and want to click. Be clever but not cringe.";
  }
  return "You're a witty, fun assistant. Create a 1-2 sentence description for these featured blog posts that would make someone curious to read them. Be engaging but not over the top.";
}

/**
 * Get content for card type
 */
async function getContentForCardType(cardType: CardType): Promise<string> {
  if (cardType === "blog") {
    return getLlmsHead();
  }

  // For featured, return generic content
  return "Featured blog posts from the archive.";
}

/**
 * POST /api/llm/generate
 *
 * Endpoint for AI-generated card descriptions
 *
 * Request body:
 * - prompt: string - The user's prompt describing what card description they want
 *
 * Returns: JSON with description text
 *
 * Example:
 * POST { "prompt": "generate description for blog card" }
 * -> { "description": "A witty blog description..." }
 */
cardDescriptionRouter.post("/", async (c) => {
  try {
    const body = await c.req.json<CardDescriptionRequest>();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return c.json(
        { error: "Missing or invalid required field: prompt" },
        400
      );
    }

    // Detect card type from prompt
    const cardType = detectCardType(prompt);

    if (!cardType) {
      return c.json(
        {
          error:
            'Could not detect card type from prompt. Please mention "blog card" or "featured posts card" in your prompt.',
          supportedTypes: ["blog card", "featured posts card"],
        },
        400
      );
    }

    // Get content and system prompt
    let content = await getContentForCardType(cardType);
    const systemPrompt = getSystemPrompt(cardType);

    // Truncate content if too long (limit to ~3000 chars for context window)
    if (content.length > MAX_CONTENT_LENGTH) {
      content = `${content.substring(0, MAX_CONTENT_LENGTH)}...`;
    }

    // Call OpenRouter API directly
    const apiKey = c.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return c.json({ error: "OPENROUTER_API_KEY not configured" }, 500);
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://api.duyet.net",
        },
        body: JSON.stringify({
          model: "z-ai/glm-4.5-air:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Content to describe:\n\n${content}` },
          ],
          max_tokens: 200,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as any;

    // Handle different response formats
    let description = "";
    if (data.choices?.[0]?.message?.content) {
      description = data.choices[0].message.content;
    } else if (data.content) {
      description = data.content;
    }

    // Clean up the description (remove special tokens)
    description = description.replace(/<s>|\[OUT\]|<INS>/g, "").trim();

    // Return JSON response with description
    return c.json({
      description,
    });
  } catch (error) {
    console.error("Error generating card description:", error);

    // Return fallback on error
    return c.json(
      {
        error: "Failed to generate description",
        fallback:
          "Thoughts, experiments, and explorations in software engineering, AI, and building things for the web.",
      },
      500
    );
  }
});

export default cardDescriptionRouter;
