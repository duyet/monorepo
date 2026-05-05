import { describe, expect, mock, test } from "bun:test";
import { getUserFromRequest } from "./auth";

describe("workers auth", () => {
  test("returns null when authorization header is missing", async () => {
    const request = new Request("https://agents.duyet.net/api/chat");
    await expect(getUserFromRequest(request, "https://clerk.example.com")).resolves.toBeNull();
  });

  test("returns null for malformed bearer token without throwing", async () => {
    const request = new Request("https://agents.duyet.net/api/chat", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    await expect(getUserFromRequest(request, "https://clerk.example.com")).resolves.toBeNull();
  });

  test("returns null when jwks fetch fails", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error("network down");
    }) as typeof fetch;

    const request = new Request("https://agents.duyet.net/api/chat", {
      headers: {
        Authorization: "Bearer a.b.c",
      },
    });

    await expect(getUserFromRequest(request, "https://clerk.example.com")).resolves.toBeNull();

    globalThis.fetch = originalFetch;
  });
});
