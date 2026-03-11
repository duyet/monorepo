/**
 * Get About Node (Unit 6)
 *
 * Wraps getAboutTool as a graph node.
 */

import { getAboutTool } from "../../../tools";
import type { AgentState } from "../../types";
import { GraphNode } from "../base";

/**
 * Get About Node
 *
 * Retrieves general information about Duyet.
 */
export class GetAboutNode extends GraphNode {
  constructor() {
    super({
      id: "get-about",
      name: "Get About",
      description: "Get general background information about Duyet",
      type: "tool",
    });
  }

  protected async executeImpl(state: AgentState): Promise<{
    success: boolean;
    state?: Partial<AgentState>;
    error?: string;
  }> {
    try {
      // Call the tool
      const { about } = await getAboutTool();

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-get-about`,
        toolName: "getAbout",
        parameters: {},
        result: about,
        status: "complete" as const,
      };

      // Update state with results
      return {
        success: true,
        state: {
          response: about,
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
