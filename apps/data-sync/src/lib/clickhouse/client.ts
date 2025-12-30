import { createClient } from "@clickhouse/client";
import type { ClickHouseClient } from "@clickhouse/client";

/**
 * ClickHouse configuration interface
 */
export interface ClickHouseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  protocol: string;
  database?: string;
}

/**
 * Query result interface
 */
export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

/**
 * Detect protocol (HTTP/HTTPS) based on port number or explicit configuration
 */
function detectClickHouseProtocol(
  port: string,
  explicitProtocol?: string
): string {
  if (explicitProtocol) {
    return explicitProtocol.toLowerCase() === "https" ? "https" : "http";
  }

  // Auto-detect based on common HTTPS ports
  const portNumber = Number.parseInt(port, 10);
  const httsPorts = [443, 8443, 9440, 9000];

  return httsPorts.includes(portNumber) ? "https" : "http";
}

/**
 * Get ClickHouse configuration from environment variables
 */
export function getClickHouseConfig(): ClickHouseConfig | null {
  // Support both CH_* and CLICKHOUSE_* naming conventions
  const host = process.env.CH_HOST || process.env.CLICKHOUSE_HOST;
  const port = process.env.CH_PORT || process.env.CLICKHOUSE_PORT || "8123";
  const user = process.env.CH_USER || process.env.CLICKHOUSE_USER || "default";
  const password = process.env.CH_PASSWORD || process.env.CLICKHOUSE_PASSWORD;
  const database = process.env.CH_DATABASE || process.env.CLICKHOUSE_DATABASE;
  const explicitProtocol =
    process.env.CH_PROTOCOL || process.env.CLICKHOUSE_PROTOCOL;

  console.log("[ClickHouse Config] Environment check:", {
    hasHost: !!host,
    hasPassword: !!password,
    hasDatabase: !!database,
    port,
    protocol: explicitProtocol,
  });

  if (!host || !password) {
    const missing = [];
    if (!host) missing.push("CH_HOST/CLICKHOUSE_HOST");
    if (!password) missing.push("CH_PASSWORD/CLICKHOUSE_PASSWORD");

    console.error(
      "[ClickHouse Config] FATAL: Missing required environment variables:",
      missing.join(", ")
    );
    return null;
  }

  const protocol = detectClickHouseProtocol(port, explicitProtocol);

  console.log("[ClickHouse Config] Configuration created:", {
    host,
    port,
    protocol,
    database: database || "default",
  });

  return { host, port, user, password, database, protocol };
}

// Singleton client instance for connection pooling
let clientInstance: ClickHouseClient | null = null;

/**
 * Get ClickHouse client instance with connection pooling
 * Returns a singleton instance that reuses connections via Keep-Alive
 */
export function getClient(): ClickHouseClient | null {
  if (clientInstance) {
    return clientInstance;
  }

  const config = getClickHouseConfig();
  if (!config) {
    console.warn("[ClickHouse Client] No configuration available");
    return null;
  }

  try {
    // Use official URL format: protocol://user:password@host:port/database
    const url = `${config.protocol}://${config.user}:${config.password}@${config.host}:${config.port}${config.database ? `/${config.database}` : ""}`;

    console.log(
      "[ClickHouse Client] Creating client with URL:",
      url.replace(/:([^:@]+)@/, ":***@")
    );

    clientInstance = createClient({
      url,
      request_timeout: 60000,
      clickhouse_settings: {
        max_execution_time: 60,
        max_result_rows: "100000",
        max_memory_usage: "2G",
      },
    });

    console.log(
      "[ClickHouse Client] Client created successfully with connection pooling enabled"
    );
    return clientInstance;
  } catch (error) {
    console.error("[ClickHouse Client] Failed to create client:", error);
    return null;
  }
}

/**
 * Test ClickHouse connection by executing a simple ping query
 */
export async function ping(): Promise<boolean> {
  const client = getClient();
  if (!client) {
    console.error("[ClickHouse Ping] Client not available");
    return false;
  }

  try {
    console.log("[ClickHouse Ping] Testing connection...");
    const result = await client.query({
      query: "SELECT 1 as ping",
      format: "JSONEachRow",
    });

    const data = await result.json();
    const success = Array.isArray(data) && data.length > 0;

    console.log(
      "[ClickHouse Ping] Connection test:",
      success ? "SUCCESS" : "FAILED"
    );
    return success;
  } catch (error) {
    console.error("[ClickHouse Ping] Connection test failed:", error);
    return false;
  }
}

/**
 * Execute ClickHouse query with retry logic and error handling
 */
export async function executeQuery(
  query: string,
  timeoutMs = 60000,
  maxRetries = 3
): Promise<QueryResult> {
  console.log("[ClickHouse Query] Starting query execution:", {
    queryLength: query.length,
    timeout: timeoutMs,
    maxRetries,
  });

  const client = getClient();

  if (!client) {
    console.error("[ClickHouse Query] FATAL: Client not available");
    return {
      success: false,
      data: [],
      error:
        "ClickHouse client not available - missing required environment variables",
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[ClickHouse Query] Attempt ${attempt}/${maxRetries}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resultSet = await client.query({
        query,
        format: "JSONEachRow",
        abort_signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[ClickHouse Query] Query executed, parsing result...");

      const data = await resultSet.json();

      if (Array.isArray(data)) {
        console.log("[ClickHouse Query] Success:", {
          rowCount: data.length,
          hasData: data.length > 0,
        });
        return {
          success: true,
          data: data as Record<string, unknown>[],
        };
      }

      console.log("[ClickHouse Query] Success but no data returned");
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error("Unknown error");

      console.error(
        `[ClickHouse Query] Failed (attempt ${attempt}/${maxRetries}):`,
        {
          error: lastError.message,
          errorType: error?.constructor?.name,
        }
      );

      if (attempt < maxRetries) {
        const backoffMs = 2 ** (attempt - 1) * 1000;
        console.log(`[ClickHouse Query] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  console.error(
    "[ClickHouse Query] All retries exhausted:",
    lastError?.message
  );
  return {
    success: false,
    data: [],
    error: lastError?.message || "Unknown error after retries",
  };
}

/**
 * Execute a command (INSERT, CREATE, DROP, etc.) that doesn't return data
 * Uses client.command() which is appropriate for non-SELECT statements
 */
export async function executeCommand(
  query: string,
  timeoutMs = 60000,
  maxRetries = 3
): Promise<QueryResult> {
  console.log("[ClickHouse Command] Starting command execution:", {
    queryLength: query.length,
    timeout: timeoutMs,
  });

  const client = getClient();
  if (!client) {
    return {
      success: false,
      data: [],
      error: "ClickHouse client not available",
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[ClickHouse Command] Attempt ${attempt}/${maxRetries}`);

    try {
      await client.command({
        query,
        clickhouse_settings: {
          wait_end_of_query: 1,
        },
      });

      console.log("[ClickHouse Command] Command executed successfully");
      return { success: true, data: [] };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      console.error(
        `[ClickHouse Command] Failed (attempt ${attempt}/${maxRetries}):`,
        { error: lastError.message }
      );

      if (attempt < maxRetries) {
        const backoffMs = 2 ** (attempt - 1) * 1000;
        console.log(`[ClickHouse Command] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  console.error(
    "[ClickHouse Command] All retries exhausted:",
    lastError?.message
  );
  return {
    success: false,
    data: [],
    error: lastError?.message || "Unknown error",
  };
}

/**
 * Execute multiple statements (for migrations)
 */
export async function executeStatements(
  statements: string[]
): Promise<QueryResult> {
  const client = getClient();
  if (!client) {
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

      console.log(
        "[ClickHouse Execute] Running statement:",
        trimmed.substring(0, 100)
      );
      // Use executeCommand for non-SELECT statements
      const result = await executeCommand(trimmed);

      if (!result.success) {
        return result;
      }
    }

    return { success: true, data: [] };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(
      "[ClickHouse Execute] Failed to execute statements:",
      errorMsg
    );
    return {
      success: false,
      data: [],
      error: errorMsg,
    };
  }
}

/**
 * Close the ClickHouse client connection (for graceful shutdown)
 */
export async function closeClient(): Promise<void> {
  if (clientInstance) {
    try {
      console.log("[ClickHouse Client] Closing connection...");
      await clientInstance.close();
      clientInstance = null;
      console.log("[ClickHouse Client] Connection closed successfully");
    } catch (error) {
      console.error("[ClickHouse Client] Error closing connection:", error);
    }
  }
}
