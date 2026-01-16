import { createClient } from "@clickhouse/client";
import type { ClickHouseConfig, QueryResult } from "../types";

/**
 * Detect protocol (HTTP/HTTPS) based on port number or explicit configuration
 */
function detectClickHouseProtocol(
  port: string,
  explicitProtocol?: string
): string {
  // Allow explicit protocol override via environment variable
  if (explicitProtocol) {
    return explicitProtocol.toLowerCase() === "https" ? "https" : "http";
  }

  // Auto-detect based on common HTTPS ports
  const portNumber = Number.parseInt(port, 10);
  const httsPorts = [443, 8443, 9440, 9000]; // Common ClickHouse HTTPS ports

  return httsPorts.includes(portNumber) ? "https" : "http";
}

/**
 * Get ClickHouse configuration from environment variables
 */
export function getClickHouseConfig(): ClickHouseConfig | null {
  const host = process.env.CLICKHOUSE_HOST;
  const port = process.env.CLICKHOUSE_PORT || "8123";
  const username = process.env.CLICKHOUSE_USER;
  const password = process.env.CLICKHOUSE_PASSWORD;
  const database = process.env.CLICKHOUSE_DATABASE;
  const explicitProtocol = process.env.CLICKHOUSE_PROTOCOL;

  // Debug logging for environment detection
  console.log("[ClickHouse Config] Environment check:", {
    hasHost: !!host,
    hasUsername: !!username,
    hasPassword: !!password,
    hasDatabase: !!database,
    port,
    protocol: explicitProtocol,
    nodeEnv: process.env.NODE_ENV,
    buildEnv: process.env.VERCEL
      ? "vercel"
      : process.env.CF_PAGES
        ? "cloudflare"
        : "local",
  });

  if (!host || !username || !password || !database) {
    const missing = [];
    if (!host) missing.push("CLICKHOUSE_HOST");
    if (!username) missing.push("CLICKHOUSE_USER");
    if (!password) missing.push("CLICKHOUSE_PASSWORD");
    if (!database) missing.push("CLICKHOUSE_DATABASE");

    console.error(
      "[ClickHouse Config] FATAL: Missing required environment variables:",
      missing.join(", ")
    );
    console.error(
      "[ClickHouse Config] ClickHouse will not be available. Please configure:",
      {
        host: host ? "SET" : "MISSING",
        username: username ? "SET" : "MISSING",
        password: password ? "SET" : "MISSING",
        database: database ? "MISSING - MUST BE SET" : "SET",
      }
    );
    return null;
  }

  const protocol = detectClickHouseProtocol(port, explicitProtocol);

  console.log("[ClickHouse Config] Configuration created:", {
    host,
    port,
    protocol,
    database,
  });

  return { host, port, username, password, database, protocol };
}

// Singleton client instance for connection pooling
let clientInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get ClickHouse client instance with error handling and connection pooling
 * Returns a singleton instance that reuses connections via Keep-Alive
 */
export function getClickHouseClient() {
  // Return existing client if available
  if (clientInstance) {
    return clientInstance;
  }

  const config = getClickHouseConfig();
  if (!config) {
    console.warn("[ClickHouse Client] No configuration available");
    return null;
  }

  try {
    // Use official URL format: protocol://username:password@host:port/database
    // This is the recommended approach per ClickHouse JS client docs
    const url = `${config.protocol}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    console.log(
      "[ClickHouse Client] Creating client with URL:",
      url.replace(/:([^:@]+)@/, ":***@")
    );

    clientInstance = createClient({
      url,
      request_timeout: 60000, // 60 second request timeout
      clickhouse_settings: {
        max_execution_time: 60,
        max_result_rows: "10000", // Prevent runaway queries
        max_memory_usage: "1G", // Limit memory usage
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
 * Classify error type for better debugging
 */
function classifyError(error: Error): {
  type:
    | "CONNECTION"
    | "AUTH"
    | "TIMEOUT"
    | "QUERY_ERROR"
    | "NO_DATA"
    | "UNKNOWN";
  description: string;
} {
  const message = error.message.toLowerCase();
  const name = error.name?.toLowerCase() || "";

  // Timeout errors
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

  // Authentication errors
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

  // Connection errors
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
      description: "Failed to connect to ClickHouse server",
    };
  }

  // Query syntax/execution errors
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
      description: "Query execution error - check SQL syntax or table/column names",
    };
  }

  return { type: "UNKNOWN", description: "Unknown error occurred" };
}

/**
 * Truncate query for logging (show first and last parts)
 */
function truncateQuery(query: string, maxLength = 500): string {
  const cleaned = query.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;

  const halfLength = Math.floor((maxLength - 20) / 2);
  return `${cleaned.slice(0, halfLength)} ... [truncated] ... ${cleaned.slice(-halfLength)}`;
}

/**
 * Execute ClickHouse query with retry logic and comprehensive error handling
 */
export async function executeClickHouseQuery(
  query: string,
  timeoutMs = 60000,
  maxRetries = 3
): Promise<QueryResult> {
  const queryId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log("[ClickHouse Query] Starting query execution:", {
    queryId,
    queryLength: query.length,
    timeout: timeoutMs,
    maxRetries,
  });

  // Log the actual SQL query for debugging
  console.log("[ClickHouse Query] SQL:", truncateQuery(query));

  const client = getClickHouseClient();

  if (!client) {
    console.error(
      "[ClickHouse Query] FATAL: Client not available - check environment variables"
    );
    console.error(
      "[ClickHouse Query] Query cannot execute without valid configuration"
    );
    console.error(
      "[ClickHouse Query] Ensure CLICKHOUSE_HOST, CLICKHOUSE_USER, CLICKHOUSE_PASSWORD, and CLICKHOUSE_DATABASE are set"
    );
    return {
      success: false,
      data: [],
      error:
        "ClickHouse client not available - missing required environment variables",
    };
  }

  let lastError: Error | null = null;
  let lastErrorType: ReturnType<typeof classifyError> | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[ClickHouse Query] Attempt ${attempt}/${maxRetries}`, {
      queryId,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[ClickHouse Query] Timeout triggered after ${timeoutMs}ms`, {
        queryId,
        attempt,
      });
      controller.abort();
    }, timeoutMs);

    const startTime = Date.now();

    try {
      const resultSet = await client.query({
        query,
        format: "JSONEachRow",
        abort_signal: controller.signal,
        query_id: queryId,
      });

      clearTimeout(timeoutId);
      const queryDuration = Date.now() - startTime;

      // Log response metadata for debugging
      console.log("[ClickHouse Query] Response metadata:", {
        queryId: resultSet.query_id,
        responseQueryId: resultSet.query_id,
        duration: `${queryDuration}ms`,
      });

      console.log("[ClickHouse Query] Query executed, parsing result...");

      const data = await resultSet.json();

      // ClickHouse JSONEachRow format returns array of objects
      if (Array.isArray(data)) {
        console.log("[ClickHouse Query] Success:", {
          queryId,
          rowCount: data.length,
          hasData: data.length > 0,
          duration: `${Date.now() - startTime}ms`,
        });
        return {
          success: true,
          data: data as Record<string, unknown>[],
        };
      }

      console.log("[ClickHouse Query] Success but no data returned", {
        queryId,
      });
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const queryDuration = Date.now() - startTime;
      lastError = error instanceof Error ? error : new Error("Unknown error");
      lastErrorType = classifyError(lastError);

      console.error(
        `[ClickHouse Query] Failed (attempt ${attempt}/${maxRetries}):`,
        {
          queryId,
          error: lastError.message,
          errorType: error?.constructor?.name,
          errorClassification: lastErrorType.type,
          errorDescription: lastErrorType.description,
          duration: `${queryDuration}ms`,
          stack: lastError.stack?.split("\n").slice(0, 5).join("\n"),
        }
      );

      // Provide specific guidance based on error type
      if (lastErrorType.type === "AUTH") {
        console.error(
          "[ClickHouse Query] AUTH ERROR: Check CLICKHOUSE_USER and CLICKHOUSE_PASSWORD"
        );
      } else if (lastErrorType.type === "CONNECTION") {
        console.error(
          "[ClickHouse Query] CONNECTION ERROR: Check CLICKHOUSE_HOST, CLICKHOUSE_PORT, and network connectivity"
        );
      } else if (lastErrorType.type === "TIMEOUT") {
        console.error(
          `[ClickHouse Query] TIMEOUT ERROR: Query exceeded ${timeoutMs}ms limit. Consider increasing timeout or optimizing query.`
        );
      } else if (lastErrorType.type === "QUERY_ERROR") {
        console.error(
          "[ClickHouse Query] QUERY ERROR: Check SQL syntax and ensure table/columns exist"
        );
        console.error("[ClickHouse Query] Problematic query:", query);
      }

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = 2 ** (attempt - 1) * 1000;
        console.log(`[ClickHouse Query] Retrying in ${backoffMs}ms...`, {
          queryId,
        });
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
    // NOTE: We do NOT close the client here to allow connection pooling and Keep-Alive
    // The client instance is reused across queries for better performance
  }

  // All retries failed
  console.error("[ClickHouse Query] All retries exhausted:", {
    queryId,
    error: lastError?.message,
    errorType: lastErrorType?.type,
    errorDescription: lastErrorType?.description,
  });

  return {
    success: false,
    data: [],
    error: `${lastErrorType?.type || "UNKNOWN"}: ${lastError?.message || "Unknown error after retries"}`,
  };
}

/**
 * Test ClickHouse connection and return diagnostic information
 */
export async function testClickHouseConnection(): Promise<{
  success: boolean;
  message: string;
  details: Record<string, unknown>;
}> {
  console.log("[ClickHouse Test] Testing connection...");

  const config = getClickHouseConfig();
  if (!config) {
    return {
      success: false,
      message: "Missing required environment variables",
      details: {
        hasHost: !!process.env.CLICKHOUSE_HOST,
        hasUser: !!process.env.CLICKHOUSE_USER,
        hasPassword: !!process.env.CLICKHOUSE_PASSWORD,
        hasDatabase: !!process.env.CLICKHOUSE_DATABASE,
      },
    };
  }

  const client = getClickHouseClient();
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
    });

    const data = await result.json();
    const duration = Date.now() - startTime;

    const version =
      Array.isArray(data) && data[0]
        ? (data[0] as Record<string, unknown>).version
        : "unknown";

    console.log("[ClickHouse Test] Connection successful:", {
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
    const errorType = classifyError(err);

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

/**
 * Execute query and return data array (backward compatibility)
 */
export async function executeClickHouseQueryLegacy(
  query: string
): Promise<Record<string, unknown>[]> {
  const result = await executeClickHouseQuery(query);

  if (!result.success && result.error) {
    console.error("[ClickHouse Query Legacy] Query failed:", result.error);
  }

  if (result.data.length === 0 && !result.success) {
    console.warn(
      "[ClickHouse Query Legacy] Returning empty array due to failure"
    );
  }

  return result.data;
}

/**
 * Close the ClickHouse client connection (for graceful shutdown)
 * Should only be called when the application is shutting down
 */
export async function closeClickHouseClient(): Promise<void> {
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
