/**
 * Export API — Cloudflare Pages Function
 *
 * Exports conversations in multiple formats:
 * - JSON: Full conversation data with messages, tool calls, state
 * - Markdown: Formatted conversation transcript
 * - Plain text: Simple format
 *
 * Methods:
 * - GET /api/export?conversationId={id}&format={json|md|txt}
 */

import { slugify } from "@duyet/libs";
import { getUserFromRequest } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";

interface Env {
  DB: D1Database;
  CLERK_ISSUER_URL?: string;
}

type ExportFormat = "json" | "md" | "txt";

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Expose-Headers": "Content-Disposition",
};

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Format conversation as JSON
 */
interface ExportConversation {
  id: string;
  title: string;
  mode: string;
  createdAt: number;
  updatedAt: number;
}

interface ExportMessage {
  id: string;
  role: string;
  content: string;
  timestamp: number;
  model?: string;
  duration?: number;
  tokens?: { prompt?: number; completion?: number; total?: number };
  toolCalls?: number;
  sources?: Array<{ title: string; url?: string }>;
}

function formatAsJSON(
  conversation: ExportConversation,
  messages: ExportMessage[]
): string {
  return JSON.stringify(
    {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        mode: conversation.mode,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        model: msg.model,
        duration: msg.duration,
        tokens: msg.tokens,
        toolCalls: msg.toolCalls,
        sources: msg.sources,
      })),
    },
    null,
    2
  );
}

/**
 * Format conversation as Markdown
 */
function formatAsMarkdown(
  conversation: ExportConversation,
  messages: ExportMessage[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${conversation.title}`);
  lines.push("");
  lines.push(`**ID:** ${conversation.id}`);
  lines.push(`**Mode:** ${conversation.mode}`);
  lines.push(
    `**Created:** ${new Date(conversation.createdAt).toLocaleString()}`
  );
  lines.push(
    `**Updated:** ${new Date(conversation.updatedAt).toLocaleString()}`
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  // Messages
  for (const message of messages) {
    const roleLabel = message.role === "user" ? "👤 User" : "🤖 Assistant";
    const timestamp = new Date(message.timestamp).toLocaleString();

    lines.push(`## ${roleLabel}`);
    lines.push(`*${timestamp}*`);
    lines.push("");

    if (message.model) {
      lines.push(`*Model: ${message.model}*`);
      lines.push("");
    }

    if (message.sources && message.sources.length > 0) {
      lines.push("**Sources:**");
      for (const source of message.sources) {
        if (source.url) {
          lines.push(`- [${source.title}](${source.url})`);
        } else {
          lines.push(`- ${source.title}`);
        }
      }
      lines.push("");
    }

    lines.push(message.content);
    lines.push("");

    if (message.toolCalls !== undefined) {
      lines.push(`*Tool calls: ${message.toolCalls}*`);
      lines.push("");
    }

    if (message.tokens) {
      lines.push(
        `*Tokens: ${message.tokens.prompt || 0} prompt + ${message.tokens.completion || 0} completion = ${message.tokens.total || 0} total*`
      );
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format conversation as plain text
 */
function formatAsText(
  conversation: ExportConversation,
  messages: ExportMessage[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`Conversation: ${conversation.title}`);
  lines.push(`ID: ${conversation.id}`);
  lines.push(`Mode: ${conversation.mode}`);
  lines.push(`Created: ${new Date(conversation.createdAt).toLocaleString()}`);
  lines.push(`Updated: ${new Date(conversation.updatedAt).toLocaleString()}`);
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("");

  // Messages
  for (const message of messages) {
    const roleLabel = message.role === "user" ? "USER" : "ASSISTANT";
    const timestamp = new Date(message.timestamp).toLocaleString();

    lines.push(`[${roleLabel}] - ${timestamp}`);
    lines.push("");

    if (message.model) {
      lines.push(`Model: ${message.model}`);
    }

    if (message.sources && message.sources.length > 0) {
      lines.push("Sources:");
      for (const source of message.sources) {
        lines.push(
          `  - ${source.title}${source.url ? ` (${source.url})` : ""}`
        );
      }
    }

    lines.push("");
    lines.push(message.content);
    lines.push("");

    if (message.toolCalls !== undefined) {
      lines.push(`Tool calls: ${message.toolCalls}`);
    }

    if (message.tokens) {
      lines.push(
        `Tokens: ${message.tokens.prompt || 0} + ${message.tokens.completion || 0} = ${message.tokens.total || 0}`
      );
    }

    lines.push("");
    lines.push("=".repeat(60));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Get Content-Type and filename for export format
 */
function getContentTypeAndFilename(
  format: ExportFormat,
  conversationTitle: string
): { contentType: string; filename: string } {
  const sanitizedTitle = slugify(conversationTitle, 50);

  switch (format) {
    case "json":
      return {
        contentType: "application/json",
        filename: `${sanitizedTitle}.json`,
      };
    case "md":
      return {
        contentType: "text/markdown",
        filename: `${sanitizedTitle}.md`,
      };
    case "txt":
      return {
        contentType: "text/plain",
        filename: `${sanitizedTitle}.txt`,
      };
    default:
      return {
        contentType: "text/plain",
        filename: `${sanitizedTitle}.txt`,
      };
  }
}

/**
 * GET /api/export?conversationId={id}&format={json|md|txt}
 */
async function handleGet(
  request: Request,
  db: D1Database,
  userId: string | undefined
): Promise<Response> {
  const client = createDatabaseClient(db);
  const url = new URL(request.url);

  const conversationId = url.searchParams.get("conversationId");
  const format = (url.searchParams.get("format") || "json") as ExportFormat;

  // Validate conversation ID
  if (!conversationId) {
    return Response.json(
      { error: "Missing conversationId parameter" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Validate format
  if (!["json", "md", "txt"].includes(format)) {
    return Response.json(
      { error: "Invalid format. Must be json, md, or txt" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    // Get conversation with messages
    const { conversation, messages } =
      await client.getConversationWithMessages(conversationId);

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Ownership check: users can only export their own conversations
    if (conversation.userId && conversation.userId !== userId) {
      return Response.json(
        { error: "Access denied" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Format content based on format parameter
    let content: string;
    switch (format) {
      case "json":
        content = formatAsJSON(conversation, messages);
        break;
      case "md":
        content = formatAsMarkdown(conversation, messages);
        break;
      case "txt":
        content = formatAsText(conversation, messages);
        break;
    }

    // Get content type and filename
    const { contentType, filename } = getContentTypeAndFilename(
      format,
      conversation.title
    );

    // Sanitize filename to prevent header injection
    const safeFilename = filename.replace(/["\n\r\\]/g, "_");

    // Create response with download headers
    return new Response(content, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error) {
    console.error("[Export API] GET error:", error);
    return Response.json(
      {
        error: "Failed to export conversation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * Main request handler
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Check for D1 binding
  if (!env.DB) {
    return Response.json(
      {
        error:
          "Missing DB binding — add [[d1_databases]] binding to wrangler.toml",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  // Only GET method is supported
  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: CORS_HEADERS }
    );
  }

  // Extract authenticated user (if any)
  const user = await getUserFromRequest(request, env.CLERK_ISSUER_URL);
  const userId = user?.userId;

  return handleGet(request, env.DB, userId);
};
