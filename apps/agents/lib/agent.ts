/**
 * AI Agent Configuration
 *
 * System prompts and tool schema definitions for the AI agent.
 * Tool implementations live in ./tools/ and are wired up in functions/api/chat.ts.
 */

import type { AgentTool } from "./types";

/** Fast mode: lightweight model for quick conversational responses */
export const FAST_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

/** Agent mode: larger model with function-calling support */
export const AGENT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

export const SYSTEM_PROMPT = `You are Duyet's AI assistant. You help answer questions about:
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

You have access to the following tools:
- searchBlog: Search for blog posts by topic
- getBlogPost: Get full content of a specific blog post
- getCV: Get Duyet's CV/Resume information
- getGitHub: Get recent GitHub activity
- getAnalytics: Get contact form analytics
- getAbout: Get general information about Duyet

When answering:
1. Check if you need data from tools
2. Call the appropriate tools
3. Synthesize the information into a helpful response
4. Include source citations when relevant`;

export const FAST_SYSTEM_PROMPT = `You are Duyet's AI assistant on duyet.net. Be friendly and conversational.

About Duyet: Software engineer specializing in data engineering. Writes a blog at blog.duyet.net covering data engineering, Rust, ClickHouse, Apache Spark, cloud computing, and programming. Open source contributor on GitHub (github.com/duyet).

Guidelines:
- Greet users warmly and offer to help
- Answer from what you know; suggest switching to Agent mode for detailed lookups
- Keep responses concise and helpful
- Never refuse short inputs like "hi" — just be friendly`;

/** Tool schemas in JSON-schema format, used by the agent registry */
export const AGENT_TOOLS: AgentTool[] = [
  {
    name: "searchBlog",
    description: "Search for blog posts by topic or keywords. Returns matching posts with titles and URLs.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for blog posts",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "getBlogPost",
    description: "Get the full content of a specific blog post by URL",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the blog post (from blog.duyet.net or duyet.net)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "getCV",
    description: "Get Duyet's CV/Resume information. Available formats: summary, detailed",
    parameters: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["summary", "detailed"],
          description: "Format of the CV data (default: summary)",
        },
      },
    },
  },
  {
    name: "getGitHub",
    description: "Get recent GitHub activity including commits, issues, PRs",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of recent activities to retrieve (default: 5, max: 20)",
        },
      },
    },
  },
  {
    name: "getAnalytics",
    description: "Get contact form analytics and reports",
    parameters: {
      type: "object",
      properties: {
        reportType: {
          type: "string",
          enum: ["summary", "purpose_breakdown", "daily_trends", "recent_activity"],
          description: "Type of analytics report (default: summary)",
        },
      },
    },
  },
  {
    name: "getAbout",
    description: "Get general information about Duyet",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

