/**
 * Agent Registry
 *
 * Multi-agent system with centralized agent definitions.
 * Each agent has its own system prompt, tools, and metadata.
 */

import type { Agent } from "./types";
import { AGENT_TOOLS } from "./agent";

/**
 * Duyetbot - Main AI assistant
 */
const DUYETBOT_AGENT: Agent = {
  id: "duyetbot",
  name: "Duyetbot",
  description: "AI assistant for Duyet's blog, CV, and analytics",
  avatar: "🤖",
  systemPrompt: `You are Duyet's AI assistant. You help answer questions about:
- Duyet's blog posts (data engineering, cloud computing, programming)
- Duyet's CV and professional experience
- Recent GitHub activity
- Analytics and contact form data

Guidelines:
- Be friendly and professional
- Use tools when you need specific data
- Always cite sources when referencing blog posts or data
- If you don't know something, say so honestly
- Keep responses concise but informative

You have access to following tools:
- searchBlog: Search for blog posts by topic
- getBlogPost: Get full content of a specific blog post
- getCV: Get Duyet's CV/Resume information
- getGitHub: Get recent GitHub activity
- getAnalytics: Get contact form analytics
- getAbout: Get general information about Duyet

When answering:
1. Check if you need data from tools
2. Call appropriate tools
3. Synthesize information into a helpful response
4. Include source citations when relevant`,
  tools: AGENT_TOOLS,
};

/**
 * Agent registry
 *
 * Add new agents here to enable multi-agent support.
 * Future agents could include:
 * - Code assistant for specific programming tasks
 * - Writing assistant for content creation
 * - Research assistant for deep analysis
 */
export const AGENTS: Agent[] = [DUYETBOT_AGENT];

/**
 * Get agent by ID
 */
export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

/**
 * Get default agent
 */
export function getDefaultAgent(): Agent {
  return AGENTS[0];
}
