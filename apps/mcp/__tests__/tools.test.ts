import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Env } from "../src/types";

const mockEnv: Env = {
  MCP_AGENT: {} as DurableObjectNamespace,
  CLICKHOUSE_HOST: "http://localhost:8123",
  CLICKHOUSE_USER: "default",
  CLICKHOUSE_PASSWORD: "secret",
  CLICKHOUSE_DATABASE: "analytics",
  MCP_AUTH_TOKEN: "test-token",
};

type ToolHandler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

function createMockServer() {
  const tools: Record<string, { description: string; handler: ToolHandler }> =
    {};
  const server = {
    tool: vi.fn(
      (
        name: string,
        description: string,
        _schema: unknown,
        handler: ToolHandler,
      ) => {
        tools[name] = { description, handler };
      },
    ),
  } as unknown as McpServer;
  return { server, tools };
}

function mockClient(queryResult = { data: [] as Record<string, unknown>[], rows: 0 }) {
  return {
    createClickHouseClient: () => ({
      query: vi.fn().mockResolvedValue(queryResult),
      ping: vi.fn().mockResolvedValue(true),
    }),
  };
}

describe("registerAllTools", () => {
  beforeEach(() => vi.resetModules());

  it("registers all expected tools", async () => {
    vi.doMock("../src/clickhouse/client", () => mockClient());

    const { registerAllTools } = await import("../src/tools/index");
    const { server, tools } = createMockServer();
    registerAllTools(server, mockEnv);

    const names = Object.keys(tools);
    expect(names).toContain("table_stats");
    expect(names).toContain("data_freshness");
    expect(names).toContain("sync_status");
    expect(names).toContain("migration_status");
    expect(names).toContain("retention_status");
    expect(names).toContain("system_info");
    expect(names).toContain("clickhouse_ping");
    expect(names.length).toBeGreaterThanOrEqual(7);
  });
});

describe("table_stats tool", () => {
  beforeEach(() => vi.resetModules());

  it("returns formatted table data", async () => {
    const data = [
      { table: "monorepo_wakatime", rows: "1000", size: "200 KiB", engine: "MergeTree" },
    ];
    vi.doMock("../src/clickhouse/client", () => mockClient({ data, rows: 1 }));

    const { registerAllTools } = await import("../src/tools/index");
    const { server, tools } = createMockServer();
    registerAllTools(server, mockEnv);

    const result = await tools.table_stats.handler({ tables: undefined });
    expect(result.content[0].text).toContain("monorepo_wakatime");
    expect(result.content[0].text).toContain("1 tables");
  });
});

describe("clickhouse_ping tool", () => {
  beforeEach(() => vi.resetModules());

  it("returns OK on success", async () => {
    vi.doMock("../src/clickhouse/client", () => mockClient());

    const { registerAllTools } = await import("../src/tools/index");
    const { server, tools } = createMockServer();
    registerAllTools(server, mockEnv);

    const result = await tools.clickhouse_ping.handler({});
    expect(result.content[0].text).toContain("OK");
  });

  it("returns FAILED on failure", async () => {
    vi.doMock("../src/clickhouse/client", () => ({
      createClickHouseClient: () => ({
        query: vi.fn().mockResolvedValue({ data: [], rows: 0 }),
        ping: vi.fn().mockResolvedValue(false),
      }),
    }));

    const { registerAllTools } = await import("../src/tools/index");
    const { server, tools } = createMockServer();
    registerAllTools(server, mockEnv);

    const result = await tools.clickhouse_ping.handler({});
    expect(result.content[0].text).toContain("FAILED");
  });
});
