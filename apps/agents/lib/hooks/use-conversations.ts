import { logger } from "@duyet/libs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConversation as createLocalConversation,
  loadConversations as loadLocalStorage,
  deleteConversation as removeLocalStorage,
  saveConversation as saveLocalStorage,
} from "../conversations";
import type { ChatMode, Conversation, Message } from "../types";

const API_BASE = "/api/conversations";

interface UseConversationsOptions {
  /** Returns a Clerk session token for authenticated requests */
  getAuthToken?: () => Promise<string | null>;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  activeMessages: Message[];
  isLoading: boolean;
  createNew: (mode: ChatMode) => Promise<string>;
  switchTo: (id: string) => Promise<Message[]>;
  remove: (id: string) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
  saveMessages: (messages: Message[]) => Promise<void>;
  syncConversation: (id: string) => Promise<void>;
}

/** Check if auth headers contain an Authorization token */
function isAuthenticated(headers: Record<string, string>): boolean {
  return !!headers.Authorization;
}

/** Build auth headers from a token getter. Returns empty headers on any error. */
async function getAuthHeaders(
  getToken?: () => Promise<string | null>
): Promise<Record<string, string>> {
  if (!getToken) return {};
  try {
    const token = await getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    logger.warn("[useConversations] Failed to get auth token:", error);
    return {};
  }
}

/**
 * Fetch conversations from the API.
 * Authenticated requests do NOT fall back to localStorage on error
 * (to avoid serving stale/wrong-user data).
 */
async function fetchConversations(
  authHeaders: Record<string, string> = {}
): Promise<Conversation[]> {
  try {
    const response = await fetch(API_BASE, { headers: authHeaders });
    if (!response.ok)
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    logger.error("[useConversations] API error:", error);
    if (isAuthenticated(authHeaders)) {
      // Authenticated: never fall back to stale local data
      return [];
    }
    return loadLocalStorage();
  }
}

/**
 * Fetch a single conversation with messages from the API
 */
async function fetchConversationWithMessages(
  id: string,
  authHeaders: Record<string, string> = {}
): Promise<{ conversation: Conversation | null; messages: Message[] }> {
  try {
    const response = await fetch(`${API_BASE}/${id}?includeMessages=true`, {
      headers: authHeaders,
    });
    if (!response.ok)
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    const data = await response.json();
    return {
      conversation: data.conversation,
      messages: data.messages || [],
    };
  } catch (error) {
    logger.error("[useConversations] API error:", error);
    if (isAuthenticated(authHeaders)) {
      return { conversation: null, messages: [] };
    }
    const local = loadLocalStorage().find((c) => c.id === id);
    return {
      conversation: local || null,
      messages: [],
    };
  }
}

/**
 * Create a new conversation via API
 */
async function createConversation(
  mode: ChatMode,
  title?: string,
  authHeaders: Record<string, string> = {}
): Promise<Conversation> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ mode, title }),
    });
    if (!response.ok)
      throw new Error(`Failed to create conversation: ${response.status}`);
    const data = await response.json();
    return data.conversation;
  } catch (error) {
    logger.error("[useConversations] API error:", error);
    if (isAuthenticated(authHeaders)) {
      throw error; // Don't fall back for authenticated users
    }
    const conv = createLocalConversation(mode);
    saveLocalStorage(conv);
    return conv;
  }
}

/**
 * Update conversation title via API.
 * Rethrows for authenticated users so callers can revert optimistic state.
 */
async function updateConversationTitle(
  id: string,
  title: string,
  authHeaders: Record<string, string> = {}
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ title }),
    });
    if (!response.ok)
      throw new Error(`Failed to update conversation: ${response.status}`);
  } catch (error) {
    logger.error("[useConversations] API error:", error);
    if (isAuthenticated(authHeaders)) throw error;
    const local = loadLocalStorage().find((c) => c.id === id);
    if (local) {
      saveLocalStorage({ ...local, title });
    }
  }
}

/**
 * Delete conversation via API.
 * Rethrows for authenticated users so callers can revert optimistic state.
 */
async function deleteConversation(
  id: string,
  authHeaders: Record<string, string> = {}
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!response.ok)
      throw new Error(`Failed to delete conversation: ${response.status}`);
  } catch (error) {
    logger.error("[useConversations] API error:", error);
    if (isAuthenticated(authHeaders)) throw error;
    removeLocalStorage(id);
  }
}

/**
 * Save messages to a conversation via API.
 * Checks each POST response and logs failures.
 */
async function saveMessagesToConversation(
  id: string,
  messages: Message[],
  authHeaders: Record<string, string> = {}
): Promise<void> {
  // Fetch existing messages to determine which ones to add
  const response = await fetch(`${API_BASE}/${id}/messages`, {
    headers: authHeaders,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch existing messages: ${response.status}`);
  }
  const data = await response.json();
  const existingMessages = data.messages || [];

  // Find new messages (by checking IDs)
  const existingIds = new Set(existingMessages.map((m: Message) => m.id));
  const newMessages = messages.filter((m) => !existingIds.has(m.id));

  // Add new messages, checking each response
  const errors: Array<{ messageId: string; status: number }> = [];
  for (const message of newMessages) {
    const res = await fetch(`${API_BASE}/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        metadata: {
          model: message.model,
          duration: message.duration,
          tokens: message.tokens,
          toolCalls: message.toolCalls,
          sources: message.sources,
        },
      }),
    });
    if (!res.ok) {
      errors.push({ messageId: message.id, status: res.status });
      logger.error(
        `[useConversations] Failed to save message ${message.id}: HTTP ${res.status}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Failed to save ${errors.length}/${newMessages.length} messages`
    );
  }
}

/**
 * Hook for managing conversations with database storage.
 * Falls back to localStorage if API is unavailable (unauthenticated only).
 * Authenticated requests never fall back to localStorage.
 * Pass getAuthToken to scope conversations to the authenticated user.
 */
export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsReturn {
  const { getAuthToken } = options;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesCacheRef = useRef<Map<string, Message[]>>(new Map());
  const getAuthTokenRef = useRef(getAuthToken);
  getAuthTokenRef.current = getAuthToken;

  // Track whether auth is configured so the effect re-runs when auth becomes available
  const hasAuth = !!getAuthToken;

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;
  const activeMessages = messagesCacheRef.current.get(activeId || "") ?? [];

  // Load conversations on mount and when auth state changes
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const headers = await getAuthHeaders(getAuthTokenRef.current);
      const loaded = await fetchConversations(headers);
      setConversations(loaded);
      setIsLoading(false);
    }
    load();
  }, [hasAuth]);

  const createNew = useCallback(async (mode: ChatMode): Promise<string> => {
    logger.debug("[useConversations] Creating new conversation, mode:", mode);
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const conv = await createConversation(mode, undefined, headers);
    logger.debug(
      "[useConversations] Created conversation:",
      conv.id,
      conv.title
    );
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    messagesCacheRef.current.set(conv.id, []);
    logger.debug("[useConversations] Set active conversation:", conv.id);
    return conv.id;
  }, []);

  const switchTo = useCallback(async (id: string): Promise<Message[]> => {
    // Check if we have messages cached
    if (messagesCacheRef.current.has(id)) {
      setActiveId(id);
      logger.debug(
        "[useConversations] Switching to conversation (cached):",
        id
      );
      return messagesCacheRef.current.get(id)!;
    }

    // Try to fetch from API
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const { conversation, messages } = await fetchConversationWithMessages(
      id,
      headers
    );

    if (conversation) {
      // Update conversation in state if needed
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...conversation } : c))
      );
      messagesCacheRef.current.set(id, messages);
    }

    setActiveId(id);
    logger.debug(
      "[useConversations] Switching to conversation:",
      id,
      "messages:",
      messages.length
    );
    return messages;
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const headers = await getAuthHeaders(getAuthTokenRef.current);
      // Capture state for rollback before optimistic removal
      const snapshot = conversations;
      const cachedMessages = messagesCacheRef.current.get(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      messagesCacheRef.current.delete(id);
      if (activeId === id) setActiveId(null);
      try {
        await deleteConversation(id, headers);
      } catch {
        // Revert optimistic removal on failure
        setConversations(snapshot);
        if (cachedMessages) messagesCacheRef.current.set(id, cachedMessages);
      }
    },
    [activeId, conversations]
  );

  const updateTitle = useCallback(
    async (id: string, title: string) => {
      const finalTitle = title.trim().slice(0, 60) || "New chat";
      // Capture previous title for rollback
      const previous = conversations.find((c) => c.id === id);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: finalTitle } : c))
      );
      const headers = await getAuthHeaders(getAuthTokenRef.current);
      try {
        await updateConversationTitle(id, finalTitle, headers);
      } catch {
        // Revert optimistic title change on failure
        if (previous) {
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, title: previous.title } : c))
          );
        }
      }
    },
    [conversations]
  );

  const saveMessages = useCallback(
    async (messages: Message[]) => {
      if (!activeId) return;

      // Update local cache immediately
      messagesCacheRef.current.set(activeId, messages);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, updatedAt: Date.now() } : c
        )
      );

      // Persist to API (fire and forget)
      getAuthHeaders(getAuthTokenRef.current).then((headers) => {
        saveMessagesToConversation(activeId, messages, headers).catch(
          (error) => {
            logger.error("[useConversations] Failed to save messages:", error);
          }
        );
      });
    },
    [activeId]
  );

  const syncConversation = useCallback(async (id: string) => {
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const { conversation, messages } = await fetchConversationWithMessages(
      id,
      headers
    );
    if (conversation) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...conversation } : c))
      );
      messagesCacheRef.current.set(id, messages);
    }
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    activeMessages,
    isLoading,
    createNew,
    switchTo,
    remove,
    updateTitle,
    saveMessages,
    syncConversation,
  };
}
