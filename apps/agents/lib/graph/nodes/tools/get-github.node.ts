/**
 * Get GitHub Node (Unit 6)
 *
 * Wraps getGitHubTool as a graph node.
 */

import { getGitHubTool } from "../../../tools";
import type { AgentState } from "../../types";
import { GraphNode } from "../base";

/**
 * Get GitHub Node
 *
 * Retrieves recent GitHub activity.
 */
export class GetGitHubNode extends GraphNode {
  constructor() {
    super({
      id: "get-github",
      name: "Get GitHub",
      description:
        "Fetch recent GitHub activity including commits, PRs, and issues",
      type: "tool",
    });
  }

  protected async executeImpl(state: AgentState): Promise<{
    success: boolean;
    state?: Partial<AgentState>;
    error?: string;
  }> {
    try {
      // Extract limit from tool parameters (not route, which is the next node name)
      const limit = typeof state.limit === 'number' ? state.limit : 5;

      // Call the tool
      const { activity } = await getGitHubTool(limit);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-get-github`,
        toolName: "getGitHub",
        parameters: { limit },
        result: activity,
        status: "complete" as const,
      };

      // Update state with results
      return {
        success: true,
        state: {
          response: activity,
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
