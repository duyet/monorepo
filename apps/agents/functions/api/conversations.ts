/**
 * Conversations API — Cloudflare Pages Function
 *
 * Handles CRUD operations for conversations and messages using D1 database
 *
 * Methods:
 * - GET /api/conversations — List all conversations
 * - GET /api/conversations/:id — Get a conversation with messages
 * - POST /api/conversations — Create a new conversation
 * - PUT /api/conversations/:id — Update a conversation
 * - DELETE /api/conversations/:id — Delete a conversation
 * - POST /api/conversations/:id/messages — Add a message to a conversation
 * - GET /api/conversations/:id/messages — Get all messages for a conversation
 */

import { getUserFromRequest } from "../../lib/auth";
import {
  type CreateConversationParams,
  type CreateMessageParams,
  createDatabaseClient,
} from "../../lib/db/client";
import type { Conversation } from "../../lib/types";

interface Env {
  DB: D1Database;
  CLERK_ISSUER_URL?: string;
}

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Parse conversation ID from URL path
 * URL format: /api/conversations or /api/conversations/:id or /api/conversations/:id/messages
 */
function parsePathname(url: string): {
  conversationId: string | null;
  isMessages: boolean;
} {
  const pathname = new URL(url).pathname;
  const parts = pathname.split("/").filter(Boolean);

  // /api/conversations
  if (parts.length === 2) {
    return { conversationId: null, isMessages: false };
  }

  // /api/conversations/:id
  if (parts.length === 3) {
    return { conversationId: parts[2], isMessages: false };
  }

  // /api/conversations/:id/messages
  if (parts.length === 4 && parts[3] === "messages") {
    return { conversationId: parts[2], isMessages: true };
  }

  return { conversationId: null, isMessages: false };
}

/**
 * Strict ownership check: deny access unless conv.userId matches the
 * requesting userId. Anonymous requests cannot access user-owned conversations,
 * and authenticated users cannot access other users' conversations.
 */
function isOwner(conv: Conversation, userId: string | undefined): boolean {
  return conv.userId === userId;
}

/**
 * GET /api/conversations — List conversations for the authenticated user
 * GET /api/conversations/:id — Get a conversation with messages
 * GET /api/conversations/:id/messages — Get all messages for a conversation
 */
async function handleGet(
  request: Request,
  db: D1Database,
  conversationId: string | null,
  isMessages: boolean,
  userId: string | undefined
): Promise<Response> {
  const client = createDatabaseClient(db);
  const url = new URL(request.url);
  const rawLimit = parseInt(url.searchParams.get("limit") || "50", 10);
  const limit =
    Number.isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 200);

  try {
    if (isMessages && conversationId) {
      // GET /api/conversations/:id/messages
      const conv = await client.getConversation(conversationId);
      if (!conv || !isOwner(conv, userId)) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      const messages = await client.getMessages(conversationId);
      return Response.json({ messages }, { headers: CORS_HEADERS });
    }

    if (conversationId) {
      // GET /api/conversations/:id
      const includeMessages =
        url.searchParams.get("includeMessages") === "true";

      if (includeMessages) {
        const { conversation, messages } =
          await client.getConversationWithMessages(conversationId);
        if (!conversation || !isOwner(conversation, userId)) {
          return Response.json(
            { error: "Conversation not found" },
            { status: 404, headers: CORS_HEADERS }
          );
        }
        return Response.json(
          { conversation, messages },
          { headers: CORS_HEADERS }
        );
      }

      const conversation = await client.getConversation(conversationId);
      if (!conversation || !isOwner(conversation, userId)) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      return Response.json({ conversation }, { headers: CORS_HEADERS });
    }

    // GET /api/conversations — require authentication.
    // Anonymous users cannot list conversations (prevents global data exposure).
    if (!userId) {
      return Response.json({ conversations: [] }, { headers: CORS_HEADERS });
    }
    const conversations = await client.listConversationsByUser(userId, limit);
    return Response.json({ conversations }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[Conversations API] GET error:", error);
    return Response.json(
      {
        error: "Failed to fetch conversations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST /api/conversations — Create a new conversation
 * POST /api/conversations/:id/messages — Add a message to a conversation
 */
async function handlePost(
  request: Request,
  db: D1Database,
  conversationId: string | null,
  isMessages: boolean,
  userId: string | undefined
): Promise<Response> {
  const client = createDatabaseClient(db);

  try {
    if (isMessages && conversationId) {
      // POST /api/conversations/:id/messages
      const conv = await client.getConversation(conversationId);
      if (!conv || !isOwner(conv, userId)) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }

      const body = await request.json();

      // Validate required fields
      if (!body.role || (body.role !== "user" && body.role !== "assistant")) {
        return Response.json(
          { error: "Invalid or missing 'role': must be 'user' or 'assistant'" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      if (
        !body.content ||
        typeof body.content !== "string" ||
        body.content.trim().length === 0
      ) {
        return Response.json(
          { error: "Invalid or missing 'content': must be a non-empty string" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const messageParams: CreateMessageParams = {
        id: body.id || crypto.randomUUID(),
        conversationId,
        role: body.role,
        content: body.content,
        timestamp:
          typeof body.timestamp === "number" ? body.timestamp : Date.now(),
        metadata:
          body.metadata && typeof body.metadata === "object"
            ? body.metadata
            : undefined,
      };

      const message = await client.createMessage(messageParams);
      return Response.json({ message }, { status: 201, headers: CORS_HEADERS });
    }

    // POST /api/conversations
    const body = await request.json();
    const conversationParams: CreateConversationParams = {
      id: body.id || crypto.randomUUID(),
      mode: body.mode || "agent",
      title: body.title,
      userId,
    };

    const conversation = await client.createConversation(conversationParams);
    return Response.json(
      { conversation },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[Conversations API] POST error:", error);
    return Response.json(
      {
        error: "Failed to create resource",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * PUT /api/conversations/:id — Update a conversation
 */
async function handlePut(
  request: Request,
  db: D1Database,
  conversationId: string | null,
  userId: string | undefined
): Promise<Response> {
  if (!conversationId) {
    return Response.json(
      { error: "Conversation ID required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const client = createDatabaseClient(db);

  try {
    const body = await request.json();

    const existing = await client.getConversation(conversationId);
    if (!existing || !isOwner(existing, userId)) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    await client.updateConversation({ id: conversationId, title: body.title });
    const updated = await client.getConversation(conversationId);

    return Response.json({ conversation: updated }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[Conversations API] PUT error:", error);
    return Response.json(
      {
        error: "Failed to update conversation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * DELETE /api/conversations/:id — Delete a conversation
 */
async function handleDelete(
  _request: Request,
  db: D1Database,
  conversationId: string | null,
  userId: string | undefined
): Promise<Response> {
  if (!conversationId) {
    return Response.json(
      { error: "Conversation ID required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const client = createDatabaseClient(db);

  try {
    const existing = await client.getConversation(conversationId);
    if (!existing || !isOwner(existing, userId)) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    await client.deleteConversation(conversationId);

    return new Response(null, { status: 204, headers: CORS_HEADERS });
  } catch (error) {
    console.error("[Conversations API] DELETE error:", error);
    return Response.json(
      {
        error: "Failed to delete conversation",
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

  // Extract authenticated user (if any) — async JWT verification
  const user = await getUserFromRequest(request, env.CLERK_ISSUER_URL);
  const userId = user?.userId;

  // Parse URL path
  const { conversationId, isMessages } = parsePathname(request.url);

  // Route to handler based on method
  switch (request.method) {
    case "GET":
      return handleGet(request, env.DB, conversationId, isMessages, userId);
    case "POST":
      return handlePost(request, env.DB, conversationId, isMessages, userId);
    case "PUT":
      return handlePut(request, env.DB, conversationId, userId);
    case "DELETE":
      return handleDelete(request, env.DB, conversationId, userId);
    default:
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: CORS_HEADERS }
      );
  }
};
