import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

const fixture = JSON.parse(
  readFileSync(
    join(import.meta.dirname!, "..", "fixtures", "clickhouse-client.json"),
    "utf-8",
  ),
) as {
  missing: null;
  configured: Record<string, string>;
};

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
] as const;

const saved = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

function applyEnv(values: Record<string, string> | null) {
  for (const key of ENV_KEYS) delete process.env[key];
  if (!values) return;
  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = saved[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.resetModules();
});

describe("getClickHouseClient", () => {
  test("returns null when the fixture has no ClickHouse config", async () => {
    applyEnv(fixture.missing);
    vi.resetModules();
    const { getClickHouseClient } = await import("@/lib/clickhouse");

    expect(getClickHouseClient()).toBe(fixture.missing);
  });

  test("returns the same client when the fixture config is set", async () => {
    applyEnv(fixture.configured);
    vi.resetModules();
    const { getClickHouseClient } = await import("@/lib/clickhouse");
    const client = getClickHouseClient();

    expect(client).not.toBeNull();
    expect(getClickHouseClient()).toBe(client);
    await client?.close();
  });
});
