import { afterEach, describe, expect, test } from "vitest";
import { isClickHouseConfigured } from "@/lib/clickhouse";

const KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
] as const;

const previous = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("isClickHouseConfigured", () => {
  test("is false until host, password, and database are set", () => {
    delete process.env.CLICKHOUSE_HOST;
    delete process.env.CLICKHOUSE_PASSWORD;
    delete process.env.CLICKHOUSE_DATABASE;
    expect(isClickHouseConfigured()).toBe(false);

    process.env.CLICKHOUSE_HOST = "localhost";
    process.env.CLICKHOUSE_PASSWORD = "secret";
    process.env.CLICKHOUSE_DATABASE = "photos";
    expect(isClickHouseConfigured()).toBe(true);
  });
});
