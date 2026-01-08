import { describe, expect, beforeEach, afterEach, test } from "bun:test";

describe("ClickHouse Config", () => {
  beforeEach(() => {
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CLICKHOUSE_PORT = "8124";
    process.env.CLICKHOUSE_USER = "testuser";
    process.env.CLICKHOUSE_PASSWORD = "testpass";
    process.env.CLICKHOUSE_DATABASE = "testdb";
  });

  afterEach(() => {
    delete process.env.CLICKHOUSE_HOST;
    delete process.env.CLICKHOUSE_PORT;
    delete process.env.CLICKHOUSE_USER;
    delete process.env.CLICKHOUSE_PASSWORD;
    delete process.env.CLICKHOUSE_DATABASE;
  });

  test("should return config when all env vars are set", async () => {
    const { getClickHouseConfig } = await import(
      "@duyet/libs/clickhouse/config"
    );
    const config = getClickHouseConfig();

    expect(config).toEqual({
      host: "localhost:8124",
      port: "8124",
      user: "testuser",
      password: "testpass",
      database: "testdb",
      protocol: "http",
    });
  });

  test("should return null when HOST is missing", async () => {
    delete process.env.CLICKHOUSE_HOST;
    const { getClickHouseConfig } = await import(
      "@duyet/libs/clickhouse/config"
    );
    const config = getClickHouseConfig();
    expect(config).toBeNull();
  });

  test("should return null when PASSWORD is missing", async () => {
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    delete process.env.CLICKHOUSE_PASSWORD;

    const { getClickHouseConfig } = await import(
      "@duyet/libs/clickhouse/config"
    );
    const config = getClickHouseConfig();
    expect(config).toBeNull();
  });

  test("should detect HTTPS port correctly", async () => {
    process.env.CLICKHOUSE_HOST = "test-host.com";
    process.env.CLICKHOUSE_PORT = "443";

    const { getClickHouseConfig } = await import(
      "@duyet/libs/clickhouse/config"
    );
    const config = getClickHouseConfig();

    expect(config?.protocol).toBe("https");
  });

  test("should detect HTTP port correctly", async () => {
    process.env.CLICKHOUSE_HOST = "test-host.com";
    process.env.CLICKHOUSE_PORT = "8123";

    const { getClickHouseConfig } = await import(
      "@duyet/libs/clickhouse/config"
    );
    const config = getClickHouseConfig();

    expect(config?.protocol).toBe("http");
  });
});

describe("ClickHouse Client", () => {
  beforeEach(() => {
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CLICKHOUSE_PORT = "8124";
    process.env.CLICKHOUSE_USER = "testuser";
    process.env.CLICKHOUSE_PASSWORD = "testpass";
    process.env.CLICKHOUSE_DATABASE = "testdb";
  });

  afterEach(async () => {
    const { getClickHouseClient, closeClickHouseClient } = await import(
      "@duyet/libs/clickhouse/client"
    );
    const client = getClickHouseClient();
    if (client) {
      await closeClickHouseClient();
    }
  });

  test("should return singleton client instance", async () => {
    const { getClickHouseClient } = await import(
      "@duyet/libs/clickhouse/client"
    );
    const client1 = getClickHouseClient();
    const client2 = getClickHouseClient();

    expect(client1).toBe(client2);
  });

  test("should return null when config is invalid", async () => {
    delete process.env.CLICKHOUSE_PASSWORD;

    const { getClickHouseClient } = await import(
      "@duyet/libs/clickhouse/client"
    );
    const client = getClickHouseClient();

    expect(client).toBeNull();
  });
});
