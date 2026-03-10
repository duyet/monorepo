/**
 * Types for the AI Agent application
 */

export type ChatMode = "fast" | "agent";

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: ChatMode;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: number;
  // Metadata for assistant messages
  model?: string;
  duration?: number; // milliseconds
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  toolCalls?: number;
}

export interface Source {
  type: "blog" | "github" | "cv" | "analytics" | "llms-txt";
  title: string;
  url?: string;
  snippet?: string;
}

export interface ChatRequest {
  messages: Message[];
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  sources?: Source[];
  done: boolean;
}

export interface MCPToolResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// MCP Server Tool Types
export interface GitHubActivityToolParams {
  limit?: number;
  include_details?: boolean;
}

export interface BlogPostContentParams {
  url: string;
}

export interface AnalyticsToolParams {
  report_type?:
    | "summary"
    | "purpose_breakdown"
    | "daily_trends"
    | "recent_activity"
    | "custom_period";
  date_from?: string;
  date_to?: string;
}

// Cloudflare Pages Function environment
export type Env = Record<string, unknown>;

// Agent tool definitions for LLM
export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Agent types for multi-agent system
export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  systemPrompt: string;
  tools: AgentTool[];
}

// Tool execution tracking for transparency panel
export interface ToolExecution {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  startTime: number;
  endTime?: number;
  status: "pending" | "running" | "complete" | "error";
  result?: unknown;
  error?: string;
}

// SSE event types for tool streaming
export interface ToolStartEvent {
  type: "tool_start";
  tool: string;
  params: Record<string, unknown>;
}

export interface ToolCompleteEvent {
  type: "tool_complete";
  tool: string;
  result: unknown;
}

export interface ToolErrorEvent {
  type: "tool_error";
  tool: string;
  error: string;
}

export type StreamEvent =
  | ToolStartEvent
  | ToolCompleteEvent
  | ToolErrorEvent
  | { type: "response"; response: string };

export type ActivityTabType = "process" | "files";

export interface ActivityPanelProps {
  executions: ToolExecution[];
  thinkingSteps?: string[];
  isLoading?: boolean;
  onClose?: () => void;
  className?: string;
  // Graph state for enhanced activity panel (Unit 19)
  graphState?: import("./graph").AgentState;
  nodeTraces?: import("./graph").NodeTrace[];
  // Visual graph data from GraphRouter (Unit 10)
  graphData?: import("./graph").VisualGraphData;
}

// ============================================================================
// GRAPH TYPES (Unit 14) - Re-exported from graph module for convenience
// ============================================================================

// Core graph state types
export type {
  AgentState,
  StateMetadata,
  ToolCall,
  NodeTrace,
  StateDiff,
} from "./graph/types";

// Graph execution metrics
export type {
  GraphMetrics,
  GraphNode,
  ConditionalEdge,
  GraphStructure,
  StateCheckpoint,
} from "./graph/types";

// Visualization types
export type {
  VisualGraphData,
  VisualNode,
  VisualEdge,
} from "./graph/types";

// Observer types
export type {
  NodeObserver,
  StateObserver,
} from "./graph/types";

// State management utilities (Unit 1)
export { StateManager } from "./graph/state";
export type { StateValidationResult } from "./graph/state";

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
} from "./graph/edges";
export type { NodeRoute, EdgeDecision } from "./graph/edges";

// Database checkpoint types (Unit 3)
export type {
  CheckpointRow,
  CreateCheckpointParams,
} from "./db/client";
