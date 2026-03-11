/**
 * Search Blog Node (Unit 6)
 *
 * Wraps searchBlogTool as a graph node.
 */

import { searchBlogTool } from "../../../tools";
import type { AgentState } from "../../types";
import { GraphNode } from "../base";

/**
 * Search Blog Node
 *
 * Searches through Duyet's blog for relevant content.
 */
export class SearchBlogNode extends GraphNode {
  constructor() {
    super({
      id: "search-blog",
      name: "Search Blog",
      description: "Search blog posts by topic, keywords, or technology",
      type: "tool",
    });
  }

  protected async executeImpl(state: AgentState): Promise<{
    success: boolean;
    state?: Partial<AgentState>;
    error?: string;
  }> {
    try {
      // Extract query from user input or state
      const query = state.userInput || state.route || "";

      if (!query) {
        return {
          success: false,
          error: "No query provided for blog search",
        };
      }

      // Call the tool
      const { results } = await searchBlogTool(query);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-search-blog`,
        toolName: "searchBlog",
        parameters: { query },
        result: results,
        status: "complete" as const,
      };

      // Update state with results
      return {
        success: true,
        state: {
          response: results,
          toolCalls: [...state.toolCalls, toolCall],
          route: undefined, // Clear route after execution
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
