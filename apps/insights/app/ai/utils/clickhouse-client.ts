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
 * Execute ClickHouse query with retry logic and comprehensive error handling
 */
export async function executeClickHouseQuery(
  query: string,
  timeoutMs = 60000,
  maxRetries = 3
): Promise<QueryResult> {
  console.log("[ClickHouse Query] Starting query execution:", {
    queryLength: query.length,
    timeout: timeoutMs,
    maxRetries,
  });

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

  // Retry logic with exponential backoff
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

      // ClickHouse JSONEachRow format returns array of objects
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
          stack: lastError.stack?.split("\n").slice(0, 3).join("\n"),
        }
      );

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = 2 ** (attempt - 1) * 1000;
        console.log(`[ClickHouse Query] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
    // NOTE: We do NOT close the client here to allow connection pooling and Keep-Alive
    // The client instance is reused across queries for better performance
  }

  // All retries failed
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
