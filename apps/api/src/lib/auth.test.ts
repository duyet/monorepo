import { describe, expect, it } from "vitest";
import {
  getBearerToken,
  isAuthorizedApiRequest,
  timingSafeEqual,
} from "./auth.js";

describe("API auth helpers", () => {
  it("extracts bearer tokens", () => {
    const request = new Request("https://api.duyet.net/api/llm/generate", {
      headers: { Authorization: "Bearer token-123" },
    });
    expect(getBearerToken(request)).toBe("token-123");
  });

  it("compares tokens without early length match", () => {
    expect(timingSafeEqual("secret", "secret")).toBe(true);
    expect(timingSafeEqual("secret", "different")).toBe(false);
    expect(timingSafeEqual("secret", undefined)).toBe(false);
    expect(timingSafeEqual("", "")).toBe(false);
  });

  it("accepts API_TOKEN or AGENT_API_TOKEN", () => {
    const request = new Request("https://api.duyet.net/api/llm/generate", {
      headers: { Authorization: "Bearer agent-secret" },
    });
    expect(
      isAuthorizedApiRequest(request, { AGENT_API_TOKEN: "agent-secret" })
    ).toBe(true);
    expect(isAuthorizedApiRequest(request, { API_TOKEN: "other" })).toBe(false);
    expect(isAuthorizedApiRequest(request, {})).toBe(false);
  });
});
