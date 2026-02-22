/**
 * AI Agent with Tool Definitions
 *
 * This agent uses Cloudflare Workers AI to answer questions about Duyet
 * by calling various tools that fetch data from the MCP server or other sources.
 */

import type { Message, Source } from "./types";
import {
  getAboutTool,
  getAnalyticsTool,
  getBlogPostTool,
  getCVTool,
  getGitHubTool,
  searchBlogTool,
} from "./tools";

// System prompt for the AI agent
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

export const FAST_SYSTEM_PROMPT = `You are Duyet's AI assistant. Answer questions about Duyet concisely and helpfully. You can discuss blog posts, CV, GitHub activity, or general topics.`

// Tool definitions for the LLM
export const AGENT_TOOLS = [
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

/**
 * Execute a tool call
 * Note: Tool functions return different property names, so we normalize them
 */
async function _executeToolCall(
  toolName: string,
  parameters: Record<string, unknown>
): Promise<{ result: string; sources: Source[] }> {
  let toolResult: any;

  switch (toolName) {
    case "searchBlog": {
      const query = parameters.query as string;
      const { results, sources } = await searchBlogTool(query);
      toolResult = { result: results, sources };
      break;
    }
    case "getBlogPost": {
      const url = parameters.url as string;
      const { content, sources } = await getBlogPostTool(url);
      toolResult = { result: content, sources };
      break;
    }
    case "getCV": {
      const format = (parameters.format as "summary" | "detailed") || "summary";
      const { content, sources } = await getCVTool(format);
      toolResult = { result: content, sources };
      break;
    }
    case "getGitHub": {
      const limit = (parameters.limit as number) || 5;
      const { activity, sources } = await getGitHubTool(limit);
      toolResult = { result: activity, sources };
      break;
    }
    case "getAnalytics": {
      const reportType = (parameters.reportType as any) || "summary";
      const { analytics, sources } = await getAnalyticsTool(reportType);
      toolResult = { result: analytics, sources };
      break;
    }
    case "getAbout": {
      const { about, sources } = await getAboutTool();
      toolResult = { result: about, sources };
      break;
    }
    default:
      return {
        result: `Unknown tool: ${toolName}`,
        sources: [],
      };
  }

  return toolResult;
}

/**
 * Process a message and return a response
 *
 * This is a simplified implementation that uses a pattern-matching approach
 * instead of full LLM integration. For production, you would:
 * 1. Use Workers AI binding for LLM inference
 * 2. Implement proper function calling
 * 3. Handle streaming responses
 */
export async function processMessage(
  messages: Message[],
  onStream?: (chunk: string) => void
): Promise<{ content: string; sources: Source[] }> {
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage.content.toLowerCase();

  // Collect all sources from tool calls
  const allSources: Source[] = [];

  // Pattern-based tool selection (simplified)
  let response = "";

  // Check for CV-related queries
  if (userQuery.includes("cv") || userQuery.includes("resume") || userQuery.includes("experience") || userQuery.includes("skill")) {
    const { content, sources } = await getCVTool(userQuery.includes("detailed") ? "detailed" : "summary");
    response = content;
    allSources.push(...sources);
  }
  // Check for GitHub-related queries
  else if (userQuery.includes("github") || userQuery.includes("commit") || userQuery.includes("pr") || userQuery.includes("pull request")) {
    const { activity, sources } = await getGitHubTool(5);
    response = activity;
    allSources.push(...sources);
  }
  // Check for analytics queries
  else if (userQuery.includes("analytics") || userQuery.includes("contact") || userQuery.includes("stats")) {
    const { analytics, sources } = await getAnalyticsTool("summary");
    response = analytics;
    allSources.push(...sources);
  }
  // Check for blog search
  else if (userQuery.includes("blog") || userQuery.includes("post") || userQuery.includes("article")) {
    // Extract search terms
    const searchTerms = lastMessage.content
      .replace(/blog|posts?|articles?|about|what|how|tell me/gi, " ")
      .trim()
      .slice(0, 100);

    if (searchTerms.length > 2) {
      const { results, sources } = await searchBlogTool(searchTerms);
      response = results;
      allSources.push(...sources);
    } else {
      response = "I found 296+ blog posts on data engineering, cloud computing, and programming. What topic would you like me to search for? You can browse all posts at https://blog.duyet.net";
    }
  }
  // Check for about queries
  else if (userQuery.includes("about") || userQuery.includes("who") || userQuery.includes("duyet")) {
    const { about, sources } = await getAboutTool();
    response = about;
    allSources.push(...sources);
  }
  // Default response
  else {
    response = `Hello! I'm Duyet's AI assistant. I can help you with:

• **Blog Search** - Search through 296+ blog posts on data engineering, cloud computing, and programming
• **CV Information** - Learn about Duyet's experience and skills
• **GitHub Activity** - See recent commits, PRs, and issues
• **Analytics** - View contact form statistics and reports

What would you like to know?

You can also visit:
- Blog: https://blog.duyet.net
- CV: https://cv.duyet.net
- GitHub: https://github.com/duyet
- Analytics: https://insights.duyet.net`;
  }

  // Simulate streaming if callback provided
  if (onStream) {
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      onStream(words[i] + (i < words.length - 1 ? " " : ""));
      // Small delay for realistic streaming effect
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  return {
    content: response,
    sources: allSources,
  };
}

/**
 * Format sources for display
 */
export function formatSources(sources: Source[]): string {
  if (!sources || sources.length === 0) return "";

  const sourceList = sources.map((s) => {
    if (s.type === "blog" && s.url) {
      return `- [${s.title}](${s.url})`;
    }
    return `- ${s.title}`;
  });

  return `\n\n**Sources:**\n${sourceList.join("\n")}`;
}

/**
 * For production: This would use Cloudflare Workers AI
 * with the AI binding and proper function calling
 *
 * Example implementation:
 *
 * export async function processWithWorkersAI(
 *   messages: Message[],
 *   env: Env
 * ): Promise<{ content: string; sources: Source[] }> {
 *   // Access AI binding in Cloudflare Pages Functions
 *   const ai = env.AI as any;
 *
 *   const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
 *     messages: [
 *       { role: 'system', content: SYSTEM_PROMPT },
 *       ...messages.map(m => ({ role: m.role, content: m.content }))
 *     ],
 *     tools: AGENT_TOOLS,
 *     // Enable function calling
 *     tool_choice: 'auto'
 *   });
 *
 *   // Handle tool calls from LLM response
 *   // Execute tools and format final response
 *
 *   return { content: response, sources: [] };
 * }
 */
