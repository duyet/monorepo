/**
 * ClickHouse HTTP client for Cloudflare Workers.
 *
 * Workers cannot use Node TCP sockets, so we use the ClickHouse HTTP interface
 * directly via fetch. All queries are validated to be read-only before execution.
 */

import type { Env, QueryResult, Row } from "../types";

/**
 * Allowed read-only statement prefixes (case-insensitive).
 */
const READ_ONLY_PREFIXES = [
  "select",
  "show",
  "describe",
  "desc",
  "explain",
  "with",
] as const;

/**
 * Validate that a SQL query is read-only.
 * Throws if the query could mutate data.
 */
export function assertReadOnly(sql: string): void {
  const trimmed = sql.trim();
  if (!trimmed) {
    throw new Error("Read-only violation: empty query");
  }

  // Reject multi-statement queries (semicolons followed by non-whitespace)
  // Strip string literals first to avoid false positives on semicolons inside strings
  const withoutStrings = trimmed.replace(/'[^']*'/g, "''");
  if (/;\s*\S/.test(withoutStrings)) {
    throw new Error(
      "Read-only violation: multi-statement queries are not allowed"
    );
  }

  const normalized = trimmed.toLowerCase();
  const allowed = READ_ONLY_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );
  if (!allowed) {
    throw new Error(
      `Read-only violation: query must start with one of [${READ_ONLY_PREFIXES.join(", ")}]. Got: "${trimmed.slice(0, 80)}"`
    );
  }
}

/**
 * Fetch-based ClickHouse HTTP client for Workers.
 */
export class ClickHouseClient {
  private readonly baseUrl: string;
  private readonly headers: HeadersInit;
  private readonly database: string;

  constructor(env: Env) {
    // CLICKHOUSE_HOST can be just a hostname or a full https://... URL
    const host = env.CLICKHOUSE_HOST.startsWith("http")
      ? env.CLICKHOUSE_HOST
      : `https://${env.CLICKHOUSE_HOST}`;

    this.baseUrl = host.replace(/\/$/, "");
    this.database = env.CLICKHOUSE_DATABASE || "default";
    this.headers = {
      "X-ClickHouse-User": env.CLICKHOUSE_USER || "default",
      "X-ClickHouse-Key": env.CLICKHOUSE_PASSWORD,
      "X-ClickHouse-Database": this.database,
      "Content-Type": "text/plain; charset=utf-8",
    };
  }

  /**
   * Execute a read-only SQL query and return parsed rows.
   *
   * @param sql  SQL string (SELECT / SHOW / DESCRIBE / EXPLAIN / WITH …)
   * @param params  Named parameters substituted as {name:Type} in the SQL
   */
  async query<T extends Row = Row>(
    sql: string,
    params?: Record<string, string | number | boolean>
  ): Promise<QueryResult & { data: T[] }> {
    assertReadOnly(sql);

    // Append FORMAT JSONEachRow if not already specified
    const query = /FORMAT\s+\w+/i.test(sql)
      ? sql.trim()
      : `${sql.trim()} FORMAT JSONEachRow`;

    const url = new URL(`${this.baseUrl}/`);
    url.searchParams.set("database", this.database);

    // Inject named parameters as query-string entries (param_<name>)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(`param_${key}`, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.headers,
      body: query,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ClickHouse HTTP ${response.status}: ${errorText.slice(0, 500)}`
      );
    }

    const text = await response.text();

    // JSONEachRow produces one JSON object per line
    const data: T[] = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as T);

    return {
      data,
      rows: data.length,
    };
  }

  /**
   * Ping the ClickHouse server to verify connectivity.
   */
  async ping(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/ping`;
      const response = await fetch(url, { method: "GET", headers: this.headers });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create a ClickHouseClient from Worker env bindings.
 */
export function createClickHouseClient(env: Env): ClickHouseClient {
  return new ClickHouseClient(env);
}
