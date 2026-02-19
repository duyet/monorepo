/**
 * Cloudflare Agents SDK - Duyet AI Agent
 *
 * This file defines the DuyetAgent class that extends AIChatAgent from the Cloudflare Agents SDK.
 * It provides tools for searching blog posts, getting CV data, GitHub activity, and analytics.
 *
 * The agent is deployed as a Durable Object on Cloudflare Pages.
 */

import { AIChatAgent } from "@cloudflare/ai-chat";
import {
  searchBlogTool,
  getCVTool,
  getGitHubTool,
  getAnalyticsTool,
  getAboutTool,
} from "../lib/tools";

/**
 * DuyetAgent - AI Assistant for Duyet's Digital Presence
 *
 * Extends AIChatAgent which provides:
 * - Built-in LLM integration with Workers AI
 * - Tool/function calling support
 * - Streaming responses
 * - Persistent state via Durable Objects (SQLite)
 */
export class DuyetAgent extends AIChatAgent {
  /**
   * Initialize the agent with welcome message
   */
  async init(): Promise<void> {
    // Set initial state
    this.setState({
      messageCount: 0,
      lastInteraction: Date.now(),
      lastSources: [],
    });
  }

  /**
   * Define the tools available to the AI agent
   * These are defined using the onBeforeChat hook to intercept tool calls
   */
  async onBeforeChat(args: { message: string }) {
    const { message } = args;
    const lowerMessage = message.toLowerCase();

    // Simple tool selection based on keywords (will be enhanced with proper tool calling)
    let toolResult: string | null = null;
    let sources: Array<{ type: string; title: string; url?: string }> = [];

    // Blog search tool
    if (lowerMessage.includes("blog") || lowerMessage.includes("post") || lowerMessage.includes("article")) {
      const query = message.replace(/blog|post|article/gi, "").trim() || "data engineering";
      const result = await searchBlogTool(query);
      toolResult = result.results;
      sources = result.sources;
    }
    // CV tool
    else if (lowerMessage.includes("cv") || lowerMessage.includes("resume") || lowerMessage.includes("experience")) {
      const result = await getCVTool("summary");
      toolResult = result.content;
      sources = result.sources;
    }
    // GitHub tool
    else if (lowerMessage.includes("github") || lowerMessage.includes("commit") || lowerMessage.includes("pr")) {
      const result = await getGitHubTool(5);
      toolResult = result.activity;
      sources = result.sources;
    }
    // Analytics tool
    else if (lowerMessage.includes("analytics") || lowerMessage.includes("statistics") || lowerMessage.includes("data")) {
      const result = await getAnalyticsTool("summary");
      toolResult = result.analytics;
      sources = result.sources;
    }
    // About tool
    else if (lowerMessage.includes("about") || lowerMessage.includes("who is") || lowerMessage.includes("who are you")) {
      const result = await getAboutTool();
      toolResult = result.about;
      sources = result.sources || [];
    }

    // Update state with sources
    this.setState({
      ...(this.state as Record<string, unknown>),
      lastSources: sources,
    });

    // If we have a tool result, prepend it to the message for the LLM
    if (toolResult) {
      return {
        ...args,
        message: `[TOOL RESULT]: ${toolResult}\n\nUSER MESSAGE: ${message}`,
      };
    }

    return args;
  }

  /**
   * System prompt for the AI
   */
  systemPrompt = `You are Duyet's AI assistant. You can help users with:

- **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
- **CV Information** - Learn about Duyet's experience and skills
- **GitHub Activity** - See recent commits, PRs, and issues
- **Analytics** - View contact form statistics

When answering questions:
1. Use the TOOL RESULT information provided above the user message
2. Always cite sources when referencing blog posts or data
3. Be helpful and conversational
4. Format sources as markdown links at the end of your response
5. If no tool result is provided, answer based on your general knowledge

Example response with sources:
"Based on the blog posts, here's what I found...

**Sources:**
- [Blog Post Title](https://blog.duyet.net/post-url)"`;
}
