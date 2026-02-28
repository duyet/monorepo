/**
 * Database client for Cloudflare D1
 * Handles CRUD operations for conversations and messages
 */

import type { Conversation, Message, ChatMode, Source } from "../types";

// Database row types
export interface ConversationRow {
  id: string;
  user_id: string | null;
  title: string;
  created_at: number;
  updated_at: number;
  mode: string;
  message_count: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  timestamp: number;
  metadata: string | null;
}

export interface MessageMetadata {
  model?: string;
  duration?: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  toolCalls?: number;
  sources?: Source[];
}

export interface CreateConversationParams {
  id: string;
  mode: ChatMode;
  title?: string;
  userId?: string | null;
}

export interface CreateMessageParams {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface UpdateConversationParams {
  id: string;
  title?: string;
}

/**
 * Database client class for D1 operations
 */
export class DatabaseClient {
  constructor(private db: D1Database) {}

  /**
   * Convert database row to Conversation type
   */
  private rowToConversation(row: ConversationRow): Conversation {
    return {
      id: row.id,
      userId: row.user_id ?? undefined,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      mode: row.mode as ChatMode,
    };
  }

  /**
   * Convert database row to Message type
   */
  private rowToMessage(row: MessageRow): Message {
    const metadata: MessageMetadata = row.metadata
      ? JSON.parse(row.metadata)
      : {};

    return {
      id: row.id,
      role: row.role as "user" | "assistant",
      content: row.content,
      timestamp: row.timestamp,
      model: metadata.model,
      duration: metadata.duration,
      tokens: metadata.tokens,
      toolCalls: metadata.toolCalls,
      sources: metadata.sources,
    };
  }

  /**
   * List conversations for a specific user, ordered by most recently updated.
   * Always scoped by user_id — never returns other users' conversations.
   */
  async listConversationsByUser(userId: string, limit = 50): Promise<Conversation[]> {
    const stmt = this.db.prepare(
      "SELECT id, user_id, title, created_at, updated_at, mode, message_count FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
    );
    const result = await stmt.bind(userId, limit).all() as { results: ConversationRow[] };
    return (result.results || []).map((row) => this.rowToConversation(row));
  }

  /**
   * List anonymous conversations (user_id IS NULL), ordered by most recently updated.
   * Used for unauthenticated users — only returns conversations without an owner.
   */
  async listAnonymousConversations(limit = 50): Promise<Conversation[]> {
    const stmt = this.db.prepare(
      "SELECT id, user_id, title, created_at, updated_at, mode, message_count FROM conversations WHERE user_id IS NULL ORDER BY updated_at DESC LIMIT ?"
    );
    const result = await stmt.bind(limit).all() as { results: ConversationRow[] };
    return (result.results || []).map((row) => this.rowToConversation(row));
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const stmt = this.db.prepare(
      "SELECT id, user_id, title, created_at, updated_at, mode, message_count FROM conversations WHERE id = ?"
    );
    const result = await stmt.bind(id).first() as ConversationRow | null;
    return result ? this.rowToConversation(result) : null;
  }

  /**
   * Create a new conversation
   */
  async createConversation(params: CreateConversationParams): Promise<Conversation> {
    const now = Date.now();
    const stmt = this.db.prepare(
      "INSERT INTO conversations (id, user_id, title, created_at, updated_at, mode, message_count) VALUES (?, ?, ?, ?, ?, ?, 0)"
    );
    await stmt
      .bind(params.id, params.userId ?? null, params.title || "New chat", now, now, params.mode)
      .run();

    return {
      id: params.id,
      userId: params.userId ?? undefined,
      title: params.title || "New chat",
      createdAt: now,
      updatedAt: now,
      mode: params.mode,
    };
  }

  /**
   * Update a conversation (title only)
   */
  async updateConversation(params: UpdateConversationParams): Promise<void> {
    const stmt = this.db.prepare(
      "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?"
    );
    await stmt.bind(params.title, Date.now(), params.id).run();
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM conversations WHERE id = ?");
    await stmt.bind(id).run();
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const stmt = this.db.prepare(
      "SELECT id, conversation_id, role, content, timestamp, metadata FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC"
    );
    const result = await stmt.bind(conversationId).all() as { results: MessageRow[] };
    return (result.results || []).map((row) => this.rowToMessage(row));
  }

  /**
   * Create a new message
   */
  async createMessage(params: CreateMessageParams): Promise<Message> {
    const metadataJson = params.metadata ? JSON.stringify(params.metadata) : null;
    const stmt = this.db.prepare(
      "INSERT INTO messages (id, conversation_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)"
    );
    await stmt
      .bind(
        params.id,
        params.conversationId,
        params.role,
        params.content,
        params.timestamp,
        metadataJson
      )
      .run();

    return {
      id: params.id,
      role: params.role as "user" | "assistant",
      content: params.content,
      timestamp: params.timestamp,
      ...(params.metadata?.model && { model: params.metadata.model }),
      ...(params.metadata?.duration && { duration: params.metadata.duration }),
      ...(params.metadata?.tokens && { tokens: params.metadata.tokens }),
      ...(params.metadata?.toolCalls !== undefined && { toolCalls: params.metadata.toolCalls }),
      ...(params.metadata?.sources && { sources: params.metadata.sources }),
    };
  }

  /**
   * Create multiple messages in a single transaction
   */
  async createMessages(messages: CreateMessageParams[]): Promise<void> {
    if (messages.length === 0) return;

    const stmt = this.db.prepare(
      "INSERT INTO messages (id, conversation_id, role, content, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?)"
    );

    // Batch insert using D1's batch functionality
    const statements = messages.map((msg) =>
      stmt
        .bind(
          msg.id,
          msg.conversationId,
          msg.role,
          msg.content,
          msg.timestamp,
          msg.metadata ? JSON.stringify(msg.metadata) : null
        )
        .run()
    );

    // Execute all statements in a batch
    await this.db.batch(statements);
  }

  /**
   * Get a conversation with all its messages
   */
  async getConversationWithMessages(
    id: string
  ): Promise<{ conversation: Conversation | null; messages: Message[] }> {
    const conversation = await this.getConversation(id);
    const messages = conversation ? await this.getMessages(id) : [];
    return { conversation, messages };
  }

  /**
   * Delete all messages for a conversation
   */
  async deleteMessages(conversationId: string): Promise<void> {
    const stmt = this.db.prepare(
      "DELETE FROM messages WHERE conversation_id = ?"
    );
    await stmt.bind(conversationId).run();
  }

  /**
   * Get total count of conversations
   */
  async getConversationCount(): Promise<number> {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM conversations"
    );
    const result = await stmt.first() as { count: number } | null;
    return result?.count ?? 0;
  }

  /**
   * Atomically check and consume a rate limit slot for an IP hash.
   * Increments the counter and returns whether the request is allowed.
   * Window is 24 hours. Limit is configurable (default 10).
   *
   * Uses INSERT ... ON CONFLICT to atomically upsert, then reads the
   * updated count to avoid race conditions between check and increment.
   */
  async consumeRateLimit(ipHash: string, limit = 10): Promise<{ allowed: boolean; remaining: number; total: number }> {
    const windowDuration = 24 * 60 * 60 * 1000; // 24 hours
    const windowStart = Math.floor(Date.now() / windowDuration) * windowDuration;

    // Atomic upsert: insert or increment in one statement
    const upsertStmt = this.db.prepare(
      "INSERT INTO rate_limits (ip_hash, window_start, message_count) VALUES (?, ?, 1) ON CONFLICT(ip_hash, window_start) DO UPDATE SET message_count = message_count + 1"
    );
    await upsertStmt.bind(ipHash, windowStart).run();

    // Read back the count after upsert
    const selectStmt = this.db.prepare(
      "SELECT message_count FROM rate_limits WHERE ip_hash = ? AND window_start = ?"
    );
    const result = await selectStmt.bind(ipHash, windowStart).first() as { message_count: number } | null;
    const count = result?.message_count ?? 1;

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      total: count,
    };
  }

  /**
   * Clean up expired rate limit entries (older than 48 hours)
   */
  async cleanupRateLimits(): Promise<void> {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const stmt = this.db.prepare("DELETE FROM rate_limits WHERE window_start < ?");
    await stmt.bind(cutoff).run();
  }

  /**
   * Prune old conversations to maintain a maximum count
   * Deletes oldest conversations beyond the limit
   */
  async pruneConversations(maxConversations: number): Promise<number> {
    // First, get conversations that would be deleted
    const excessStmt = this.db.prepare(
      "SELECT id FROM conversations ORDER BY updated_at DESC LIMIT -1 OFFSET ?"
    );
    const excess = await excessStmt.bind(maxConversations).all() as { results: { id: string }[] };

    if (!excess.results || excess.results.length === 0) return 0;

    // Delete the excess conversations (messages will be cascade deleted)
    const ids = excess.results.map((r) => r.id);

    // Delete one by one since SQLite doesn't support unlimited bind params
    for (const id of ids) {
      const deleteStmt = this.db.prepare("DELETE FROM conversations WHERE id = ?");
      await deleteStmt.bind(id).run();
    }

    return ids.length;
  }
}

/**
 * Create a database client from a D1 binding
 */
export function createDatabaseClient(db: D1Database): DatabaseClient {
  return new DatabaseClient(db);
}
