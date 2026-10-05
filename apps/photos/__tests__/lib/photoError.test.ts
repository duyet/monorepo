import { describe, expect, test } from "vitest";
import { photoError, RateLimitError } from "@/lib/errors";

describe("photoError", () => {
  test("wraps a PhotoFetchError in a failed fetch result", () => {
    const error = new RateLimitError("unsplash", 120);
    const result = photoError<string[]>(error);

    expect(result).toEqual({ success: false, error });
    if (!result.success) {
      expect(result.error.type).toBe("rate_limit");
      expect(result.error.userMessage).toContain("2 minutes");
    }
  });
});
