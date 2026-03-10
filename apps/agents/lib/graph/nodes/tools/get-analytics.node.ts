/**
 * Get Analytics Node (Unit 6)
 *
 * Wraps getAnalyticsTool as a graph node.
 */

import type { AgentState } from "../../types";
import { GraphNode } from "../base";
import { getAnalyticsTool } from "../../../tools";

/**
 * Get Analytics Node
 *
 * Retrieves contact form analytics and reports.
 */
export class GetAnalyticsNode extends GraphNode {
  constructor() {
    super({
      id: "get-analytics",
      name: "Get Analytics",
      description: "Get contact form analytics and reports",
      type: "tool",
    });
  }

  protected async executeImpl(
    state: AgentState
  ): Promise<{ success: boolean; state?: Partial<AgentState>; error?: string }> {
    try {
      // Extract report type from route or default to summary
      const reportType = (state.route as any) || "summary";

      // Validate report type
      const validReportTypes = [
        "summary",
        "purpose_breakdown",
        "daily_trends",
        "recent_activity",
      ];
      const validatedReportType = validReportTypes.includes(reportType)
        ? reportType
        : "summary";

      // Call the tool
      const { analytics } = await getAnalyticsTool(validatedReportType);

      // Create tool call record
      const toolCall = {
        id: `tc-${Date.now()}-get-analytics`,
        toolName: "getAnalytics",
        parameters: { reportType: validatedReportType },
        result: analytics,
        status: "complete" as const,
      };

      // Update state with results
      return {
        success: true,
        state: {
          response: analytics,
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
