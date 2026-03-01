import { describe, test, expect, mock } from "bun:test";
import type { GitHubEvent } from "../types";

function makePushEvent(isoDate: string, commitCount: number = 1): GitHubEvent {
  return {
    type: "PushEvent",
    created_at: isoDate,
    payload: {
      commits: Array.from({ length: commitCount }, () => ({})),
    },
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

describe("getCommitStats", () => {

  test("returns empty stats when fetchAllEvents returns no events", async () => {
    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve([])),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(0);
    expect(stats.commitHistory.length).toBe(12);
    expect(stats.mostActiveDay).toBe("Monday");
    expect(stats.avgCommitsPerWeek).toBe(0);
  });

  test("counts commits from PushEvents within last 12 weeks", async () => {
    const events: GitHubEvent[] = [
      makePushEvent(daysAgo(1), 3),
      makePushEvent(daysAgo(3), 2),
      makePushEvent(daysAgo(10), 1),
    ];

    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve(events)),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(6); // 3 + 2 + 1
  });

  test("ignores non-PushEvent events", async () => {
    const events: GitHubEvent[] = [
      { type: "WatchEvent", created_at: daysAgo(1) },
      { type: "ForkEvent", created_at: daysAgo(2) },
      makePushEvent(daysAgo(3), 2),
    ];

    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve(events)),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(2);
  });

  test("ignores PushEvents older than 12 weeks", async () => {
    const events: GitHubEvent[] = [
      makePushEvent(daysAgo(1), 5),
      makePushEvent(daysAgo(90), 10), // older than 12 weeks (84 days)
    ];

    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve(events)),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(5);
  });

  test("groups commits into 12 weekly history entries", async () => {
    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve([])),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.commitHistory.length).toBe(12);
    stats.commitHistory.forEach((entry, i) => {
      expect(entry.week).toBe(i + 1);
      expect(typeof entry.date).toBe("string");
      expect(typeof entry.commits).toBe("number");
    });
  });

  test("calculates avgCommitsPerWeek as totalCommits / 12", async () => {
    const events: GitHubEvent[] = [makePushEvent(daysAgo(1), 12)];

    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.resolve(events)),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(12);
    expect(stats.avgCommitsPerWeek).toBe(1); // 12 / 12 weeks
  });

  test("returns empty stats on error from fetchAllEvents", async () => {
    mock.module("../github-api", () => ({
      fetchAllEvents: mock(() => Promise.reject(new Error("Network error"))),
    }));

    const { getCommitStats } = await import("../commit-stats");
    const stats = await getCommitStats("testuser");

    expect(stats.totalCommits).toBe(0);
    expect(stats.commitHistory).toEqual([]);
    expect(stats.mostActiveDay).toBe("Monday");
    expect(stats.avgCommitsPerWeek).toBe(0);
  });
});
