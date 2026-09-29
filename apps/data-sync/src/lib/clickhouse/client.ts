/**
 * data-sync's binding to the shared ClickHouse client.
 *
 * The implementation lives in `@duyet/config/clickhouse`; this file only pins
 * the options that are genuinely specific to this app. `apps/insights` binds
 * the same client with a different set — see
 * `apps/insights/app/ai/utils/clickhouse-client.ts`.
 */

import { createClickHouseClient } from "@duyet/config/clickhouse";
import type { ClickHouseClient } from "@clickhouse/client";

export type {
  ClickHouseConfig,
  QueryResult,
} from "@duyet/config/clickhouse";

const clickhouse = createClickHouseClient({
  // `CH_*` is the documented prefix for this app; `CLICKHOUSE_*` is what the
  // GitHub Actions workflows actually export, so both are read, `CH_*` first.
  envPrefix: "CH",
  envAliases: ["CLICKHOUSE"],
  // Only host and password gate availability. The database is optional and
  // falls back to the server's `default`; the user defaults to `default` too.
  required: ["HOST", "PASSWORD"],
  defaultUsername: "default",
  // This app has been pointed at a 9440/9000 endpoint before, so those are
  // still treated as HTTPS.
  httpsPorts: [443, 8443, 9440, 9000],
  // Shipped behaviour: no credentials are sent, so the SDK falls back to
  // ClickHouse's `default` user with an empty password. The production server
  // accepts that, which is why `CH_PASSWORD` has only ever gated availability.
  // See `ClickHouseCredentials` in @duyet/config/clickhouse before changing it.
  credentials: "omit",
  clickhouseSettings: {
    max_execution_time: 60,
    // Syncs and retention sweeps legitimately move far more than a dashboard
    // ever shows, hence 100k rather than insights' 10k.
    max_result_rows: "100000",
    max_memory_usage: "2G",
  },
  logging: "always",
});

/**
 * Get ClickHouse configuration from environment variables.
 * Returns `null` when a required variable is missing.
 */
export function getClickHouseConfig() {
  return clickhouse.getConfig();
}

/**
 * Get the pooled client instance, or `null` when unconfigured.
 *
 * Now `async` because `@clickhouse/client` is imported lazily — the shared
 * client is also bundled by `apps/insights` for the browser, where the Node
 * transport must never be pulled in eagerly.
 */
export function getClient(): Promise<ClickHouseClient | null> {
  return clickhouse.getClient();
}

/** Execute a `SELECT` and parse the `JSONEachRow` payload. */
export function executeQuery(
  query: string,
  timeoutMs?: number,
  maxRetries?: number
) {
  return clickhouse.executeQuery(query, timeoutMs, maxRetries);
}

/**
 * Execute a command (INSERT, CREATE, DROP, …) that doesn't return data.
 * Uses `client.command()`, which is appropriate for non-SELECT statements.
 */
export function executeCommand(
  query: string,
  timeoutMs?: number,
  maxRetries?: number
) {
  return clickhouse.executeCommand(query, timeoutMs, maxRetries);
}

/** Execute multiple statements, stopping at the first failure. */
export function executeStatements(statements: string[]) {
  return clickhouse.executeStatements(statements);
}

/**
 * Insert rows into a table as `JSONEachRow`.
 *
 * Separate from {@link executeCommand} because the rows go in the request
 * *body*; `client.command()` sends only the query text. This is the path
 * `unsplash-photos.syncer.ts` used to hand-roll with raw `fetch` + Basic auth,
 * which left it with no timeout, no retry and no `query_id`.
 */
export function insertJsonEachRow(
  table: string,
  rows: readonly string[],
  timeoutMs?: number,
  maxRetries?: number
) {
  return clickhouse.insertJsonEachRow(table, rows, timeoutMs, maxRetries);
}

/** Ping the server with a trivial query. */
export function ping() {
  return clickhouse.ping();
}

/** Close the pooled client (for graceful shutdown). */
export function closeClient(): Promise<void> {
  return clickhouse.close();
}
