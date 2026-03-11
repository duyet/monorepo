/**
 * LLM Routing Node (Unit 7)
 *
 * Decides next action based on conversation state.
 * Returns toolName or "done" based on conversation context.
 */

import type { AgentState } from "../types";
import { GraphNode } from "./base";

/**
 * Tool intent detection result
 */
interface ToolIntent {
  toolName: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

/**
 * LLM Routing Node
 *
 * Analyzes conversation context and tool results to determine next action.
 * Uses keyword-based intent detection for efficiency.
 */
export class LLMRouterNode extends GraphNode {
  private readonly toolPatterns: Map<string, RegExp[]> = new Map([
    [
      "search-blog",
      [
        /blog|post|article|write|wrote|written/i,
        /clickhouse|spark|rust|golang|python|data/i,
        /tutorial|guide|how to|explain/i,
      ],
    ],
    [
      "get-cv",
      [
        /cv|resume|experience|work|job|career/i,
        /skill|background|qualification|education/i,
        /summary|detailed/i,
      ],
    ],
    [
      "get-github",
      [
        /github|commit|pr|pull request|issue|activity/i,
        /recent|latest|code|push|repo/i,
      ],
    ],
    [
      "get-analytics",
      [
        /analytics|statistic|metric|report/i,
        /contact|submission|traffic|trend/i,
      ],
    ],
    ["get-about", [/about|who|duyet|introduction|background/i]],
    ["fetch-llms-txt", [/llms\.txt|documentation|feature|domain/i]],
  ]);

  constructor() {
    super({
      id: "llm-router",
      name: "LLM Router",
      description: "Decides next action based on conversation state",
      type: "conditional",
    });
  }

  protected async executeImpl(state: AgentState): Promise<{
    success: boolean;
    state?: Partial<AgentState>;
    error?: string;
  }> {
    try {
      // If we already have a response from tools, route to synthesis
      if (state.toolCalls.length > 0 && state.response) {
        const lastToolCall = state.toolCalls[state.toolCalls.length - 1];

        // Check if tool was successful
        if (lastToolCall.status === "complete") {
          // Determine if we need more tools or are done
          const needsFollowUp = this.checkNeedsFollowUp(state);

          if (needsFollowUp) {
            // Route to additional tool
            const intent = this.detectIntent(state.userInput);

            return {
              success: true,
              state: {
                route: intent.toolName,
              },
            };
          }

          // Route to synthesis for final response
          return {
            success: true,
            state: {
              route: "synthesis",
            },
          };
        }

        // Tool failed, try again with different approach
        return {
          success: true,
          state: {
            route: this.detectIntent(state.userInput).toolName,
          },
        };
      }

      // No tools called yet, detect intent from user input
      const intent = this.detectIntent(state.userInput);

      if (intent.confidence < 0.5) {
        // Low confidence, route to output directly
        return {
          success: true,
          state: {
            route: "output",
            response: this.generateFallbackResponse(state.userInput),
          },
        };
      }

      // High confidence, route to tool
      return {
        success: true,
        state: {
          route: intent.toolName,
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
   * Detect tool intent from user input
   */
  private detectIntent(input: string): ToolIntent {
    const scores: Array<{ toolName: string; score: number }> = [];

    for (const [toolName, patterns] of this.toolPatterns) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores.push({ toolName, score });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
      return {
        toolName: "output",
        parameters: {},
        confidence: 0,
      };
    }

    const top = scores[0];
    const maxScore = Math.max(...scores.map((s) => s.score));
    const confidence = maxScore > 0 ? top.score / maxScore : 0;

    return {
      toolName: top.toolName,
      parameters: this.extractParameters(input, top.toolName),
      confidence,
    };
  }

  /**
   * Extract parameters for a tool from user input
   */
  private extractParameters(
    input: string,
    toolName: string
  ): Record<string, unknown> {
    switch (toolName) {
      case "get-cv":
        if (/detailed/i.test(input)) {
          return { format: "detailed" };
        }
        return { format: "summary" };

      case "get-github": {
        const limitMatch = input.match(/(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1], 10);
          if (limit >= 1 && limit <= 20) {
            return { limit };
          }
        }
        return { limit: 5 };
      }

      case "get-analytics":
        if (/daily|trend/i.test(input)) {
          return { reportType: "daily_trends" };
        }
        if (/purpose|breakdown/i.test(input)) {
          return { reportType: "purpose_breakdown" };
        }
        if (/recent|activity/i.test(input)) {
          return { reportType: "recent_activity" };
        }
        return { reportType: "summary" };

      case "fetch-llms-txt": {
        const domainMatch = input.match(
          /blog|insights|llm[- ]timeline|cv|photos|homelab|home/i
        );
        if (domainMatch) {
          return { domain: domainMatch[0].toLowerCase().replace(" ", "-") };
        }
        return { domain: "home" };
      }

      default:
        return {};
    }
  }

  /**
   * Check if follow-up action is needed
   */
  private checkNeedsFollowUp(state: AgentState): boolean {
    const input = state.userInput.toLowerCase();

    // Check for follow-up indicators
    const followUpIndicators = [
      "and also",
      "additionally",
      "what about",
      "also tell",
      "more detail",
    ];

    return followUpIndicators.some((indicator) => input.includes(indicator));
  }

  /**
   * Generate fallback response when intent is unclear
   */
  private generateFallbackResponse(_input: string): string {
    return `I'm not sure which tool would be best for that question. Could you clarify what you're looking for?

I can help you with:
- **Blog posts**: Search Duyet's technical articles
- **CV/Resume**: Professional experience and skills
- **GitHub activity**: Recent commits and pull requests
- **Analytics**: Site traffic and contact form statistics
- **About**: General information about Duyet

Just ask your question more specifically, and I'll do my best to help!`;
  }
}
