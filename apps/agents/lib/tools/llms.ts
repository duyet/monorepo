/**
 * llms.txt Tool
 *
 * Fetches llms.txt content from various domains in the duyet.net ecosystem.
 */

import type { Source } from "../types";

const LLMS_TXT_DOMAINS = {
  home: "https://duyet.net/llms.txt",
  blog: "https://blog.duyet.net/llms.txt",
  insights: "https://insights.duyet.net/llms.txt",
  llmTimeline: "https://llm-timeline.duyet.net/llms.txt",
  cv: "https://cv.duyet.net/llms.txt",
  photos: "https://photos.duyet.net/llms.txt",
  homelab: "https://homelab.duyet.net/llms.txt",
} as const;

type LlmsDomain = keyof typeof LLMS_TXT_DOMAINS;

/**
 * Tool: Fetch llms.txt content
 * Retrieves the llms.txt file from a specified domain
 */
export async function fetchLlmsTxtTool(domain: LlmsDomain | string): Promise<{
  content: string;
  sources: Source[];
}> {
  const url = domain.startsWith("http")
    ? domain
    : LLMS_TXT_DOMAINS[domain as LlmsDomain] ||
      `https://${domain}.duyet.net/llms.txt`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "text/plain, text/markdown" },
    });

    if (!response.ok) {
      return {
        content: `Failed to fetch llms.txt from ${url}: ${response.status} ${response.statusText}`,
        sources: [],
      };
    }

    const text = await response.text();

    return {
      content: text.slice(0, 10000), // Limit content size
      sources: [
        {
          type: "llms-txt",
          title: `${domain} llms.txt`,
          url,
        },
      ],
    };
  } catch (error) {
    return {
      content: `Error fetching llms.txt from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
      sources: [],
    };
  }
}

/**
 * Get available llms.txt domains
 */
export function getLlmsDomains(): { key: string; url: string }[] {
  return Object.entries(LLMS_TXT_DOMAINS).map(([key, url]) => ({ key, url }));
}
