/**
 * Checkpointer Service (Unit 4)
 *
 * High-level checkpoint management service for AgentState persistence.
 * Provides async fire-and-forget pattern for non-blocking saves.
 *
 * Features:
 * - Async checkpoint saves that don't block execution
 * - Automatic version tracking per conversation
 * - Checkpoint pruning to manage storage
 * - Rollback support to any checkpoint version
 */

import type { AgentState, StateCheckpoint } from "./types";
import { StateManager } from "./state";
import type { DatabaseClient } from "../db/client";

/**
 * Checkpointer configuration options
 */
export interface CheckpointerOptions {
  /** Maximum checkpoints to keep per conversation (default: 50) */
  maxCheckpoints?: number;

  /** Whether to save checkpoints asynchronously (default: true) */
  async?: boolean;

  /** Custom logger */
  logger?: (level: "debug" | "info" | "warn" | "error", message: string, ...args: unknown[]) => void;
}

/**
 * Checkpoint metadata for listing
 */
export interface CheckpointInfo {
  /** Checkpoint ID */
  id: string;

  /** Conversation ID */
  conversationId: string;

  /** Checkpoint version number */
  version: number;

  /** Creation timestamp */
  createdAt: number;

  /** Parent checkpoint ID (if this is a child checkpoint) */
  parentCheckpointId: string | null;

  /** Step index at checkpoint */
  stepIndex: number;

  /** Current node name at checkpoint */
  currentNode?: string;
}

/**
 * Checkpointer Service
 *
 * Manages state checkpoints with D1 persistence.
 * Saves are async and fire-and-forget by default.
 */
export class Checkpointer {
  private db: DatabaseClient;
  private options: Required<CheckpointerOptions>;
  private pendingSaves: Map<string, Promise<void>> = new Map();
  private versionCache: Map<string, number> = new Map();

  constructor(db: DatabaseClient, options: CheckpointerOptions = {}) {
    this.db = db;
    this.options = {
      maxCheckpoints: options.maxCheckpoints ?? 50,
      async: options.async ?? true,
      logger: options.logger ?? this.defaultLogger,
    };
  }

  /**
   * Save a checkpoint for the current state
   *
   * If async mode is enabled (default), returns immediately after
   * initiating the save. The save continues in the background.
   *
   * @param state - The AgentState to checkpoint
   * @param nodeId - The node ID that created this checkpoint
   * @returns Promise that resolves when save is complete (or immediately if async)
   */
  async saveCheckpoint(
    state: AgentState,
    _nodeId?: string
  ): Promise<string> {
    const conversationId = state.conversationId;

    // Get next version number (cached to avoid race conditions)
    const version = await this.getNextVersion(conversationId);

    // Create checkpoint ID
    const checkpointId = `${conversationId}-${version}-${Date.now()}`;

    // Create state snapshot for storage
    const stateSnapshot = StateManager.createCheckpoint(state);

    // Create the checkpoint record
    const checkpoint: StateCheckpoint = {
      id: checkpointId,
      conversationId,
      state: stateSnapshot,
      timestamp: Date.now(),
      stepIndex: state.metadata.stepIndex,
    };

    // Save to database
    const savePromise = this.saveToDatabase(checkpoint, version);

    if (this.options.async) {
      // Track pending save for potential await later
      this.pendingSaves.set(checkpointId, savePromise);

      // Clean up completed saves
      savePromise.finally(() => {
        this.pendingSaves.delete(checkpointId);
      });

      // Return ID immediately (fire-and-forget)
      return checkpointId;
    }

    // Synchronous mode: wait for save to complete
    await savePromise;
    return checkpointId;
  }

  /**
   * Load a checkpoint by ID
   *
   * @param checkpointId - The checkpoint ID to load
   * @returns The checkpoint with state, or null if not found
   */
  async loadCheckpoint(checkpointId: string): Promise<StateCheckpoint | null> {
    try {
      const result = await this.db.getCheckpoint(checkpointId);
      if (!result) {
        return null;
      }

      const { checkpoint, state } = result;

      return {
        id: checkpoint.id,
        conversationId: checkpoint.conversation_id,
        state: StateManager.restoreFromCheckpoint(state),
        timestamp: checkpoint.created_at,
        stepIndex: state.metadata.stepIndex,
      };
    } catch (error) {
      this.options.logger("error", `Failed to load checkpoint ${checkpointId}:`, error);
      throw error;
    }
  }

  /**
   * Load the latest checkpoint for a conversation
   *
   * @param conversationId - The conversation ID
   * @returns The latest checkpoint, or null if none exists
   */
  async loadLatestCheckpoint(
    conversationId: string
  ): Promise<StateCheckpoint | null> {
    try {
      const result = await this.db.getLatestCheckpoint(conversationId);
      if (!result) {
        return null;
      }

      const { checkpoint, state } = result;

      return {
        id: checkpoint.id,
        conversationId: checkpoint.conversation_id,
        state: StateManager.restoreFromCheckpoint(state),
        timestamp: checkpoint.created_at,
        stepIndex: state.metadata.stepIndex,
      };
    } catch (error) {
      this.options.logger("error", `Failed to load latest checkpoint for ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * List all checkpoints for a conversation
   *
   * Returns checkpoints in version order (newest first).
   *
   * @param conversationId - The conversation ID
   * @param limit - Maximum checkpoints to return (default: 50)
   * @returns Array of checkpoint info (without full state)
   */
  async listVersions(
    conversationId: string,
    limit = 50
  ): Promise<CheckpointInfo[]> {
    try {
      const checkpoints = await this.db.listCheckpoints(conversationId, limit);

      return checkpoints.map((cp) => {
        const state = JSON.parse(cp.state_snapshot) as AgentState;
        return {
          id: cp.id,
          conversationId: cp.conversation_id,
          version: cp.version,
          createdAt: cp.created_at,
          parentCheckpointId: cp.parent_checkpoint_id,
          stepIndex: state.metadata.stepIndex,
          currentNode: state.metadata.currentNode,
        };
      });
    } catch (error) {
      this.options.logger("error", `Failed to list checkpoints for ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Restore conversation to a specific checkpoint version
   *
   * @param checkpointId - The checkpoint ID to restore to
   * @returns The restored AgentState
   */
  async rollback(checkpointId: string): Promise<AgentState> {
    const checkpoint = await this.loadCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    return checkpoint.state;
  }

  /**
   * Restore conversation to a specific version number
   *
   * @param conversationId - The conversation ID
   * @param version - The version number to restore to
   * @returns The restored AgentState
   */
  async rollbackToVersion(
    conversationId: string,
    version: number
  ): Promise<AgentState> {
    const checkpoints = await this.db.listCheckpoints(conversationId, 100);
    const target = checkpoints.find((cp) => cp.version === version);

    if (!target) {
      throw new Error(`Version ${version} not found for conversation ${conversationId}`);
    }

    const state = JSON.parse(target.state_snapshot) as AgentState;
    return StateManager.restoreFromCheckpoint(state);
  }

  /**
   * Delete a checkpoint
   *
   * @param checkpointId - The checkpoint ID to delete
   */
  async deleteCheckpoint(checkpointId: string): Promise<void> {
    try {
      await this.db.deleteCheckpoint(checkpointId);
      this.options.logger("info", `Deleted checkpoint ${checkpointId}`);
    } catch (error) {
      this.options.logger("error", `Failed to delete checkpoint ${checkpointId}:`, error);
      throw error;
    }
  }

  /**
   * Delete all checkpoints for a conversation
   *
   * @param conversationId - The conversation ID
   */
  async deleteConversationCheckpoints(conversationId: string): Promise<void> {
    try {
      await this.db.deleteCheckpointsForConversation(conversationId);
      this.versionCache.delete(conversationId);
      this.options.logger("info", `Deleted all checkpoints for conversation ${conversationId}`);
    } catch (error) {
      this.options.logger("error", `Failed to delete checkpoints for ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Prune old checkpoints for a conversation
   *
   * Keeps only the latest N checkpoints as configured.
   *
   * @param conversationId - The conversation ID
   * @returns Number of checkpoints pruned
   */
  async pruneCheckpoints(conversationId: string): Promise<number> {
    try {
      const pruned = await this.db.pruneCheckpoints(
        conversationId,
        this.options.maxCheckpoints
      );

      if (pruned > 0) {
        this.options.logger("info", `Pruned ${pruned} checkpoints for ${conversationId}`);
      }

      return pruned;
    } catch (error) {
      this.options.logger("error", `Failed to prune checkpoints for ${conversationId}:`, error);
      return 0;
    }
  }

  /**
   * Wait for all pending saves to complete
   *
   * Useful for ensuring all checkpoints are persisted before shutdown.
   */
  async flushPendingSaves(): Promise<void> {
    const promises = Array.from(this.pendingSaves.values());
    if (promises.length > 0) {
      this.options.logger("debug", `Flushing ${promises.length} pending checkpoint saves`);
      await Promise.all(promises);
    }
  }

  /**
   * Get checkpoint history with parent-child relationships
   *
   * @param conversationId - The conversation ID
   * @returns Array of checkpoints with state, in version order
   */
  async getHistory(conversationId: string): Promise<StateCheckpoint[]> {
    try {
      const history = await this.db.getCheckpointHistory(conversationId);

      return history.map(({ checkpoint, state }) => ({
        id: checkpoint.id,
        conversationId: checkpoint.conversation_id,
        state: StateManager.restoreFromCheckpoint(state),
        timestamp: checkpoint.created_at,
        stepIndex: state.metadata.stepIndex,
      }));
    } catch (error) {
      this.options.logger("error", `Failed to get history for ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Get the next version number for a conversation
   *
   * Uses a cache to avoid race conditions when saving multiple checkpoints
   * for the same conversation in quick succession.
   */
  private async getNextVersion(conversationId: string): Promise<number> {
    // Check cache first
    const cached = this.versionCache.get(conversationId);
    if (cached !== undefined) {
      const next = cached + 1;
      this.versionCache.set(conversationId, next);
      return next;
    }

    // Load latest checkpoint to get version
    const latest = await this.db.getLatestCheckpoint(conversationId);
    const version = (latest?.checkpoint.version ?? 0) + 1;

    // Cache for next call
    this.versionCache.set(conversationId, version);

    return version;
  }

  /**
   * Save checkpoint to database
   */
  private async saveToDatabase(
    checkpoint: StateCheckpoint,
    version: number
  ): Promise<void> {
    try {
      await this.db.createCheckpoint({
        id: checkpoint.id,
        conversationId: checkpoint.conversationId,
        stateSnapshot: checkpoint.state,
        version,
      });

      this.options.logger(
        "debug",
        `Saved checkpoint ${checkpoint.id} for ${checkpoint.conversationId} (version ${version})`
      );

      // Prune old checkpoints if needed
      await this.pruneCheckpoints(checkpoint.conversationId);
    } catch (error) {
      this.options.logger("error", `Failed to save checkpoint ${checkpoint.id}:`, error);
      throw error;
    }
  }

  /**
   * Default logger implementation
   */
  private defaultLogger(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    ...args: unknown[]
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = `[Checkpointer][${timestamp}]`;
    switch (level) {
      case "debug":
        console.debug(prefix, message, ...args);
        break;
      case "info":
        console.info(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
    }
  }
}

/**
 * Create a checkpointer instance with default options
 */
export function createCheckpointer(
  db: DatabaseClient,
  options?: CheckpointerOptions
): Checkpointer {
  return new Checkpointer(db, options);
}
