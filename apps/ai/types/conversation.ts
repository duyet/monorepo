/**
 * Conversation History Types
 *
 * Type definitions for managing conversation history in ChatKit.
 */

/**
 * Represents a single conversation/thread
 */
export interface Conversation {
  /** Unique thread ID from ChatKit */
  threadId: string;

  /** Display title for the conversation */
  title: string;

  /** Preview text (usually first user message) */
  preview?: string;

  /** When the conversation was created */
  createdAt: number;

  /** Last activity timestamp */
  lastActivityAt: number;

  /** Number of messages in the conversation */
  messageCount?: number;
}

/**
 * Storage key for localStorage
 */
export const CONVERSATION_STORAGE_KEY = "chatkit_conversation_history" as const;

/**
 * Maximum number of conversations to keep in history
 */
export const MAX_CONVERSATIONS = 50;

/**
 * Result type for storage operations
 */
export type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
