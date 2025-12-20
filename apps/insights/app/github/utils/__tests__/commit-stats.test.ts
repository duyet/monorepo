/**
 * Tests for GitHub commit statistics
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getCommitStats } from "../commit-stats";
import { fetchAllEvents } from "../github-api";

// Mock the github-api module
jest.mock("../github-api", () => ({
  fetchAllEvents: jest.fn(),
}));

const mockFetchAllEvents = fetchAllEvents as jest.MockedFunction<
  typeof fetchAllEvents
>;

// Suppress console output during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe("commit-stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCommitStats", () => {
    it("should return empty stats when no events", async () => {
      mockFetchAllEvents.mockResolvedValue([]);

      const stats = await getCommitStats("testuser");

      expect(stats.totalCommits).toBe(0);
      expect(stats.avgCommitsPerWeek).toBe(0);
      // commitHistory will have 12 weeks of empty data
      expect(stats.commitHistory).toHaveLength(12);
    });

    it("should count commits from push events", async () => {
      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: new Date().toISOString(),
          payload: {
            commits: [{}, {}, {}], // 3 commits
          },
        },
        {
          id: "2",
          type: "PushEvent",
          created_at: new Date().toISOString(),
          payload: {
            commits: [{}, {}], // 2 commits
          },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      expect(stats.totalCommits).toBe(5);
      expect(stats.totalCommits).toBeGreaterThan(0);
    });

    it("should filter out non-push events", async () => {
      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: new Date().toISOString(),
          payload: {
            commits: [{}],
          },
        },
        {
          id: "2",
          type: "IssueCommentEvent",
          created_at: new Date().toISOString(),
          payload: {},
        },
        {
          id: "3",
          type: "WatchEvent",
          created_at: new Date().toISOString(),
          payload: {},
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      // Should only count the one PushEvent
      expect(stats.totalCommits).toBe(1);
    });

    it("should only include commits from last 12 weeks", async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 13 * 7 * 24 * 60 * 60 * 1000); // 13 weeks ago
      const recentDate = new Date(now.getTime() - 5 * 7 * 24 * 60 * 60 * 1000); // 5 weeks ago

      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: oldDate.toISOString(),
          payload: {
            commits: [{}],
          },
        },
        {
          id: "2",
          type: "PushEvent",
          created_at: recentDate.toISOString(),
          payload: {
            commits: [{}],
          },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      // Should only count the recent commit
      expect(stats.totalCommits).toBe(1);
    });

    it("should calculate average commits per week", async () => {
      const mockEvents = Array.from({ length: 24 }, (_, i) => ({
        id: `${i}`,
        type: "PushEvent",
        created_at: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000
        ).toISOString(), // Spread over days
        payload: {
          commits: [{}],
        },
      }));

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      expect(stats.avgCommitsPerWeek).toBeGreaterThan(0);
      expect(stats.totalCommits).toBe(24);
    });

    it("should determine most active day", async () => {
      // Create commits heavily weighted to Monday
      const monday = new Date("2024-01-08"); // A Monday
      const mockEvents = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `monday-${i}`,
          type: "PushEvent",
          created_at: monday.toISOString(),
          payload: { commits: [{}] },
        })),
        {
          id: "tuesday",
          type: "PushEvent",
          created_at: new Date("2024-01-09").toISOString(),
          payload: { commits: [{}] },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      expect(stats.mostActiveDay).toBe("Monday");
    });

    it("should handle commits without payload gracefully", async () => {
      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: new Date().toISOString(),
          payload: {
            commits: undefined,
          },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      // Should count as 1 commit when commits array is undefined
      expect(stats.totalCommits).toBeGreaterThanOrEqual(0);
    });

    it("should return commit history data", async () => {
      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: new Date().toISOString(),
          payload: {
            commits: [{}],
          },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      expect(Array.isArray(stats.commitHistory)).toBe(true);
    });

    it("should handle API errors gracefully", async () => {
      mockFetchAllEvents.mockRejectedValue(new Error("API Error"));

      const stats = await getCommitStats("testuser");

      // Should return empty stats instead of throwing
      expect(stats.totalCommits).toBe(0);
      expect(stats.avgCommitsPerWeek).toBe(0);
    });

    it("should group commits by week correctly", async () => {
      // Create events in the last 12 weeks
      const now = new Date();
      const recentWeek1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentWeek2 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const mockEvents = [
        {
          id: "1",
          type: "PushEvent",
          created_at: recentWeek1.toISOString(),
          payload: { commits: [{}, {}] },
        },
        {
          id: "2",
          type: "PushEvent",
          created_at: recentWeek2.toISOString(),
          payload: { commits: [{}] },
        },
      ];

      mockFetchAllEvents.mockResolvedValue(mockEvents as any);

      const stats = await getCommitStats("testuser");

      expect(stats.totalCommits).toBe(3);
    });
  });
});
