import { describe, expect, it } from "vitest";
import {
  authorizeAssistantRequest,
  getAssistantClientHeaders,
  getBearerToken,
  getCorsHeaders,
  timingSafeEqual,
} from "./api-auth";

const env = { ASSISTANT_API_TOKEN: "assistant-secret" };

describe("assistant API auth", () => {
  it("extracts bearer tokens", () => {
    const request = new Request(
      "https://agent-assistant.duyet.net/api/threads",
      {
        headers: { Authorization: "Bearer token-123" },
      }
    );
    expect(getBearerToken(request)).toBe("token-123");
  });

  it("compares tokens without leaking length", () => {
    expect(timingSafeEqual("secret", "secret")).toBe(true);
    expect(timingSafeEqual("secret", "different")).toBe(false);
    expect(timingSafeEqual("secret", undefined)).toBe(false);
    expect(timingSafeEqual("", "")).toBe(false);
  });

  it("rejects missing and wrong tokens", () => {
    const missing = authorizeAssistantRequest(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        method: "POST",
      }),
      env
    );
    expect(missing?.status).toBe(401);

    const wrong = authorizeAssistantRequest(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        headers: { Authorization: "Bearer nope" },
        method: "POST",
      }),
      env
    );
    expect(wrong?.status).toBe(401);
  });

  it("allows a valid bearer token", () => {
    const allowed = authorizeAssistantRequest(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        headers: { Authorization: "Bearer assistant-secret" },
        method: "POST",
      }),
      env
    );
    expect(allowed).toBeNull();
  });

  it("fails closed when no token is configured", () => {
    const response = authorizeAssistantRequest(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        headers: { Authorization: "Bearer assistant-secret" },
        method: "POST",
      }),
      {}
    );
    expect(response?.status).toBe(401);
  });

  it("does not use wildcard CORS", () => {
    const blocked = getCorsHeaders(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        headers: { Origin: "https://evil.example" },
      })
    );
    expect(blocked["Access-Control-Allow-Origin"]).not.toBe("*");
    expect(blocked["Access-Control-Allow-Origin"]).not.toBe(
      "https://evil.example"
    );

    const allowed = getCorsHeaders(
      new Request("https://agent-assistant.duyet.net/api/threads", {
        headers: { Origin: "https://agent-assistant.duyet.net" },
      })
    );
    expect(allowed["Access-Control-Allow-Origin"]).toBe(
      "https://agent-assistant.duyet.net"
    );
  });

  it("attaches a bearer header when a client token is present", () => {
    const previous = process.env.VITE_ASSISTANT_API_TOKEN;
    process.env.VITE_ASSISTANT_API_TOKEN = "client-token";
    expect(getAssistantClientHeaders()).toEqual({
      Authorization: "Bearer client-token",
    });
    if (previous === undefined) {
      delete process.env.VITE_ASSISTANT_API_TOKEN;
    } else {
      process.env.VITE_ASSISTANT_API_TOKEN = previous;
    }
  });
});
