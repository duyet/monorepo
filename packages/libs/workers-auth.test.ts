import { describe, expect, it } from "vitest";
import { getBearerToken, timingSafeEqualStrings } from "./workers-auth";

describe("getBearerToken", () => {
  it("parses Bearer tokens", () => {
    const request = new Request("https://api.example.com", {
      headers: { Authorization: "Bearer secret-token" },
    });

    expect(getBearerToken(request)).toBe("secret-token");
  });

  it("rejects missing or malformed authorization headers", () => {
    expect(getBearerToken(new Request("https://api.example.com"))).toBeNull();
    expect(
      getBearerToken(
        new Request("https://api.example.com", {
          headers: { Authorization: "Basic abc123" },
        })
      )
    ).toBeNull();
    expect(
      getBearerToken(
        new Request("https://api.example.com", {
          headers: { Authorization: "Bearer" },
        })
      )
    ).toBeNull();
  });
});

describe("timingSafeEqualStrings", () => {
  it("returns true for equal strings", () => {
    expect(timingSafeEqualStrings("secret", "secret")).toBe(true);
  });

  it("returns false for different strings", () => {
    expect(timingSafeEqualStrings("secret", "different")).toBe(false);
  });

  it("returns false when either side is missing or empty", () => {
    expect(timingSafeEqualStrings("secret", undefined)).toBe(false);
    expect(timingSafeEqualStrings(undefined, "secret")).toBe(false);
    expect(timingSafeEqualStrings("", "")).toBe(false);
    expect(timingSafeEqualStrings("", "nonempty")).toBe(false);
  });

  it("returns false for differing-length strings without throwing", () => {
    expect(timingSafeEqualStrings("short", "much-longer-value")).toBe(false);
  });
});
