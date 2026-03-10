/**
 * Observability Middleware (Unit 15)
 *
 * Provides node execution metrics, state diff logging, and execution trace collection.
 * Wraps GraphRouter to add observability without modifying core logic.
 */

import type {
  AgentState,
  NodeObserver,
  NodeTrace,
  StateDiff,
  StateObserver,
  GraphMetrics,
} from "./types";
import { StateManager } from "./state";

/**
 * Observability configuration options
 */
export interface ObservabilityOptions {
  /** Enable debug logging */
  debug?: boolean;

  /** Maximum number of traces to keep in memory */
  maxTraces?: number;

  /** Callback for node execution events */
  onNodeExecuted?: NodeObserver;

  /** Callback for state changes */
  onStateChanged?: StateObserver;

  /** Custom logger function */
  logger?: (level: "debug" | "info" | "warn" | "error", message: string, ...args: unknown[]) => void;
}

/**
 * Observability middleware result
 */
export interface ObservabilityResult {
  /** All collected traces */
  traces: NodeTrace[];

  /** Computed metrics */
  metrics: GraphMetrics;

  /** State diffs per node */
  stateDiffs: Map<string, StateDiff>;

  /** Clear collected traces and reset metrics */
  clear: () => void;

  /** Get trace by node ID */
  getTrace: (nodeId: string) => NodeTrace | undefined;

  /** Get all traces for a specific node */
  getTracesByNode: (nodeId: string) => NodeTrace[];

  /** Export traces as JSON */
  exportTraces: () => string;
}

/**
 * Default logger implementation
 */
function defaultLogger(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  ...args: unknown[]
): void {
  const timestamp = new Date().toISOString();
  const prefix = `[Observability][${timestamp}]`;
  switch (level) {
    case "debug":
      console.debug(prefix, message, ...args);
      break;
    case "info":
      console.info(prefix, message, ...args);
      break;
    case "warn":
      console.warn(prefix, message, ...args);
      break;
    case "error":
      console.error(prefix, message, ...args);
      break;
  }
}

/**
 * Observability Middleware
 *
 * Wraps graph execution to collect metrics, traces, and state diffs.
 */
export class ObservabilityMiddleware {
  private traces: NodeTrace[] = [];
  private stateDiffs: Map<string, StateDiff> = new Map();
  private nodeExecutionCounts: Map<string, number> = new Map();
  private nodeDurations: Map<string, number[]> = new Map();
  private options: Required<ObservabilityOptions>;
  private startTime: number = 0;

  constructor(options: ObservabilityOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      maxTraces: options.maxTraces ?? 1000,
      onNodeExecuted: options.onNodeExecuted ?? (() => {}),
      onStateChanged: options.onStateChanged ?? (() => {}),
      logger: options.logger ?? defaultLogger,
    };
  }

  /**
   * Wrap a node execution with observability
   *
   * Records execution time, captures state diffs, and notifies observers.
   */
  async observeNodeExecution(
    nodeId: string,
    nodeName: string,
    inputState: AgentState,
    executeFn: (state: AgentState) => Promise<Partial<AgentState>>
  ): Promise<{ state: Partial<AgentState>; trace: NodeTrace }> {
    const startTime = Date.now();
    const executionStep = this.traces.length;

    this.options.logger(
      "debug",
      `Node started: ${nodeName} (${nodeId})`,
      "step:",
      executionStep
    );

    // Create initial trace
    const trace: NodeTrace = {
      nodeId,
      nodeName,
      startTime,
      inputState: StateManager.createCheckpoint(inputState),
      outcome: "running",
    };

    // Notify observer
    this.options.onNodeExecuted(trace);

    try {
      // Execute the node
      const resultState = await executeFn(inputState);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Compute state diff
      const stateDiff = StateManager.computeDiff(inputState, {
        ...inputState,
        ...resultState,
      } as AgentState);

      // Update trace with results
      trace.endTime = endTime;
      trace.duration = duration;
      trace.outputState = StateManager.createCheckpoint({
        ...inputState,
        ...resultState,
      } as AgentState);
      trace.stateDiff = stateDiff;
      trace.outcome = "success";

      // Record metrics
      this.recordMetrics(nodeId, duration, true);

      // Store state diff
      this.stateDiffs.set(`${nodeId}-${executionStep}`, stateDiff);

      // Log state diff if debug mode
      if (this.options.debug && stateDiff) {
        const diffFormatted = StateManager.formatDiff(stateDiff);
        this.options.logger("debug", `State diff for ${nodeName}:`, diffFormatted);
      }

      this.options.logger(
        "info",
        `Node completed: ${nodeName} (${nodeId})`,
        "duration:",
        `${duration}ms`
      );

      // Notify state observer
      if (resultState && Object.keys(resultState).length > 0) {
        this.options.onStateChanged(
          { ...inputState, ...resultState } as AgentState,
          inputState
        );
      }

      // Notify observer
      this.options.onNodeExecuted(trace);

      return { state: resultState, trace };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update trace with error
      trace.endTime = endTime;
      trace.duration = duration;
      trace.outcome = "error";
      trace.error = errorMessage;

      // Record error metrics
      this.recordMetrics(nodeId, duration, false);

      this.options.logger(
        "error",
        `Node failed: ${nodeName} (${nodeId})`,
        "error:",
        errorMessage,
        "duration:",
        `${duration}ms`
      );

      // Notify observer
      this.options.onNodeExecuted(trace);

      throw error;
    } finally {
      // Store trace
      this.addTrace(trace);
    }
  }

  /**
   * Start timing for a graph execution
   */
  startExecution(): void {
    this.startTime = Date.now();
    this.options.logger("info", "Graph execution started");
  }

  /**
   * End graph execution and compute final metrics
   */
  endExecution(): GraphMetrics {
    const totalDuration = Date.now() - this.startTime;

    const metrics = this.computeMetrics(totalDuration);

    this.options.logger(
      "info",
      "Graph execution completed",
      "duration:",
      `${totalDuration}ms`,
      "nodes:",
      metrics.nodesExecuted,
      "errors:",
      metrics.errorCount
    );

    return metrics;
  }

  /**
   * Record execution metrics for a node
   */
  private recordMetrics(nodeId: string, duration: number, success: boolean): void {
    // Update execution count
    this.nodeExecutionCounts.set(
      nodeId,
      (this.nodeExecutionCounts.get(nodeId) || 0) + 1
    );

    // Track durations
    if (!this.nodeDurations.has(nodeId)) {
      this.nodeDurations.set(nodeId, []);
    }
    this.nodeDurations.get(nodeId)!.push(duration);
  }

  /**
   * Compute aggregated metrics from collected data
   */
  private computeMetrics(totalDuration: number): GraphMetrics {
    const nodesExecuted = Array.from(this.nodeExecutionCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const nodeCounts: Record<string, number> = {};
    for (const [nodeId, count] of this.nodeExecutionCounts.entries()) {
      nodeCounts[nodeId] = count;
    }

    // Calculate average node duration
    const allDurations = Array.from(this.nodeDurations.values()).flat();
    const avgNodeDuration =
      allDurations.length > 0
        ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
        : 0;

    // Count errors from traces
    const errorCount = this.traces.filter(
      (t) => t.outcome === "error"
    ).length;

    // Calculate success rate
    const successRate =
      nodesExecuted > 0 ? (nodesExecuted - errorCount) / nodesExecuted : 1;

    return {
      totalDuration,
      nodesExecuted,
      successRate,
      avgNodeDuration,
      nodeCounts,
      errorCount,
    };
  }

  /**
   * Add a trace to collection (respects maxTraces limit)
   *
   * Clear all state diffs when limit is reached to avoid key/index mismatches.
   * Traces themselves are preserved up to maxTraces.
   */
  private addTrace(trace: NodeTrace): void {
    this.traces.push(trace);

    // Enforce max traces limit - remove oldest trace
    if (this.traces.length > this.options.maxTraces) {
      this.traces.shift();
      // Clear state diffs to avoid stale index references
      // In production, consider a more sophisticated tracking mechanism
      this.stateDiffs.clear();
    }
  }

  /**
   * Get current observability result
   */
  getResult(): ObservabilityResult {
    const metrics = this.computeMetrics(Date.now() - this.startTime);

    return {
      traces: [...this.traces],
      metrics,
      stateDiffs: new Map(this.stateDiffs),
      clear: () => this.clear(),
      getTrace: (nodeId: string) => this.getTrace(nodeId),
      getTracesByNode: (nodeId: string) => this.getTracesByNode(nodeId),
      exportTraces: () => this.exportTraces(),
    };
  }

  /**
   * Get trace by node ID (most recent)
   */
  private getTrace(nodeId: string): NodeTrace | undefined {
    for (let i = this.traces.length - 1; i >= 0; i--) {
      if (this.traces[i].nodeId === nodeId) {
        return this.traces[i];
      }
    }
    return undefined;
  }

  /**
   * Get all traces for a specific node
   */
  private getTracesByNode(nodeId: string): NodeTrace[] {
    return this.traces.filter((t) => t.nodeId === nodeId);
  }

  /**
   * Export traces as JSON string
   */
  private exportTraces(): string {
    return JSON.stringify({
      traces: this.traces,
      metrics: this.computeMetrics(Date.now() - this.startTime),
      stateDiffs: Object.fromEntries(this.stateDiffs),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Clear all collected data
   */
  private clear(): void {
    this.traces = [];
    this.stateDiffs.clear();
    this.nodeExecutionCounts.clear();
    this.nodeDurations.clear();
    this.startTime = 0;
    this.options.logger("info", "Observability data cleared");
  }
}

/**
 * Create an observability middleware instance with default options
 */
export function createObservability(options?: ObservabilityOptions): ObservabilityMiddleware {
  return new ObservabilityMiddleware(options);
}

/**
 * Wrap a GraphRouter with observability
 *
 * Returns a wrapper function that adds observability to all node executions.
 */
export function withObservability<T extends (
  state: AgentState,
  nodeId: string,
  nodeName: string,
  executeFn: (state: AgentState) => Promise<Partial<AgentState>>
) => Promise<{ state: Partial<AgentState>; trace: NodeTrace }>>(
  executeFn: T,
  observability: ObservabilityMiddleware
): T {
  return (async (
    state: AgentState,
    nodeId: string,
    nodeName: string,
    fn: (state: AgentState) => Promise<Partial<AgentState>>
  ) => {
    return observability.observeNodeExecution(nodeId, nodeName, state, fn);
  }) as T;
}
