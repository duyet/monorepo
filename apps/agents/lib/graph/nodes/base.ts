/**
 * Base Node Class (Unit 5)
 *
 * Abstract base class for all graph nodes.
 * Provides standard error handling, metrics collection, and state management.
 */

import type { AgentState, NodeTrace } from "../types";

/**
 * Node execution outcome
 */
export type NodeOutcome =
  | { success: true; state: Partial<AgentState>; trace?: Partial<NodeTrace> }
  | { success: false; error: string; trace?: Partial<NodeTrace> };

/**
 * Abstract base class for all graph nodes
 *
 * All nodes must extend this class and implement the execute method.
 * Provides standard error handling, metrics collection, and trace generation.
 */
export abstract class GraphNode {
  /** Unique node identifier */
  readonly id: string;

  /** Display name for UI and logging */
  readonly name: string;

  /** Node description */
  readonly description?: string;

  /** Node type for categorization */
  readonly type: "input" | "llm" | "tool" | "output" | "conditional" | "synthesis";

  /**
   * Create a new graph node
   */
  constructor(config: {
    id: string;
    name: string;
    description?: string;
    type: GraphNode["type"];
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
  }

  /**
   * Execute the node with the given state
   *
   * This is the main entry point for node execution.
   * Handles timing, error catching, and trace generation.
   *
   * @param state - Current agent state
   * @returns Promise resolving to node outcome
   */
  async execute(state: AgentState): Promise<NodeOutcome> {
    const startTime = Date.now();
    const inputState = this.snapshotState(state);

    try {
      // Call the implementation
      const result = await this.executeImpl(state);

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (result.success) {
        return {
          success: true,
          state: result.state,
          trace: {
            nodeId: this.id,
            nodeName: this.name,
            startTime,
            endTime,
            duration,
            outcome: "success",
            inputState,
            outputState: result.state,
            stateDiff: this.computeDiff(inputState, result.state),
            metadata: this.getMetadata(),
          },
        };
      } else {
        return {
          success: false,
          error: result.error,
          trace: {
            nodeId: this.id,
            nodeName: this.name,
            startTime,
            endTime,
            duration,
            outcome: "error",
            inputState,
            error: result.error,
            metadata: this.getMetadata(),
          },
        };
      }
    } catch (error) {
      const endTime = Date.now();
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
        trace: {
          nodeId: this.id,
          nodeName: this.name,
          startTime,
          endTime,
          duration: endTime - startTime,
          outcome: "error",
          inputState,
          error: errorMessage,
          metadata: this.getMetadata(),
        },
      };
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   *
   * @param state - Current agent state
   * @returns Promise resolving to state updates
   */
  protected abstract executeImpl(
    state: AgentState
  ): Promise<{ success: boolean; state?: Partial<AgentState>; error?: string }>;

  /**
   * Create a snapshot of the current state for tracing
   *
   * Creates a shallow copy of relevant state fields.
   */
  protected snapshotState(state: AgentState): Partial<AgentState> {
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
   * Compute state diff between input and output
   *
   * Identifies which fields were added, modified, or deleted.
   */
  protected computeDiff(
    input: Partial<AgentState>,
    output: Partial<AgentState>
  ): NodeTrace["stateDiff"] {
    const added: Record<string, unknown> = {};
    const modified: Record<string, { old: unknown; new: unknown }> = {};
    const deleted: Record<string, unknown> = {};

    // Check for added and modified keys
    for (const key in output) {
      if (!(key in input)) {
        added[key] = output[key];
      } else if (JSON.stringify(input[key]) !== JSON.stringify(output[key])) {
        modified[key] = { old: input[key], new: output[key] };
      }
    }

    // Check for deleted keys
    for (const key in input) {
      if (!(key in output)) {
        deleted[key] = input[key];
      }
    }

    return { added, modified, deleted };
  }

  /**
   * Get additional metadata for this node execution
   *
   * Override in subclasses to add custom metadata.
   */
  protected getMetadata(): Record<string, unknown> {
    return {
      type: this.type,
      description: this.description,
    };
  }

  /**
   * Convert this node to a GraphNode interface
   *
   * Useful for graph structure definitions.
   */
  toGraphNode(): import("../types").GraphNode {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      execute: async (state) => {
        const result = await this.execute(state);
        if (result.success) {
          return result.state;
        }
        throw new Error(result.error);
      },
    };
  }
}
