/**
 * Types for the AI Agent application
 */

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
export type Env = {}

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
