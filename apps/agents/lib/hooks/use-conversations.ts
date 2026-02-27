"use client";

import { useState, useCallback, useEffect } from "react";
import type { Conversation, ChatMode } from "../types";
import {
  loadConversations,
  saveConversation,
  deleteConversation as removeConversation,
  createConversation,
} from "../conversations";

export interface UseConversationsReturn {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  createNew: (mode: ChatMode) => string;
  switchTo: (id: string) => void;
  remove: (id: string) => void;
  updateTitle: (id: string, firstMessage: string) => void;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setConversations(loadConversations());
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  const createNew = useCallback(
    (mode: ChatMode): string => {
      console.log("[useConversations] Creating new conversation, mode:", mode);
      const conv = createConversation(mode);
      console.log("[useConversations] Created conversation:", conv.id, conv.title);
      saveConversation(conv);
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      console.log("[useConversations] Set active conversation:", conv.id);
      return conv.id;
    },
    []
  );

  const switchTo = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const remove = useCallback(
    (id: string) => {
      removeConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const updateTitle = useCallback((id: string, title: string) => {
    const finalTitle = title.trim().slice(0, 60) || "New chat";
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: finalTitle } : c))
    );
    // Also persist
    const all = loadConversations();
    const conv = all.find((c) => c.id === id);
    if (conv) saveConversation({ ...conv, title: finalTitle });
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    createNew,
    switchTo,
    remove,
    updateTitle,
  };
}
