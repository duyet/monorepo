/**
 * Graph Router (Unit 10)
 *
 * Main orchestrator for graph execution.
 * Executes nodes sequentially with state persistence.
 */

import type { AgentState, NodeTrace, GraphMetrics } from "./types";
import {
  GraphNode,
  LLMRouterNode,
  SynthesisNode,
  SearchBlogNode,
  GetBlogPostNode,
  GetCVNode,
  GetGitHubNode,
  GetAnalyticsNode,
  GetAboutNode,
  FetchLlmsTxtNode,
} from "./nodes";

/**
 * Maximum number of steps to prevent infinite loops
 */
const MAX_STEPS = 30;

/**
 * Graph Router
 *
 * Orchestrates sequential node execution with state persistence.
 */
export class GraphRouter {
  private nodes: Map<string, GraphNode> = new Map();
  private traces: NodeTrace[] = [];
  private metrics: GraphMetrics = {
    totalDuration: 0,
    nodesExecuted: 0,
    successRate: 1,
    avgNodeDuration: 0,
    nodeCounts: {},
    errorCount: 0,
  };

  constructor() {
    this.registerDefaultNodes();
  }

  /**
   * Register default nodes
   */
  private registerDefaultNodes(): void {
    // Core nodes
    this.registerNode(new LLMRouterNode());
    this.registerNode(new SynthesisNode());

    // Tool nodes
    this.registerNode(new SearchBlogNode());
    this.registerNode(new GetBlogPostNode());
    this.registerNode(new GetCVNode());
    this.registerNode(new GetGitHubNode());
    this.registerNode(new GetAnalyticsNode());
    this.registerNode(new GetAboutNode());
    this.registerNode(new FetchLlmsTxtNode());
  }

  /**
   * Register a custom node
   */
  registerNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Execute the graph with initial state
   *
   * Main entry point for graph execution.
   */
  async executeGraph(initialState: AgentState): Promise<{
    state: AgentState;
    traces: NodeTrace[];
    metrics: GraphMetrics;
  }> {
    const startTime = Date.now();
    let state = { ...initialState };
    this.traces = [];
    this.metrics = {
      totalDuration: 0,
      nodesExecuted: 0,
      successRate: 1,
      avgNodeDuration: 0,
      nodeCounts: {},
      errorCount: 0,
    };

    try {
      // Start with router node
      let currentRoute = "llm-router";

      for (let step = 0; step < MAX_STEPS; step++) {
        // Check if we're done
        if (currentRoute === "done" || currentRoute === "output") {
          break;
        }

        // Get the node to execute
        const node = this.nodes.get(currentRoute);
        if (!node) {
          throw new Error(`Unknown route: ${currentRoute}`);
        }

        // Update metadata
        state.metadata.currentNode = node.id;
        state.metadata.stepIndex = step;
        state.metadata.updatedAt = Date.now();

        // Execute the node
        const result = await node.execute(state);

        // Record trace
        if (result.trace) {
          // Build trace with required defaults for optional fields
          const trace: NodeTrace = {
            nodeId: result.trace.nodeId ?? node.id,
            nodeName: result.trace.nodeName ?? node.name,
            startTime: result.trace.startTime ?? Date.now(),
            endTime: result.trace.endTime,
            duration: result.trace.duration,
            outcome: result.trace.outcome ?? "success",
            inputState: result.trace.inputState ?? {},
            outputState: result.trace.outputState,
            stateDiff: result.trace.stateDiff,
            error: result.trace.error,
            metadata: result.trace.metadata,
          };
          this.traces.push(trace);
        }

        // Update metrics
        this.metrics.nodesExecuted++;
        this.metrics.nodeCounts[node.id] =
          (this.metrics.nodeCounts[node.id] || 0) + 1;

        if (result.success) {
          // Update state with node results
          if (result.state) {
            state = this.mergeState(state, result.state);
          }

          // Determine next route
          currentRoute = state.route || "llm-router";
        } else {
          // Node failed
          this.metrics.errorCount++;
          state.error = result.error;
          state.response = `Error: ${result.error}`;
          break;
        }
      }

      // Final metrics
      this.metrics.totalDuration = Date.now() - startTime;
      this.metrics.avgNodeDuration =
        this.metrics.nodesExecuted > 0
          ? this.metrics.totalDuration / this.metrics.nodesExecuted
          : 0;
      this.metrics.successRate =
        this.metrics.nodesExecuted > 0
          ? (this.metrics.nodesExecuted - this.metrics.errorCount) /
            this.metrics.nodesExecuted
          : 1;

      // Update final state metadata
      state.metadata.totalNodesExecuted = this.metrics.nodesExecuted;
      state.metadata.updatedAt = Date.now();

      return {
        state,
        traces: this.traces,
        metrics: this.metrics,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.metrics.errorCount++;
      this.metrics.totalDuration = Date.now() - startTime;

      return {
        state: {
          ...state,
          error: errorMessage,
          response: `Error: ${errorMessage}`,
        },
        traces: this.traces,
        metrics: this.metrics,
      };
    }
  }

  /**
   * Merge state updates into current state
   */
  private mergeState(
    current: AgentState,
    updates: Partial<AgentState>
  ): AgentState {
    const merged: AgentState = {
      ...current,
      ...updates,
      metadata: {
        ...current.metadata,
        ...updates.metadata,
      },
    };

    // Merge tool calls
    if (updates.toolCalls) {
      merged.toolCalls = [...current.toolCalls, ...updates.toolCalls];
    }

    // Update response (append if exists)
    if (updates.response) {
      if (current.response && updates.response !== current.response) {
        merged.response = updates.response; // Replace, not append
      } else {
        merged.response = updates.response;
      }
    }

    return merged;
  }

  /**
   * Get execution traces
   */
  getTraces(): NodeTrace[] {
    return [...this.traces];
  }

  /**
   * Get execution metrics
   */
  getMetrics(): GraphMetrics {
    return { ...this.metrics };
  }

  /**
   * Get registered nodes
   */
  getNodes(): Map<string, GraphNode> {
    return new Map(this.nodes);
  }

  /**
   * Create a visual representation of the graph
   */
  getVisualGraph(): import("./types").VisualGraphData {
    const nodes = Array.from(this.nodes.values()).map((node, index) => ({
      id: node.id,
      position: {
        x: (index % 4) * 250,
        y: Math.floor(index / 4) * 150,
      },
      type: node.type,
      data: {
        label: node.name,
        description: node.description,
        nodeType: node.type,
      },
    }));

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
      label?: string;
    }> = [];

    // Add router to tool nodes edges
    edges.push(
      { id: "router-search", source: "llm-router", target: "search-blog" },
      { id: "router-post", source: "llm-router", target: "get-blog-post" },
      { id: "router-cv", source: "llm-router", target: "get-cv" },
      { id: "router-github", source: "llm-router", target: "get-github" },
      { id: "router-analytics", source: "llm-router", target: "get-analytics" },
      { id: "router-about", source: "llm-router", target: "get-about" },
      { id: "router-llms", source: "llm-router", target: "fetch-llms-txt" }
    );

    // Add tool nodes to synthesis edges
    edges.push(
      { id: "search-synthesis", source: "search-blog", target: "synthesis" },
      { id: "post-synthesis", source: "get-blog-post", target: "synthesis" },
      { id: "cv-synthesis", source: "get-cv", target: "synthesis" },
      { id: "github-synthesis", source: "get-github", target: "synthesis" },
      { id: "analytics-synthesis", source: "get-analytics", target: "synthesis" },
      { id: "about-synthesis", source: "get-about", target: "synthesis" },
      { id: "llms-synthesis", source: "fetch-llms-txt", target: "synthesis" }
    );

    // Add synthesis to done edge
    edges.push({ id: "synthesis-done", source: "synthesis", target: "done" });

    return { nodes, edges };
  }
}

/**
 * Create initial state for a new conversation
 */
export function createInitialState(
  conversationId: string,
  userInput: string
): AgentState {
  return {
    conversationId,
    userInput,
    response: "",
    toolCalls: [],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stepIndex: 0,
      totalNodesExecuted: 0,
    },
  };
}

/**
 * Execute graph with simple input (convenience function)
 */
export async function executeGraph(
  conversationId: string,
  userInput: string
): Promise<AgentState> {
  const router = new GraphRouter();
  const initialState = createInitialState(conversationId, userInput);
  const result = await router.executeGraph(initialState);
  return result.state;
}
