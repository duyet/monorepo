/**
 * ClickHouse HTTP client shared by the AI-percentage and insights routes.
 *
 * Two error policies live here on purpose:
 * - {@link executeClickHouseQuery} throws, so routes can answer 4xx/5xx.
 * - {@link queryClickHouseRows} degrades to an empty list, so one dead
 *   dashboard source cannot fail the whole insights payload.
 * @module lib/clickhouse
 */

import type { Env } from "../env.js";

export const CLICKHOUSE_FETCH_TIMEOUT_MS = 10_000;
export const MAX_CLICKHOUSE_RESPONSE_BYTES = 1_048_576;

export interface ClickHouseRequestConfig {
  headers: Record<string, string>;
  url: string;
}

export interface ClickHouseRequest extends ClickHouseRequestConfig {
  body: string;
}

/**
 * Build a ClickHouse HTTP target without embedding credentials in the URL.
 */
export function getClickHouseConfig(env: Env): ClickHouseRequestConfig | null {
  const host = env.CLICKHOUSE_HOST;
  const password = env.CLICKHOUSE_PASSWORD;
  const user = env.CLICKHOUSE_USER || "default";
  const protocol = env.CLICKHOUSE_PROTOCOL || "https";
  const port = env.CLICKHOUSE_PORT || "443";

  if (!host || !password) {
    return null;
  }

  return {
    headers: {
      "X-ClickHouse-Key": password,
      "X-ClickHouse-User": user,
    },
    url: `${protocol}://${host}:${port}`,
  };
}

/**
 * Request builder used by executeClickHouseQuery, queryClickHouseRows and tests.
 * The returned URL must never include userinfo.
 */
export function buildClickHouseRequest(
  env: Env,
  query: string,
  database = "default"
): ClickHouseRequest | null {
  const config = getClickHouseConfig(env);
  if (!config) {
    return null;
  }

  return {
    body: query,
    headers: {
      ...config.headers,
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    url: `${config.url}?database=${database}`,
  };
}

function nonEmptyLines(text: string): string[] {
  return text.trim().split("\n").filter(Boolean);
}

/**
 * Execute a ClickHouse query using native fetch and header-based auth.
 * @throws Error when ClickHouse is unconfigured, the query fails, or the
 *   response is too large.
 */
export async function executeClickHouseQuery(
  env: Env,
  query: string,
  database = "default"
): Promise<unknown[]> {
  const request = buildClickHouseRequest(env, query, database);
  if (!request) {
    throw new Error("ClickHouse not configured");
  }

  const response = await fetch(request.url, {
    body: request.body,
    headers: request.headers,
    method: "POST",
    signal: AbortSignal.timeout(CLICKHOUSE_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ClickHouse query failed: ${response.status} - ${errorText}`
    );
  }

  const text = await response.text();
  if (text.length > MAX_CLICKHOUSE_RESPONSE_BYTES) {
    throw new Error(
      `[REDACTED] response exceeded ${MAX_CLICKHOUSE_RESPONSE_BYTES} bytes`
    );
  }

  return nonEmptyLines(text).map((line) => JSON.parse(line));
}

/**
 * Run a `FORMAT JSONEachRow` query for dashboard reads: never throws, returns
 * an empty list on any failure so callers can merge partial results.
 */
export async function queryClickHouseRows(
  env: Env,
  query: string
): Promise<Record<string, unknown>[]> {
  const request = buildClickHouseRequest(
    env,
    `${query}\nFORMAT JSONEachRow`,
    env.CLICKHOUSE_DATABASE || "default"
  );
  if (!request) return [];

  try {
    const response = await fetch(request.url, {
      body: request.body,
      headers: request.headers,
      method: "POST",
      signal: AbortSignal.timeout(CLICKHOUSE_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    if (text.length > MAX_CLICKHOUSE_RESPONSE_BYTES) {
      console.warn(
        `[REDACTED] insights response exceeded ${MAX_CLICKHOUSE_RESPONSE_BYTES} bytes`
      );
      return [];
    }

    const results: Record<string, unknown>[] = [];
    for (const line of nonEmptyLines(text)) {
      try {
        results.push(JSON.parse(line) as Record<string, unknown>);
      } catch {
        console.warn("Skipping malformed ClickHouse JSONEachRow line");
      }
    }

    return results;
  } catch (error) {
    console.error("ClickHouse insights query failed:", error);
    return [];
  }
}
