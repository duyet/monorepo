/**
 * Cloudflare Worker MCP server for duyet.net
 *
 * Exposes ClickHouse analytics tools via the Model Context Protocol (MCP).
 * Uses McpAgent from the `agents` package for Durable Object state management
 * and McpServer from @modelcontextprotocol/sdk for tool registration.
 */

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { authMiddleware } from "./auth";
import { registerAllTools } from "./tools/index";
import type { Env } from "./types";

// ── MCP Agent (Durable Object) ────────────────────────────────────────────────

export class DuyetMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: "duyet-mcp",
    version: "0.1.0",
  });

  async init(): Promise<void> {
    registerAllTools(this.server, this.env);
  }
}

// ── HTTP Router ───────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

// Health / info endpoint — no auth required
app.get("/", (c) => {
  return c.json({
    name: "duyet-mcp",
    version: "0.1.0",
    description: "MCP server exposing ClickHouse analytics for duyet.net",
    environment: c.env.ENVIRONMENT ?? "unknown",
    endpoints: {
      mcp: "/mcp",
      health: "/",
    },
    docs: "https://github.com/duyet/monorepo/tree/master/apps/mcp",
  });
});

// MCP endpoint — requires Bearer token
app.use("/mcp/*", authMiddleware);
app.all("/mcp/*", (c) => {
  return DuyetMcpAgent.serve("/mcp").fetch(c.req.raw, c.env, c.executionCtx);
});

// ── Worker export ─────────────────────────────────────────────────────────────

export default app;
