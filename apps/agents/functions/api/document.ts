/**
 * Document API — Cloudflare Pages Function
 *
 * CRUD operations for artifact documents stored in D1.
 * Supports GET (list versions), POST (save/update), and DELETE (restore version).
 *
 * Adapted from vercel/ai-chatbot app/api/document/route.ts.
 * Uses D1 directly instead of Drizzle ORM.
 */

import { getUserFromRequest } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Env {
  DB?: D1Database;
  CLERK_ISSUER_URL?: string;
}

interface DocumentRow {
  id: string;
  title: string;
  content: string;
  kind: string;
  user_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// GET /api/document?id=<documentId>
// Returns all versions of a document ordered by creation time
// ---------------------------------------------------------------------------

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB, CLERK_ISSUER_URL } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const documentId = url.searchParams.get("id");

  if (!documentId) {
    return Response.json({ error: "id parameter is required" }, { status: 400 });
  }

  const user = await getUserFromRequest(context.request, CLERK_ISSUER_URL);
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createDatabaseClient(DB);

  const stmt = DB.prepare(
    "SELECT id, title, content, kind, user_id, created_at FROM documents WHERE id = ? ORDER BY created_at ASC"
  );
  const result = (await stmt.bind(documentId).all()) as {
    results: DocumentRow[];
  };

  if (!result.results || result.results.length === 0) {
    // Return empty array for new documents that haven't been saved yet
    return Response.json([]);
  }

  // Verify ownership
  if (result.results[0].user_id !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const documents = result.results.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    kind: row.kind,
    createdAt: row.created_at,
  }));

  return Response.json(documents);
};

// ---------------------------------------------------------------------------
// POST /api/document?id=<documentId>
// Save a new version of a document
// ---------------------------------------------------------------------------

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB, CLERK_ISSUER_URL } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const documentId = url.searchParams.get("id");

  if (!documentId) {
    return Response.json({ error: "id parameter is required" }, { status: 400 });
  }

  const user = await getUserFromRequest(context.request, CLERK_ISSUER_URL);
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { title?: string; content?: string; kind?: string; isManualEdit?: boolean };
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, content, kind } = body;

  if (content === undefined || content === null) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Check if document already exists
  const existing = (await DB.prepare(
    "SELECT id, user_id FROM documents WHERE id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(documentId)
    .first()) as { id: string; user_id: string } | null;

  if (existing && existing.user_id !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // Insert a new version (each save creates a new row with same id)
  const insertStmt = DB.prepare(
    "INSERT INTO documents (id, title, content, kind, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  await insertStmt
    .bind(
      documentId,
      title || "Untitled",
      content,
      kind || "text",
      user.userId,
      now
    )
    .run();

  return Response.json({ success: true });
};

// ---------------------------------------------------------------------------
// DELETE /api/document?id=<documentId>&timestamp=<iso>
// Delete all versions newer than the given timestamp (restore to that version)
// ---------------------------------------------------------------------------

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { DB, CLERK_ISSUER_URL } = context.env;

  if (!DB) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const url = new URL(context.request.url);
  const documentId = url.searchParams.get("id");
  const timestamp = url.searchParams.get("timestamp");

  if (!documentId) {
    return Response.json({ error: "id parameter is required" }, { status: 400 });
  }

  if (!timestamp) {
    return Response.json(
      { error: "timestamp parameter is required" },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(context.request, CLERK_ISSUER_URL);
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const existing = (await DB.prepare(
    "SELECT user_id FROM documents WHERE id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(documentId)
    .first()) as { user_id: string } | null;

  if (!existing) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  if (existing.user_id !== user.userId) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  // Delete all versions created after the given timestamp
  const deleteStmt = DB.prepare(
    "DELETE FROM documents WHERE id = ? AND created_at > ?"
  );
  await deleteStmt.bind(documentId, timestamp).run();

  return Response.json({ success: true });
};
