import { describe, expect, test } from "vitest";
import { closeClickHouseClient } from "./clickhouse-client";

describe("closeClickHouseClient", () => {
  test("resolves with no value when no client is open", async () => {
    await expect(closeClickHouseClient()).resolves.toBeUndefined();
  });
});
