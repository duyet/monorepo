/**
 * MCP tools that expose ClickHouse data-sync status and analytics.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createClickHouseClient } from "../clickhouse/client";
import {
  buildUserQuery,
  dataFreshnessQuery,
  migrationStatusQuery,
  retentionStatusQuery,
  syncStatusQuery,
  systemInfoQuery,
  tableStatsQuery,
} from "../clickhouse/queries";
import type { Env } from "../types";

function formatRows(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "(no rows returned)";
  const keys = Object.keys(rows[0]);
  const header = keys.join("\t");
  const divider = keys.map((k) => "-".repeat(k.length)).join("\t");
  const body = rows.map((row) => keys.map((k) => String(row[k] ?? "")).join("\t")).join("\n");
  return `${header}\n${divider}\n${body}`;
}

export function registerClickHouseTools(server: McpServer, env: Env): void {
  const ch = createClickHouseClient(env);

  // ── execute_query ─────────────────────────────────────────────────────────
  server.tool(
    "execute_query",
    "Run a read-only SQL query against ClickHouse (SELECT / SHOW / DESCRIBE / EXPLAIN / WITH).",
    {
      query: z
        .string()
        .describe(
          "SQL query to execute. Must be a read-only statement (SELECT, SHOW, DESCRIBE, EXPLAIN, or WITH)."
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10_000)
        .optional()
        .default(100)
        .describe("Maximum number of rows to return (default 100, max 10 000)."),
    },
    async ({ query, limit }) => {
      try {
        const sql = buildUserQuery(query, limit);
        const result = await ch.query(sql);
        return {
          content: [
            {
              type: "text",
              text: `Query returned ${result.rows} row(s):\n\n${formatRows(result.data)}`,
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // ── table_stats ───────────────────────────────────────────────────────────
  server.tool(
    "table_stats",
    "Return row counts, size, and engine for ClickHouse tables in the current database.",
    {
      tables: z
        .array(z.string())
        .optional()
        .describe("Optional list of table names to filter. Omit for all."),
    },
    async ({ tables }) => {
      const result = await ch.query(tableStatsQuery(tables));
      return {
        content: [
          {
            type: "text",
            text: `Table statistics (${result.rows} tables):\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── data_freshness ────────────────────────────────────────────────────────
  server.tool(
    "data_freshness",
    "Show the most recent synced_at value per monorepo_* table to detect stale data.",
    {},
    async () => {
      const result = await ch.query(dataFreshnessQuery());
      return {
        content: [
          {
            type: "text",
            text: `Data freshness (${result.rows} tables):\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── sync_status ───────────────────────────────────────────────────────────
  server.tool(
    "sync_status",
    "Summarise sync record counts per source over the past N days.",
    {
      source: z
        .string()
        .optional()
        .describe(
          "Optional source name, e.g. 'wakatime', 'github', 'cloudflare', 'posthog', 'unsplash'."
        ),
      days: z
        .number()
        .int()
        .min(1)
        .max(90)
        .optional()
        .default(7)
        .describe("Lookback window in days (default 7, max 90)."),
    },
    async ({ source, days }) => {
      const result = await ch.query(syncStatusQuery(source, days));
      return {
        content: [
          {
            type: "text",
            text: `Sync status – last ${days} days (${result.rows} rows):\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── migration_status ──────────────────────────────────────────────────────
  server.tool(
    "migration_status",
    "List applied ClickHouse migrations from the monorepo_migrations table.",
    {},
    async () => {
      const result = await ch.query(migrationStatusQuery());
      return {
        content: [
          {
            type: "text",
            text: `Applied migrations (${result.rows}):\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── retention_status ──────────────────────────────────────────────────────
  server.tool(
    "retention_status",
    "Show partition-level size and row counts to understand data retention.",
    {},
    async () => {
      const result = await ch.query(retentionStatusQuery());
      return {
        content: [
          {
            type: "text",
            text: `Retention status (${result.rows} tables):\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── system_info ───────────────────────────────────────────────────────────
  server.tool(
    "system_info",
    "Return ClickHouse server version, uptime, timezone, and memory settings.",
    {},
    async () => {
      const result = await ch.query(systemInfoQuery());
      return {
        content: [
          {
            type: "text",
            text: `System info:\n\n${formatRows(result.data)}`,
          },
        ],
      };
    }
  );

  // ── clickhouse_ping ───────────────────────────────────────────────────────
  server.tool(
    "clickhouse_ping",
    "Ping the ClickHouse server to verify connectivity from the MCP worker.",
    {},
    async () => {
      const ok = await ch.ping();
      return {
        content: [
          {
            type: "text",
            text: ok
              ? "ClickHouse ping: OK"
              : "ClickHouse ping: FAILED — check CLICKHOUSE_HOST and credentials.",
          },
        ],
      };
    }
  );
}
