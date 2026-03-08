/**
 * Worker environment bindings
 */
export interface Env {
  // Durable Object binding for McpAgent
  MCP_AGENT: DurableObjectNamespace;

  // ClickHouse connection secrets
  CLICKHOUSE_HOST: string;
  CLICKHOUSE_USER: string;
  CLICKHOUSE_PASSWORD: string;
  CLICKHOUSE_DATABASE: string;

  // Auth
  MCP_AUTH_TOKEN: string;

  // Informational
  ENVIRONMENT?: string;
}

/**
 * ClickHouse query result row
 */
export type Row = Record<string, unknown>;

/**
 * Result returned from ClickHouse queries
 */
export interface QueryResult {
  data: Row[];
  rows: number;
  statistics?: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}
