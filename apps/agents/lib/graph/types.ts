/**
 * LangGraph-inspired Agent Graph Types
 *
 * Core types for state machine-based agent execution.
 * Provides foundation for observability, visualization, and testing.
 */

/**
 * Core agent state - the single source of truth for graph execution
 */
export interface AgentState {
  /** Unique conversation identifier */
  conversationId: string;

  /** User's current input message */
  userInput: string;

  /** Accumulated response to user */
  response: string;

  /** Tool calls made during execution */
  toolCalls: ToolCall[];

  /** Current routing decision / next node to execute */
  route?: string;

  /** Error if any node failed */
  error?: string;

  /** Execution metadata */
  metadata: StateMetadata;
}

/** State metadata for observability */
export interface StateMetadata {
  /** Timestamp when state was created */
  createdAt: number;

  /** Timestamp of last state update */
  updatedAt: number;

  /** Current execution step index */
  stepIndex: number;

  /** Total nodes executed */
  totalNodesExecuted: number;

  /** Current node being executed (if any) */
  currentNode?: string;
}

/** Tool call record in state */
export interface ToolCall {
  /** Unique tool call ID */
  id: string;

  /** Tool name (e.g., 'searchBlog', 'getCV') */
  toolName: string;

  /** Parameters passed to tool */
  parameters: Record<string, unknown>;

  /** Tool result if completed */
  result?: unknown;

  /** Error if tool failed */
  error?: string;

  /** Execution status */
  status: "pending" | "running" | "complete" | "error";
}

/**
 * Node execution trace for observability
 */
export interface NodeTrace {
  /** Node identifier */
  nodeId: string;

  /** Node display name */
  nodeName: string;

  /** Execution start timestamp */
  startTime: number;

  /** Execution end timestamp (undefined if running) */
  endTime?: number;

  /** Execution duration in milliseconds */
  duration?: number;

  /** Execution outcome */
  outcome: "pending" | "running" | "success" | "error";

  /** Input state snapshot (before execution) */
  inputState: Partial<AgentState>;

  /** Output state snapshot (after execution) */
  outputState?: Partial<AgentState>;

  /** State diff (changes made by this node) */
  stateDiff?: StateDiff;

  /** Error message if execution failed */
  error?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** State diff showing what changed */
export interface StateDiff {
  /** Added keys and values */
  added?: Record<string, unknown>;

  /** Modified keys with old/new values */
  modified?: Record<string, { old: unknown; new: unknown }>;

  /** Deleted keys and their previous values */
  deleted?: Record<string, unknown>;
}

/**
 * Graph execution metrics
 */
export interface GraphMetrics {
  /** Total execution time in milliseconds */
  totalDuration: number;

  /** Number of nodes executed */
  nodesExecuted: number;

  /** Success rate (0-1) */
  successRate: number;

  /** Average node duration in milliseconds */
  avgNodeDuration: number;

  /** Node execution counts */
  nodeCounts: Record<string, number>;

  /** Error count */
  errorCount: number;
}

/**
 * Graph node definition
 */
export interface GraphNode {
  /** Unique node identifier */
  id: string;

  /** Display name */
  name: string;

  /** Node description */
  description?: string;

  /** Node type for categorization */
  type: "input" | "llm" | "tool" | "output" | "conditional" | "synthesis";

  /** Execute function - processes state and returns updates */
  execute: (state: AgentState) => Promise<Partial<AgentState>>;
}

/**
 * Conditional edge for routing
 */
export interface ConditionalEdge {
  /** Edge source node */
  from: string;

  /** Edge target node (may include special 'END') */
  to: string;

  /** Condition function - returns true if this edge should be taken */
  condition: (state: AgentState) => boolean;
}

/**
 * Graph structure definition
 */
export interface GraphStructure {
  /** All nodes in the graph */
  nodes: GraphNode[];

  /** All edges in the graph */
  edges: ConditionalEdge[];

  /** Entry node ID */
  entryNode: string;
}

/**
 * Checkpoint for state persistence
 */
export interface StateCheckpoint {
  /** Checkpoint ID (timestamp-based) */
  id: string;

  /** Conversation ID */
  conversationId: string;

  /** State snapshot at checkpoint */
  state: AgentState;

  /** Checkpoint creation timestamp */
  timestamp: number;

  /** Step index when checkpoint was created */
  stepIndex: number;
}

/**
 * Visual graph data for React Flow
 */
export interface VisualGraphData {
  /** Graph nodes for visualization */
  nodes: VisualNode[];

  /** Graph edges for visualization */
  edges: VisualEdge[];
}

/** Visual node for React Flow */
export interface VisualNode {
  /** Unique node ID */
  id: string;

  /** Node position */
  position: { x: number; y: number };

  /** Node type in React Flow */
  type?: string;

  /** Node data for rendering */
  data: {
    label: string;
    description?: string;
    nodeType: GraphNode["type"];
    status?: "pending" | "running" | "success" | "error";
    duration?: number;
  };
}

/** Visual edge for React Flow */
export interface VisualEdge {
  /** Edge ID */
  id: string;

  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Edge type (animated for active path) */
  type?: string;

  /** Edge label */
  label?: string;

  /** Whether edge is currently active */
  animated?: boolean;
}

/**
 * Observer callback for node execution events
 */
export type NodeObserver = (trace: NodeTrace) => void;

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
 * State change observer callback
 */
export type StateObserver = (
  newState: AgentState,
  oldState: AgentState
) => void;
