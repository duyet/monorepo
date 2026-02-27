-- Database schema for agents app conversations
-- Cloudflare D1 database (SQLite)

-- Conversations table
-- Stores chat conversations with metadata
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('fast', 'agent')),
  message_count INTEGER NOT NULL DEFAULT 0
);

-- Messages table
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  -- JSON metadata: model, duration, tokens, tool_calls, sources
  metadata TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Trigger to update conversation metadata when messages are added
CREATE TRIGGER IF NOT EXISTS update_conversation_on_message_insert
AFTER INSERT ON messages
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      updated_at = MAX(updated_at, NEW.timestamp)
  WHERE id = NEW.conversation_id;
END;

-- Trigger to update conversation metadata when messages are deleted
CREATE TRIGGER IF NOT EXISTS update_conversation_on_message_delete
AFTER DELETE ON messages
BEGIN
  UPDATE conversations
  SET message_count = message_count - 1,
      updated_at = (SELECT MAX(timestamp) FROM messages WHERE conversation_id = OLD.conversation_id)
  WHERE id = OLD.conversation_id;
END;
