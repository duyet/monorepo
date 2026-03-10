/**
 * Fetch llms.txt Node (Unit 6)
 *
 * Wraps fetchLlmsTxt tool as a graph node.
 */

import type { AgentState } from "../../types";
import { GraphNode } from "../base";
import { fetchLlmsTxt } from "../../../tools";

/**
 * Fetch llms.txt Node
 *
 * Retrieves llms.txt content from any duyet.net domain.
 */
export class FetchLlmsTxtNode extends GraphNode {
  constructor() {
    super({
      id: "fetch-llms-txt",
      name: "Fetch llms.txt",
      description: "Fetch llms.txt from any duyet.net domain for AI-readable documentation",
      type: "tool",
    });
  }

  protected async executeImpl(
    state: AgentState
  ): Promise<{ success: boolean; state?: Partial<AgentState>; error?: string }> {
    try {
      // Extract domain from route or default to home
      const domain = state.route || "home";

      // Call the tool
      const { content } = await fetchLlmsTxt(domain);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-fetch-llms-txt`,
        toolName: "fetchLlmsTxt",
        parameters: { domain },
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
