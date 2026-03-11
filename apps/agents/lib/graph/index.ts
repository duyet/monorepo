/**
 * LangGraph-inspired Agent Graph Module
 *
 * Core graph execution system for multi-step agent workflows.
 * Provides state management, routing, observability, and visualization.
 */

// Types
export type {
  AgentState,
  StateMetadata,
  ToolCall,
  NodeTrace,
  StateDiff,
  GraphMetrics,
  GraphNode,
  ConditionalEdge,
  GraphStructure,
  StateCheckpoint,
  VisualGraphData,
  VisualNode,
  VisualEdge,
  NodeObserver,
  StateObserver,
} from "./types";

// Router (Unit 10)
export { GraphRouter, createInitialState, executeGraph } from "./router";

// Observability (Unit 15)
export {
  ObservabilityMiddleware,
  createObservability,
  withObservability,
  type ObservabilityOptions,
  type ObservabilityResult,
} from "./observability";

// Checkpointer (Unit 4)
export {
  Checkpointer,
  createCheckpointer,
  type CheckpointerOptions,
  type CheckpointInfo,
} from "./checkpointer";

// State management utilities (Unit 1)
export {
  validate,
  createAgentState,
  clone,
  applyUpdate,
  computeDiff,
  formatDiff,
  createCheckpoint,
  restoreFromCheckpoint,
} from "./state";
export type { StateValidationResult } from "./state";

// Conditional edge logic (Unit 9)
export {
  routeNextNode,
  shouldEnd,
  createConditionalEdge,
  hasPendingToolsEdge,
  toolsCompletedEdge,
  hasResponseEdge,
  hasErrorEdge,
  chainEdges,
  defaultEdgeChain,
} from "./edges";
export type { NodeRoute, EdgeDecision } from "./edges";
