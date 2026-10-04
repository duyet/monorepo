import { afterEach, describe, expect, test } from "vitest";
import { getPostHogConfig } from "./posthog";

const KEYS = ["POSTHOG_API_KEY", "POSTHOG_PROJECT_ID"] as const;
const previous = Object.fromEntries(
  KEYS.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("getPostHogConfig", () => {
  test("returns null without credentials and the query URL when both are set", () => {
    delete process.env.POSTHOG_API_KEY;
    delete process.env.POSTHOG_PROJECT_ID;
    expect(getPostHogConfig()).toBeNull();

    process.env.POSTHOG_API_KEY = "phx_test";
    process.env.POSTHOG_PROJECT_ID = "42";
    expect(getPostHogConfig()).toEqual({
      apiKey: "phx_test",
      projectId: "42",
      apiUrl: "https://app.posthog.com/api/projects/42/query/",
    });
  });
});
