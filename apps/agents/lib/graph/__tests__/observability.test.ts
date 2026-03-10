/**
 * Unit Tests for ObservabilityMiddleware (Unit 15)
 *
 * Tests for metrics collection, trace management, and observer callbacks.
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { ObservabilityMiddleware, createObservability } from "../observability";
import type { AgentState, NodeTrace } from "../types";

describe("ObservabilityMiddleware", () => {
  let middleware: ObservabilityMiddleware;
  let mockLogger: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    const logs: string[] = [];
    mockLogger = (level: string, message: string, ...args: unknown[]) => {
      logs.push(`[${level}] ${message}`);
    };

    middleware = new ObservabilityMiddleware({
      debug: false,
      maxTraces: 10,
      logger: mockLogger,
    });
  });

  describe("constructor", () => {
    it("should apply default options", () => {
      const defaultMiddleware = createObservability();

      expect(defaultMiddleware).toBeInstanceOf(ObservabilityMiddleware);
    });

    it("should apply custom options", () => {
      const customMiddleware = new ObservabilityMiddleware({
        debug: true,
        maxTraces: 100,
      });

      expect(customMiddleware).toBeInstanceOf(ObservabilityMiddleware);
    });
  });

  describe("observeNodeExecution", () => {
    it("should track successful node execution", async () => {
      const state: AgentState = {
        conversationId: "test-123",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const executeFn = async () => ({
        response: "Executed successfully",
      });

      const result = await middleware.observeNodeExecution(
        "test-node",
        "Test Node",
        state,
        executeFn
      );

      expect(result.trace.outcome).toBe("success");
      expect(result.trace.duration).toBeGreaterThanOrEqual(0);
      expect(result.trace.nodeName).toBe("Test Node");
      expect(result.state).toEqual({ response: "Executed successfully" });
    });

    it("should track failed node execution", async () => {
      const state: AgentState = {
        conversationId: "test-123",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const executeFn = async () => {
        throw new Error("Execution failed");
      };

      try {
        await middleware.observeNodeExecution(
          "test-node",
          "Test Node",
          state,
          executeFn
        );
        expect.unreachable("Should have thrown");
      } catch {
        // Expected
      }

      const result = middleware.getResult();
      expect(result.traces).toHaveLength(1);
      expect(result.traces[0].outcome).toBe("error");
      expect(result.traces[0].error).toBe("Execution failed");
    });

    it("should compute state diff", async () => {
      const state: AgentState = {
        conversationId: "test-123",
        userInput: "test input",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      const executeFn = async () => ({
        response: "New response",
      });

      await middleware.observeNodeExecution("node-1", "Node 1", state, executeFn);

      const result = middleware.getResult();
      const trace = result.traces[0];

      expect(trace.stateDiff).toBeDefined();
      expect(trace.stateDiff?.added?.response).toBe("New response");
    });
  });

  describe("metrics", () => {
    it("should track node execution counts", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      middleware.startExecution();

      // Execute same node multiple times
      for (let i = 0; i < 3; i++) {
        await middleware.observeNodeExecution(
          "node-1",
          "Node 1",
          state,
          async () => ({ response: `Execution ${i}` })
        );
      }

      const metrics = middleware.endExecution();

      expect(metrics.nodesExecuted).toBe(3);
      expect(metrics.nodeCounts["node-1"]).toBe(3);
    });

    it("should calculate success rate", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      middleware.startExecution();

      // Successful execution
      await middleware.observeNodeExecution(
        "node-success",
        "Success Node",
        state,
        async () => ({ response: "ok" })
      );

      // Failed execution
      try {
        await middleware.observeNodeExecution(
          "node-fail",
          "Fail Node",
          state,
          async () => {
            throw new Error("Failed");
          }
        );
      } catch {
        // Expected
      }

      const metrics = middleware.endExecution();

      expect(metrics.nodesExecuted).toBe(2);
      expect(metrics.errorCount).toBe(1);
      expect(metrics.successRate).toBe(0.5); // 1 success, 1 failure
    });

    it("should calculate average duration", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      middleware.startExecution();

      // Simulate different durations
      for (let i = 0; i < 3; i++) {
        await middleware.observeNodeExecution(
          `node-${i}`,
          `Node ${i}`,
          state,
          async () => ({ response: "ok" })
        );
      }

      const metrics = middleware.endExecution();

      // Duration should be non-negative (may be 0 for very fast execution)
      expect(metrics.avgNodeDuration).toBeGreaterThanOrEqual(0);
      expect(metrics.totalDuration).toBeGreaterThanOrEqual(0);
      // Should have executed some nodes
      expect(metrics.nodesExecuted).toBeGreaterThan(0);
    });
  });

  describe("getResult", () => {
    it("should return current observability result", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      await middleware.observeNodeExecution(
        "node-1",
        "Node 1",
        state,
        async () => ({ response: "ok" })
      );

      const result = middleware.getResult();

      expect(result.traces).toHaveLength(1);
      expect(result.metrics).toBeDefined();
      expect(result.clear).toBeInstanceOf(Function);
      expect(result.getTrace).toBeInstanceOf(Function);
      expect(result.getTracesByNode).toBeInstanceOf(Function);
      expect(result.exportTraces).toBeInstanceOf(Function);
    });

    it("should get trace by node ID", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      await middleware.observeNodeExecution(
        "search-blog",
        "Search Blog",
        state,
        async () => ({ response: "results" })
      );

      const result = middleware.getResult();
      const trace = result.getTrace("search-blog");

      expect(trace).toBeDefined();
      expect(trace?.nodeId).toBe("search-blog");
    });

    it("should get all traces for a node", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      // Execute same node twice
      await middleware.observeNodeExecution(
        "node-1",
        "Node 1",
        state,
        async () => ({ response: "first" })
      );

      await middleware.observeNodeExecution(
        "node-1",
        "Node 1",
        state,
        async () => ({ response: "second" })
      );

      const result = middleware.getResult();
      const traces = result.getTracesByNode("node-1");

      expect(traces).toHaveLength(2);
    });

    it("should export traces as JSON", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      await middleware.observeNodeExecution(
        "node-1",
        "Node 1",
        state,
        async () => ({ response: "ok" })
      );

      const result = middleware.getResult();
      const exported = result.exportTraces();

      const parsed = JSON.parse(exported);
      expect(parsed.traces).toBeDefined();
      expect(parsed.metrics).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe("clear", () => {
    it("should clear all collected data", async () => {
      const state: AgentState = {
        conversationId: "test",
        userInput: "test",
        response: "",
        toolCalls: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stepIndex: 0,
          totalNodesExecuted: 0,
        },
      };

      middleware.startExecution();

      await middleware.observeNodeExecution(
        "node-1",
        "Node 1",
        state,
        async () => ({ response: "ok" })
      );

      let result = middleware.getResult();
      expect(result.traces.length).toBeGreaterThan(0);

      result.clear();

      result = middleware.getResult();
      expect(result.traces).toHaveLength(0);
      expect(result.metrics.nodesExecuted).toBe(0);
    });
  });
});

describe("createObservability", () => {
  it("should create ObservabilityMiddleware instance", () => {
    const middleware = createObservability();

    expect(middleware).toBeInstanceOf(ObservabilityMiddleware);
  });

  it("should pass options to middleware", () => {
    const middleware = createObservability({
      debug: true,
      maxTraces: 50,
    });

    expect(middleware).toBeInstanceOf(ObservabilityMiddleware);
  });
});
