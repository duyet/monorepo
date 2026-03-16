/**
 * Checkpoint API Tests (Unit 12)
 *
 * Tests for checkpoint persistence and restoration endpoints.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createCheckpointer } from "../../lib/graph";
import type { DatabaseClient } from "../../lib/db/client";
import type { AgentState } from "../../lib/graph/types";

// Mock DatabaseClient
const mockDb = {
  createCheckpoint: vi.fn(),
  getCheckpoint: vi.fn(),
  getLatestCheckpoint: vi.fn(),
  listCheckpoints: vi.fn(),
  deleteCheckpoint: vi.fn(),
  deleteCheckpointsForConversation: vi.fn(),
  getCheckpointHistory: vi.fn(),
  pruneCheckpoints: vi.fn(),
} as unknown as DatabaseClient;

describe("Checkpoint API", () => {
  let checkpointer: ReturnType<typeof createCheckpointer>;

  beforeEach(() => {
    vi.clearAllMocks();
    checkpointer = createCheckpointer(mockDb, { logger: vi.fn() });
  });

  const createMockState = (
    conversationId: string,
    stepIndex = 0
  ): AgentState => ({
    conversationId,
    userInput: "Test input",
    response: "",
    toolCalls: [],
    metadata: {
      stepIndex,
      totalNodesExecuted: stepIndex,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: "llmRouter",
    },
  });

  describe("saveCheckpoint", () => {
    it("should save a checkpoint and return its ID", async () => {
      const state = createMockState("conv-123", 1);

      (mockDb.getLatestCheckpoint as any).mockResolvedValue(null);
      (mockDb.createCheckpoint as any).mockResolvedValue({
        id: "conv-123-1-timestamp",
        conversation_id: "conv-123",
        state_snapshot: JSON.stringify(state),
        version: 1,
        created_at: Date.now(),
        parent_checkpoint_id: null,
      });

      const checkpointId = await checkpointer.saveCheckpoint(state);

      expect(checkpointId).toMatch(/^conv-123-1-\d+$/);
      expect(mockDb.createCheckpoint).toHaveBeenCalledWith({
        id: expect.stringMatching(/^conv-123-1-\d+$/),
        conversationId: "conv-123",
        stateSnapshot: expect.any(Object),
        version: 1,
      });
    });

    it("should increment version for existing conversation", async () => {
      const state = createMockState("conv-123", 2);

      (mockDb.getLatestCheckpoint as any).mockResolvedValue({
        checkpoint: { version: 1 },
      });
      (mockDb.createCheckpoint as any).mockResolvedValue({
        id: "conv-123-2-timestamp",
        conversation_id: "conv-123",
        state_snapshot: JSON.stringify(state),
        version: 2,
        created_at: Date.now(),
        parent_checkpoint_id: null,
      });

      const checkpointId = await checkpointer.saveCheckpoint(state);

      expect(checkpointId).toMatch(/^conv-123-2-\d+$/);
      expect(mockDb.createCheckpoint).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^conv-123-2-\d+$/),
          version: 2,
        })
      );
    });
  });

  describe("loadCheckpoint", () => {
    it("should load a checkpoint by ID", async () => {
      const state = createMockState("conv-123", 1);
      const checkpointRow = {
        id: "cp-123",
        conversation_id: "conv-123",
        state_snapshot: JSON.stringify(state),
        version: 1,
        created_at: Date.now(),
        parent_checkpoint_id: null,
      };

      (mockDb.getCheckpoint as any).mockResolvedValue({
        checkpoint: checkpointRow,
        state,
      });

      const checkpoint = await checkpointer.loadCheckpoint("cp-123");

      expect(checkpoint).toEqual({
        id: "cp-123",
        conversationId: "conv-123",
        state: expect.objectContaining({
          conversationId: "conv-123",
          userInput: "Test input",
        }),
        timestamp: checkpointRow.created_at,
        stepIndex: 1,
      });
    });

    it("should return null for non-existent checkpoint", async () => {
      (mockDb.getCheckpoint as any).mockResolvedValue(null);

      const checkpoint = await checkpointer.loadCheckpoint("non-existent");

      expect(checkpoint).toBeNull();
    });

    it("should propagate errors from database", async () => {
      (mockDb.getCheckpoint as any).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        checkpointer.loadCheckpoint("cp-123")
      ).rejects.toThrow("Database error");
    });
  });

  describe("loadLatestCheckpoint", () => {
    it("should load the latest checkpoint for a conversation", async () => {
      const state = createMockState("conv-123", 3);
      const checkpointRow = {
        id: "cp-latest",
        conversation_id: "conv-123",
        state_snapshot: JSON.stringify(state),
        version: 3,
        created_at: Date.now(),
        parent_checkpoint_id: null,
      };

      (mockDb.getLatestCheckpoint as any).mockResolvedValue({
        checkpoint: checkpointRow,
        state,
      });

      const checkpoint = await checkpointer.loadLatestCheckpoint("conv-123");

      expect(checkpoint).toEqual({
        id: "cp-latest",
        conversationId: "conv-123",
        state: expect.any(Object),
        timestamp: checkpointRow.created_at,
        stepIndex: 3,
      });
    });

    it("should return null when no checkpoints exist", async () => {
      (mockDb.getLatestCheckpoint as any).mockResolvedValue(null);

      const checkpoint = await checkpointer.loadLatestCheckpoint("conv-123");

      expect(checkpoint).toBeNull();
    });
  });

  describe("listVersions", () => {
    it("should list checkpoints for a conversation", async () => {
      const state1 = createMockState("conv-123", 1);
      const state2 = createMockState("conv-123", 2);

      (mockDb.listCheckpoints as any).mockResolvedValue([
        {
          id: "cp-2",
          conversation_id: "conv-123",
          state_snapshot: JSON.stringify(state2),
          version: 2,
          created_at: Date.now(),
          parent_checkpoint_id: "cp-1",
        },
        {
          id: "cp-1",
          conversation_id: "conv-123",
          state_snapshot: JSON.stringify(state1),
          version: 1,
          created_at: Date.now() - 1000,
          parent_checkpoint_id: null,
        },
      ]);

      const checkpoints = await checkpointer.listVersions("conv-123");

      expect(checkpoints).toHaveLength(2);
      expect(checkpoints[0]).toEqual(
        expect.objectContaining({
          id: "cp-2",
          version: 2,
          parentCheckpointId: "cp-1",
        })
      );
      expect(checkpoints[1]).toEqual(
        expect.objectContaining({
          id: "cp-1",
          version: 1,
          parentCheckpointId: null,
        })
      );
    });

    it("should respect limit parameter", async () => {
      (mockDb.listCheckpoints as any).mockResolvedValue([]);

      await checkpointer.listVersions("conv-123", 10);

      expect(mockDb.listCheckpoints).toHaveBeenCalledWith("conv-123", 10);
    });
  });

  describe("rollback", () => {
    it("should restore state from a checkpoint ID", async () => {
      const state = createMockState("conv-123", 1);
      const checkpointRow = {
        id: "cp-123",
        conversation_id: "conv-123",
        state_snapshot: JSON.stringify(state),
        version: 1,
        created_at: Date.now(),
        parent_checkpoint_id: null,
      };

      (mockDb.getCheckpoint as any).mockResolvedValue({
        checkpoint: checkpointRow,
        state,
      });

      const restoredState = await checkpointer.rollback("cp-123");

      expect(restoredState).toEqual(
        expect.objectContaining({
          conversationId: "conv-123",
          userInput: "Test input",
        })
      );
    });

    it("should throw error for non-existent checkpoint", async () => {
      (mockDb.getCheckpoint as any).mockResolvedValue(null);

      await expect(checkpointer.rollback("non-existent")).rejects.toThrow(
        "Checkpoint not found: non-existent"
      );
    });
  });

  describe("rollbackToVersion", () => {
    it("should restore state to a specific version", async () => {
      const state = createMockState("conv-123", 2);

      (mockDb.listCheckpoints as any).mockResolvedValue([
        {
          id: "cp-3",
          conversation_id: "conv-123",
          state_snapshot: JSON.stringify(state),
          version: 3,
          created_at: Date.now(),
          parent_checkpoint_id: null,
        },
        {
          id: "cp-2",
          conversation_id: "conv-123",
          state_snapshot: JSON.stringify(state),
          version: 2,
          created_at: Date.now() - 1000,
          parent_checkpoint_id: null,
        },
      ]);

      const restoredState = await checkpointer.rollbackToVersion(
        "conv-123",
        2
      );

      expect(restoredState).toEqual(
        expect.objectContaining({
          conversationId: "conv-123",
        })
      );
    });

    it("should throw error for non-existent version", async () => {
      (mockDb.listCheckpoints as any).mockResolvedValue([
        {
          id: "cp-1",
          conversation_id: "conv-123",
          state_snapshot: "{}",
          version: 1,
          created_at: Date.now(),
          parent_checkpoint_id: null,
        },
      ]);

      await expect(
        checkpointer.rollbackToVersion("conv-123", 5)
      ).rejects.toThrow("Version 5 not found for conversation conv-123");
    });
  });

  describe("deleteCheckpoint", () => {
    it("should delete a checkpoint", async () => {
      (mockDb.deleteCheckpoint as any).mockResolvedValue(undefined);

      await checkpointer.deleteCheckpoint("cp-123");

      expect(mockDb.deleteCheckpoint).toHaveBeenCalledWith("cp-123");
    });

    it("should propagate errors", async () => {
      (mockDb.deleteCheckpoint as any).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(
        checkpointer.deleteCheckpoint("cp-123")
      ).rejects.toThrow("Delete failed");
    });
  });

  describe("pruneCheckpoints", () => {
    it("should prune old checkpoints", async () => {
      (mockDb.pruneCheckpoints as any).mockResolvedValue(5);

      const pruned = await checkpointer.pruneCheckpoints("conv-123");

      expect(pruned).toBe(5);
      expect(mockDb.pruneCheckpoints).toHaveBeenCalledWith("conv-123", 50);
    });

    it("should return 0 on error", async () => {
      (mockDb.pruneCheckpoints as any).mockRejectedValue(
        new Error("Prune failed")
      );

      const pruned = await checkpointer.pruneCheckpoints("conv-123");

      expect(pruned).toBe(0);
    });
  });

  describe("getHistory", () => {
    it("should get checkpoint history with state", async () => {
      const state1 = createMockState("conv-123", 1);
      const state2 = createMockState("conv-123", 2);

      (mockDb.getCheckpointHistory as any).mockResolvedValue([
        {
          checkpoint: {
            id: "cp-1",
            conversation_id: "conv-123",
            state_snapshot: JSON.stringify(state1),
            version: 1,
            created_at: Date.now() - 1000,
            parent_checkpoint_id: null,
          },
          state: state1,
        },
        {
          checkpoint: {
            id: "cp-2",
            conversation_id: "conv-123",
            state_snapshot: JSON.stringify(state2),
            version: 2,
            created_at: Date.now(),
            parent_checkpoint_id: "cp-1",
          },
          state: state2,
        },
      ]);

      const history = await checkpointer.getHistory("conv-123");

      expect(history).toHaveLength(2);
      expect(history[0]).toEqual(
        expect.objectContaining({
          id: "cp-1",
          conversationId: "conv-123",
        })
      );
      expect(history[1]).toEqual(
        expect.objectContaining({
          id: "cp-2",
        })
      );
    });
  });
});
