import { type ClickHouseClient, createClient } from "@clickhouse/client";

interface ClickHouseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
  protocol: string;
}

/**
 * Get ClickHouse configuration from environment variables.
 * Returns null if required config is missing.
 */
function getConfig(): ClickHouseConfig | null {
  const host = process.env.CLICKHOUSE_HOST;
  const port = process.env.CLICKHOUSE_PORT || "8123";
  const user = process.env.CLICKHOUSE_USER || "default";
  const password = process.env.CLICKHOUSE_PASSWORD;
  const database = process.env.CLICKHOUSE_DATABASE;

  // Auto-detect protocol from port (443, 8443, 9440 = https)
  const protocol =
    process.env.CLICKHOUSE_PROTOCOL ||
    (["443", "8443", "9440"].includes(port) ? "https" : "http");

  if (!host || !password || !database) {
    return null;
  }

  return { host, port, user, password, database, protocol };
}

let client: ClickHouseClient | null = null;
let configChecked = false;

/**
 * Get the ClickHouse client singleton.
 * Returns null if configuration is missing.
 */
export function getClickHouseClient(): ClickHouseClient | null {
  if (client) return client;

  const config = getConfig();
  if (!config) {
    if (!configChecked) {
      console.warn(
        "[Photos ClickHouse] Missing required config (CLICKHOUSE_HOST, CLICKHOUSE_PASSWORD, CLICKHOUSE_DATABASE)"
      );
      configChecked = true;
    }
    return null;
  }

  try {
    const url = `${config.protocol}://${config.host}:${config.port}`;

    client = createClient({
      url,
      username: config.user,
      password: config.password,
      database: config.database,
      request_timeout: 15000,
      clickhouse_settings: {
        max_execution_time: 30,
        max_result_rows: "1000",
      },
    });

    return client;
  } catch (error) {
    console.error("[Photos ClickHouse] Failed to create client:", error);
    return null;
  }
}

const QUERY_TIMEOUT_MS = 10_000; // 10s timeout for ClickHouse queries

/**
 * Execute a ClickHouse query and return typed results.
 * Returns empty array if client is unavailable, query fails, or times out.
 */
export async function executeQuery<T>(query: string): Promise<T[]> {
  const clickhouse = getClickHouseClient();
  if (!clickhouse) {
    return [];
  }

  try {
    let timer: ReturnType<typeof setTimeout>;

    const queryPromise = async () => {
      const result = await clickhouse.query({
        query,
        format: "JSONEachRow",
      });
      const data = await result.json();
      return (Array.isArray(data) ? data : []) as T[];
    };

    const timeoutPromise = new Promise<T[]>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("ClickHouse query timed out")),
        QUERY_TIMEOUT_MS
      );
    });

    try {
      return await Promise.race([queryPromise(), timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  } catch (error) {
    console.error("[Photos ClickHouse] Query failed:", error);
    return [];
  }
}

/**
 * Check if ClickHouse is available and configured.
 */
export function isClickHouseConfigured(): boolean {
  return getConfig() !== null;
}
