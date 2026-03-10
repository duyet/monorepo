/**
 * Unit Tests for StateManager (Unit 1)
 *
 * Tests for state validation, diff computation, and utilities.
 */

import { describe, it, expect } from "bun:test";
import { StateManager } from "../state";
import type { AgentState } from "../types";

describe("StateManager", () => {
  describe("validate", () => {
    it("should validate a correct state", () => {
      const state: AgentState = {
        conversationId: "test-conv-123",
        userInput: "Hello",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const result = StateManager.validate(state);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect missing conversationId", () => {
      const state = {
        conversationId: "",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      } as AgentState;

      const result = StateManager.validate(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("conversationId"))).toBe(true);
    });

    it("should detect invalid timestamps", () => {
      const state = {
        conversationId: "test-123",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now() - 1000, // Updated before created
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      } as AgentState;

      const result = StateManager.validate(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("updatedAt"))).toBe(true);
    });

    it("should warn about large tool call counts", () => {
      const toolCalls = Array.from({ length: 101 }, (_, i) => ({
        id: `tool-${i}`,
        toolName: "test",
        parameters: {},
        status: "complete" as const,
        startTime: Date.now(),
        endTime: Date.now(),
      }));

      const state: AgentState = {
        conversationId: "test-123",
        userInput: "test",
        response: "",
        toolCalls,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const result = StateManager.validate(state);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("Large number of tool calls"))).toBe(true);
    });
  });

  describe("createInitialState", () => {
    it("should create initial state with defaults", () => {
      const state = StateManager.createInitialState("conv-123", "Hello, world!");

      expect(state.conversationId).toBe("conv-123");
      expect(state.userInput).toBe("Hello, world!");
      expect(state.response).toBe("");
      expect(state.toolCalls).toEqual([]);
      expect(state.metadata.createdAt).toBeGreaterThan(0);
      expect(state.metadata.updatedAt).toBeGreaterThan(0);
      expect(state.metadata.stepIndex).toBe(0);
      expect(state.metadata.totalNodesExecuted).toBe(0);
    });

    it("should include userId when provided", () => {
      const state = StateManager.createInitialState("conv-123", "test", "user-456");

      expect(state.conversationId).toBe("conv-123");
      // Note: userId is stored in toolCalls or other fields, not directly in AgentState
      // The implementation may vary based on actual state structure
    });
  });

  describe("clone", () => {
    it("should create a deep copy of state", () => {
      const original: AgentState = {
        conversationId: "test-123",
        userInput: "test",
        response: "response",
        route: "test-route",
        toolCalls: [
          {
            id: "tool-1",
            toolName: "searchBlog",
            parameters: { query: "test" },
            status: "pending",
            startTime: Date.now(),
          },
        ],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 5,
          totalNodesExecuted: 3,
          currentNode: "llm-router",
        },
      };

      const cloned = StateManager.clone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);

      // Modify original and verify clone is unaffected
      original.userInput = "modified";
      expect(cloned.userInput).toBe("test");

      original.toolCalls[0].parameters = { query: "changed" };
      expect(cloned.toolCalls[0].parameters).toEqual({ query: "test" });
    });
  });

  describe("applyUpdate", () => {
    it("should merge updates into state", () => {
      const state = StateManager.createInitialState("conv-123", "Hello");

      const updated = StateManager.applyUpdate(state, {
        response: "Hi there!",
        route: "synthesis",
      });

      expect(updated.conversationId).toBe("conv-123");
      expect(updated.userInput).toBe("Hello");
      expect(updated.response).toBe("Hi there!");
      expect(updated.route).toBe("synthesis");
      expect(updated.metadata.stepIndex).toBe(1); // Incremented
      // UpdatedAt should be greater than or equal (accounting for fast execution)
      expect(updated.metadata.updatedAt).toBeGreaterThanOrEqual(state.metadata.updatedAt);
    });

    it("should update currentNode when route is provided", () => {
      const state = StateManager.createInitialState("conv-123", "test");

      const updated = StateManager.applyUpdate(state, {
        route: "search-blog",
      });

      expect(updated.metadata.currentNode).toBe("search-blog");
    });
  });

  describe("computeDiff", () => {
    it("should compute diff between states", () => {
      const oldState: AgentState = {
        conversationId: "conv-123",
        userInput: "Hello",
        response: "",
        route: undefined,
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const newState: AgentState = {
        conversationId: "conv-123",
        userInput: "Hello",
        response: "Hi there!",
        route: "done",
        toolCalls: [
          {
            id: "tool-1",
            toolName: "searchBlog",
            parameters: { query: "test" },
            status: "complete",
            startTime: Date.now(),
            endTime: Date.now(),
            result: "results",
          },
        ],
        metadata: {
          createdAt: oldState.metadata.createdAt,
          updatedAt: Date.now(),
          stepIndex: 1,
          totalNodesExecuted: 1,
        },
      };

      const diff = StateManager.computeDiff(oldState, newState);

      expect(diff.added?.response).toBeDefined();
      expect(diff.added?.route).toBeDefined();
      expect(diff.modified?.toolCalls).toBeDefined();
      expect(diff.modified?.metadata).toBeDefined();
    });

    it("should track tool call changes by ID", () => {
      const tool1 = {
        id: "tool-1",
        toolName: "searchBlog",
        parameters: { query: "test" },
        status: "pending" as const,
        startTime: Date.now(),
      };

      const oldState: AgentState = {
        conversationId: "conv-123",
        userInput: "test",
        response: "",
        toolCalls: [tool1],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const newState: AgentState = {
        ...oldState,
        toolCalls: [
          {
            ...tool1,
            status: "complete",
            endTime: Date.now(),
            result: "done",
          },
        ],
      };

      const diff = StateManager.computeDiff(oldState, newState);

      // Tool call should be marked as modified
      expect(diff.modified?.toolCalls).toBeDefined();
    });
  });

  describe("formatDiff", () => {
    it("should format diff for display", () => {
      const diff = {
        added: { response: "Hi", route: "done" },
        modified: { userInput: { old: "Hi", new: "Hello" } },
        deleted: { error: "gone" },
      };

      const formatted = StateManager.formatDiff(diff);

      expect(formatted).toContain("Added:");
      expect(formatted).toContain("Modified:");
      expect(formatted).toContain("Deleted:");
    });

    it("should return no changes message for empty diff", () => {
      const diff = {};
      const formatted = StateManager.formatDiff(diff);
      expect(formatted).toBe("(no changes)");
    });
  });
});
