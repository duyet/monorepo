import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { PostHogSyncer } from "../posthog.syncer";

interface PageviewEvent {
  uuid: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  distinct_id: string;
}

function pageview(
  url: string,
  distinctId: string,
  options: { sessionId?: string; timestamp?: string } = {}
): PageviewEvent {
  return {
    uuid: `evt-${distinctId}`,
    event: "$pageview",
    properties: {
      $current_url: url,
      ...(options.sessionId ? { $session_id: options.sessionId } : {}),
    },
    timestamp: options.timestamp ?? "2026-01-01T10:00:00Z",
    distinct_id: distinctId,
  };
}

function transform(events: PageviewEvent[]) {
  const syncer = new PostHogSyncer(mockClient);
  return (
    syncer as unknown as {
      transform: (data: Array<{ results: PageviewEvent[] }>) => Promise<
        Array<{
          date: string;
          path: string;
          visitors: number;
          views: number;
          sessions: number;
        }>
      >;
    }
  ).transform([{ results: events }]);
}

let mockClient: ClickHouseClient;

describe("PostHogSyncer", () => {
  beforeEach(() => {
    mockClient = {
      insert: vi.fn(() => Promise.resolve()),
      query: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    } as unknown as ClickHouseClient;

    vi.stubEnv("POSTHOG_API_KEY", "phc_test");
    vi.stubEnv("POSTHOG_PROJECT_ID", "1234");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // Regression: the aggregation key was `${date}:${path}` and was read back
  // with key.split(":"), so "/a:b" was stored as "/a" and "/a:c" landed on the
  // same (date, path) row - two different pages, one surviving row.
  test("keeps colons in paths intact and keeps sibling paths apart", async () => {
    const records = await transform([
      pageview("https://blog.duyet.net/a:b", "visitor-1", { sessionId: "s1" }),
      pageview("https://blog.duyet.net/a:c", "visitor-2", { sessionId: "s2" }),
    ]);

    expect(records).toHaveLength(2);
    expect(records.every((record) => record.date === "2026-01-01")).toBe(true);
    expect(records.map((record) => record.path).sort()).toEqual([
      "/a:b",
      "/a:c",
    ]);
  });

  test("aggregates repeated events on a path containing a colon", async () => {
    const records = await transform([
      pageview("https://blog.duyet.net/a:b", "visitor-1", { sessionId: "s1" }),
      pageview("https://blog.duyet.net/a:b", "visitor-2", { sessionId: "s1" }),
      pageview("https://blog.duyet.net/a:b", "visitor-1", { sessionId: "s2" }),
    ]);

    expect(records).toEqual([
      {
        date: "2026-01-01",
        path: "/a:b",
        visitors: 2,
        views: 3,
        sessions: 2,
      },
    ]);
  });

  // The `sessions` column migration 20260930 adds to monorepo_posthog: it was
  // in every record the syncer emitted and in no table definition, so the
  // value was dropped on insert.
  test("emits sessions, falling back to distinct_id without a session id", async () => {
    const records = await transform([
      pageview("https://blog.duyet.net/post", "visitor-1", { sessionId: "s1" }),
      pageview("https://blog.duyet.net/post", "visitor-1"),
      pageview("https://blog.duyet.net/post", "visitor-2"),
    ]);

    expect(records).toEqual([
      {
        date: "2026-01-01",
        path: "/post",
        visitors: 2,
        views: 3,
        sessions: 3,
      },
    ]);
  });

  test("keeps separate days separate", async () => {
    const records = await transform([
      pageview("https://blog.duyet.net/a:b", "visitor-1", {
        sessionId: "s1",
        timestamp: "2026-01-01T10:00:00Z",
      }),
      pageview("https://blog.duyet.net/a:b", "visitor-1", {
        sessionId: "s1",
        timestamp: "2026-01-02T10:00:00Z",
      }),
    ]);

    expect(records.map((record) => record.date).sort()).toEqual([
      "2026-01-01",
      "2026-01-02",
    ]);
    expect(records.every((record) => record.path === "/a:b")).toBe(true);
  });
});
