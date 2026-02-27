import type { Conversation } from "./types";

const STORAGE_KEY = "agent-conversations";
const MAX_CONVERSATIONS = 50;

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    all[idx] = { ...conversation, updatedAt: Date.now() };
  } else {
    all.unshift({ ...conversation, updatedAt: Date.now() });
  }
  // Evict oldest beyond cap
  const trimmed = all.slice(0, MAX_CONVERSATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function deleteConversation(id: string): void {
  const all = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function generateConversationTitle(firstMessage: string): string {
  return firstMessage.trim().slice(0, 60) || "New chat";
}

export function createConversation(mode: Conversation["mode"]): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    mode,
  };
}
