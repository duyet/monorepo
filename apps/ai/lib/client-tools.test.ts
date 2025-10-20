import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  executeClientTool,
  registerClientTool,
  getRegisteredTools,
  type ClientToolContext,
  type ClientToolInvocation,
  type FactAction,
} from "./client-tools";

describe("client-tools", () => {
  let mockContext: ClientToolContext;

  beforeEach(() => {
    // Reset context before each test
    mockContext = {
      onThemeRequest: vi.fn(),
      onWidgetAction: vi.fn(),
      processedFacts: new Set<string>(),
      isDev: false,
    };
  });

  describe("getRegisteredTools", () => {
    it("should return array of registered tool names", () => {
      const tools = getRegisteredTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools).toContain("switch_theme");
      expect(tools).toContain("record_fact");
    });
  });

  describe("switch_theme tool", () => {
    it("should call onThemeRequest with light theme", async () => {
      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "light" },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.onThemeRequest).toHaveBeenCalledWith("light");
      expect(mockContext.onThemeRequest).toHaveBeenCalledTimes(1);
    });

    it("should call onThemeRequest with dark theme", async () => {
      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "dark" },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.onThemeRequest).toHaveBeenCalledWith("dark");
    });

    it("should return success false for invalid theme", async () => {
      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "invalid" },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(false);
      expect(mockContext.onThemeRequest).not.toHaveBeenCalled();
    });

    it("should return success false for missing theme param", async () => {
      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: {},
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(false);
      expect(mockContext.onThemeRequest).not.toHaveBeenCalled();
    });
  });

  describe("record_fact tool", () => {
    it("should call onWidgetAction for new fact", async () => {
      const invocation: ClientToolInvocation = {
        name: "record_fact",
        params: {
          fact_id: "fact-1",
          fact_text: "Test fact",
        },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.onWidgetAction).toHaveBeenCalledWith({
        type: "save",
        factId: "fact-1",
        factText: "Test fact",
      });
      expect(mockContext.processedFacts.has("fact-1")).toBe(true);
    });

    it("should normalize whitespace in fact text", async () => {
      const invocation: ClientToolInvocation = {
        name: "record_fact",
        params: {
          fact_id: "fact-2",
          fact_text: "  Multiple   spaces   here  ",
        },
      };

      await executeClientTool(invocation, mockContext);

      expect(mockContext.onWidgetAction).toHaveBeenCalledWith({
        type: "save",
        factId: "fact-2",
        factText: "Multiple spaces here",
      });
    });

    it("should skip already processed facts", async () => {
      mockContext.processedFacts.add("fact-3");

      const invocation: ClientToolInvocation = {
        name: "record_fact",
        params: {
          fact_id: "fact-3",
          fact_text: "Duplicate fact",
        },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(true);
      expect(mockContext.onWidgetAction).not.toHaveBeenCalled();
    });

    it("should return error for empty fact_id", async () => {
      const invocation: ClientToolInvocation = {
        name: "record_fact",
        params: {
          fact_id: "",
          fact_text: "Test fact",
        },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing fact_id parameter");
      expect(mockContext.onWidgetAction).not.toHaveBeenCalled();
    });

    it("should return error for missing params", async () => {
      const invocation: ClientToolInvocation = {
        name: "record_fact",
        params: {},
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing fact_id parameter");
      expect(mockContext.onWidgetAction).not.toHaveBeenCalled();
    });
  });

  describe("executeClientTool", () => {
    it("should return success false for unknown tool", async () => {
      const invocation: ClientToolInvocation = {
        name: "unknown_tool",
        params: {},
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(false);
    });

    it("should log in dev mode", async () => {
      const consoleDebugSpy = vi
        .spyOn(console, "debug")
        .mockImplementation(() => {});
      mockContext.isDev = true;

      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "dark" },
      };

      await executeClientTool(invocation, mockContext);

      expect(consoleDebugSpy).toHaveBeenCalled();
      consoleDebugSpy.mockRestore();
    });

    it("should not log in production mode", async () => {
      const consoleDebugSpy = vi
        .spyOn(console, "debug")
        .mockImplementation(() => {});
      mockContext.isDev = false;

      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "dark" },
      };

      await executeClientTool(invocation, mockContext);

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      consoleDebugSpy.mockRestore();
    });
  });

  describe("registerClientTool", () => {
    it("should allow registering custom tools", async () => {
      const customHandler = vi.fn().mockResolvedValue({ success: true });

      registerClientTool("custom_tool", customHandler);

      const invocation: ClientToolInvocation = {
        name: "custom_tool",
        params: { test: "value" },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result.success).toBe(true);
      // Handler is called with params and context, not full invocation
      expect(customHandler).toHaveBeenCalledWith(
        invocation.params,
        mockContext,
      );
    });

    it("should allow overriding existing tools", async () => {
      const customHandler = vi
        .fn()
        .mockResolvedValue({ success: true, custom: true });

      registerClientTool("switch_theme", customHandler);

      const invocation: ClientToolInvocation = {
        name: "switch_theme",
        params: { theme: "dark" },
      };

      const result = await executeClientTool(invocation, mockContext);

      expect(result).toEqual({ success: true, custom: true });
      expect(customHandler).toHaveBeenCalled();
      expect(mockContext.onThemeRequest).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle handler errors gracefully", async () => {
      const errorHandler = vi
        .fn()
        .mockRejectedValue(new Error("Handler error"));
      registerClientTool("error_tool", errorHandler);

      const invocation: ClientToolInvocation = {
        name: "error_tool",
        params: {},
      };

      // Errors are caught and returned as { success: false }
      const result = await executeClientTool(invocation, mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Handler error");
    });
  });

  describe("type safety", () => {
    it("should properly type FactAction", () => {
      const action: FactAction = {
        type: "save",
        factId: "test-id",
        factText: "test text",
      };

      expect(action.type).toBe("save");
      expect(action.factId).toBe("test-id");
      expect(action.factText).toBe("test text");
    });
  });
});
