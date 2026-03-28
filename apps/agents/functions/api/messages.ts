/**
 * Messages API — Cloudflare Pages Function
 *
 * GET /api/messages?chatId=<id> — Retrieve messages for a conversation.
 * Returns messages ordered by timestamp, with auth check for private chats.
 */

import { getUserFromRequest } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";

interface Env {
  DB?: D1Database;
  CLERK_ISSUER_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const chatId = url.searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "chatId required" }, { status: 400 });
  }

  const user = await getUserFromRequest(
    context.request,
    context.env.CLERK_ISSUER_URL
  );

  const dbClient = createDatabaseClient(DB);
  const conversation = await dbClient.getConversation(chatId);

  if (!conversation) {
    return Response.json({ messages: [], userId: null });
  }

  // Only the conversation owner can see messages
  if (conversation.userId && conversation.userId !== user?.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const messages = await dbClient.getMessages(chatId);

  return Response.json({
    messages,
    userId: conversation.userId ?? null,
    isReadonly: !user || user.userId !== conversation.userId,
  });
};
