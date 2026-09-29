/**
 * Shared ClickHouse HTTP client.
 *
 * `apps/insights` and `apps/data-sync` each shipped a near-duplicate of this
 * (608 and 392 lines). Both read a `ClickHouseConfig` from environment
 * variables, built a singleton `createClient()` with connection pooling, and
 * ran the same `2 ** (attempt - 1) * 1000` backoff. This module is the single
 * implementation; each app keeps a thin adapter that pins the options that
 * genuinely differ (env var names, required fields, HTTPS port list, server
 * settings, logging verbosity).
 *
 * Two behaviours that look like bugs are **preserved on purpose** and flagged
 * inline, because both call sites are load-bearing in production:
 *
 * - `credentials: "omit"` (data-sync) never hands the username/password to
 *   `createClient`, so the SDK falls back to ClickHouse's `default` user with
 *   an empty password. See {@link ClickHouseCredentials}.
 * - `max_result_rows: "10000"` (insights) silently truncates any dashboard
 *   query over ten thousand rows. See `INSIGHTS_*` in the insights adapter.
 *
 * @module config/clickhouse
 */

import type { ClickHouseClient } from "@clickhouse/client";

/** Environment suffix a shared client can read, e.g. `CLICKHOUSE_HOST`. */
export type ClickHouseEnvField =
  | "HOST"
  | "PORT"
  | "USER"
  | "PASSWORD"
  | "DATABASE"
  | "PROTOCOL";

/**
 * Resolved ClickHouse connection settings.
 *
 * The credential field is named `username` for both apps. data-sync shipped it
 * as `user`, which made the two `ClickHouseConfig` objects structurally
 * incompatible for no benefit — the ClickHouse HTTP API calls this value the
 * user, the JS SDK calls it `username`, and `user` collided with nothing but
 * confusion.
 */
export interface ClickHouseConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  /** `undefined` when unset — only data-sync tolerates a missing database. */
  database: string | undefined;
  protocol: string;
}

/** Uniform result shape for every statement this module runs. */
export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

/** Result of {@link ClickHouseClientHandle.testConnection}. */
export interface ClickHouseConnectionTest {
  success: boolean;
  message: string;
  details: Record<string, unknown>;
}

/** Coarse error buckets, used to log and to decide whether to retry. */
export type ClickHouseErrorType =
  | "CONNECTION"
  | "AUTH"
  | "TIMEOUT"
  | "QUERY_ERROR"
  | "NO_DATA"
  | "UNKNOWN";

/** Base delay for the shared exponential backoff (1s, 2s, 4s, …). */
export const CLICKHOUSE_BACKOFF_BASE_MS = 1000;

/**
 * The backoff both apps shipped, unchanged: `2 ** (attempt - 1) * 1000`.
 *
 * @param attempt 1-based attempt number that just failed.
 */
export function clickHouseBackoffMs(attempt: number): number {
  return 2 ** (attempt - 1) * CLICKHOUSE_BACKOFF_BASE_MS;
}

/**
 * How credentials reach `createClient`.
 *
 * - `"url"` — userinfo is URL-encoded into the connection string, and nothing
 *   else carries the secret. This is what `apps/insights` has always done.
 * - `"omit"` — **no credentials are sent at all**, so `@clickhouse/client`
 *   falls back to `default` with an empty password. This is what
 *   `apps/data-sync` has always done, and it is kept deliberately: the
 *   production ClickHouse accepts `default` with an empty password, so
 *   `CH_PASSWORD` there is only a "is ClickHouse configured?" flag and never a
 *   secret on the wire. Sending the real password would switch the principal
 *   that writes rows, which is a deployment change, not a refactor. If that is
 *   ever wanted it needs its own commit with a live-server check.
 */
export type ClickHouseCredentials = "url" | "omit";

export interface ClickHouseClientOptions {
  /**
   * Primary environment prefix, without the trailing underscore —
   * `"CLICKHOUSE"` or `"CH"`.
   */
  envPrefix: string;
  /**
   * Additional prefixes consulted after {@link envPrefix}, in order. data-sync
   * reads `CH_*` first and falls back to `CLICKHOUSE_*`, which is the only
   * prefix its GitHub Actions workflows actually export.
   */
  envAliases?: readonly string[];
  /**
   * Fields that must be present or {@link ClickHouseClientHandle.getConfig}
   * returns `null`. `HOST` and `PASSWORD` are always required on top of this
   * list, so include them for the benefit of the log line. insights requires
   * host + user + password + database; data-sync requires host + password only.
   */
  required?: readonly ClickHouseEnvField[];
  /** Username used when no user variable is set. data-sync defaults to `default`. */
  defaultUsername?: string;
  /** Port used when no port variable is set. */
  defaultPort?: string;
  /** Ports that imply `https` when no protocol variable is set. */
  httpsPorts?: readonly number[];
  /** Where the username and password are delivered. Default `"omit"`. */
  credentials?: ClickHouseCredentials;
  /** Per-statement ClickHouse server settings. */
  clickhouseSettings?: Record<string, string | number>;
  /** HTTP request timeout handed to `createClient`. */
  requestTimeoutMs?: number;
  /**
   * Refuse to build a client when `window` exists. insights is a browser app
   * that only ever queries from the server.
   */
  serverOnly?: boolean;
  /**
   * Shortened timeout and retry count for a local `NODE_ENV=production` build,
   * where ClickHouse is usually unreachable. CI keeps full timeouts because
   * GitHub Actions reaches the server over Tailscale.
   */
  buildBudget?: { timeoutMs: number; maxRetries: number };
  /**
   * `"auto"` logs outside production (insights); `"always"` logs unconditionally
   * (data-sync, a short-lived CLI).
   */
  logging?: "auto" | "always";
}

/** The singleton-per-app surface both adapters build on. */
export interface ClickHouseClientHandle {
  getConfig(): ClickHouseConfig | null;
  getClient(): Promise<ClickHouseClient | null>;
  executeQuery(
    query: string,
    timeoutMs?: number,
    maxRetries?: number
  ): Promise<QueryResult>;
  executeCommand(
    query: string,
    timeoutMs?: number,
    maxRetries?: number
  ): Promise<QueryResult>;
  /**
   * Insert rows into a table as `JSONEachRow`.
   *
   * Distinct from {@link executeCommand} because an `INSERT … FORMAT
   * JSONEachRow` needs the **rows in the request body**, not appended to the
   * query string. `client.command()` sends only the query, so it cannot express
   * this — the alternative is the raw `fetch` + Basic-auth block that
   * `unsplash-photos.syncer.ts` used to hand-roll, which is how an insert path
   * ended up with no timeout, no retry, and no `query_id`.
   */
  insertJsonEachRow(
    table: string,
    rows: readonly string[],
    timeoutMs?: number,
    maxRetries?: number
  ): Promise<QueryResult>;
  executeStatements(statements: string[]): Promise<QueryResult>;
  testConnection(): Promise<ClickHouseConnectionTest>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 3;

/**
 * Classify an error so a non-retryable failure fails fast and a transient one
 * gets another attempt.
 *
 * Verbatim from the insights client so its retry decisions are unchanged.
 */
export function classifyClickHouseError(error: Error): {
  type: ClickHouseErrorType;
  description: string;
} {
  const message = error.message.toLowerCase();
  const name = error.name?.toLowerCase() || "";

  if (
    message.includes("abort") ||
    message.includes("timeout") ||
    name.includes("abort")
  ) {
    return {
      type: "TIMEOUT",
      description: "Query exceeded timeout limit or was aborted",
    };
  }

  if (
    message.includes("authentication") ||
    message.includes("unauthorized") ||
    message.includes("401") ||
    message.includes("access denied") ||
    message.includes("wrong password") ||
    message.includes("invalid password")
  ) {
    return {
      type: "AUTH",
      description: "Authentication failed - check username/password",
    };
  }

  if (
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("connection") ||
    message.includes("network") ||
    message.includes("dns") ||
    message.includes("socket") ||
    message.includes("etimedout") ||
    message.includes("econnreset")
  ) {
    return {
      type: "CONNECTION",
      description: "Connection to database failed",
    };
  }

  if (
    message.includes("syntax") ||
    message.includes("unknown") ||
    message.includes("no such") ||
    message.includes("table") ||
    message.includes("column") ||
    message.includes("database")
  ) {
    return {
      type: "QUERY_ERROR",
      description:
        "Query execution error - check SQL syntax or table/column names",
    };
  }

  return { type: "UNKNOWN", description: "Unknown error occurred" };
}

/** Only the buckets that a later identical attempt could plausibly survive. */
function isTransientError(type: ClickHouseErrorType): boolean {
  return type === "CONNECTION" || type === "TIMEOUT";
}

/**
 * Hash a query for logging so a failure can be correlated without spilling
 * SQL (and any literal bound to it) into the log.
 */
function getQueryFingerprint(query: string): string {
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/** Leading keyword and placeholder count, for log lines only. */
function getQueryMetadata(query: string): {
  paramCount: number;
  type: string;
} {
  const paramCount = (query.match(/\?/g) || []).length;

  const trimmed = query.trim().toUpperCase();
  let type = "UNKNOWN";
  if (trimmed.startsWith("SELECT")) type = "SELECT";
  else if (trimmed.startsWith("INSERT")) type = "INSERT";
  else if (trimmed.startsWith("UPDATE")) type = "UPDATE";
  else if (trimmed.startsWith("DELETE")) type = "DELETE";

  return { paramCount, type };
}

/**
 * Drop a `:port` suffix from a configured host.
 *
 * Both apps may be handed `CLICKHOUSE_HOST=localhost:8124`; concatenating that
 * with the port again would produce `localhost:8124:8124`. data-sync stripped
 * it, insights did not, so the strip is now unconditional. Anchoring on
 * `:<digits>$` also leaves a bracketed IPv6 host such as `[::1]:8123` alone,
 * where a naive `split(":")[0]` would have produced `[`.
 */
function stripPort(host: string): string {
  return host.replace(/:\d+$/, "");
}

function detectProtocol(
  port: string,
  explicitProtocol: string | undefined,
  httpsPorts: readonly number[]
): string {
  if (explicitProtocol) {
    return explicitProtocol.toLowerCase() === "https" ? "https" : "http";
  }
  return httpsPorts.includes(Number.parseInt(port, 10)) ? "https" : "http";
}

/**
 * True for a local production build with no CI, where ClickHouse is normally
 * unreachable. GitHub Actions is excluded because it reaches the server over
 * Tailscale and must keep the full timeout and retry budget.
 */
function isBuildEnvironment(): boolean {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    return false;
  }
  return (
    process.env.NODE_ENV === "production" &&
    !process.env.VERCEL &&
    !process.env.CF_PAGES
  );
}

/** Operator-facing next step for the error buckets that have one. */
function logErrorGuidance(
  type: ClickHouseErrorType,
  timeoutMs: number,
  fingerprint: string
): void {
  if (type === "AUTH") {
    console.error(
      "[ClickHouse Query] AUTH ERROR: Check the configured user and password"
    );
  } else if (type === "CONNECTION") {
    console.error(
      "[ClickHouse Query] CONNECTION ERROR: Check the configured host, port, and network connectivity"
    );
  } else if (type === "TIMEOUT") {
    console.error(
      `[ClickHouse Query] TIMEOUT ERROR: Query exceeded ${timeoutMs}ms limit. Consider increasing timeout or optimizing query.`
    );
  } else if (type === "QUERY_ERROR") {
    console.error(
      "[ClickHouse Query] QUERY ERROR: Check SQL syntax and ensure table/columns exist"
    );
    console.error("[ClickHouse Query] Query fingerprint:", fingerprint);
  }
}

/** Build a per-app handle that owns one pooled client and one error policy. */
export function createClickHouseClient(
  options: ClickHouseClientOptions
): ClickHouseClientHandle {
  const {
    envPrefix,
    envAliases = [],
    required = ["HOST", "PASSWORD"],
    defaultUsername = "",
    defaultPort = "8123",
    httpsPorts = [443, 8443],
    credentials = "omit",
    clickhouseSettings = {},
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    serverOnly = false,
    buildBudget,
    logging = "auto",
  } = options;

  const logEnabled = logging === "always" || process.env.NODE_ENV !== "production";
  const debug = (...args: unknown[]) => {
    if (logEnabled) console.log(...args);
  };
  const prefixes = [envPrefix, ...envAliases];

  function readEnv(field: ClickHouseEnvField): string | undefined {
    for (const prefix of prefixes) {
      const value = process.env[`${prefix}_${field}`];
      if (value) return value;
    }
    return undefined;
  }

  function getConfig(): ClickHouseConfig | null {
    const host = readEnv("HOST");
    const port = readEnv("PORT") || defaultPort;
    const username = readEnv("USER") || defaultUsername;
    const password = readEnv("PASSWORD") || "";
    const database = readEnv("DATABASE");
    const explicitProtocol = readEnv("PROTOCOL");

    const present: Record<ClickHouseEnvField, boolean> = {
      HOST: !!host,
      PORT: true, // always defaulted
      USER: !!username,
      PASSWORD: !!password,
      DATABASE: !!database,
      PROTOCOL: !!explicitProtocol,
    };

    debug("[ClickHouse Config] Environment check:", {
      hasHost: present.HOST,
      hasUsername: present.USER,
      hasPassword: present.PASSWORD,
      hasDatabase: present.DATABASE,
      port,
      protocol: explicitProtocol,
    });

    const missing: ClickHouseEnvField[] = required.filter(
      (field) => !present[field]
    );
    if (!host && !missing.includes("HOST")) missing.push("HOST");
    if (!password && !missing.includes("PASSWORD")) missing.push("PASSWORD");

    // `HOST` and `PASSWORD` gate every binding, so the `!host || !password`
    // arm is what narrows them here.
    if (!host || !password || missing.length > 0) {
      console.error(
        "[ClickHouse Config] FATAL: Missing required environment variables:",
        missing
          .map((field) =>
            prefixes.map((prefix) => `${prefix}_${field}`).join("/")
          )
          .join(", ")
      );
      return null;
    }

    const protocol = detectProtocol(port, explicitProtocol, httpsPorts);

    debug("[ClickHouse Config] Configuration created:", {
      host,
      port,
      protocol,
      database,
    });

    return { host, port, username, password, database, protocol };
  }

  function buildUrl(config: ClickHouseConfig): string {
    const host = stripPort(config.host);
    const suffix = config.database ? `/${config.database}` : "";
    const base = `${config.protocol}://${host}:${config.port}${suffix}`;
    if (credentials !== "url") return base;
    return `${config.protocol}://${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@${host}:${config.port}${suffix}`;
  }

  let clientInstance: ClickHouseClient | null = null;
  // Held only while a `createClient` call is in flight, then dropped again
  // either way: a success is remembered in `clientInstance`, and a failure has
  // to stay retryable the way both shipped clients were.
  let pending: Promise<ClickHouseClient | null> | null = null;

  async function getClient(): Promise<ClickHouseClient | null> {
    if (serverOnly && typeof window !== "undefined") {
      return null;
    }
    if (clientInstance) return clientInstance;
    if (pending) return pending;

    const config = getConfig();
    if (!config) {
      console.warn("[ClickHouse Client] No configuration available");
      return null;
    }

    const created = (async () => {
      try {
        // Imported lazily: `@clickhouse/client` is a Node-only package and
        // insights bundles this module for the browser, where the `serverOnly`
        // guard above is the only thing that keeps it from being reached.
        const { createClient } = await import("@clickhouse/client");

        const url = buildUrl(config);
        debug(
          "[ClickHouse Client] Creating client with URL:",
          credentials === "url"
            ? url.replace(/:([^:@]+)@/, ":***@")
            : `${config.protocol}://${config.username}:***@${stripPort(config.host)}:${config.port}${config.database ? `/${config.database}` : ""}`
        );

        clientInstance = createClient({
          url,
          request_timeout: requestTimeoutMs,
          clickhouse_settings: clickhouseSettings,
        });

        debug(
          "[ClickHouse Client] Client created successfully with connection pooling enabled"
        );
        return clientInstance;
      } catch (error) {
        const safeMessage = String(error).replace(
          /\/\/[^@]+@/g,
          "//<credentials>@"
        );
        console.error("[ClickHouse Client] Failed to create client:", safeMessage);
        return null;
      }
    })();

    pending = created;
    try {
      return await created;
    } finally {
      // Never leave a settled promise cached: a later `close()` resets
      // `clientInstance`, and a stale `pending` would hand the closed client
      // back instead of building a fresh one.
      if (pending === created) pending = null;
    }
  }

  /**
   * Apply the shortened build budget, and only when the caller asked for one.
   */
  function resolveBudget(
    timeoutMs: number,
    maxRetries: number
  ): { timeoutMs: number; maxRetries: number } {
    if (!buildBudget || !isBuildEnvironment()) {
      return { timeoutMs, maxRetries };
    }
    debug(
      "[ClickHouse Query] Local build environment detected (no CI), using reduced timeout:",
      buildBudget
    );
    return { timeoutMs: buildBudget.timeoutMs, maxRetries: buildBudget.maxRetries };
  }

  /**
   * Shared retry driver.
   *
   * Retry policy: **transient failures only** (`CONNECTION`, `TIMEOUT`). A
   * syntax error, a missing table or a rejected password will fail identically
   * on every attempt, so re-sending it just burns wall clock — 1s, 2s, 4s of
   * pure latency before the caller learns it was never going to work. This is
   * the insights behaviour, kept for both: data-sync used to retry everything
   * and no comment, test, plan doc or commit message in the repo records a
   * reason, so there was nothing to preserve. It matches the neighbouring
   * `BaseSyncer.isRetryable` policy and its "401/403 stay non-retryable so
   * `withRetry` fails fast, as before" test.
   */
  async function runWithRetries<T>(
    client: ClickHouseClient | null,
    label: "query" | "command" | "insert",
    run: (queryId: string, signal: AbortSignal) => Promise<T>,
    onSuccess: (value: T) => QueryResult,
    query: string,
    timeoutMs: number,
    maxRetries: number
  ): Promise<QueryResult> {
    const budget = resolveBudget(timeoutMs, maxRetries);
    const finalTimeoutMs = budget.timeoutMs;
    const finalMaxRetries = budget.maxRetries;

    const queryId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const metadata = getQueryMetadata(query);
    const fingerprint = getQueryFingerprint(query);

    debug(`[ClickHouse ${label === "query" ? "Query" : "Command"}] Starting execution:`, {
      queryId,
      queryFingerprint: fingerprint,
      queryType: metadata.type,
      queryLength: query.length,
      paramCount: metadata.paramCount,
      timeout: finalTimeoutMs,
      maxRetries: finalMaxRetries,
    });

    if (!client) {
      console.error(
        `[ClickHouse ${label === "query" ? "Query" : "Command"}] FATAL: Client not available - check environment variables`
      );
      return {
        success: false,
        data: [],
        error:
          "ClickHouse client not available - missing required environment variables",
      };
    }

    let lastError: Error | null = null;

    let lastErrorType: { type: ClickHouseErrorType; description: string } | null =
      null;

    for (let attempt = 1; attempt <= finalMaxRetries; attempt++) {
      debug(
        `[ClickHouse ${label === "query" ? "Query" : "Command"}] Attempt ${attempt}/${finalMaxRetries}`,
        { queryId }
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        debug(
          `[ClickHouse ${label === "query" ? "Query" : "Command"}] Timeout triggered after ${finalTimeoutMs}ms`,
          { queryId, attempt }
        );
        controller.abort();
      }, finalTimeoutMs);

      const startTime = Date.now();
      try {
        const value = await run(queryId, controller.signal);
        clearTimeout(timeoutId);

        debug(
          `[ClickHouse ${label === "query" ? "Query" : "Command"}] Response metadata:`,
          {
            queryId,
            duration: `${Date.now() - startTime}ms`,
          }
        );

        return onSuccess(value);
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error instanceof Error ? error : new Error("Unknown error");
        lastErrorType = classifyClickHouseError(lastError);

        console.error(
          `[ClickHouse ${label === "query" ? "Query" : "Command"}] Failed (attempt ${attempt}/${finalMaxRetries}):`,
          {
            queryId,
            error: lastError.message,
            errorType: error?.constructor?.name,
            errorClassification: lastErrorType.type,
            errorDescription: lastErrorType.description,
            duration: `${Date.now() - startTime}ms`,
            stack: lastError.stack?.split("\n").slice(0, 5).join("\n"),
          }
        );

        logErrorGuidance(lastErrorType.type, finalTimeoutMs, fingerprint);

        if (isTransientError(lastErrorType.type) && attempt < finalMaxRetries) {
          const backoffMs = clickHouseBackoffMs(attempt);
          debug(
            `[ClickHouse ${label === "query" ? "Query" : "Command"}] Retrying in ${backoffMs}ms (transient error)...`,
            { queryId, errorType: lastErrorType.type }
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        } else if (!isTransientError(lastErrorType.type)) {
          console.error(
            "[ClickHouse Query] Non-retryable error encountered, aborting retries",
            {
              queryId,
              errorType: lastErrorType.type,
              errorDescription: lastErrorType.description,
            }
          );
          break;
        }
      }
      // NOTE: We do NOT close the client here to allow connection pooling and
      // Keep-Alive. The instance is reused across queries for performance.
    }

    console.error(
      `[ClickHouse ${label === "query" ? "Query" : "Command"}] All retries exhausted:`,
      {
        queryId,
        error: lastError?.message,
        errorType: lastErrorType?.type,
        errorDescription: lastErrorType?.description,
      }
    );

    return {
      success: false,
      data: [],
      error: `${lastErrorType?.type || "UNKNOWN"}: ${lastError?.message || "Unknown error after retries"}`,
    };
  }

  async function executeQuery(
    query: string,
    timeoutMs = requestTimeoutMs,
    maxRetries = DEFAULT_MAX_RETRIES
  ): Promise<QueryResult> {
    const client = await getClient();
    return runWithRetries(
      client,
      "query",
      async (queryId, signal) => {
        const resultSet = await client!.query({
          query,
          format: "JSONEachRow",
          abort_signal: signal,
          // Correlates this attempt with the server's `system.query_log` and
          // with every log line above. data-sync never sent one; it does now.
          query_id: queryId,
        });
        return resultSet.json();
      },
      (data) => {
        // ClickHouse JSONEachRow parses to an array of row objects.
        if (Array.isArray(data)) {
          debug("[ClickHouse Query] Success:", {
            rowCount: data.length,
            hasData: data.length > 0,
          });
          return { success: true, data: data as Record<string, unknown>[] };
        }
        debug("[ClickHouse Query] Success but no data returned");
        return { success: true, data: [] };
      },
      query,
      timeoutMs,
      maxRetries
    );
  }

  async function executeCommand(
    query: string,
    timeoutMs = requestTimeoutMs,
    maxRetries = DEFAULT_MAX_RETRIES
  ): Promise<QueryResult> {
    const client = await getClient();
    return runWithRetries(
      client,
      "command",
      async (queryId, signal) => {
        await client!.command({
          query,
          query_id: queryId,
          abort_signal: signal,
          clickhouse_settings: { wait_end_of_query: 1 },
        });
        return undefined;
      },
      () => {
        debug("[ClickHouse Command] Command executed successfully");
        return { success: true, data: [] };
      },
      query,
      timeoutMs,
      maxRetries
    );
  }

  async function insertJsonEachRow(
    table: string,
    rows: readonly string[],
    timeoutMs = requestTimeoutMs,
    maxRetries = DEFAULT_MAX_RETRIES
  ): Promise<QueryResult> {
    const client = await getClient();
    if (!client) {
      return {
        success: false,
        data: [],
        error: "ClickHouse client not available",
      };
    }
    if (rows.length === 0) {
      // An empty insert is a no-op, not an error. Callers batch, and a short
      // final batch is normal; making it fail would turn a clean pagination
      // tail into a sync failure.
      return { success: true, data: [] };
    }

    return runWithRetries(
      client,
      "insert",
      async (queryId, signal) => {
        await client!.insert({
          table,
          values: [...rows],
          format: "JSONEachRow",
          query_id: queryId,
          abort_signal: signal,
        });
      },
      () => {
        debug(
          `[ClickHouse Insert] Inserted ${rows.length} row(s) into ${table}`
        );
        return { success: true, data: [] };
      },
      `INSERT INTO ${table} FORMAT JSONEachRow (${rows.length} rows)`,
      timeoutMs,
      maxRetries
    );
  }

  async function executeStatements(statements: string[]): Promise<QueryResult> {
    if (!(await getClient())) {
      return {
        success: false,
        data: [],
        error: "ClickHouse client not available",
      };
    }

    try {
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (!trimmed) continue;

        debug("[ClickHouse Execute] Running statement:", trimmed.substring(0, 100));
        const result = await executeCommand(trimmed);
        if (!result.success) return result;
      }

      return { success: true, data: [] };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[ClickHouse Execute] Failed to execute statements:", errorMsg);
      return { success: false, data: [], error: errorMsg };
    }
  }

  async function testConnection(): Promise<ClickHouseConnectionTest> {
    debug("[ClickHouse Test] Testing connection...");

    const config = getConfig();
    if (!config) {
      return {
        success: false,
        message: "Missing required environment variables",
        details: {
          hasHost: !!readEnv("HOST"),
          hasUser: !!readEnv("USER"),
          hasPassword: !!readEnv("PASSWORD"),
          hasDatabase: !!readEnv("DATABASE"),
        },
      };
    }

    const client = await getClient();
    if (!client) {
      return {
        success: false,
        message: "Failed to create ClickHouse client",
        details: { config: { host: config.host, port: config.port } },
      };
    }

    try {
      const startTime = Date.now();
      const result = await client.query({
        query: "SELECT 1 as test, version() as version",
        format: "JSONEachRow",
        query_id: `q_ping_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      });

      const data = await result.json();
      const duration = Date.now() - startTime;
      const version =
        Array.isArray(data) && data[0]
          ? (data[0] as Record<string, unknown>).version
          : "unknown";

      debug("[ClickHouse Test] Connection successful:", {
        duration: `${duration}ms`,
        queryId: result.query_id,
        version,
      });

      return {
        success: true,
        message: `Connected successfully in ${duration}ms`,
        details: {
          host: config.host,
          port: config.port,
          database: config.database,
          protocol: config.protocol,
          queryId: result.query_id,
          version,
          duration: `${duration}ms`,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      const errorType = classifyClickHouseError(err);

      console.error("[ClickHouse Test] Connection failed:", {
        error: err.message,
        type: errorType.type,
        description: errorType.description,
      });

      return {
        success: false,
        message: `${errorType.type}: ${errorType.description}`,
        details: {
          host: config.host,
          port: config.port,
          error: err.message,
          errorType: errorType.type,
        },
      };
    }
  }

  async function ping(): Promise<boolean> {
    return (await testConnection()).success;
  }

  async function close(): Promise<void> {
    pending = null;
    if (!clientInstance) return;
    try {
      debug("[ClickHouse Client] Closing connection...");
      await clientInstance.close();
      clientInstance = null;
      debug("[ClickHouse Client] Connection closed successfully");
    } catch (error) {
      console.error("[ClickHouse Client] Error closing connection:", error);
    }
  }

  return {
    getConfig,
    getClient,
    executeQuery,
    executeCommand,
    insertJsonEachRow,
    executeStatements,
    testConnection,
    ping,
    close,
  };
}
