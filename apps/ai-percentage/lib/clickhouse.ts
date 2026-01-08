import { createClient, type ClickHouseClient } from "@clickhouse/client";

let clientInstance: ClickHouseClient | null = null;

export function getClient(): ClickHouseClient | null {
  if (clientInstance) {
    return clientInstance;
  }

  const host = process.env.CLICKHOUSE_HOST;
  const password = process.env.CLICKHOUSE_PASSWORD;

  if (!host || !password) {
    return null;
  }

  clientInstance = createClient({
    host: `https://${host}`,
    password,
    database: "default",
  });

  return clientInstance;
}

export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

export async function executeQuery(
  query: string,
  timeoutMs = 60000,
  maxRetries = 3
): Promise<QueryResult> {
  const client = getClient();

  if (!client) {
    return {
      success: false,
      data: [],
      error: "ClickHouse client not available",
    };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resultSet = await client.query({
        query,
        format: "JSONEachRow",
      });

      const data = await resultSet.json();

      if (Array.isArray(data)) {
        return {
          success: true,
          data: data as Record<string, unknown>[],
        };
      }

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      if (attempt === maxRetries) {
        return {
          success: false,
          data: [],
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    data: [],
    error: "All retries failed",
  };
}
