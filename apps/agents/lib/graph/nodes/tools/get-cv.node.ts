/**
 * Get CV Node (Unit 6)
 *
 * Wraps getCVTool as a graph node.
 */

import type { AgentState } from "../../types";
import { GraphNode } from "../base";
import { getCVTool } from "../../../tools";

/**
 * Get CV Node
 *
 * Retrieves Duyet's CV/Resume information.
 */
export class GetCVNode extends GraphNode {
  constructor() {
    super({
      id: "get-cv",
      name: "Get CV",
      description: "Retrieve Duyet's CV/Resume information (summary or detailed)",
      type: "tool",
    });
  }

  protected async executeImpl(
    state: AgentState
  ): Promise<{ success: boolean; state?: Partial<AgentState>; error?: string }> {
    try {
      // Determine format from route or default to summary
      const format = state.route === "detailed" ? "detailed" : "summary";

      // Call the tool
      const { content, sources } = await getCVTool(format);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-get-cv`,
        toolName: "getCV",
        parameters: { format },
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
