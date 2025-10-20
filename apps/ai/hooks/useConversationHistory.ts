/**
 * Conversation History Hook
 *
 * Custom hook for managing conversation history with localStorage persistence.
 */

import { useState, useEffect, useCallback } from "react";
import type { Conversation } from "@/types/conversation";
import { MAX_CONVERSATIONS } from "@/types/conversation";
import {
  loadConversations,
  saveConversations,
  clearConversations,
} from "@/lib/conversation-storage";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

export interface UseConversationHistoryReturn {
  /** List of all conversations */
  conversations: Conversation[];

  /** Current active conversation thread ID */
  activeThreadId: string | null;

  /** Set the active conversation */
  setActiveThreadId: (threadId: string | null) => void;

  /** Add or update a conversation */
  upsertConversation: (
    threadId: string,
    updates: Partial<Omit<Conversation, "threadId">>,
  ) => void;

  /** Delete a conversation */
  deleteConversation: (threadId: string) => void;

  /** Clear all conversations */
  clearAll: () => void;

  /** Get a specific conversation by thread ID */
  getConversation: (threadId: string) => Conversation | undefined;

  /** Whether the hook is ready (loaded from storage) */
  isReady: boolean;
}

/**
 * Hook for managing conversation history
 *
 * @returns Conversation management functions and state
 */
export function useConversationHistory(): UseConversationHistoryReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const result = loadConversations();

    if (result.success) {
      setConversations(result.data);
      if (isDev) {
        console.debug(
          "[useConversationHistory] Loaded conversations:",
          result.data.length,
        );
      }
    } else {
      console.error(
        "[useConversationHistory] Failed to load conversations:",
        result.error,
      );
    }

    setIsReady(true);
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (!isReady) return;

    const result = saveConversations(conversations);
    if (!result.success) {
      console.error(
        "[useConversationHistory] Failed to save conversations:",
        result.error,
      );
    } else if (isDev) {
      console.debug(
        "[useConversationHistory] Saved conversations:",
        conversations.length,
      );
    }
  }, [conversations, isReady]);

  /**
   * Add or update a conversation
   */
  const upsertConversation = useCallback(
    (threadId: string, updates: Partial<Omit<Conversation, "threadId">>) => {
      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.threadId === threadId);

        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...updates,
            lastActivityAt: Date.now(),
          };

          if (isDev) {
            console.debug(
              "[useConversationHistory] Updated conversation:",
              threadId,
            );
          }

          return updated;
        } else {
          // Add new conversation
          const newConversation: Conversation = {
            threadId,
            title: updates.title || "New Conversation",
            preview: updates.preview,
            createdAt: Date.now(),
            lastActivityAt: Date.now(),
            messageCount: updates.messageCount || 0,
          };

          const updated = [newConversation, ...prev];

          // Limit the number of conversations
          const limited =
            updated.length > MAX_CONVERSATIONS
              ? updated.slice(0, MAX_CONVERSATIONS)
              : updated;

          if (isDev) {
            console.debug(
              "[useConversationHistory] Added conversation:",
              threadId,
            );
          }

          return limited;
        }
      });
    },
    [],
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback((threadId: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.threadId !== threadId);

      if (isDev) {
        console.debug(
          "[useConversationHistory] Deleted conversation:",
          threadId,
        );
      }

      return filtered;
    });
  }, []);

  /**
   * Clear all conversations
   */
  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveThreadId(null);

    const result = clearConversations();
    if (!result.success) {
      console.error(
        "[useConversationHistory] Failed to clear storage:",
        result.error,
      );
    } else if (isDev) {
      console.debug("[useConversationHistory] Cleared all conversations");
    }
  }, []);

  /**
   * Get a specific conversation by thread ID
   */
  const getConversation = useCallback(
    (threadId: string): Conversation | undefined => {
      return conversations.find((c) => c.threadId === threadId);
    },
    [conversations],
  );

  return {
    conversations,
    activeThreadId,
    setActiveThreadId,
    upsertConversation,
    deleteConversation,
    clearAll,
    getConversation,
    isReady,
  };
}
