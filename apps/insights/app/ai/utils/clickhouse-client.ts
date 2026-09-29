/**
 * insights' binding to the shared ClickHouse client.
 *
 * The implementation lives in `@duyet/config/clickhouse`; this file only pins
 * the options that are genuinely specific to this app. `apps/data-sync` binds
 * the same client with a different set — see
 * `apps/data-sync/src/lib/clickhouse/client.ts`.
 */

import { createClickHouseClient } from "@duyet/config/clickhouse";
import type {
  ClickHouseConfig,
  QueryResult,
} from "@duyet/config/clickhouse";

export type { ClickHouseConfig, QueryResult } from "@duyet/config/clickhouse";

const clickhouse = createClickHouseClient({
  envPrefix: "CLICKHOUSE",
  // All four are mandatory here: every dashboard query is scoped to a
  // database, and a dashboard that silently read from `default` would be a
  // wrong answer rather than an obvious failure.
  required: ["HOST", "USER", "PASSWORD", "DATABASE"],
  // 443 and 8443 are the only ports the HTTPS endpoint is exposed on here.
  httpsPorts: [443, 8443],
  // Shipped behaviour: credentials are URL-encoded into the connection
  // string. `apps/api` moved to a header after 07563caa, so this is worth
  // revisiting, but changing it is a deployment concern, not a refactor.
  credentials: "url",
  clickhouseSettings: {
    max_execution_time: 60,
    // Shipped behaviour: 10k, not data-sync's 100k. Any dashboard query that
    // returns more silently truncates here. Kept because dashboards are built
    // around it, and raising it is a one-line change once someone has checked
    // which query is the one that overflows.
    max_result_rows: "10000",
    max_memory_usage: "1G",
  },
  // The browser must never reach for credentials; only the server does.
  serverOnly: true,
  // A local `NODE_ENV=production` build usually has no route to ClickHouse,
  // so it gets a 5s timeout and a single attempt instead of blocking a build
  // for a minute. CI keeps the full budget.
  buildBudget: { timeoutMs: 5000, maxRetries: 1 },
  logging: "auto",
});

/**
 * Get ClickHouse configuration from environment variables.
 * Returns `null` when a required variable is missing.
 */
export function getClickHouseConfig(): ClickHouseConfig | null {
  return clickhouse.getConfig();
}

/**
 * Get the pooled client instance, or `null` when unconfigured or in a browser.
 */
export async function getClickHouseClient() {
  return clickhouse.getClient();
}

/**
 * Execute a ClickHouse query with retry-on-transient-error and timeout.
 */
export function executeClickHouseQuery(
  query: string,
  timeoutMs?: number,
  maxRetries?: number
): Promise<QueryResult> {
  return clickhouse.executeQuery(query, timeoutMs, maxRetries);
}

/**
 * Test the connection and return diagnostic information.
 */
export function testClickHouseConnection() {
  return clickhouse.testConnection();
}

/**
 * Close the pooled client (for graceful shutdown).
 */
export async function closeClickHouseClient(): Promise<void> {
  return clickhouse.close();
}
