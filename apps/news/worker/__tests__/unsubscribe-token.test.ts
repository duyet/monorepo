import { describe, expect, it } from "vitest";
import { deriveUnsubscribeToken } from "../subscribe/handlers.js";
import type { Env } from "../types.js";

describe("deriveUnsubscribeToken", () => {
  it("uses deterministic HMAC when secret is configured", async () => {
    const env = { NEWS_UNSUBSCRIBE_SECRET: "test-secret" } as Env;
    const a = await deriveUnsubscribeToken(env, "User@Example.com");
    const b = await deriveUnsubscribeToken(env, "user@example.com");
    const c = await deriveUnsubscribeToken(
      { NEWS_UNSUBSCRIBE_SECRET: "other" } as Env,
      "user@example.com"
    );
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("falls back to UUID when secret is unset", async () => {
    const env = {} as Env;
    const a = await deriveUnsubscribeToken(env, "a@b.com");
    const b = await deriveUnsubscribeToken(env, "a@b.com");
    expect(a).not.toBe(b);
  });
});
