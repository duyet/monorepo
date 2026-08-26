import { describe, expect, it } from "vitest";
import {
  checkAdminAuth,
  checkAdminAuthRateLimit,
} from "../admin/auth.js";
import type { Env } from "../types.js";

function makeRateLimitDb(count: number) {
  const inserts: unknown[][] = [];
  return {
    db: {
      prepare(sql: string) {
        return {
          bind: (...args: unknown[]) => ({
            first: async () =>
              sql.includes("COUNT(*)") ? { count } : null,
            run: async () => {
              if (sql.includes("INSERT INTO subscribe_attempts")) {
                inserts.push(args);
              }
              return { meta: { changes: 1 } };
            },
          }),
        };
      },
    } as unknown as D1Database,
    inserts,
  };
}

describe("checkAdminAuth rate limit", () => {
  it("returns 429 when failure budget is exhausted", async () => {
    const { db } = makeRateLimitDb(10);
    const env = { DB: db, NEWS_ADMIN_TOKEN: "secret" } as Env;
    const req = new Request("https://news.duyet.net/api/admin/items", {
      headers: {
        Authorization: "Bearer wrong",
        "CF-Connecting-IP": "203.0.113.1",
      },
    });
    const limited = await checkAdminAuthRateLimit(req, env);
    expect(limited?.status).toBe(429);
  });

  it("records failed auth attempts", async () => {
    const { db, inserts } = makeRateLimitDb(0);
    const env = { DB: db, NEWS_ADMIN_TOKEN: "secret" } as Env;
    const req = new Request("https://news.duyet.net/api/admin/items", {
      headers: {
        Authorization: "Bearer wrong",
        "CF-Connecting-IP": "203.0.113.1",
      },
    });
    const res = await checkAdminAuth(req, env);
    expect(res?.status).toBe(401);
    expect(inserts.length).toBe(1);
  });
});
