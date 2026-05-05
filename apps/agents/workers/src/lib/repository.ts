export interface D1Env {
  DB: D1Database;
}

export interface MirrorMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
}

export async function ensureConversation(
  db: D1Database,
  conversationId: string,
  userId: string,
  title = "New chat"
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO conversations (id, user_id, title, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(conversationId, userId, title, Date.now(), Date.now())
    .run();

  await db
    .prepare("UPDATE conversations SET updated_at = ? WHERE id = ?")
    .bind(Date.now(), conversationId)
    .run();
}

export async function addMessage(db: D1Database, message: MirrorMessage): Promise<void> {
  await db
    .prepare(
      `INSERT INTO messages (id, conversation_id, role, content, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      message.id,
      message.conversationId,
      message.role,
      message.text,
      message.createdAt
    )
    .run();
}

export async function addSession(
  db: D1Database,
  sessionId: string,
  userId: string,
  conversationId: string
): Promise<void> {
  await db
    .prepare(
      `INSERT OR REPLACE INTO sessions (id, user_id, conversation_id, updated_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(sessionId, userId, conversationId, Date.now())
    .run();
}

export async function listConversationsByUser(db: D1Database, userId: string) {
  const result = await db
    .prepare(
      `SELECT id, user_id, title, created_at, updated_at
       FROM conversations
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 100`
    )
    .bind(userId)
    .all<{
      id: string;
      user_id: string;
      title: string;
      created_at: number;
      updated_at: number;
    }>();

  return result.results ?? [];
}

export async function getConversationWithMessages(
  db: D1Database,
  conversationId: string,
  userId: string
) {
  const conversation = await db
    .prepare(
      `SELECT id, user_id, title, created_at, updated_at
       FROM conversations
       WHERE id = ? AND user_id = ?`
    )
    .bind(conversationId, userId)
    .first<{
      id: string;
      user_id: string;
      title: string;
      created_at: number;
      updated_at: number;
    }>();

  if (!conversation) return { conversation: null, messages: [] };

  const messages = await db
    .prepare(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC`
    )
    .bind(conversationId)
    .all<{ id: string; role: string; content: string; created_at: number }>();

  return {
    conversation,
    messages: messages.results ?? [],
  };
}

export async function addToolCall(
  db: D1Database,
  params: {
    id: string;
    conversationId: string;
    messageId: string;
    toolName: string;
    status: string;
    payload?: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO tool_calls (id, conversation_id, message_id, tool_name, status, payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      params.id,
      params.conversationId,
      params.messageId,
      params.toolName,
      params.status,
      params.payload ?? null,
      Date.now()
    )
    .run();
}

export async function addApproval(
  db: D1Database,
  params: {
    id: string;
    conversationId: string;
    toolCallId: string;
    requestedBy: string;
    decision: "approved" | "rejected";
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO approvals (id, conversation_id, tool_call_id, requested_by, decision, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      params.id,
      params.conversationId,
      params.toolCallId,
      params.requestedBy,
      params.decision,
      Date.now()
    )
    .run();
}
