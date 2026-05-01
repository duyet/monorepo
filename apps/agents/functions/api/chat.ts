/**
 * Chat API — Cloudflare Pages Function
 *
 * Handles streaming chat with tool calling via AI SDK v6.
 * Supports both new messages and tool approval continuation flows.
 *
 * Provider: Cloudflare Workers AI via AI Gateway
 */

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { z } from "zod";
import { getCapabilities } from "../../lib/ai/models";
import {
  buildSystemPrompt,
  FAST_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
} from "../../lib/ai/prompts";
import { getLanguageModel } from "../../lib/ai/providers";
import { getClientIp, getUserFromRequest, hashIp } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";
import { AGENT_SKILLS } from "../../lib/skills-data";
import {
  fetchLlmsTxt,
  getAboutTool,
  getAnalyticsTool,
  getBlogPostTool,
  getCVTool,
  getGitHubTool,
  searchBlogTool,
} from "../../lib/tools";

/** Rate limit for unauthenticated users: max messages per 24h window */
const ANON_RATE_LIMIT = 10;

// ─── Zod Request Schema ─────────────────────────────────────────────

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.literal("file"),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

const userMessageSchema = z.object({
  id: z.string(),
  role: z.literal("user"),
  parts: z.array(partSchema),
});

const toolApprovalMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.any()),
});

const postRequestBodySchema = z.object({
  id: z.string().optional(),
  message: userMessageSchema.optional(),
  messages: z.array(toolApprovalMessageSchema).optional(),
  selectedChatModel: z.string().optional(),
  // Keep backward compatibility with legacy fields
  mode: z.string().optional(),
  modelId: z.string().optional(),
  conversationId: z.string().optional(),
  settings: z
    .object({
      customInstructions: z.string().optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

type PostRequestBody = z.infer<typeof postRequestBodySchema>;

// ─── Tool Definitions ───────────────────────────────────────────────

const AGENT_TOOLS = {
  searchBlog: tool({
    description:
      "Search Duyet's blog (296+ posts) by topic, technology, or keywords. Returns matching posts with titles, URLs, and snippets.",
    parameters: z.object({
      query: z
        .string()
        .describe("Search query - topic, keyword, or technology name"),
    }),
    execute: async ({ query }) => {
      const { results } = await searchBlogTool(query);
      return results;
    },
  }),
  getBlogPost: tool({
    description:
      "Fetch the full content of a specific blog post. Use after searchBlog when user wants detailed information. Requires the full URL.",
    parameters: z.object({
      url: z
        .string()
        .describe(
          "Full URL of the blog post (e.g., https://blog.duyet.net/posts/...)"
        ),
    }),
    execute: async ({ url }) => {
      const { content } = await getBlogPostTool(url);
      return content;
    },
  }),
  getCV: tool({
    description:
      "Retrieve Duyet's CV/Resume information. Choose 'summary' for quick overview, 'detailed' for full info.",
    parameters: z.object({
      format: z
        .enum(["summary", "detailed"])
        .optional()
        .describe("Format: 'summary' or 'detailed'"),
    }),
    execute: async ({ format = "summary" }) => {
      const { content } = await getCVTool(format);
      return content;
    },
  }),
  getGitHub: tool({
    description:
      "Fetch recent GitHub activity including commits, PRs, issues. Requires user approval.",
    parameters: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of recent activities (1-20, default 5)"),
    }),
    execute: async ({ limit = 5 }) => {
      const { activity } = await getGitHubTool(limit);
      return activity;
    },
  }),
  getAnalytics: tool({
    description:
      "Get contact form analytics and reports. Requires user approval. Reports: summary, purpose_breakdown, daily_trends, recent_activity.",
    parameters: z.object({
      reportType: z
        .enum([
          "summary",
          "purpose_breakdown",
          "daily_trends",
          "recent_activity",
        ])
        .optional()
        .describe("Report type (default: summary)"),
    }),
    execute: async ({ reportType = "summary" }) => {
      const { analytics } = await getAnalyticsTool(reportType);
      return analytics;
    },
  }),
  getAbout: tool({
    description:
      "Get general background information about Duyet - who he is, expertise areas.",
    parameters: z.object({}),
    execute: async () => {
      const { about } = await getAboutTool();
      return about;
    },
  }),
  fetchLlmsTxt: tool({
    description:
      "Fetch the llms.txt file from any duyet.net domain for AI-readable documentation.",
    parameters: z.object({
      domain: z
        .string()
        .describe(
          "Domain key (home, blog, insights, llmTimeline, cv, photos, homelab) or full URL"
        ),
    }),
    execute: async ({ domain }) => {
      const { content } = await fetchLlmsTxt(domain);
      return content;
    },
  }),
};

// ─── Env Types ──────────────────────────────────────────────────────

interface Env {
  AI?: Ai;
  DB?: D1Database;
  CLERK_ISSUER_URL?: string;
  AI_GATEWAY?: string;
  CF_AIG_GATEWAY_ID?: string;
  CF_AIG_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  RATE_LIMIT_PEPPER?: string;
}

// ─── POST Handler ───────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB, RATE_LIMIT_PEPPER } = context.env;

  try {
    // Parse and validate request body with Zod schema
    let requestBody: PostRequestBody;
    try {
      const raw = await context.request.json();
      requestBody = postRequestBodySchema.parse(raw);
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
      id,
      message,
      messages,
      selectedChatModel,
      mode,
      modelId: legacyModelId,
      conversationId: legacyConversationId,
      settings,
    } = requestBody;

    // Resolve model ID: prefer new field, fall back to legacy
    const chatModelId = selectedChatModel || legacyModelId || "openrouter/free";
    // Resolve conversation ID: prefer new `id` field, fall back to legacy
    const conversationId = id || legacyConversationId || crypto.randomUUID();

    const hasGatewayCredentials = Boolean(
      context.env.CLOUDFLARE_ACCOUNT_ID &&
        (context.env.CF_AIG_TOKEN || context.env.CLOUDFLARE_API_TOKEN)
    );

    // Validate Cloudflare AI configuration early. This is deployment
    // configuration, not a user error.
    if (!context.env.AI && !hasGatewayCredentials) {
      return Response.json(
        {
          error: "Service temporarily unavailable",
          message:
            "The AI service is not configured yet. Please try again later or contact the site administrator.",
          code: "missing_ai_config",
        },
        { status: 503 }
      );
    }

    // Auth: extract user from Clerk JWT
    const user = await getUserFromRequest(
      context.request,
      context.env.CLERK_ISSUER_URL
    );

    // Rate limit unauthenticated users
    let rateLimitResult: {
      allowed: boolean;
      remaining: number;
      total: number;
    } | null = null;

    if (!user && DB) {
      const dbClient = createDatabaseClient(DB);
      const clientIp = getClientIp(context.request);
      const ipHash = await hashIp(clientIp, RATE_LIMIT_PEPPER);
      try {
        rateLimitResult = await dbClient.consumeRateLimit(
          ipHash,
          ANON_RATE_LIMIT
        );
      } catch (error) {
        console.warn("[Chat API] Rate limit unavailable:", error);
      }

      if (rateLimitResult && !rateLimitResult.allowed) {
        return Response.json(
          {
            error: "Rate limit exceeded",
            message: `You've reached the limit of ${ANON_RATE_LIMIT} messages per day. Sign in for unlimited access.`,
            remaining: 0,
            limit: ANON_RATE_LIMIT,
          },
          {
            status: 429,
            headers: {
              "Retry-After": "86400",
              "X-RateLimit-Limit": String(ANON_RATE_LIMIT),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    // Determine if this is a tool approval continuation flow
    const isToolApprovalFlow = Boolean(messages);
    const isFastMode = mode === "fast";

    // Build UI messages array for the AI SDK
    let uiMessages: Array<Record<string, unknown>>;

    if (isToolApprovalFlow && messages) {
      // Tool approval: use the messages array directly (contains approval states)
      uiMessages = messages as Array<Record<string, unknown>>;
    } else if (message) {
      // New message: append to empty array (AI SDK manages history internally)
      uiMessages = [message as unknown as Record<string, unknown>];
    } else {
      return Response.json(
        { error: "Either message or messages is required" },
        { status: 400 }
      );
    }

    // Build system prompt with skills and user settings
    const capabilities = getCapabilities(chatModelId);
    const basePrompt = isFastMode ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const system = buildSystemPrompt(
      basePrompt,
      !isFastMode ? AGENT_SKILLS : undefined,
      settings
    );

    // Get AI model
    const { model, resolvedModelId } = getLanguageModel(
      context.env,
      chatModelId
    );

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(uiMessages);

    // Store conversation for authenticated users
    if (user && DB && conversationId) {
      const dbClient = createDatabaseClient(DB);
      const existing = await dbClient.getConversation(conversationId);
      if (!existing) {
        dbClient
          .createConversation({
            id: conversationId,
            mode: isFastMode ? "fast" : "agent",
            userId: user.userId,
            modelId: resolvedModelId,
          })
          .catch((err) => {
            console.error("[Chat API] Failed to create conversation:", err);
          });
      }
    }

    // Create streaming response using the template pattern
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model,
          system,
          messages: modelMessages,
          temperature: isFastMode ? 0.3 : 0.7,
          ...(isFastMode
            ? {}
            : {
                tools: AGENT_TOOLS,
                toolChoice: "auto" as const,
                stopWhen: stepCountIs(5),
                experimental_activeTools: capabilities.tools
                  ? [
                      "searchBlog",
                      "getBlogPost",
                      "getCV",
                      "getGitHub",
                      "getAnalytics",
                      "getAbout",
                      "fetchLlmsTxt",
                    ]
                  : [],
              }),
        });

        writer.merge(
          result.toUIMessageStream({
            sendReasoning: capabilities.reasoning,
          })
        );
      },
      onError: () => {
        return "An error occurred while processing your request.";
      },
    });

    const response = createUIMessageStreamResponse({ stream });

    // Add rate limit headers for unauthenticated users
    if (rateLimitResult) {
      response.headers.set("X-RateLimit-Limit", String(ANON_RATE_LIMIT));
      response.headers.set(
        "X-RateLimit-Remaining",
        String(rateLimitResult.remaining)
      );
    }

    return response;
  } catch (error) {
    console.error("[Chat API] Error:", error);
    const rawMessage = error instanceof Error ? error.message : "Unknown error";

    // Map known internal errors to user-friendly messages
    const isAiConfigError = rawMessage.includes("Cloudflare AI configuration");
    const userMessage = isAiConfigError
      ? "The AI service is not configured yet. Please try again later."
      : "Something went wrong while processing your request. Please try again.";

    return Response.json(
      {
        error: userMessage,
        message: userMessage,
        code: isAiConfigError ? "missing_ai_config" : "internal_error",
      },
      { status: isAiConfigError ? 503 : 500 }
    );
  }
};

// ─── DELETE Handler ─────────────────────────────────────────────────

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  const user = await getUserFromRequest(
    context.request,
    context.env.CLERK_ISSUER_URL
  );

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbClient = createDatabaseClient(DB);
  const conversation = await dbClient.getConversation(id);

  if (!conversation || conversation.userId !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  await dbClient.deleteConversation(id);
  return Response.json({ success: true }, { status: 200 });
};
