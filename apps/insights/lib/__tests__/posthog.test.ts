import { afterEach, describe, expect, test, vi } from "vitest";
import { queryPostHog } from "../posthog";

describe("queryPostHog", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("returns null when PostHog is not configured", async () => {
    vi.stubEnv("POSTHOG_API_KEY", "");
    vi.stubEnv("POSTHOG_PROJECT_ID", "");

    expect(await queryPostHog({ kind: "HogQLQuery" })).toBeNull();
  });

  test("returns the parsed API response on success", async () => {
    vi.stubEnv("POSTHOG_API_KEY", "phx_test");
    vi.stubEnv("POSTHOG_PROJECT_ID", "123");
    const payload = {
      results: [["2026-01-01", 42]],
      columns: ["day", "views"],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => payload,
      }))
    );

    expect(await queryPostHog({ kind: "HogQLQuery" })).toEqual(payload);
  });

  test("returns null when the API responds with an error status", async () => {
    vi.stubEnv("POSTHOG_API_KEY", "phx_test");
    vi.stubEnv("POSTHOG_PROJECT_ID", "123");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 429, statusText: "Too Many" }))
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await queryPostHog({ kind: "HogQLQuery" })).toBeNull();
    errorSpy.mockRestore();
  });
});
