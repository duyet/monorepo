# CLAUDE.md - MCP Server

Cloudflare Worker exposing ClickHouse analytics data via the Model Context Protocol (MCP).

## What this is

A stateful MCP server built on `McpAgent` (Cloudflare Agents SDK + Durable Objects) that gives
AI assistants structured access to the monorepo's ClickHouse analytics database.

- **Live**: https://mcp.duyet.net
- **Protocol**: MCP over HTTP (streamable HTTP transport)
- **Auth**: Bearer token (`MCP_AUTH_TOKEN`)

## Dev / deploy

```bash
# Install deps (from monorepo root)
bun install

# Local dev (Wrangler dev mode)
cd apps/mcp && bun run dev

# Type-check
bun run check-types

# Run tests
bun run test

# Deploy to Cloudflare (production)
bun run cf:deploy:prod
```

## Project structure

```
apps/mcp/
├── src/
│   ├── index.ts              # Worker entry point + Hono router + McpAgent export
│   ├── auth.ts               # Bearer token middleware
│   ├── types.ts              # Env bindings interface
│   ├── clickhouse/
│   │   ├── client.ts         # Fetch-based HTTP client (read-only enforced)
│   │   └── queries.ts        # Pre-built SQL query templates
│   └── tools/
│       ├── index.ts          # registerAllTools()
│       └── clickhouse.ts     # MCP tool definitions
└── __tests__/
    └── client.test.ts        # Unit tests (vitest)
```

## Environment variables / secrets

Set secrets via `wrangler secret put <KEY>`:

| Secret | Description |
|---|---|
| `CLICKHOUSE_HOST` | ClickHouse hostname or full HTTPS URL |
| `CLICKHOUSE_USER` | ClickHouse username |
| `CLICKHOUSE_PASSWORD` | ClickHouse password |
| `CLICKHOUSE_DATABASE` | Target database name |
| `MCP_AUTH_TOKEN` | Shared Bearer token for MCP clients |

## Available MCP tools

| Tool | Description |
|---|---|
| `clickhouse_ping` | Verify connectivity to ClickHouse |
| `table_stats` | Row counts + size per table |
| `data_freshness` | Latest synced_at per monorepo_* table |
| `sync_status` | Sync record counts per source (last N days) |
| `migration_status` | List applied migrations |
| `retention_status` | Partition-level size and row counts |
| `system_info` | ClickHouse version, uptime, timezone |

## Adding a new tool

1. Add a query template function to `src/clickhouse/queries.ts`
2. Register the tool in `src/tools/clickhouse.ts` using `server.tool(...)`
3. Add unit tests in `__tests__/`

## Key constraints

- All ClickHouse queries are validated read-only before execution
  (only SELECT / SHOW / DESCRIBE / EXPLAIN / WITH are allowed).
- The ClickHouse client uses ClickHouse's HTTP interface (POST with SQL body),
  not Node TCP sockets — required for Workers compatibility.
- Auth is required for all `/mcp/*` routes; the `/` health endpoint is public.
