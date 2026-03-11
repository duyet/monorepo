/**
 * Get Blog Post Node (Unit 6)
 *
 * Wraps getBlogPostTool as a graph node.
 */

import { getBlogPostTool } from "../../../tools";
import type { AgentState } from "../../types";
import { GraphNode } from "../base";

/**
 * Get Blog Post Node
 *
 * Fetches full content of a specific blog post.
 */
export class GetBlogPostNode extends GraphNode {
  constructor() {
    super({
      id: "get-blog-post",
      name: "Get Blog Post",
      description: "Fetch full content of a specific blog post by URL",
      type: "tool",
    });
  }

  protected async executeImpl(state: AgentState): Promise<{
    success: boolean;
    state?: Partial<AgentState>;
    error?: string;
  }> {
    try {
      // Extract URL from state metadata or tool calls
      let url: string | undefined;

      // Check if URL is in route
      if (state.route?.startsWith("http")) {
        url = state.route;
      }

      // Check previous tool calls for blog URLs
      if (!url) {
        const lastBlogCall = [...state.toolCalls]
          .reverse()
          .find((tc) => tc.toolName === "searchBlog");
        if (lastBlogCall?.result) {
          // Try to extract URL from search results
          const match = String(lastBlogCall.result).match(
            /https:\/\/blog\.duyet\.net\/[^\s]+/
          );
          url = match?.[0];
        }
      }

      if (!url) {
        return {
          success: false,
          error: "No blog URL found in state",
        };
      }

      // Call the tool
      const { content } = await getBlogPostTool(url);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-get-blog-post`,
        toolName: "getBlogPost",
        parameters: { url },
        result: content,
        status: "complete" as const,
      };

      // Update state with results
      return {
        success: true,
        state: {
          response: content,
          toolCalls: [...state.toolCalls, toolCall],
          route: undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
