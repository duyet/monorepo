/**
 * Tool registry — registers all MCP tools on the given server instance.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../types";
import { registerClickHouseTools } from "./clickhouse";

export function registerAllTools(server: McpServer, env: Env): void {
  registerClickHouseTools(server, env);
}
