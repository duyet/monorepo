/**
 * Chat API — Cloudflare Pages Function
 *
 * Handles streaming chat with LangGraph-style agent execution.
 * Mode: 'fast' = direct LLM, no tools. 'agent' = full graph execution with tool calling.
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
// Graph system imports (Unit 11 integration)
import {
  createCheckpointer,
  createInitialState,
  createObservability,
  GraphRouter,
} from "../../lib/graph";
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

/** Truncate an identifier to a short prefix for safe logging (no raw PII) */
function anonymizeForLog(value: string | undefined, prefixLen = 8): string {
  if (!value) return "anon";
  if (value.length <= prefixLen) return value;
  return `${value.substring(0, prefixLen)}…`;
}

/**
 * Sanitize a user-supplied string before injecting into the system prompt.
 */
function sanitizeUserString(value: string, maxLen: number): string {
  const truncated = value.substring(0, maxLen);
  return truncated
    .replace(
      /<\/?(?:system|assistant|user|human|prompt|instruction)[^>]*>/gi,
      ""
    )
    .replace(/^\s*(?:system|assistant|human|user)\s*:/gim, "")
    .trim();
}

/**
 * Build system prompt with skills and user settings (shared helper)
 */
function buildSystemPrompt(
  basePrompt: string,
  includeSkills: boolean,
  settings?: {
    customInstructions?: string;
    language?: string;
    timezone?: string;
  }
): string {
  let system = basePrompt;

  if (includeSkills && AGENT_SKILLS && AGENT_SKILLS.length > 0) {
    const skillsXml = AGENT_SKILLS.map(
      (skill) =>
        `  <skill>\n    <name>${skill.metadata.name}</name>\n    <description>${skill.metadata.description.trim()}</description>\n    <content>\n${skill.content}\n    </content>\n  </skill>`
    ).join("\n");
    system += `\n\n<available_skills>\n${skillsXml}\n</available_skills>`;
  }

  if (settings) {
    const parts = [];
    if (settings.customInstructions) {
      const sanitized = sanitizeUserString(settings.customInstructions, 500);
      if (sanitized) parts.push(`User Custom Instructions:\n${sanitized}`);
    }
    if (settings.language) {
      const sanitized = sanitizeUserString(settings.language, 50);
      if (sanitized)
        parts.push(`The user's preferred language is: ${sanitized}`);
    }
    if (settings.timezone) {
      const sanitized = sanitizeUserString(settings.timezone, 50);
      if (sanitized) parts.push(`The user's current timezone is: ${sanitized}`);
    }

    if (parts.length > 0) {
      system += `\n\n--- User Preferences ---\n${parts.join("\n\n")}\n------------------------`;
    }
  }

  return system;
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
    // Parse and validate the request body
    const requestBodySchema = z.object({
      messages: z.array(z.unknown()),
      mode: z.string().optional(),
      conversationId: z.string().optional(),
      settings: z
        .object({
          customInstructions: z.string().optional(),
          language: z.string().optional(),
          timezone: z.string().optional(),
        })
        .optional(),
      // New: useGraph flag to enable LangGraph-style execution (Unit 11)
      useGraph: z.boolean().optional(),
    });

    let parsedBody: z.infer<typeof requestBodySchema>;
    try {
      const raw = await context.request.json();
      const result = requestBodySchema.safeParse(raw);
      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "Invalid request body",
            details: result.error.flatten(),
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      parsedBody = result.data;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      messages: uiMessages,
      mode = "agent",
      conversationId,
      settings,
      useGraph = false, // Default to legacy behavior for now
    } = parsedBody;

    // Extract auth and IP for rate limiting
    const user = await getUserFromRequest(
      context.request,
      context.env.CLERK_ISSUER_URL
    );
    const clientIp = getClientIp(context.request);

    // Rate limit unauthenticated users
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

    // Generate unique request ID for tracing
    const requestId = crypto.randomUUID().substring(0, 8);

    // Log incoming request
    console.log(
      `[Chat API][${requestId}] Request: mode=${mode}, useGraph=${useGraph}, messages=${uiMessages.length}, user=${anonymizeForLog(user?.userId)}, ip=${anonymizeForLog(clientIp)}`
    );

    // Unit 11: Graph-based execution path
    // When useGraph=true and mode=agent, use GraphRouter instead of direct LLM
    if (useGraph && mode === "agent") {
      return handleGraphExecution(
        { request: context.request, env: context.env, waitUntil: context.waitUntil.bind(context) },
        requestId,
        uiMessages,
        conversationId,
        settings,
        user,
        rateLimitResult
      );
    }

    // Legacy direct LLM execution path (maintained for backward compatibility)
    return handleDirectExecution(
      context,
      requestId,
      uiMessages,
      mode,
      conversationId,
      settings,
      user,
      rateLimitResult
    );
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

/**
 * Handle graph-based execution using GraphRouter (Unit 11)
 *
 * This path uses the LangGraph-style execution system:
 * 1. Create initial state from user input
 * 2. Execute graph with observability
 * 3. Stream results as nodes complete
 *
 * Note: For MVP, this still uses streamText for the actual LLM calls
 * but orchestrates through the GraphRouter for state management.
 */
async function handleGraphExecution(
  context: { request: Request; env: Env; waitUntil: (promise: Promise<unknown>) => void },
  requestId: string,
  uiMessages: unknown[],
  conversationId: string | undefined,
  settings:
    | { customInstructions?: string; language?: string; timezone?: string }
    | undefined,
  user: { userId: string } | null,
  rateLimitResult: { allowed: boolean; remaining: number; total: number } | null
): Promise<Response> {
  // Get user's last message as input
  const lastMessage = uiMessages[uiMessages.length - 1];
  const userInput =
    typeof lastMessage === "object" &&
    lastMessage !== null &&
    "content" in lastMessage
      ? String(lastMessage.content)
      : String(lastMessage);

  // Create initial state for graph execution
  const convId = conversationId || crypto.randomUUID();
  const initialState = createInitialState(convId, userInput);

  console.log(
    `[Chat API][${requestId}] Graph execution started for conversation ${convId}`
  );

  // Create observability middleware
  const observability = createObservability({
    debug: false, // Disable debug logs in production
    logger: (level, message, ...args) => {
      console.log(
        `[Chat API][${requestId}][${level.toUpperCase()}]`,
        message,
        ...args
      );
    },
  });

  // For now, we still use streamText for the actual LLM interaction
  // The graph will be executed in the background while we stream the LLM response
  // TODO: In future, we'll stream graph state updates via SSE

  // Convert messages for AI SDK
  const allMessages = await convertToModelMessages(uiMessages);
  const messages = pruneMessages({
    messages: allMessages,
    toolCalls: "require-last-only",
  });

  // Build system prompt with graph context (shared helper)
  const system = buildSystemPrompt(SYSTEM_PROMPT, true, settings);

  // AI Gateway setup
  const accountId = context.env.CF_AIG_ACCOUNT_ID;
  if (!accountId) {
    return new Response(
      JSON.stringify({
        error: "Server misconfiguration: CF_AIG_ACCOUNT_ID is not set",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const aigateway = createAiGateway({
    accountId,
    gateway: "monorepo",
    apiKey: context.env.CF_AIG_TOKEN,
  });
  const unified = createUnified();
  const model = aigateway(unified(`workers-ai/${AGENT_MODEL}`));

  // Start graph execution in background — use waitUntil so Cloudflare does
  // not terminate the worker before the promise resolves.
  context.waitUntil(
    (async () => {
      try {
        const router = new GraphRouter();
        observability.startExecution();

        const finalState = await router.executeGraph(initialState);

        const metrics = observability.endExecution();

        console.log(
          `[Chat API][${requestId}] Graph completed:`,
          `nodes=${metrics.nodesExecuted}`,
          `errors=${metrics.errorCount}`,
          `duration=${metrics.totalDuration}ms`
        );

        // Persist checkpoint to D1 for resumability
        if (context.env.DB) {
          const dbClient = createDatabaseClient(context.env.DB);
          const checkpointer = createCheckpointer(dbClient);

          try {
            const checkpointId = await checkpointer.saveCheckpoint(finalState);
            console.log(
              `[Chat API][${requestId}] Checkpoint saved: ${checkpointId}`
            );
          } catch (checkpointError) {
            console.error(
              `[Chat API][${requestId}] Failed to save checkpoint:`,
              checkpointError
            );
          }
        }
      } catch (error) {
        console.error(`[Chat API][${requestId}] Graph execution error:`, error);
        observability.endExecution();
      }
    })()
  );

  // Stream the LLM response immediately (don't wait for graph)
  const result = streamText({
    model,
    system,
    messages,
    temperature: 0.7,
    tools: AGENT_TOOLS,
    toolChoice: "auto" as const,
    stopWhen: stepCountIs(30),
  });

  console.log(
    `[Chat API][${requestId}] Streaming started via AI Gateway (graph mode)`
  );

  // Store conversation for authenticated users
  if (user && context.env.DB && conversationId) {
    const dbClient = createDatabaseClient(context.env.DB);
    const existing = await dbClient.getConversation(conversationId);
    if (!existing) {
      dbClient
        .createConversation({
          id: conversationId,
          mode: "agent",
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

  // Add rate limit headers
  if (rateLimitResult) {
    response.headers.set("X-RateLimit-Limit", String(ANON_RATE_LIMIT));
    response.headers.set(
      "X-RateLimit-Remaining",
      String(rateLimitResult.remaining)
    );
  }

  // Add header indicating graph execution
  response.headers.set("X-Graph-Execution", "enabled");

  return response;
}

/**
 * Handle direct LLM execution (legacy path)
 *
 * This maintains the existing behavior for backward compatibility.
 */
async function handleDirectExecution(
  context: { request: Request; env: Env },
  requestId: string,
  uiMessages: unknown[],
  mode: string,
  conversationId: string | undefined,
  settings:
    | { customInstructions?: string; language?: string; timezone?: string }
    | undefined,
  user: { userId: string } | null,
  rateLimitResult: { allowed: boolean; remaining: number; total: number } | null
): Promise<Response> {
  const allMessages = await convertToModelMessages(uiMessages);
  const messages = pruneMessages({
    messages: allMessages,
    toolCalls: "require-last-only",
  });

  // AI Gateway with unified provider
  const accountId = context.env.CF_AIG_ACCOUNT_ID;
  if (!accountId) {
    return new Response(
      JSON.stringify({
        error: "Server misconfiguration: CF_AIG_ACCOUNT_ID is not set",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const aigateway = createAiGateway({
    accountId,
    gateway: "monorepo",
    apiKey: context.env.CF_AIG_TOKEN,
  });
  const unified = createUnified();

  const isFast = mode === "fast";
  const basePrompt = isFast ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;

  // Build system prompt with skills and settings (shared helper)
  const system = buildSystemPrompt(
    basePrompt,
    !isFast && AGENT_SKILLS.length > 0,
    settings
  );

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
  if (user && context.env.DB && conversationId) {
    const dbClient = createDatabaseClient(context.env.DB);
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
}
