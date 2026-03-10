/**
 * Conditional Edge Logic (Unit 9)
 *
 * Routing functions for determining the next node in the graph.
 * Implements the routeNextNode function with the following logic:
 * - Has pending tools → execute
 * - Tools done → synthesize
 * - Else → LLM decide
 */

import type { AgentState } from "./types";

/**
 * Target node for routing
 */
export type NodeRoute =
  | "llm" // Route to LLM node for reasoning
  | "execute_tools" // Route to tool execution
  | "synthesize" // Route to final synthesis
  | "output" // Route to output/complete
  | "end"; // End the conversation

/**
 * Edge routing decision with reason
 */
export interface EdgeDecision {
  /** Target node to route to */
  route: NodeRoute;
  /** Reason for the routing decision */
  reason: string;
}

/**
 * Conditional edge function for routing
 *
 * Determines the next node based on the current state:
 *
 * 1. **Pending tools** → route to "execute_tools"
 *    - If there are tool calls with "pending" or "running" status
 *
 * 2. **Tools done** → route to "synthesize"
 *    - If there are completed tool calls and no pending ones
 *
 * 3. **Has response** → route to "output"
 *    - If we have a meaningful response ready
 *
 * 4. **Error state** → route to "output"
 *    - If there's an error, output it to the user
 *
 * 5. **Default** → route to "llm"
 *    - Let the LLM decide what to do next
 *
 * @param state - Current agent state
 * @returns Edge decision with target node and reason
 */
export function routeNextNode(state: AgentState): EdgeDecision {
  // Check for pending tool calls
  const pendingTools = state.toolCalls.filter(
    (tc) => tc.status === "pending" || tc.status === "running"
  );

  if (pendingTools.length > 0) {
    return {
      route: "execute_tools",
      reason: `Has ${pendingTools.length} pending tool(s) to execute`,
    };
  }

  // Check if we have completed tools and need synthesis
  const completedTools = state.toolCalls.filter(
    (tc) => tc.status === "complete"
  );

  if (completedTools.length > 0 && !state.response) {
    return {
      route: "synthesize",
      reason: `${completedTools.length} tool(s) completed, need synthesis`,
    };
  }

  // Check if we have a response ready
  if (state.response && state.response.length > 0) {
    return {
      route: "output",
      reason: "Response ready, outputting to user",
    };
  }

  // Check for error state
  if (state.error) {
    return {
      route: "output",
      reason: `Error state: ${state.error}`,
    };
  }

  // Default: let LLM decide
  return {
    route: "llm",
    reason: "No clear path, routing to LLM for decision",
  };
}

/**
 * Check if a route should end the conversation
 *
 * Used by conditional edges to determine if execution should complete.
 */
export function shouldEnd(state: AgentState, route: NodeRoute): boolean {
  // End if we're at output with a response
  if (route === "output" && state.response) {
    return true;
  }

  // End if we have an error
  if (state.error) {
    return true;
  }

  // End if explicitly routed to end
  if (route === "end") {
    return true;
  }

  // Continue execution
  return false;
}

/**
 * Create a conditional edge function
 *
 * Returns a function that can be used as a conditional edge in the graph.
 * The returned function evaluates the condition and returns the target node.
 */
export function createConditionalEdge(
  condition: (state: AgentState) => boolean,
  trueRoute: NodeRoute,
  falseRoute: NodeRoute,
  _reason?: string
): (state: AgentState) => NodeRoute {
  return (state: AgentState): NodeRoute => {
    if (condition(state)) {
      return trueRoute;
    }
    return falseRoute;
  };
}

/**
 * Predefined conditional edge: route to tool execution if pending tools
 */
export const hasPendingToolsEdge = createConditionalEdge(
  (state) =>
    state.toolCalls.some((tc) => tc.status === "pending" || tc.status === "running"),
  "execute_tools",
  "llm",
  "Route to tool execution if pending tools"
);

/**
 * Predefined conditional edge: route to synthesis if tools completed
 */
export const toolsCompletedEdge = createConditionalEdge(
  (state) =>
    state.toolCalls.some((tc) => tc.status === "complete") &&
    state.toolCalls.every((tc) => tc.status !== "pending" && tc.status !== "running"),
  "synthesize",
  "llm",
  "Route to synthesis if all tools completed"
);

/**
 * Predefined conditional edge: route to output if response ready
 */
export const hasResponseEdge = createConditionalEdge(
  (state) => state.response.length > 0,
  "output",
  "llm",
  "Route to output if response ready"
);

/**
 * Predefined conditional edge: route to output on error
 */
export const hasErrorEdge = createConditionalEdge(
  (state) => !!state.error,
  "output",
  "llm",
  "Route to output on error"
);

/**
 * Chain multiple conditional edges
 *
 * Evaluates edges in order and returns the first matching route.
 * If no edges match, returns the default route.
 */
export function chainEdges(
  edges: Array<(state: AgentState) => NodeRoute>,
  defaultRoute: NodeRoute = "llm"
): (state: AgentState) => NodeRoute {
  return (state: AgentState): NodeRoute => {
    for (const edge of edges) {
      const route = edge(state);
      // Edge returned something other than default, use it
      if (route !== defaultRoute) {
        return route;
      }
    }
    return defaultRoute;
  };
}

/**
 * Default edge chain for the agent graph
 *
 * Chains the common conditional edges in priority order:
 * 1. Error → output
 * 2. Pending tools → execute_tools
 * 3. Completed tools → synthesize
 * 4. Has response → output
 * 5. Default → llm
 */
export const defaultEdgeChain = chainEdges(
  [
    hasErrorEdge,
    hasPendingToolsEdge,
    toolsCompletedEdge,
    hasResponseEdge,
  ],
  "llm"
);
