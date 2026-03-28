/**
 * Vote API — Cloudflare Pages Function
 *
 * GET  /api/vote?chatId=<id> — Get votes for a conversation
 * POST /api/vote — Cast or update a vote on a message
 */

import { z } from "zod";
import { getUserFromRequest } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";

interface Env {
  DB?: D1Database;
  CLERK_ISSUER_URL?: string;
}

const voteSchema = z.object({
  chatId: z.string(),
  messageId: z.string(),
  type: z.enum(["up", "down"]),
});

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

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbClient = createDatabaseClient(DB);
  const conversation = await dbClient.getConversation(chatId);

  if (!conversation) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  if (conversation.userId !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const votes = await dbClient.getVotesByChatId(chatId);
  return Response.json(votes, { status: 200 });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  let body: z.infer<typeof voteSchema>;
  try {
    const raw = await context.request.json();
    body = voteSchema.parse(raw);
  } catch {
    return Response.json(
      { error: "chatId, messageId, and type are required" },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(
    context.request,
    context.env.CLERK_ISSUER_URL
  );

  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const dbClient = createDatabaseClient(DB);
  const conversation = await dbClient.getConversation(body.chatId);

  if (!conversation) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  if (conversation.userId !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  await dbClient.voteMessage({
    chatId: body.chatId,
    messageId: body.messageId,
    isUpvoted: body.type === "up",
  });

  return new Response("Message voted", { status: 200 });
};
