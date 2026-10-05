import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { isFallbackEnabled } from "@/lib/fallback-provider";

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "UNSPLASH_ACCESS_KEY",
  "CLOUDINARY_CLOUD_NAME",
];

describe("isFallbackEnabled", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    for (const key of ENV_KEYS) delete process.env[key];
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  test("enables the fallback when no provider is configured", () => {
    expect(isFallbackEnabled()).toBe(true);
  });

  test.each(["UNSPLASH_ACCESS_KEY", "CLOUDINARY_CLOUD_NAME"])(
    "disables the fallback when %s is set",
    (key) => {
      process.env[key] = "test";
      expect(isFallbackEnabled()).toBe(false);
    },
  );

  test("disables the fallback only when ClickHouse is fully configured", () => {
    process.env.CLICKHOUSE_HOST = "localhost:8123";
    process.env.CLICKHOUSE_PASSWORD = "secret";
    expect(isFallbackEnabled()).toBe(true);

    process.env.CLICKHOUSE_DATABASE = "analytics";
    expect(isFallbackEnabled()).toBe(false);
  });
});
