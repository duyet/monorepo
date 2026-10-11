import { describe, expect, test } from "vitest";
import { isRateLimitError, RateLimitError } from "@/lib/errors";

describe("isRateLimitError", () => {
  test("recognizes a RateLimitError and rejects an ordinary Error", () => {
    const rateLimit = new RateLimitError("unsplash", 120);
    const ordinary = new Error("network down");

    expect(isRateLimitError(rateLimit)).toBe(true);
    expect(isRateLimitError(ordinary)).toBe(false);
  });

  test("recognizes Unsplash client messages and a 429 response", () => {
    const jsonShape = new Error("expected JSON response from Unsplash");
    const quota = new Error("Rate Limit Exceeded");
    const statusText = new Error("Request failed with status 429");
    const response = Object.assign(new Error("upstream"), {
      response: { status: 429 },
    });

    expect(isRateLimitError(jsonShape)).toBe(true);
    expect(isRateLimitError(quota)).toBe(true);
    expect(isRateLimitError(statusText)).toBe(true);
    expect(isRateLimitError(response)).toBe(true);
    expect(isRateLimitError(null)).toBe(false);
  });
});
