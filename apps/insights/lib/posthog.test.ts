import { afterEach, describe, expect, test, vi } from "vitest";
import { getPostHogConfig } from "./posthog";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPostHogConfig", () => {
  test("returns null when both credentials are missing", () => {
    vi.stubEnv("POSTHOG_API_KEY", "");
    vi.stubEnv("POSTHOG_PROJECT_ID", "");
    expect(getPostHogConfig()).toBeNull();
  });

  test("returns null when only the API key is missing", () => {
    vi.stubEnv("POSTHOG_API_KEY", "");
    vi.stubEnv("POSTHOG_PROJECT_ID", "42");
    expect(getPostHogConfig()).toBeNull();
  });

  test("returns null when only the project id is missing", () => {
    vi.stubEnv("POSTHOG_API_KEY", "phx_test");
    vi.stubEnv("POSTHOG_PROJECT_ID", "");
    expect(getPostHogConfig()).toBeNull();
  });

  test("returns the query URL when both are set", () => {
    vi.stubEnv("POSTHOG_API_KEY", "phx_test");
    vi.stubEnv("POSTHOG_PROJECT_ID", "42");
    expect(getPostHogConfig()).toEqual({
      apiKey: "phx_test",
      projectId: "42",
      apiUrl: "https://app.posthog.com/api/projects/42/query/",
    });
  });
});
