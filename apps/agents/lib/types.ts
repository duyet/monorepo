/**
 * Types for the AI Agent application
 */

export type ChatMode = 'fast' | 'agent'

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: number;
}

export interface Source {
  type: "blog" | "github" | "cv" | "analytics";
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
  report_type?: "summary" | "purpose_breakdown" | "daily_trends" | "recent_activity" | "custom_period";
  date_from?: string;
  date_to?: string;
}

// Cloudflare Pages Function environment
export type Env = Record<string, unknown>

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
