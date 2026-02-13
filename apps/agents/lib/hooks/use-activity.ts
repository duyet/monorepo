"use client";

import { useState, useCallback } from "react";
import { type ToolExecution, type StreamEvent } from "@/lib/types";

export interface UseActivityReturn {
  executions: ToolExecution[];
  thinkingSteps: string[];
  addExecution: (execution: ToolExecution) => void;
  updateExecution: (id: string, updates: Partial<ToolExecution>) => void;
  addThinkingStep: (step: string) => void;
  clearExecutions: () => void;
  clearThinkingSteps: () => void;
}

export function useActivity(): UseActivityReturn {
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  const addExecution = useCallback((execution: ToolExecution) => {
    setExecutions((prev) => [...prev, execution]);
  }, []);

  const updateExecution = useCallback(
    (id: string, updates: Partial<ToolExecution>) => {
      setExecutions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const addThinkingStep = useCallback((step: string) => {
    setThinkingSteps((prev) => [...prev, step]);
  }, []);

  const clearExecutions = useCallback(() => {
    setExecutions([]);
  }, []);

  const clearThinkingSteps = useCallback(() => {
    setThinkingSteps([]);
  }, []);

  return {
    executions,
    thinkingSteps,
    addExecution,
    updateExecution,
    addThinkingStep,
    clearExecutions,
    clearThinkingSteps,
  };
}

/**
 * Parse SSE stream and extract tool events
 */
export function parseStreamEvent(line: string): StreamEvent | null {
  if (!line.startsWith("data: ")) {
    return null;
  }

  const data = line.slice(6).trim();
  if (data === "[DONE]" || data === "") {
    return null;
  }

  try {
    const parsed = JSON.parse(data);

    // Check for tool events
    if (parsed.type === "tool_start") {
      return {
        type: "tool_start",
        tool: parsed.tool,
        params: parsed.params,
      } as StreamEvent;
    }

    if (parsed.type === "tool_complete") {
      return {
        type: "tool_complete",
        tool: parsed.tool,
        result: parsed.result,
      } as StreamEvent;
    }

    if (parsed.type === "tool_error") {
      return {
        type: "tool_error",
        tool: parsed.tool,
        error: parsed.error,
      } as StreamEvent;
    }

    // Default response event
    if (parsed.response) {
      return {
        type: "response",
        response: parsed.response,
      } as StreamEvent;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Create a new tool execution
 */
export function createToolExecution(
  toolName: string,
  parameters: Record<string, unknown>
): ToolExecution {
  return {
    id: `${toolName}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    toolName,
    parameters,
    startTime: Date.now(),
    status: "pending",
  };
}
