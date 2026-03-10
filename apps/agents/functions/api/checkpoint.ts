/**
 * Checkpoint API (Unit 12)
 *
 * Cloudflare Pages Function for checkpoint management.
 *
 * Endpoints:
 * - GET  /checkpoint?id={conversationId} - List checkpoints for a conversation
 * - GET  /checkpoint/{checkpointId} - Get a specific checkpoint
 * - POST /checkpoint/restore - Restore conversation to a checkpoint
 * - DELETE /checkpoint/{checkpointId} - Delete a checkpoint
 */

import { createCheckpointer } from "../../lib/graph";
import { createDatabaseClient } from "../../lib/db/client";

interface Env {
  DB?: D1Database;
}

/**
 * GET /checkpoint?id={conversationId}
 *
 * List all checkpoints for a conversation.
 *
 * Query params:
 * - id: Conversation ID (required)
 * - limit: Maximum checkpoints to return (default: 50)
 *
 * Returns array of checkpoint info (without full state for performance).
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { DB } = env;

  if (!DB) {
    return new Response(
      JSON.stringify({ error: "Database not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("id");
  const checkpointId = url.searchParams.get("checkpointId");

  // If checkpointId is provided, get specific checkpoint
  if (checkpointId) {
    const db = createDatabaseClient(DB);
    const checkpointer = createCheckpointer(db);

    try {
      const checkpoint = await checkpointer.loadCheckpoint(checkpointId);

      if (!checkpoint) {
        return new Response(
          JSON.stringify({ error: "Checkpoint not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          checkpoint: {
            id: checkpoint.id,
            conversationId: checkpoint.conversationId,
            timestamp: checkpoint.timestamp,
            stepIndex: checkpoint.stepIndex,
            state: checkpoint.state,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[Checkpoint API] Error loading checkpoint:", error);
      return new Response(
        JSON.stringify({ error: "Failed to load checkpoint" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // If conversationId is provided, list all checkpoints
  if (conversationId) {
    const db = createDatabaseClient(DB);
    const checkpointer = createCheckpointer(db);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    try {
      const checkpoints = await checkpointer.listVersions(conversationId, limit);

      return new Response(
        JSON.stringify({
          conversationId,
          checkpoints,
          count: checkpoints.length,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[Checkpoint API] Error listing checkpoints:", error);
      return new Response(
        JSON.stringify({ error: "Failed to list checkpoints" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Missing required parameter
  return new Response(
    JSON.stringify({
      error: "Missing required parameter",
      message: "Provide either 'id' (conversation ID) or 'checkpointId' parameter",
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
};

/**
 * POST /checkpoint/restore
 *
 * Restore a conversation to a specific checkpoint.
 *
 * Body:
 * - checkpointId: The checkpoint ID to restore to
 *
 * Returns the restored state.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { DB } = env;

  if (!DB) {
    return new Response(
      JSON.stringify({ error: "Database not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json() as { checkpointId?: string; conversationId?: string; version?: number };

    if (!body.checkpointId && !(body.conversationId && body.version)) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameter",
          message: "Provide either 'checkpointId' or both 'conversationId' and 'version'",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = createDatabaseClient(DB);
    const checkpointer = createCheckpointer(db);

    let restoredState;

    if (body.checkpointId) {
      // Restore by checkpoint ID
      restoredState = await checkpointer.rollback(body.checkpointId);
    } else {
      // Restore by conversation ID and version
      restoredState = await checkpointer.rollbackToVersion(
        body.conversationId!,
        body.version!
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        state: restoredState,
        message: "Conversation restored to checkpoint",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Checkpoint API] Error restoring checkpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to restore checkpoint",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * DELETE /checkpoint/{checkpointId}
 *
 * Delete a specific checkpoint.
 *
 * Path params:
 * - checkpointId: The checkpoint ID to delete
 *
 * Returns success confirmation.
 */
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { DB } = env;

  if (!DB) {
    return new Response(
      JSON.stringify({ error: "Database not available" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Extract checkpoint ID from URL path
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const checkpointId = pathParts[pathParts.length - 1];

  if (!checkpointId || checkpointId === "checkpoint") {
    return new Response(
      JSON.stringify({
        error: "Invalid checkpoint ID",
        message: "Checkpoint ID must be provided in the URL path",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const db = createDatabaseClient(DB);
  const checkpointer = createCheckpointer(db);

  try {
    await checkpointer.deleteCheckpoint(checkpointId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Checkpoint deleted",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Checkpoint API] Error deleting checkpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete checkpoint",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
