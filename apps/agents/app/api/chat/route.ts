/**
 * Chat API Route - Cloudflare Pages Function
 *
 * Handles streaming chat with Workers AI + tool calling.
 * Mode: 'fast' = direct LLM, no tools. 'agent' = full tool use with maxSteps.
 */

import { streamText, tool } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";
import { SYSTEM_PROMPT, FAST_SYSTEM_PROMPT } from "../../../lib/agent";
import {
  searchBlogTool,
  getBlogPostTool,
  getCVTool,
  getGitHubTool,
  getAnalyticsTool,
  getAboutTool,
} from "../../../lib/tools";

export const runtime = "edge";

const AGENT_TOOLS = {
  searchBlog: tool({
    description:
      "Search for blog posts by topic or keywords. Returns matching posts with titles and URLs.",
    inputSchema: z.object({
      query: z.string().describe("Search query for blog posts"),
    }),
    execute: async ({ query }) => {
      const { results } = await searchBlogTool(query);
      return results;
    },
  }),
  getBlogPost: tool({
    description: "Get the full content of a specific blog post by URL",
    inputSchema: z.object({
      url: z.string().describe("URL of the blog post"),
    }),
    execute: async ({ url }) => {
      const { content } = await getBlogPostTool(url);
      return content;
    },
  }),
  getCV: tool({
    description: "Get Duyet's CV/Resume information",
    inputSchema: z.object({
      format: z
        .enum(["summary", "detailed"])
        .optional()
        .describe("Format of the CV data (default: summary)"),
    }),
    execute: async ({ format = "summary" }) => {
      const { content } = await getCVTool(format);
      return content;
    },
  }),
  getGitHub: tool({
    description: "Get recent GitHub activity including commits, issues, PRs",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("Number of activities to retrieve (max 20)"),
    }),
    execute: async ({ limit = 5 }) => {
      const { activity } = await getGitHubTool(limit);
      return activity;
    },
  }),
  getAnalytics: tool({
    description: "Get contact form analytics and reports",
    inputSchema: z.object({
      reportType: z
        .enum(["summary", "purpose_breakdown", "daily_trends", "recent_activity"])
        .optional()
        .describe("Type of analytics report (default: summary)"),
    }),
    execute: async ({ reportType = "summary" }) => {
      const { analytics } = await getAnalyticsTool(reportType);
      return analytics;
    },
  }),
  getAbout: tool({
    description: "Get general information about Duyet",
    inputSchema: z.object({}),
    execute: async () => {
      const { about } = await getAboutTool();
      return about;
    },
  }),
};

export async function POST(req: Request) {
  try {
    const { messages, mode = "agent" } = await req.json();

    const env = process.env as {
      CLOUDFLARE_ACCOUNT_ID?: string;
      CLOUDFLARE_API_KEY?: string;
    };

    const workersai = createWorkersAI({
      accountId: env.CLOUDFLARE_ACCOUNT_ID || "",
      apiKey: env.CLOUDFLARE_API_KEY || "",
    });

    const isFast = mode === "fast";
    const system = isFast ? FAST_SYSTEM_PROMPT : SYSTEM_PROMPT;

    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
      system,
      messages,
      temperature: isFast ? 0.3 : 0.7,
      ...(isFast ? {} : { tools: AGENT_TOOLS, maxSteps: 5 }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
