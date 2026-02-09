/**
 * Tool wrappers for AI Agent
 *
 * These functions wrap MCP client calls and provide structured responses
 * that the AI agent can use to answer questions.
 */

import { getAbout, getAnalytics, getBlogPostContent, getCVData, getGitHubActivity, searchBlog } from "../mcp-client";
import type { Source } from "../types";

/**
 * Tool: Search Blog Posts
 * Searches through Duyet's blog for relevant content
 */
export async function searchBlogTool(query: string): Promise<{
  results: string;
  sources: Source[];
}> {
  const response = await searchBlog(query, 5);

  if (!response.success || !response.data) {
    return {
      results: `I couldn't find any blog posts matching "${query}". You can browse all posts at https://blog.duyet.net`,
      sources: [],
    };
  }

  const sources: Source[] = response.data.map((post) => ({
    type: "blog",
    title: post.title,
    url: post.url,
    snippet: post.snippet,
  }));

  const results = `Found ${response.data.length} blog post(s) matching "${query}":\n\n${response.data
    .map((post, i) => `${i + 1}. **${post.title}**\n   ${post.url}`)
    .join("\n\n")}`;

  return { results, sources };
}

/**
 * Tool: Get Blog Post Content
 * Fetches full content of a specific blog post
 */
export async function getBlogPostTool(url: string): Promise<{
  content: string;
  sources: Source[];
}> {
  const response = await getBlogPostContent({ url });

  if (!response.success || !response.data) {
    return {
      content: `Error: ${response.error || "Failed to fetch blog post"}`,
      sources: [],
    };
  }

  return {
    content: `**${response.data.title}**\n\n${response.data.content.slice(0, 2000)}...`,
    sources: [
      {
        type: "blog",
        title: response.data.title,
        url: response.data.url,
      },
    ],
  };
}

/**
 * Tool: Get CV Data
 * Retrieves Duyet's CV/Resume information
 */
export async function getCVTool(format: "summary" | "detailed" = "summary"): Promise<{
  content: string;
  sources: Source[];
}> {
  const response = await getCVData(format);

  if (!response.success || !response.data) {
    return {
      content: `Error: ${response.error || "Failed to fetch CV"}`,
      sources: [],
    };
  }

  return {
    content: response.data,
    sources: [
      {
        type: "cv",
        title: "Duyet's CV",
        url: "https://cv.duyet.net",
      },
    ],
  };
}

/**
 * Tool: Get GitHub Activity
 * Retrieves recent GitHub activity
 */
export async function getGitHubTool(limit = 5): Promise<{
  activity: string;
  sources: Source[];
}> {
  const response = await getGitHubActivity({ limit });

  if (!response.success || !response.data) {
    return {
      activity: `Error: ${response.error || "Failed to fetch GitHub activity"}`,
      sources: [],
    };
  }

  return {
    activity: response.data,
    sources: [
      {
        type: "github",
        title: "GitHub Profile",
        url: "https://github.com/duyet",
      },
    ],
  };
}

/**
 * Tool: Get Analytics
 * Retrieves contact form analytics
 */
export async function getAnalyticsTool(
  reportType: "summary" | "purpose_breakdown" | "daily_trends" | "recent_activity" = "summary"
): Promise<{
  analytics: string;
  sources: Source[];
}> {
  const response = await getAnalytics({ report_type: reportType });

  if (!response.success || !response.data) {
    return {
      analytics: `Error: ${response.error || "Failed to fetch analytics"}`,
      sources: [],
    };
  }

  return {
    analytics: response.data,
    sources: [
      {
        type: "analytics",
        title: "Analytics Dashboard",
        url: "https://insights.duyet.net",
      },
    ],
  };
}

/**
 * Tool: Get About Information
 * Retrieves general information about Duyet
 */
export async function getAboutTool(): Promise<{
  about: string;
  sources: Source[];
}> {
  const response = await getAbout();

  if (!response.success || !response.data) {
    return {
      about: "Error: Failed to fetch about information",
      sources: [],
    };
  }

  return {
    about: response.data,
    sources: [],
  };
}
