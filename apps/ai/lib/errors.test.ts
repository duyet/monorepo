import { describe, it, expect } from "vitest";
import {
  createInitialErrors,
  extractErrorDetail,
  isErrorInstance,
  getErrorMessage,
} from "./errors";

describe("errors utilities", () => {
  describe("createInitialErrors", () => {
    it("should return initial error state with all nulls", () => {
      const errors = createInitialErrors();
      expect(errors).toEqual({
        script: null,
        session: null,
        integration: null,
        retryable: false,
      });
    });

    it("should return a new object each time", () => {
      const errors1 = createInitialErrors();
      const errors2 = createInitialErrors();
      expect(errors1).not.toBe(errors2);
    });
  });

  describe("extractErrorDetail", () => {
    it("should return fallback for undefined payload", () => {
      expect(extractErrorDetail(undefined, "fallback")).toBe("fallback");
    });

    it("should extract error string from payload", () => {
      expect(extractErrorDetail({ error: "error message" }, "fallback")).toBe(
        "error message",
      );
    });

    it("should extract error.message from payload", () => {
      expect(
        extractErrorDetail({ error: { message: "error message" } }, "fallback"),
      ).toBe("error message");
    });

    it("should extract details string from payload", () => {
      expect(
        extractErrorDetail({ details: "details message" }, "fallback"),
      ).toBe("details message");
    });

    it("should extract nested details.error string", () => {
      expect(
        extractErrorDetail({ details: { error: "nested error" } }, "fallback"),
      ).toBe("nested error");
    });

    it("should extract nested details.error.message", () => {
      expect(
        extractErrorDetail(
          { details: { error: { message: "nested message" } } },
          "fallback",
        ),
      ).toBe("nested message");
    });

    it("should extract message string from payload", () => {
      expect(extractErrorDetail({ message: "message text" }, "fallback")).toBe(
        "message text",
      );
    });

    it("should prioritize error over message", () => {
      expect(
        extractErrorDetail(
          { error: "error text", message: "message text" },
          "fallback",
        ),
      ).toBe("error text");
    });

    it("should prioritize error over details", () => {
      expect(
        extractErrorDetail(
          { error: "error text", details: "details text" },
          "fallback",
        ),
      ).toBe("error text");
    });

    it("should prioritize details over message", () => {
      expect(
        extractErrorDetail(
          { details: "details text", message: "message text" },
          "fallback",
        ),
      ).toBe("details text");
    });

    it("should return fallback for empty object", () => {
      expect(extractErrorDetail({}, "fallback")).toBe("fallback");
    });

    it("should return fallback for object with non-error properties", () => {
      expect(extractErrorDetail({ foo: "bar", baz: 123 }, "fallback")).toBe(
        "fallback",
      );
    });

    it("should handle complex nested structures", () => {
      const payload = {
        status: 500,
        details: {
          error: {
            message: "Internal server error",
            code: "SERVER_ERROR",
          },
        },
      };
      expect(extractErrorDetail(payload, "fallback")).toBe(
        "Internal server error",
      );
    });
  });

  describe("isErrorInstance", () => {
    it("should return true for Error instances", () => {
      expect(isErrorInstance(new Error("test"))).toBe(true);
    });

    it("should return false for non-Error objects", () => {
      expect(isErrorInstance({ message: "test" })).toBe(false);
      expect(isErrorInstance("string")).toBe(false);
      expect(isErrorInstance(null)).toBe(false);
      expect(isErrorInstance(undefined)).toBe(false);
      expect(isErrorInstance(123)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      expect(getErrorMessage(new Error("test error"), "fallback")).toBe(
        "test error",
      );
    });

    it("should return fallback for non-Error values", () => {
      expect(getErrorMessage("string error", "fallback")).toBe("fallback");
      expect(getErrorMessage({ message: "object" }, "fallback")).toBe(
        "fallback",
      );
      expect(getErrorMessage(null, "fallback")).toBe("fallback");
      expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
    });
  });
});
