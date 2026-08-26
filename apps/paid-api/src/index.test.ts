/**
 * Unit tests for the gating logic that runs BEFORE the x402 middleware. The
 * middleware initializes the facilitator eagerly (network), so the 402 payment
 * flow and the /chat handler are covered in payment.test.ts.
 */
import { describe, expect, it } from "vitest";
import handler, { isPaidChatEnabled, isPriceSane, type Env } from "./index";

const ADDR = "0xb6BECF08DFd2E2B0F03ED6ea48b515d687DB034B";
const stubEnv = (over: Partial<Env> = {}): Env => ({
  AI: {} as Env["AI"],
  ...over,
});

describe("isPaidChatEnabled", () => {
  it("is true for a valid 40-hex EVM address", () => {
    expect(isPaidChatEnabled(stubEnv({ PAY_TO: ADDR }))).toBe(true);
  });

  it("is false when PAY_TO is missing", () => {
    expect(isPaidChatEnabled(stubEnv())).toBe(false);
  });

  it("is false for a malformed address", () => {
    expect(isPaidChatEnabled(stubEnv({ PAY_TO: "0xdead" }))).toBe(false);
    expect(isPaidChatEnabled(stubEnv({ PAY_TO: "not-an-address" }))).toBe(false);
  });
});

describe("isPriceSane", () => {
  it("rejects zero, malformed, and negative prices", () => {
    for (const price of ["$0", "$", "0", "abc", "$-1"]) {
      expect(isPriceSane(price)).toBe(false);
    }
  });

  it("accepts positive dollar prices", () => {
    for (const price of ["$0.01", "$1", "$10"]) {
      expect(isPriceSane(price)).toBe(true);
    }
  });
});

describe("fetch (pre-middleware short-circuits)", () => {
  it("returns 503 when PAY_TO is unset — no payment surface", async () => {
    const res = await handler.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        body: '{"message":"hi"}',
      }),
      stubEnv(),
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "x402 not configured — PAY_TO missing",
    });
  });

  it("returns 503 when PAY_TO is set but the price is insane", async () => {
    const res = await handler.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "POST",
        body: '{"message":"hi"}',
      }),
      stubEnv({ PAY_TO: ADDR, X402_PRICE: "$0" }),
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "x402 price misconfigured" });
  });

  it("returns 204 for an OPTIONS preflight", async () => {
    const res = await handler.fetch(
      new Request("https://paid-api.duyet.workers.dev/chat", {
        method: "OPTIONS",
      }),
      stubEnv({ PAY_TO: ADDR }),
    );
    expect(res.status).toBe(204);
  });
});
