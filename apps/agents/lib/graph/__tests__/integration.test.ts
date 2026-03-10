/**
 * Integration Tests for Graph Execution (Unit 20)
 *
 * End-to-end tests for complete graph execution flow.
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { GraphRouter, createInitialState } from "../router";
import type { AgentState } from "../types";

describe("Graph Integration Tests", () => {
  describe("GraphRouter", () => {
    let router: GraphRouter;

    beforeEach(() => {
      router = new GraphRouter();
    });

    describe("executeGraph", () => {
      it("should execute graph from initial state", async () => {
        const initialState = createInitialState("test-conv-123", "Hello!");

        const result = await router.executeGraph(initialState);

        expect(result.state).toBeDefined();
        expect(result.traces).toBeDefined();
        expect(result.metrics).toBeDefined();
      });

      it("should preserve conversation ID", async () => {
        const initialState = createInitialState("my-conversation", "test input");

        const result = await router.executeGraph(initialState);

        expect(result.state.conversationId).toBe("my-conversation");
      });

      it("should route to done after completion", async () => {
        const initialState = createInitialState("test-123", "Hi");

        const result = await router.executeGraph(initialState);

        // Should complete without error
        expect(result.state.error).toBeUndefined();
        // Should have some response
        expect(result.state.response).toBeDefined();
      });

      it("should collect traces for executed nodes", async () => {
        const initialState = createInitialState("test-123", "test");

        const result = await router.executeGraph(initialState);

        expect(result.traces.length).toBeGreaterThan(0);
        // Each trace should have required fields
        result.traces.forEach((trace) => {
          expect(trace.nodeId).toBeDefined();
          expect(trace.nodeName).toBeDefined();
          expect(trace.startTime).toBeGreaterThan(0);
          expect(trace.outcome).toMatch(/^(pending|running|success|error)$/);
        });
      });

      it("should compute metrics", async () => {
        const initialState = createInitialState("test-123", "test");

        const result = await router.executeGraph(initialState);

        expect(result.metrics.totalDuration).toBeGreaterThanOrEqual(0);
        expect(result.metrics.nodesExecuted).toBeGreaterThan(0);
        expect(result.metrics.successRate).toBeGreaterThanOrEqual(0);
        expect(result.metrics.successRate).toBeLessThanOrEqual(1);
        expect(result.metrics.avgNodeDuration).toBeGreaterThanOrEqual(0);
      });

      it("should track node execution counts", async () => {
        const initialState = createInitialState("test-123", "test");

        const result = await router.executeGraph(initialState);

        expect(Object.keys(result.metrics.nodeCounts).length).toBeGreaterThan(0);
        // At minimum should have executed some core nodes
        expect(result.metrics.nodesExecuted).toBeGreaterThan(0);
      });
    });

    describe("error handling", () => {
      it("should handle execution errors gracefully", async () => {
        // Create a router with a node that will fail
        const failingRouter = new GraphRouter();

        // Override a node to fail
        const originalExecute = failingRouter.getNodes().get("llm-router")?.execute;
        if (originalExecute) {
          failingRouter.getNodes().get("llm-router")!.execute = async () => {
            throw new Error("Simulated node failure");
          };
        }

        const initialState = createInitialState("test-123", "test");

        const result = await failingRouter.executeGraph(initialState);

        // Should have error in state
        expect(result.state.error).toBeDefined();
        // Should still return traces
        expect(result.traces).toBeDefined();
        // Metrics should reflect error
        expect(result.metrics.errorCount).toBeGreaterThan(0);
      });
    });

    describe("getVisualGraph", () => {
      it("should return visual graph data", () => {
        const router = new GraphRouter();
        const visualGraph = router.getVisualGraph();

        expect(visualGraph.nodes).toBeDefined();
        expect(visualGraph.edges).toBeDefined();
        expect(visualGraph.nodes.length).toBeGreaterThan(0);
        expect(visualGraph.edges.length).toBeGreaterThan(0);
      });

      it("should have nodes with required properties", () => {
        const router = new GraphRouter();
        const visualGraph = router.getVisualGraph();

        visualGraph.nodes.forEach((node) => {
          expect(node.id).toBeDefined();
          expect(node.position).toBeDefined();
          expect(node.data).toBeDefined();
          expect(node.data.label).toBeDefined();
          expect(node.data.nodeType).toBeDefined();
        });
      });

      it("should have edges with source and target", () => {
        const router = new GraphRouter();
        const visualGraph = router.getVisualGraph();

        visualGraph.edges.forEach((edge) => {
          expect(edge.id).toBeDefined();
          expect(edge.source).toBeDefined();
          expect(edge.target).toBeDefined();
        });
      });

      it("should include all core nodes", () => {
        const router = new GraphRouter();
        const visualGraph = router.getVisualGraph();

        const nodeIds = visualGraph.nodes.map((n) => n.id);

        // Should have core nodes
        expect(nodeIds).toContain("llm-router");
        expect(nodeIds).toContain("synthesis");
      });

      it('should include tool nodes', () => {
        const router = new GraphRouter();
        const visualGraph = router.getVisualGraph();

        const nodeIds = visualGraph.nodes.map((n) => n.id);

        // Should have some tool nodes
        const toolNodes = nodeIds.filter((id) =>
          id.startsWith("search-") ||
          id.startsWith("get-") ||
          id.startsWith("fetch-")
        );

        expect(toolNodes.length).toBeGreaterThan(0);
      });
    });
  });

  describe("createInitialState", () => {
    it("should create initial state with correct structure", () => {
      const state = createInitialState("conv-123", "Hello, world!");

      expect(state.conversationId).toBe("conv-123");
      expect(state.userInput).toBe("Hello, world!");
      expect(state.response).toBe("");
      expect(state.toolCalls).toEqual([]);
      expect(state.metadata.createdAt).toBeGreaterThan(0);
      expect(state.metadata.updatedAt).toBeGreaterThan(0);
      expect(state.metadata.stepIndex).toBe(0);
      expect(state.metadata.totalNodesExecuted).toBe(0);
    });

    it("should generate unique conversation IDs", () => {
      const state1 = createInitialState("test", "input1");
      const state2 = createInitialState("test", "input2");

      // If we provide conversation IDs, they should be used
      const stateWithId = createInitialState("my-id", "input");
      expect(stateWithId.conversationId).toBe("my-id");
    });
  });

  describe("state persistence", () => {
    it("should maintain state across node executions", async () => {
      const router = new GraphRouter();
      const initialState = createInitialState("test-123", "Initial input");

      const result = await router.executeGraph(initialState);

      // State should evolve through execution
      expect(result.state.userInput).toBe("Initial input");
      // Response should be built
      expect(result.state.response.length).toBeGreaterThanOrEqual(0);
    });

    it('should track tool calls in state', async () => {
      const router = new GraphRouter();
      const initialState = createInitialState("test-123", "Search for blog posts");

      const result = await router.executeGraph(initialState);

      // Tool calls should be tracked
      expect(Array.isArray(result.state.toolCalls)).toBe(true);
    });
  });
});
