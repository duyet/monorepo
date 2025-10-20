/**
 * Conversation Storage Utilities
 *
 * Safe localStorage operations for conversation history with error handling.
 */

import type {
  Conversation,
  StorageResult,
  CONVERSATION_STORAGE_KEY,
} from "@/types/conversation";

const STORAGE_KEY: typeof CONVERSATION_STORAGE_KEY =
  "chatkit_conversation_history";

/**
 * Checks if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads conversations from localStorage
 *
 * @returns Array of conversations or empty array on error
 */
export function loadConversations(): StorageResult<Conversation[]> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "localStorage is not available",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: true, data: [] };
    }

    const parsed = JSON.parse(stored);

    // Validate the data structure
    if (!Array.isArray(parsed)) {
      console.warn("[ConversationStorage] Invalid data format, resetting");
      return { success: true, data: [] };
    }

    // Validate each conversation object
    const validated = parsed.filter((item): item is Conversation => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.threadId === "string" &&
        typeof item.title === "string" &&
        typeof item.createdAt === "number" &&
        typeof item.lastActivityAt === "number"
      );
    });

    return { success: true, data: validated };
  } catch (error) {
    console.error("[ConversationStorage] Failed to load conversations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Saves conversations to localStorage
 *
 * @param conversations - Array of conversations to save
 */
export function saveConversations(
  conversations: Conversation[],
): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "localStorage is not available",
    };
  }

  try {
    const serialized = JSON.stringify(conversations);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[ConversationStorage] Failed to save conversations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clears all conversations from localStorage
 */
export function clearConversations(): StorageResult<void> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: "localStorage is not available",
    };
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true, data: undefined };
  } catch (error) {
    console.error(
      "[ConversationStorage] Failed to clear conversations:",
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
