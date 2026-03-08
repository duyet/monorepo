/**
 * Chat API — Cloudflare Pages Function
 *
 * Handles streaming chat via AI Gateway unified API + tool calling.
 * Mode: 'fast' = direct LLM, no tools. 'agent' = full tool use with stepCountIs.
 *
 * Provider: ai-gateway-provider with unified API
 */

import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { createAiGateway } from "ai-gateway-provider";
import { createUnified } from "ai-gateway-provider/providers/unified";
import { z } from "zod";
import {
  AGENT_MODEL,
  FAST_MODEL,
  FAST_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
} from "../../lib/agent";
import { getClientIp, getUserFromRequest, hashIp } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";
import {
  fetchLlmsTxt,
  getAboutTool,
  getAnalyticsTool,
  getBlogPostTool,
  getCVTool,
  getGitHubTool,
  searchBlogTool,
} from "../../lib/tools";
import { AGENT_SKILLS } from "../../lib/skills-data";

/** Rate limit for unauthenticated users: max messages per 24h window */
const ANON_RATE_LIMIT = 10;

/** Truncate an identifier to a short prefix for safe logging (no raw PII) */
function anonymizeForLog(value: string | undefined, prefixLen = 8): string {
  if (!value) return "anon";
  if (value.length <= prefixLen) return value;
  return `${value.substring(0, prefixLen)}…`;
}

interface Env {
  AI: Ai;
  DB?: D1Database;
  // AI Gateway configuration
  CF_AIG_ACCOUNT_ID?: string;
  CF_AIG_TOKEN?: string;
  // Server-side pepper for hashing IPs
  RATE_LIMIT_PEPPER?: string;
}

const AGENT_TOOLS = {
  searchBlog: tool({
    description:
      "Search Duyet's blog (296+ posts) by topic, technology, or keywords. Use for: finding articles about data engineering, ClickHouse, Rust, Spark, cloud computing, etc. Returns matching posts with titles, URLs, and snippets.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Search query — topic, keyword, or technology name"),
    }),
    execute: async ({ query }) => {
      const { results } = await searchBlogTool(query);
      return results;
    },
  }),
  getBlogPost: tool({
    description:
      "Fetch the full content of a specific blog post. Use after searchBlog when user wants detailed information from a post. Requires the full URL from blog.duyet.net or duyet.net.",
    inputSchema: z.object({
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
      "Retrieve Duyet's CV/Resume information. Use for questions about work experience, skills, education, or professional background. Choose 'summary' for quick overview, 'detailed' for comprehensive info.",
    inputSchema: z.object({
      format: z
        .enum(["summary", "detailed"])
        .optional()
        .describe(
          "Format: 'summary' for quick overview, 'detailed' for full CV"
        ),
    }),
    execute: async ({ format = "summary" }) => {
      const { content } = await getCVTool(format);
      return content;
    },
  }),
  getGitHub: tool({
    description:
      "Fetch recent GitHub activity including commits, pull requests, issues, and releases. Use for questions about recent coding activity, open source contributions, or project updates. Requires user approval — inform them before calling.",
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Number of recent activities (1-20, default 5)"),
    }),
    needsApproval: true,
    execute: async ({ limit = 5 }) => {
      const { activity } = await getGitHubTool(limit);
      return activity;
    },
  }),
  getAnalytics: tool({
    description:
      "Get contact form analytics and reports. Use for questions about site traffic, contact submissions, or user engagement patterns. Requires user approval — inform them before calling. Available reports: summary, purpose_breakdown, daily_trends, recent_activity.",
    inputSchema: z.object({
      reportType: z
        .enum([
          "summary",
          "purpose_breakdown",
          "daily_trends",
          "recent_activity",
        ])
        .optional()
        .describe(
          "Report type: 'summary' (overview), 'purpose_breakdown' (contact reasons), 'daily_trends' (time patterns), 'recent_activity' (latest submissions)"
        ),
    }),
    needsApproval: true,
    execute: async ({ reportType = "summary" }) => {
      const { analytics } = await getAnalyticsTool(reportType);
      return analytics;
    },
  }),
  getAbout: tool({
    description:
      "Get general background information about Duyet — who he is, what he does, his expertise areas. Use as a starting point for general questions.",
    inputSchema: z.object({}),
    execute: async () => {
      const { about } = await getAboutTool();
      return about;
    },
  }),
  fetchLlmsTxt: tool({
    description:
      "Fetch the llms.txt file from any duyet.net domain to get AI-readable documentation. Use for discovering available features, understanding domain structure, or getting comprehensive site information. Domains: home, blog, insights, llmTimeline, cv, photos, homelab. Also accepts full URLs.",
    inputSchema: z.object({
      domain: z
        .string()
        .describe(
          "Domain key (home, blog, insights, llmTimeline, cv, photos, homelab) or full URL (e.g., https://blog.duyet.net/llms.txt)"
        ),
    }),
    execute: async ({ domain }) => {
      const { content } = await fetchLlmsTxt(domain);
      return content;
    },
  }),
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { AI, DB, RATE_LIMIT_PEPPER } = context.env;
  if (!AI) {
    return new Response(
      JSON.stringify({
        error: "Missing AI binding — check wrangler.toml [ai] config",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Extract auth and IP for rate limiting
    const user = await getUserFromRequest(
      context.request,
      context.env.CLERK_ISSUER_URL
    );
    const clientIp = getClientIp(context.request);

    // Rate limit unauthenticated users (10 messages per 24h window per IP)
    // Uses atomic consumeRateLimit to avoid check-then-increment race conditions
    let rateLimitResult: {
      allowed: boolean;
      remaining: number;
      total: number;
    } | null = null;
    if (!user && DB) {
      const dbClient = createDatabaseClient(DB);
      const ipHash = await hashIp(clientIp, RATE_LIMIT_PEPPER);
      rateLimitResult = await dbClient.consumeRateLimit(
        ipHash,
        ANON_RATE_LIMIT
      );

      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: `You've reached the limit of ${ANON_RATE_LIMIT} messages per day. Sign in for unlimited access.`,
            remaining: 0,
            limit: ANON_RATE_LIMIT,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "86400",
              "X-RateLimit-Limit": String(ANON_RATE_LIMIT),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    const {
      messages: uiMessages,
      mode = "agent",
      conversationId,
      settings,
    } = (await context.request.json()) as any;

    // Generate unique request ID for tracing
    const requestId = crypto.randomUUID().substring(0, 8);

    // Log incoming request (anonymized — no raw PII)
    console.log(
      `[Chat API][${requestId}] Request: mode=${mode}, messages=${uiMessages.length}, user=${anonymizeForLog(user?.userId)}, ip=${anonymizeForLog(clientIp)}`
    );

    const allMessages = await convertToModelMessages(uiMessages);

    // Prune old tool calls to prevent context overflow
    const messages = pruneMessages({
      messages: allMessages,
      toolCalls: "require-last-only",
    });

    // AI Gateway with unified provider
    const aigateway = createAiGateway({
      accountId:
        context.env.CF_AIG_ACCOUNT_ID || "23050adb6c92e313643a29e1ba64c88a",
      gateway: "monorepo",
      apiKey: context.env.CF_AIG_TOKEN,
    });
    const unified = createUnified();

    const isFast = mode === "fast";
    let system = isFast ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;

    // Inject Agent Skills if available and in agent mode
    if (!isFast && AGENT_SKILLS && AGENT_SKILLS.length > 0) {
      const skillsXml = AGENT_SKILLS.map(
        (skill) =>
          `  <skill>\n    <name>${skill.metadata.name}</name>\n    <description>${skill.metadata.description.trim()}</description>\n    <content>\n${skill.content}\n    </content>\n  </skill>`
      ).join("\n");
      system += `\n\n<available_skills>\n${skillsXml}\n</available_skills>`;
    }

    // Inject custom user settings
    if (settings) {
      const parts = [];
      if (settings.customInstructions)
        parts.push(`User Custom Instructions:\n${settings.customInstructions}`);
      if (settings.language)
        parts.push(`The user's preferred language is: ${settings.language}`);
      if (settings.timezone)
        parts.push(`The user's current timezone is: ${settings.timezone}`);

      if (parts.length > 0) {
        system += `\n\n--- User Preferences ---\n${parts.join("\n\n")}\n------------------------`;
      }
    }

    const modelId = isFast ? FAST_MODEL : AGENT_MODEL;

    // Log system prompt
    const systemPreview =
      system.length > 100 ? `${system.substring(0, 100)}...` : system;
    console.log(
      `[Chat API][${requestId}] System prompt (${system.length} chars):`,
      systemPreview
    );

    // Log message count and model
    console.log(
      `[Chat API][${requestId}] Messages:`,
      messages.length,
      "| Model:",
      modelId
    );

    // For Workers AI models, use the format: workers-ai/@cf/meta/...
    const model = aigateway(unified(`workers-ai/${modelId}`));

    const result = streamText({
      model,
      system,
      messages,
      temperature: isFast ? 0.3 : 0.7,
      ...(isFast
        ? {}
        : {
            tools: AGENT_TOOLS,
            toolChoice: "auto" as const,
            stopWhen: stepCountIs(30),
          }),
    });

    console.log(
      `[Chat API][${requestId}] Streaming started via AI Gateway: ${modelId}`
    );

    // Store conversation for authenticated users (fire and forget)
    if (user && DB && conversationId) {
      const dbClient = createDatabaseClient(DB);
      const existing = await dbClient.getConversation(conversationId);
      if (!existing) {
        dbClient
          .createConversation({
            id: conversationId,
            mode: mode as "fast" | "agent",
            userId: user.userId,
          })
          .catch((err) => {
            console.error(
              `[Chat API][${requestId}] Failed to create conversation:`,
              err
            );
          });
      }
    }

    const response = result.toUIMessageStreamResponse();

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
    const requestId = `error-${crypto.randomUUID().substring(0, 8)}`;
    console.error(`[Chat API][${requestId}] Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Chat API][${requestId}] Error details:`, errorMessage);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
