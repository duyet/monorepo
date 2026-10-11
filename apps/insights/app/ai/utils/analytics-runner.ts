/**
 * Query execution for the analytics fetchers: ClickHouse first, DuckDB cache
 * as the fallback, plus the ClickHouse health/ping probes.
 */
async function executeServerClickHouseQuery(
  query: string,
  timeoutMs: number,
  maxRetries: number
) {
  if (!import.meta.env.SSR) {
    return { success: false, data: [], error: "ClickHouse is server-only" };
  }

  const { executeClickHouseQuery } = await import("./database");
  return executeClickHouseQuery(query, timeoutMs, maxRetries);
}

async function testServerClickHouseConnection() {
  if (!import.meta.env.SSR) {
    return {
      success: false,
      message: "ClickHouse health check is server-only",
      details: {},
    };
  }

  const { testClickHouseConnection } = await import("./database");
  return testClickHouseConnection();
}

async function executeDuckDBCacheQuery(
  query: string
): Promise<Record<string, unknown>[]> {
  if (!import.meta.env.SSR) {
    return [];
  }

  const { executeDuckDBQuery } = await import("./duckdb-cache");
  return executeDuckDBQuery(query);
}

let hasLoggedDuckDBCacheFallback = false;
let clickHouseUnavailable = false;

const CLICKHOUSE_FALLBACK_TIMEOUT_MS = 5_000;

export async function executeAnalyticsQuery(
  clickHouseQuery: string,
  duckDBQuery = clickHouseQuery
): Promise<Record<string, unknown>[]> {
  let results: Record<string, unknown>[] = [];

  if (!clickHouseUnavailable) {
    try {
      const result = await executeServerClickHouseQuery(
        clickHouseQuery,
        CLICKHOUSE_FALLBACK_TIMEOUT_MS,
        1
      );
      results = result.data;
      if (!result.success) {
        clickHouseUnavailable = true;
      }
    } catch (error) {
      console.warn(
        "[CCUsage] ClickHouse query failed, trying DuckDB cache:",
        error instanceof Error ? error.message : error
      );
      clickHouseUnavailable = true;
    }
  }

  if (results.length > 0) {
    return results;
  }

  const cacheResults = await executeDuckDBCacheQuery(duckDBQuery);
  if (cacheResults.length > 0 && !hasLoggedDuckDBCacheFallback) {
    console.log("[CCUsage] Using DuckDB cache fallback");
    hasLoggedDuckDBCacheFallback = true;
  }
  return cacheResults;
}

// Single in-flight promise prevents concurrent callers from running duplicate checks
let healthCheckPromise: Promise<boolean> | null = null;

/**
 * Quick health check with 10 second timeout to verify ClickHouse connectivity
 * Runs only once per build; concurrent callers share the same in-flight promise.
 */
export function checkClickHouseHealth(): Promise<boolean> {
  if (healthCheckPromise !== null) {
    return healthCheckPromise;
  }

  healthCheckPromise = (async () => {
    const startTime = Date.now();

    try {
      const result = await testServerClickHouseConnection();

      if (!result.success) {
        console.error("[ClickHouse Health] ✗ Connection failed:", {
          duration: `${Date.now() - startTime}ms`,
          message: result.message,
          details: result.details,
        });
      }

      return result.success;
    } catch (error) {
      console.error("[ClickHouse Health] ✗ Health check threw error:", {
        duration: `${Date.now() - startTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return false;
    }
  })();

  return healthCheckPromise;
}

/**
 * Quick ping test - runs SELECT 1 with 10 second timeout
 * Returns true if ClickHouse responds, false otherwise
 */
export async function pingClickHouse(): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const result = await executeServerClickHouseQuery(
      "SELECT 1 as ping, now() as server_time",
      10000, // 10 second timeout for ping
      1 // Only 1 attempt for ping
    );

    const latencyMs = Date.now() - startTime;

    if (result.success && result.data.length > 0) {
      return { success: true, latencyMs };
    }

    console.error("[ClickHouse Ping] ✗ No response:", {
      latencyMs,
      error: result.error,
    });
    return { success: false, latencyMs, error: result.error };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    console.error("[ClickHouse Ping] ✗ Ping failed:", {
      latencyMs,
      error: errorMsg,
    });
    return { success: false, latencyMs, error: errorMsg };
  }
}
