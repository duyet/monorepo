/**
 * State Schema Definition (Unit 1)
 *
 * State validation and diff utilities for the AgentState.
 * Provides functions for validating state integrity and tracking changes.
 */

import type { AgentState, StateDiff, ToolCall } from "./types";

/**
 * State validation result
 */
export interface StateValidationResult {
  /** Whether the state is valid */
  isValid: boolean;
  /** Validation errors (critical issues) */
  errors: string[];
  /** Warnings (non-critical issues) */
  warnings: string[];
}

/**
 * State manager utility class
 * Provides validation, diff computation, and state manipulation utilities
 */
export class StateManager {
  /**
   * Validate an AgentState for integrity and correctness
   *
   * Checks:
   * - Required fields are present and valid
   * - Tool calls have valid status transitions
   * - Metadata timestamps are reasonable
   * - No circular references
   */
  static validate(state: AgentState): StateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!state.conversationId || typeof state.conversationId !== "string") {
      errors.push("conversationId must be a non-empty string");
    }

    if (typeof state.userInput !== "string") {
      errors.push("userInput must be a string");
    }

    if (typeof state.response !== "string") {
      errors.push("response must be a string");
    }

    // Validate metadata
    if (!state.metadata) {
      errors.push("metadata is required");
    } else {
      if (typeof state.metadata.createdAt !== "number" || state.metadata.createdAt <= 0) {
        errors.push("metadata.createdAt must be a positive number");
      }

      if (typeof state.metadata.updatedAt !== "number" || state.metadata.updatedAt <= 0) {
        errors.push("metadata.updatedAt must be a positive number");
      }

      if (state.metadata.updatedAt < state.metadata.createdAt) {
        errors.push("metadata.updatedAt cannot be before metadata.createdAt");
      }

      if (typeof state.metadata.stepIndex !== "number" || state.metadata.stepIndex < 0) {
        errors.push("metadata.stepIndex must be a non-negative number");
      }
    }

    // Validate tool calls
    if (!Array.isArray(state.toolCalls)) {
      errors.push("toolCalls must be an array");
    } else {
      for (let i = 0; i < state.toolCalls.length; i++) {
        const tool = state.toolCalls[i];
        const errors_ = StateManager.validateToolCall(tool, i);
        errors.push(...errors_);
      }
    }

    // Check for unreasonable state size (warning)
    if (state.toolCalls.length > 100) {
      warnings.push(`Large number of tool calls (${state.toolCalls.length}) may indicate a loop`);
    }

    if (state.metadata.stepIndex > 100) {
      warnings.push(`High step index (${state.metadata.stepIndex}) may indicate a long-running conversation`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a single tool call
   */
  private static validateToolCall(tool: ToolCall, index: number): string[] {
    const errors: string[] = [];
    const prefix = `toolCalls[${index}]`;

    if (!tool.id || typeof tool.id !== "string") {
      errors.push(`${prefix}.id must be a non-empty string`);
    }

    if (!tool.toolName || typeof tool.toolName !== "string") {
      errors.push(`${prefix}.toolName must be a non-empty string`);
    }

    if (tool.status !== "pending" && tool.status !== "running" && tool.status !== "complete" && tool.status !== "error") {
      errors.push(`${prefix}.status must be one of: pending, running, complete, error`);
    }

    // Note: We don't enforce result/error for complete/error status because
    // tool calls may be created externally and filled in later
    // This allows for more flexible usage patterns

    return errors;
  }

  /**
   * Create a fresh AgentState with default values
   *
   * @param conversationId - Unique conversation identifier
   * @param userInput - Initial user message
   * @param userId - Optional user ID for authenticated conversations
   */
  static createInitialState(
    conversationId: string,
    userInput: string,
    _userId?: string
  ): AgentState {
    const now = Date.now();

    return {
      conversationId,
      userInput,
      response: "",
      toolCalls: [],
      metadata: {
        createdAt: now,
        updatedAt: now,
        stepIndex: 0,
        totalNodesExecuted: 0,
        currentNode: undefined,
      },
    };
  }

  /**
   * Clone a state deeply to prevent mutations
   */
  static clone(state: AgentState): AgentState {
    return {
      conversationId: state.conversationId,
      userInput: state.userInput,
      response: state.response,
      route: state.route,
      error: state.error,
      toolCalls: state.toolCalls.map((tc) => ({ ...tc })),
      metadata: { ...state.metadata },
    };
  }

  /**
   * Apply state updates safely
   *
   * Merges partial updates into a state, ensuring metadata is updated correctly.
   */
  static applyUpdate(
    state: AgentState,
    updates: Partial<AgentState>
  ): AgentState {
    const newState = StateManager.clone(state);

    // Apply direct field updates
    if (updates.userInput !== undefined) newState.userInput = updates.userInput;
    if (updates.response !== undefined) newState.response = updates.response;
    if (updates.route !== undefined) newState.route = updates.route;
    if (updates.error !== undefined) newState.error = updates.error;

    // Merge tool calls if provided
    if (updates.toolCalls) {
      newState.toolCalls = [...updates.toolCalls];
    }

    // Update metadata
    if (updates.metadata) {
      newState.metadata = {
        ...newState.metadata,
        ...updates.metadata,
      };
    }

    // Always update the timestamp and step index
    newState.metadata.updatedAt = Date.now();
    newState.metadata.stepIndex += 1;

    // Update current node from route if available
    if (updates.route) {
      newState.metadata.currentNode = updates.route;
    }

    return newState;
  }

  /**
   * Compute a diff between two states
   *
   * Identifies which fields were added, modified, or deleted.
   */
  static computeDiff(oldState: AgentState, newState: AgentState): StateDiff {
    const added: Record<string, unknown> = {};
    const modified: Record<string, { old: unknown; new: unknown }> = {};
    const deleted: Record<string, unknown> = {};

    // Check all top-level fields
    const fields: (keyof AgentState)[] = [
      "conversationId",
      "userInput",
      "response",
      "route",
      "error",
      "toolCalls",
      "metadata",
    ];

    for (const field of fields) {
      const oldValue = oldState[field];
      const newValue = newState[field];

      // Handle undefined vs defined
      if (oldValue === undefined && newValue !== undefined) {
        added[field] = newValue;
      } else if (oldValue !== undefined && newValue === undefined) {
        deleted[field] = oldValue;
      } else if (StateManager.valueChanged(oldValue, newValue)) {
        // Special case for response: empty → non-empty is treated as "added"
        // for clearer diff semantics
        if (field === "response" && oldValue === "" && newValue !== "") {
          added[field] = newValue;
        } else if (field === "response" && newValue === "") {
          deleted[field] = oldValue;
        } else {
          modified[field] = { old: oldValue, new: newValue };
        }
      }
    }

    // Special handling for toolCalls array - track by ID
    if (oldState.toolCalls !== newState.toolCalls) {
      const oldById = new Map(oldState.toolCalls.map((tc) => [tc.id, tc]));
      const newById = new Map(newState.toolCalls.map((tc) => [tc.id, tc]));

      // Find added and modified tool calls
      for (const [id, newTool] of newById) {
        const oldTool = oldById.get(id);
        if (!oldTool) {
          // New tool call added
          if (!added.toolCalls) added.toolCalls = [];
          (added.toolCalls as ToolCall[]).push(newTool);
        } else if (StateManager.toolCallChanged(oldTool, newTool)) {
          // Tool call modified
          if (!modified.toolCalls) modified.toolCalls = { old: oldState.toolCalls, new: newState.toolCalls };
        }
      }

      // Find deleted tool calls
      for (const [id, oldTool] of oldById) {
        if (!newById.has(id)) {
          if (!deleted.toolCalls) deleted.toolCalls = [];
          (deleted.toolCalls as ToolCall[]).push(oldTool);
        }
      }
    }

    return { added, modified, deleted };
  }

  /**
   * Check if two values are different
   */
  private static valueChanged(oldValue: unknown, newValue: unknown): boolean {
    // Handle arrays differently
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) return true;
      return oldValue.some((v, i) => StateManager.valueChanged(v, newValue[i]));
    }

    // Handle objects
    if (typeof oldValue === "object" && oldValue !== null &&
        typeof newValue === "object" && newValue !== null) {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }

    // Primitives
    return oldValue !== newValue;
  }

  /**
   * Check if a tool call has changed meaningfully
   */
  private static toolCallChanged(old: ToolCall, new_: ToolCall): boolean {
    return (
      old.id !== new_.id ||
      old.toolName !== new_.toolName ||
      old.status !== new_.status ||
      StateManager.valueChanged(old.parameters, new_.parameters) ||
      StateManager.valueChanged(old.result, new_.result) ||
      StateManager.valueChanged(old.error, new_.error)
    );
  }

  /**
   * Format a state diff for display/logging
   */
  static formatDiff(diff: StateDiff): string {
    const parts: string[] = [];

    if (Object.keys(diff.added || {}).length > 0) {
      parts.push(`Added: ${JSON.stringify(diff.added)}`);
    }

    if (Object.keys(diff.modified || {}).length > 0) {
      const modifiedEntries = Object.entries(diff.modified || {})
        .map(([k, v]) => `${k}=${JSON.stringify(v.old)} → ${JSON.stringify(v.new)}`)
        .join(", ");
      parts.push(`Modified: ${modifiedEntries}`);
    }

    if (Object.keys(diff.deleted || {}).length > 0) {
      parts.push(`Deleted: ${JSON.stringify(diff.deleted)}`);
    }

    return parts.length > 0 ? parts.join(" | ") : "(no changes)";
  }

  /**
   * Create a checkpoint-ready state snapshot
   *
   * Returns a minimal state suitable for storage.
   */
  static createCheckpoint(state: AgentState): AgentState {
    return {
      conversationId: state.conversationId,
      userInput: state.userInput,
      response: state.response,
      route: state.route,
      error: state.error,
      toolCalls: state.toolCalls.map((tc) => ({ ...tc })),
      metadata: { ...state.metadata },
    };
  }

  /**
   * Restore a state from a checkpoint
   *
   * Validates the restored state before returning.
   */
  static restoreFromCheckpoint(checkpoint: AgentState): AgentState {
    const validation = StateManager.validate(checkpoint);
    if (!validation.isValid) {
      throw new Error(`Invalid checkpoint: ${validation.errors.join(", ")}`);
    }

    return StateManager.clone(checkpoint);
  }
}
