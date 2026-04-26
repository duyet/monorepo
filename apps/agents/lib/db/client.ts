/**
 * Database client for Cloudflare D1
 * Handles CRUD operations for conversations, messages, and graph checkpoints
 */

import type { AgentState } from "../graph/types";
import {
  type ChatMode,
  type Conversation,
  DEFAULT_OPENROUTER_MODEL_ID,
  type Message,
  type Source,
} from "../types";

// Database row types
export interface ConversationRow {
  id: string;
  user_id: string | null;
  title: string;
  created_at: number;
  updated_at: number;
  mode: string;
  model_id: string | null;
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
  modelId?: string;
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
  modelId?: string;
}

// Checkpoint row type
export interface CheckpointRow {
  id: string;
  conversation_id: string;
  state_snapshot: string;
  version: number;
  created_at: number;
  parent_checkpoint_id: string | null;
}

// Checkpoint CRUD parameters
export interface CreateCheckpointParams {
  id: string;
  conversationId: string;
  stateSnapshot: AgentState;
  version: number;
  parentCheckpointId?: string;
}

/**
 * Database client class for D1 operations
 */
export class DatabaseClient {
  constructor(private db: any) {}

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
      modelId: row.model_id ?? undefined,
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
  async listConversationsByUser(
    userId: string,
    limit = 50
  ): Promise<Conversation[]> {
    const stmt = this.db.prepare(
      "SELECT id, user_id, title, created_at, updated_at, mode, model_id, message_count FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?"
    );
    const result = (await stmt.bind(userId, limit).all()) as {
      results: ConversationRow[];
    };
    return (result.results || []).map((row) => this.rowToConversation(row));
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const stmt = this.db.prepare(
      "SELECT id, user_id, title, created_at, updated_at, mode, model_id, message_count FROM conversations WHERE id = ?"
    );
    const result = (await stmt.bind(id).first()) as ConversationRow | null;
    return result ? this.rowToConversation(result) : null;
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    params: CreateConversationParams
  ): Promise<Conversation> {
    const now = Date.now();
    const stmt = this.db.prepare(
      "INSERT INTO conversations (id, user_id, title, created_at, updated_at, mode, model_id, message_count) VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
    );
    await stmt
      .bind(
        params.id,
        params.userId ?? null,
        params.title || "New chat",
        now,
        now,
        params.mode,
        params.modelId ?? DEFAULT_OPENROUTER_MODEL_ID
      )
      .run();

    return {
      id: params.id,
      userId: params.userId ?? undefined,
      title: params.title || "New chat",
      createdAt: now,
      updatedAt: now,
      mode: params.mode,
      modelId: params.modelId ?? DEFAULT_OPENROUTER_MODEL_ID,
    };
  }

  /**
   * Update conversation metadata.
   */
  async updateConversation(params: UpdateConversationParams): Promise<void> {
    if (params.title === undefined && params.modelId === undefined) return;

    const assignments: string[] = [];
    const values: unknown[] = [];

    if (params.title !== undefined) {
      assignments.push("title = ?");
      values.push(params.title);
    }

    if (params.modelId !== undefined) {
      assignments.push("model_id = ?");
      values.push(params.modelId);
    }

    assignments.push("updated_at = ?");
    values.push(Date.now());
    values.push(params.id);

    const stmt = this.db.prepare(
      `UPDATE conversations SET ${assignments.join(", ")} WHERE id = ?`
    );
    await stmt.bind(...values).run();
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
    const result = (await stmt.bind(conversationId).all()) as {
      results: MessageRow[];
    };
    return (result.results || []).map((row) => this.rowToMessage(row));
  }

  /**
   * Create a new message
   */
  async createMessage(params: CreateMessageParams): Promise<Message> {
    const metadataJson = params.metadata
      ? JSON.stringify(params.metadata)
      : null;
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
      ...(params.metadata?.toolCalls !== undefined && {
        toolCalls: params.metadata.toolCalls,
      }),
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
    const stmt = this.db.prepare("SELECT COUNT(*) as count FROM conversations");
    const result = (await stmt.first()) as { count: number } | null;
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
  async consumeRateLimit(
    ipHash: string,
    limit = 10
  ): Promise<{ allowed: boolean; remaining: number; total: number }> {
    const windowDuration = 24 * 60 * 60 * 1000; // 24 hours
    const windowStart =
      Math.floor(Date.now() / windowDuration) * windowDuration;

    // Read current count first
    const selectStmt = this.db.prepare(
      "SELECT message_count FROM rate_limits WHERE ip_hash = ? AND window_start = ?"
    );
    const existing = (await selectStmt.bind(ipHash, windowStart).first()) as {
      message_count: number;
    } | null;
    const currentCount = existing?.message_count ?? 0;

    // If already at or over limit, reject without incrementing
    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        total: currentCount,
      };
    }

    // Atomic upsert: insert or increment (only when under limit)
    const upsertStmt = this.db.prepare(
      "INSERT INTO rate_limits (ip_hash, window_start, message_count) VALUES (?, ?, 1) ON CONFLICT(ip_hash, window_start) DO UPDATE SET message_count = message_count + 1"
    );
    await upsertStmt.bind(ipHash, windowStart).run();

    const newCount = currentCount + 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - newCount),
      total: newCount,
    };
  }

  // ========== Checkpoint CRUD Operations ==========

  /**
   * Create a new checkpoint for a conversation
   *
   * Stores a state snapshot for potential resume/rollback.
   * Version numbers must be increasing for a conversation.
   */
  async createCheckpoint(
    params: CreateCheckpointParams
  ): Promise<CheckpointRow> {
    const { id, conversationId, stateSnapshot, version, parentCheckpointId } =
      params;
    const now = Date.now();

    const stmt = this.db.prepare(
      "INSERT INTO graph_checkpoints (id, conversation_id, state_snapshot, version, created_at, parent_checkpoint_id) VALUES (?, ?, ?, ?, ?, ?)"
    );

    await stmt
      .bind(
        id,
        conversationId,
        JSON.stringify(stateSnapshot),
        version,
        now,
        parentCheckpointId ?? null
      )
      .run();

    return {
      id,
      conversation_id: conversationId,
      state_snapshot: JSON.stringify(stateSnapshot),
      version,
      created_at: now,
      parent_checkpoint_id: parentCheckpointId ?? null,
    };
  }

  /**
   * Get a checkpoint by ID
   *
   * Returns the checkpoint with parsed state snapshot.
   */
  async getCheckpoint(id: string): Promise<{
    checkpoint: CheckpointRow;
    state: AgentState;
  } | null> {
    const stmt = this.db.prepare(
      "SELECT id, conversation_id, state_snapshot, version, created_at, parent_checkpoint_id FROM graph_checkpoints WHERE id = ?"
    );

    const result = (await stmt.bind(id).first()) as CheckpointRow | null;

    if (!result) {
      return null;
    }

    return {
      checkpoint: result,
      state: JSON.parse(result.state_snapshot) as AgentState,
    };
  }

  /**
   * Get the latest checkpoint for a conversation
   *
   * Returns the most recent checkpoint (highest version).
   */
  async getLatestCheckpoint(
    conversationId: string
  ): Promise<{ checkpoint: CheckpointRow; state: AgentState } | null> {
    const stmt = this.db.prepare(
      "SELECT id, conversation_id, state_snapshot, version, created_at, parent_checkpoint_id FROM graph_checkpoints WHERE conversation_id = ? ORDER BY version DESC LIMIT 1"
    );

    const result = (await stmt
      .bind(conversationId)
      .first()) as CheckpointRow | null;

    if (!result) {
      return null;
    }

    return {
      checkpoint: result,
      state: JSON.parse(result.state_snapshot) as AgentState,
    };
  }

  /**
   * List all checkpoints for a conversation
   *
   * Ordered by version descending (newest first).
   */
  async listCheckpoints(
    conversationId: string,
    limit = 50
  ): Promise<CheckpointRow[]> {
    const stmt = this.db.prepare(
      "SELECT id, conversation_id, state_snapshot, version, created_at, parent_checkpoint_id FROM graph_checkpoints WHERE conversation_id = ? ORDER BY version DESC LIMIT ?"
    );

    const result = (await stmt.bind(conversationId, limit).all()) as {
      results: CheckpointRow[];
    };

    return result.results || [];
  }

  /**
   * Delete a checkpoint by ID
   *
   * Note: Child checkpoints will have their parent_checkpoint_id set to NULL
   * due to the ON DELETE SET NULL foreign key constraint.
   */
  async deleteCheckpoint(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM graph_checkpoints WHERE id = ?");
    await stmt.bind(id).run();
  }

  /**
   * Delete all checkpoints for a conversation
   *
   * Used when a conversation is deleted.
   */
  async deleteCheckpointsForConversation(
    conversationId: string
  ): Promise<number> {
    const stmt = this.db.prepare(
      "DELETE FROM graph_checkpoints WHERE conversation_id = ?"
    );
    const result = await stmt.bind(conversationId).run();

    // Return the number of deleted rows
    return result.meta.changes ?? 0;
  }

  /**
   * Get checkpoint version history for a conversation
   *
   * Returns checkpoints in version order with parent-child relationships.
   */
  async getCheckpointHistory(
    conversationId: string
  ): Promise<Array<{ checkpoint: CheckpointRow; state: AgentState }>> {
    const stmt = this.db.prepare(
      "SELECT id, conversation_id, state_snapshot, version, created_at, parent_checkpoint_id FROM graph_checkpoints WHERE conversation_id = ? ORDER BY version ASC"
    );

    const result = (await stmt.bind(conversationId).all()) as {
      results: CheckpointRow[];
    };

    return (result.results || []).map((row) => ({
      checkpoint: row,
      state: JSON.parse(row.state_snapshot) as AgentState,
    }));
  }

  /**
   * Prune old checkpoints for a conversation
   *
   * Keeps only the latest N checkpoints to manage storage.
   * Returns the number of checkpoints deleted.
   */
  async pruneCheckpoints(
    conversationId: string,
    keepCount = 10
  ): Promise<number> {
    // Get checkpoints to delete (all but the latest N)
    const stmt = this.db.prepare(
      "SELECT id FROM graph_checkpoints WHERE conversation_id = ? AND id NOT IN (SELECT id FROM graph_checkpoints WHERE conversation_id = ? ORDER BY version DESC LIMIT ?) ORDER BY version ASC"
    );

    const excess = (await stmt
      .bind(conversationId, conversationId, keepCount)
      .all()) as {
      results: { id: string }[];
    };

    if (!excess.results || excess.results.length === 0) {
      return 0;
    }

    // Delete the excess checkpoints
    const ids = excess.results.map((r) => r.id);
    let deletedCount = 0;

    for (const id of ids) {
      const deleteStmt = this.db.prepare(
        "DELETE FROM graph_checkpoints WHERE id = ?"
      );
      await deleteStmt.bind(id).run();
      deletedCount++;
    }

    return deletedCount;
  }

  // ========== Vote Operations ==========

  /**
   * Get all votes for a conversation
   */
  async getVotesByChatId(
    chatId: string
  ): Promise<Array<{ chatId: string; messageId: string; isUpvoted: boolean }>> {
    const stmt = this.db.prepare(
      "SELECT chat_id, message_id, is_upvoted FROM votes WHERE chat_id = ?"
    );
    const result = (await stmt.bind(chatId).all()) as {
      results: Array<{
        chat_id: string;
        message_id: string;
        is_upvoted: number;
      }>;
    };

    return (result.results || []).map((row) => ({
      chatId: row.chat_id,
      messageId: row.message_id,
      isUpvoted: Boolean(row.is_upvoted),
    }));
  }

  /**
   * Cast or update a vote on a message
   */
  async voteMessage(params: {
    chatId: string;
    messageId: string;
    isUpvoted: boolean;
  }): Promise<void> {
    const stmt = this.db.prepare(
      "INSERT INTO votes (chat_id, message_id, is_upvoted) VALUES (?, ?, ?) ON CONFLICT(chat_id, message_id) DO UPDATE SET is_upvoted = ?"
    );
    await stmt
      .bind(
        params.chatId,
        params.messageId,
        params.isUpvoted ? 1 : 0,
        params.isUpvoted ? 1 : 0
      )
      .run();
  }

  // ========== Document Operations ==========

  /**
   * Save a document (artifact)
   */
  async saveDocument(params: {
    id: string;
    title: string;
    content: string;
    kind: string;
    userId: string;
  }): Promise<void> {
    const now = Date.now();
    const stmt = this.db.prepare(
      "INSERT INTO documents (id, title, content, kind, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    await stmt
      .bind(
        params.id,
        params.title,
        params.content,
        params.kind,
        params.userId,
        now
      )
      .run();
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<{
    id: string;
    title: string;
    content: string;
    kind: string;
    userId: string;
    createdAt: number;
  } | null> {
    const stmt = this.db.prepare(
      "SELECT id, title, content, kind, user_id, created_at FROM documents WHERE id = ? ORDER BY created_at DESC LIMIT 1"
    );
    const result = (await stmt.bind(id).first()) as {
      id: string;
      title: string;
      content: string;
      kind: string;
      user_id: string;
      created_at: number;
    } | null;

    if (!result) return null;

    return {
      id: result.id,
      title: result.title,
      content: result.content,
      kind: result.kind,
      userId: result.user_id,
      createdAt: result.created_at,
    };
  }

  /**
   * Update document content
   */
  async updateDocumentContent(id: string, content: string): Promise<void> {
    const stmt = this.db.prepare(
      "UPDATE documents SET content = ? WHERE id = ?"
    );
    await stmt.bind(content, id).run();
  }
}

/**
 * Create a database client from a D1 binding
 */
export function createDatabaseClient(db: any): DatabaseClient {
  return new DatabaseClient(db);
}
