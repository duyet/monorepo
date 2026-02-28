"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Conversation, ChatMode, Message } from "../types";
import {
  loadConversations as loadLocalStorage,
  saveConversation as saveLocalStorage,
  deleteConversation as removeLocalStorage,
  createConversation as createLocalConversation,
} from "../conversations";

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

/** Build auth headers from a token getter */
async function getAuthHeaders(
  getToken?: () => Promise<string | null>
): Promise<Record<string, string>> {
  if (!getToken) return {};
  const token = await getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch conversations from the API
 */
async function fetchConversations(authHeaders: Record<string, string> = {}): Promise<Conversation[]> {
  try {
    const response = await fetch(API_BASE, { headers: authHeaders });
    if (!response.ok) throw new Error("Failed to fetch conversations");
    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
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
    const response = await fetch(`${API_BASE}/${id}?includeMessages=true`, { headers: authHeaders });
    if (!response.ok) throw new Error("Failed to fetch conversation");
    const data = await response.json();
    return {
      conversation: data.conversation,
      messages: data.messages || [],
    };
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
    const local = loadLocalStorage().find((c) => c.id === id);
    return {
      conversation: local || null,
      messages: [], // Messages loaded separately via messages cache
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
    if (!response.ok) throw new Error("Failed to create conversation");
    const data = await response.json();
    return data.conversation;
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
    const conv = createLocalConversation(mode);
    saveLocalStorage(conv);
    return conv;
  }
}

/**
 * Update conversation title via API
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
    if (!response.ok) throw new Error("Failed to update conversation");
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
    const local = loadLocalStorage().find((c) => c.id === id);
    if (local) {
      saveLocalStorage({ ...local, title });
    }
  }
}

/**
 * Delete conversation via API
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
    if (!response.ok) throw new Error("Failed to delete conversation");
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
    removeLocalStorage(id);
  }
}

/**
 * Save messages to a conversation via API
 */
async function saveMessagesToConversation(
  id: string,
  messages: Message[],
  authHeaders: Record<string, string> = {}
): Promise<void> {
  try {
    // Fetch existing messages to determine which ones to add
    const response = await fetch(`${API_BASE}/${id}/messages`, { headers: authHeaders });
    if (!response.ok) throw new Error("Failed to fetch existing messages");
    const data = await response.json();
    const existingMessages = data.messages || [];

    // Find new messages (by checking IDs)
    const existingIds = new Set(existingMessages.map((m: Message) => m.id));
    const newMessages = messages.filter((m) => !existingIds.has(m.id));

    // Add new messages
    for (const message of newMessages) {
      await fetch(`${API_BASE}/${id}/messages`, {
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
    }
  } catch (error) {
    console.error("[useConversations] API error, falling back to localStorage:", error);
    // Messages are cached in memory, localStorage only stores conversation metadata
    const local = loadLocalStorage().find((c) => c.id === id);
    if (local) {
      saveLocalStorage({ ...local, updatedAt: Date.now() });
    }
  }
}

/**
 * Hook for managing conversations with database storage.
 * Falls back to localStorage if API is unavailable.
 * Pass getAuthToken to scope conversations to the authenticated user.
 */
export function useConversations(options: UseConversationsOptions = {}): UseConversationsReturn {
  const { getAuthToken } = options;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesCacheRef = useRef<Map<string, Message[]>>(new Map());
  const getAuthTokenRef = useRef(getAuthToken);
  getAuthTokenRef.current = getAuthToken;

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const activeMessages = messagesCacheRef.current.get(activeId || "") ?? [];

  // Load conversations on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const headers = await getAuthHeaders(getAuthTokenRef.current);
      const loaded = await fetchConversations(headers);
      setConversations(loaded);
      setIsLoading(false);
    }
    load();
  }, []);

  const createNew = useCallback(async (mode: ChatMode): Promise<string> => {
    console.log("[useConversations] Creating new conversation, mode:", mode);
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const conv = await createConversation(mode, undefined, headers);
    console.log("[useConversations] Created conversation:", conv.id, conv.title);
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    messagesCacheRef.current.set(conv.id, []);
    console.log("[useConversations] Set active conversation:", conv.id);
    return conv.id;
  }, []);

  const switchTo = useCallback(async (id: string): Promise<Message[]> => {
    // Check if we have messages cached
    if (messagesCacheRef.current.has(id)) {
      setActiveId(id);
      console.log("[useConversations] Switching to conversation (cached):", id);
      return messagesCacheRef.current.get(id)!;
    }

    // Try to fetch from API
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const { conversation, messages } = await fetchConversationWithMessages(id, headers);

    if (conversation) {
      // Update conversation in state if needed
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...conversation } : c))
      );
      messagesCacheRef.current.set(id, messages);
    }

    setActiveId(id);
    console.log("[useConversations] Switching to conversation:", id, "messages:", messages.length);
    return messages;
  }, []);

  const remove = useCallback(async (id: string) => {
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    await deleteConversation(id, headers);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    messagesCacheRef.current.delete(id);
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const updateTitle = useCallback(async (id: string, title: string) => {
    const finalTitle = title.trim().slice(0, 60) || "New chat";
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: finalTitle } : c))
    );
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    await updateConversationTitle(id, finalTitle, headers);
  }, []);

  const saveMessages = useCallback(async (messages: Message[]) => {
    if (!activeId) return;

    // Update local cache immediately
    messagesCacheRef.current.set(activeId, messages);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, updatedAt: Date.now() } : c))
    );

    // Persist to API (fire and forget)
    getAuthHeaders(getAuthTokenRef.current).then((headers) => {
      saveMessagesToConversation(activeId, messages, headers).catch((error) => {
        console.error("[useConversations] Failed to save messages:", error);
      });
    });
  }, [activeId]);

  const syncConversation = useCallback(async (id: string) => {
    const headers = await getAuthHeaders(getAuthTokenRef.current);
    const { conversation, messages } = await fetchConversationWithMessages(id, headers);
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
