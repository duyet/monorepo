import { describe, expect, it } from "vitest";
import {
  buildRateLimitQuery,
  checkRateLimit,
  hashIp,
  ONE_DAY_SEC,
} from "../rate-limit.js";

describe("buildRateLimitQuery", () => {
  it("counts rows in `table` matching `column = key` within the window", () => {
    const { sql, params } = buildRateLimitQuery({
      table: "submissions",
      column: "user_id",
      key: "user-1",
      windowSec: ONE_DAY_SEC,
      now: 1_700_000_000_000,
    });

    expect(sql).toContain("FROM submissions");
    expect(sql).toContain("user_id = ?");
    expect(sql).toContain("created_at >= ?");
    expect(params[0]).toBe("user-1");
    expect(params[1]).toBe(1_700_000_000_000 - ONE_DAY_SEC * 1000);
  });

  it("uses the given column name (ip_hash)", () => {
    const { sql } = buildRateLimitQuery({
      table: "translation_suggestions",
      column: "ip_hash",
      key: "abc",
      windowSec: 3600,
    });
    expect(sql).toContain("ip_hash = ?");
  });

  it("defaults `now` to Date.now() when omitted", () => {
    const before = Date.now();
    const { params } = buildRateLimitQuery({
      table: "submissions",
      column: "user_id",
      key: "x",
      windowSec: 60,
    });
    const after = Date.now();
    const since = params[1] as number;
    expect(since).toBeGreaterThanOrEqual(before - 60_000);
    expect(since).toBeLessThanOrEqual(after - 60_000 + 1);
  });
});

function makeCountingDb(count: number) {
  const calls: { sql: string; args: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      return {
        bind: (...args: unknown[]) => {
          calls.push({ sql, args });
          return { first: async () => ({ count }) };
        },
      };
    },
  };
  return { db: db as unknown as D1Database, calls };
}

describe("checkRateLimit", () => {
  it("returns false (not blocked) when the count is below the limit", async () => {
    const { db } = makeCountingDb(4);
    const blocked = await checkRateLimit(db, {
      table: "submissions",
      column: "user_id",
      key: "u1",
      windowSec: ONE_DAY_SEC,
      limit: 5,
    });
    expect(blocked).toBe(false);
  });

  it("returns true (blocked) when the count is at or above the limit", async () => {
    const { db } = makeCountingDb(5);
    const blockedAt = await checkRateLimit(db, {
      table: "submissions",
      column: "user_id",
      key: "u1",
      windowSec: ONE_DAY_SEC,
      limit: 5,
    });
    expect(blockedAt).toBe(true);

    const { db: db2 } = makeCountingDb(9999);
    const blockedOver = await checkRateLimit(db2, {
      table: "submissions",
      column: "user_id",
      key: "u1",
      windowSec: ONE_DAY_SEC,
      limit: 5,
    });
    expect(blockedOver).toBe(true);
  });

  it("treats a missing/null count as 0 (not blocked)", async () => {
    const db = {
      prepare: () => ({
        bind: () => ({ first: async () => null }),
      }),
    } as unknown as D1Database;
    const blocked = await checkRateLimit(db, {
      table: "submissions",
      column: "ip_hash",
      key: "h",
      windowSec: ONE_DAY_SEC,
      limit: 5,
    });
    expect(blocked).toBe(false);
  });

  it("passes the table/column/key/window through to the query builder", async () => {
    const { db, calls } = makeCountingDb(0);
    await checkRateLimit(db, {
      table: "translation_suggestions",
      column: "ip_hash",
      key: "myhash",
      windowSec: ONE_DAY_SEC,
      limit: 20,
    });
    expect(calls[0].sql).toContain("FROM translation_suggestions");
    expect(calls[0].sql).toContain("ip_hash = ?");
    expect(calls[0].args[0]).toBe("myhash");
  });
});

describe("hashIp", () => {
  it("is stable: the same IP always hashes to the same value", async () => {
    const a = await hashIp("203.0.113.42");
    const b = await hashIp("203.0.113.42");
    expect(a).toBe(b);
  });

  it("produces different hashes for different IPs", async () => {
    const a = await hashIp("203.0.113.42");
    const b = await hashIp("198.51.100.7");
    expect(a).not.toBe(b);
  });

  it("never returns the raw IP", async () => {
    const hash = await hashIp("203.0.113.42");
    expect(hash).not.toContain("203.0.113.42");
    expect(hash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex
  });
});
