/**
 * Synthesis Node (Unit 8)
 *
 * Combines tool results into final response.
 * Handles source aggregation and formatting.
 */

import type { AgentState } from "../types";
import type { Source } from "../../types";
import { GraphNode } from "./base";

/**
 * Synthesis Node
 *
 * Aggregates results from multiple tool executions into a coherent response.
 */
export class SynthesisNode extends GraphNode {
  constructor() {
    super({
      id: "synthesis",
      name: "Synthesis",
      description: "Combines tool results into final response with sources",
      type: "synthesis",
    });
  }

  protected async executeImpl(
    state: AgentState
  ): Promise<{ success: boolean; state?: Partial<AgentState>; error?: string }> {
    try {
      // If we already have a response, just aggregate sources
      if (state.response) {
        const sources = this.extractSources(state);

        // Format response with sources
        const responseWithSources = this.formatResponseWithSources(
          state.response,
          sources
        );

        return {
          success: true,
          state: {
            response: responseWithSources,
            route: "done",
          },
        };
      }

      // No response available, synthesize from tool calls
      const synthesizedResponse = this.synthesizeFromToolCalls(state);
      const sources = this.extractSources(state);

      const responseWithSources = this.formatResponseWithSources(
        synthesizedResponse,
        sources
      );

      return {
        success: true,
        state: {
          response: responseWithSources,
          route: "done",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract sources from tool calls
   */
  private extractSources(state: AgentState): Source[] {
    const sources: Source[] = [];

    for (const toolCall of state.toolCalls) {
      if (toolCall.status !== "complete") continue;

      switch (toolCall.toolName) {
        case "searchBlog":
          sources.push({
            type: "blog",
            title: "Blog Search Results",
            url: "https://blog.duyet.net",
          });
          break;

        case "getBlogPost":
          sources.push({
            type: "blog",
            title: "Blog Post",
            url: toolCall.parameters.url as string,
          });
          break;

        case "getCV":
          sources.push({
            type: "cv",
            title: "Duyet's CV",
            url: "https://cv.duyet.net",
          });
          break;

        case "getGitHub":
          sources.push({
            type: "github",
            title: "GitHub Profile",
            url: "https://github.com/duyet",
          });
          break;

        case "getAnalytics":
          sources.push({
            type: "analytics",
            title: "Analytics Dashboard",
            url: "https://insights.duyet.net",
          });
          break;

        case "fetchLlmsTxt":
          const domain = toolCall.parameters.domain as string;
          sources.push({
            type: "llms-txt",
            title: `${domain} Documentation`,
            url: `https://${domain}.duyet.net/llms.txt`,
          });
          break;
      }
    }

    return sources;
  }

  /**
   * Format response with source citations
   */
  private formatResponseWithSources(
    response: string,
    sources: Source[]
  ): string {
    if (sources.length === 0) {
      return response;
    }

    // Build source links
    const sourceLinks = sources
      .map((source) => {
        if (source.type === "blog") {
          return `[Blog: ${source.title}](${source.url})`;
        }
        if (source.type === "github") {
          return `[GitHub](${source.url})`;
        }
        if (source.type === "cv") {
          return `[CV](${source.url})`;
        }
        if (source.type === "analytics") {
          return `[Analytics](${source.url})`;
        }
        if (source.type === "llms-txt") {
          return `[${source.title}](${source.url})`;
        }
        return `[${source.title}](${source.url})`;
      })
      .join(" | ");

    return `${response}

---

**Sources**: ${sourceLinks}`;
  }

  /**
   * Synthesize response from tool calls when no direct response exists
   */
  private synthesizeFromToolCalls(state: AgentState): string {
    const parts: string[] = [];

    for (const toolCall of state.toolCalls) {
      if (toolCall.status !== "complete" || !toolCall.result) continue;

      const result = String(toolCall.result);

      // Add a header for each tool result
      switch (toolCall.toolName) {
        case "searchBlog":
          parts.push("## Blog Search Results");
          parts.push(result);
          break;

        case "getBlogPost":
          parts.push("## Blog Post Content");
          parts.push(result);
          break;

        case "getCV":
          parts.push("## CV Information");
          parts.push(result);
          break;

        case "getGitHub":
          parts.push("## GitHub Activity");
          parts.push(result);
          break;

        case "getAnalytics":
          parts.push("## Analytics Report");
          parts.push(result);
          break;

        case "getAbout":
          parts.push("## About Duyet");
          parts.push(result);
          break;

        case "fetchLlmsTxt":
          const domain = toolCall.parameters.domain as string;
          parts.push(`## ${domain} Documentation`);
          parts.push(result);
          break;

        default:
          parts.push(result);
      }
    }

    if (parts.length === 0) {
      return "I apologize, but I couldn't retrieve the information you requested. Please try again.";
    }

    return parts.join("\n\n");
  }
}
