/**
 * Conversation Storage Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadConversations,
  saveConversations,
  clearConversations,
} from "./conversation-storage";
import type { Conversation } from "@/types/conversation";

describe("conversation-storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("loadConversations", () => {
    it("should return empty array when no data exists", () => {
      const result = loadConversations();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it("should load valid conversations from localStorage", () => {
      const mockConversations: Conversation[] = [
        {
          threadId: "thread_123",
          title: "Test Conversation",
          preview: "Hello world",
          createdAt: Date.now(),
          lastActivityAt: Date.now(),
          messageCount: 5,
        },
      ];

      localStorage.setItem(
        "chatkit_conversation_history",
        JSON.stringify(mockConversations),
      );

      const result = loadConversations();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockConversations);
      }
    });

    it("should filter out invalid conversation objects", () => {
      const invalidData = [
        { threadId: "thread_123", title: "Valid" },
        { invalid: "data" },
        {
          threadId: "thread_456",
          title: "Also Valid",
          createdAt: Date.now(),
          lastActivityAt: Date.now(),
        },
      ];

      localStorage.setItem(
        "chatkit_conversation_history",
        JSON.stringify(invalidData),
      );

      const result = loadConversations();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].threadId).toBe("thread_456");
      }
    });

    it("should handle corrupted JSON data", () => {
      localStorage.setItem("chatkit_conversation_history", "invalid json{");

      const result = loadConversations();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Unexpected");
      }
    });

    it("should handle non-array data", () => {
      localStorage.setItem(
        "chatkit_conversation_history",
        JSON.stringify({ not: "an array" }),
      );

      const result = loadConversations();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe("saveConversations", () => {
    it("should save conversations to localStorage", () => {
      const conversations: Conversation[] = [
        {
          threadId: "thread_123",
          title: "Test",
          createdAt: Date.now(),
          lastActivityAt: Date.now(),
        },
      ];

      const result = saveConversations(conversations);

      expect(result.success).toBe(true);

      const stored = localStorage.getItem("chatkit_conversation_history");
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(conversations);
    });

    it("should handle empty array", () => {
      const result = saveConversations([]);

      expect(result.success).toBe(true);

      const stored = localStorage.getItem("chatkit_conversation_history");
      expect(stored).toBe("[]");
    });
  });

  describe("clearConversations", () => {
    it("should remove conversations from localStorage", () => {
      localStorage.setItem("chatkit_conversation_history", "[]");

      const result = clearConversations();

      expect(result.success).toBe(true);
      expect(localStorage.getItem("chatkit_conversation_history")).toBeNull();
    });

    it("should succeed even if no data exists", () => {
      const result = clearConversations();

      expect(result.success).toBe(true);
    });
  });
});
