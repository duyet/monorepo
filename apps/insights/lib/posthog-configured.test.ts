import { afterEach, describe, expect, test } from "vitest";
import { isPostHogConfigured } from "./posthog";

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

describe("isPostHogConfigured", () => {
  test("is false without both credentials and true once they are set", () => {
    delete process.env.POSTHOG_API_KEY;
    delete process.env.POSTHOG_PROJECT_ID;
    expect(isPostHogConfigured()).toBe(false);

    process.env.POSTHOG_API_KEY = "phx_test";
    process.env.POSTHOG_PROJECT_ID = "42";
    expect(isPostHogConfigured()).toBe(true);
  });
});
