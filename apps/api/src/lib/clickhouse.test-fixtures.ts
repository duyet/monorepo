import { expect } from "vitest";
import type { Env } from "../env.js";
import { buildClickHouseRequest, getClickHouseConfig } from "./clickhouse.js";

/**
 * Shared ClickHouse fixtures for the api test suites.
 *
 * Named `*.test-fixtures.ts` so it is neither a suite of its own — vitest here
 * only collects `*.test.ts` — nor production source, even though it sits beside
 * the module it configures.
 */

/** Deliberately not a real secret: the suites assert it never reaches a URL. */
export const CLICKHOUSE_TEST_PASSWORD = "s3cret-clickhouse-pass";

/** A fully configured ClickHouse env, so the suites exercise the real path. */
export const clickHouseTestEnv: Env = {
  CLICKHOUSE_DATABASE: "analytics",
  CLICKHOUSE_HOST: "ch.example.com",
  CLICKHOUSE_PASSWORD: CLICKHOUSE_TEST_PASSWORD,
  CLICKHOUSE_PORT: "8443",
  CLICKHOUSE_PROTOCOL: "https",
  CLICKHOUSE_USER: "reader",
};

/**
 * The unconfigured case: with no ClickHouse env there is nothing to talk to, so
 * both the config lookup and the request builder have to decline rather than
 * build a request against undefined host and port.
 */
export function expectClickHouseUnconfigured(): void {
  expect(getClickHouseConfig({})).toBeNull();
  expect(buildClickHouseRequest({}, "SELECT 1")).toBeNull();
}
