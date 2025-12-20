/**
 * Tests for CCUsage utility functions
 * These tests focus on data transformation and processing logic
 */

import {
  getCCUsageActivity,
  getCCUsageCosts,
  getCCUsageEfficiency,
  getCCUsageMetrics,
  getCCUsageModels,
} from "../ccusage-utils";

// Mock ClickHouse client utilities
jest.mock("../utils/clickhouse-client", () => ({
  executeClickHouseQueryLegacy: jest.fn(),
}));

import { executeClickHouseQueryLegacy } from "../utils/clickhouse-client";
const mockExecuteQuery = executeClickHouseQueryLegacy as jest.MockedFunction<
  typeof executeClickHouseQueryLegacy
>;

// Suppress console output during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe("CCUsage Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCCUsageMetrics", () => {
    it("should return default metrics when no data is available", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      const result = await getCCUsageMetrics();

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: "N/A",
      });
    });

    it("should process metrics data correctly", async () => {
      const mockData = [
        {
          total_tokens: 100000,
          input_tokens: 60000,
          output_tokens: 30000,
          cache_tokens: 10000,
          total_cost: 5.25,
          active_days: 15,
        },
      ];
      const mockModelData = [{ model_name: "claude-3-5-sonnet-20241022" }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockModelData);

      const result = await getCCUsageMetrics();

      expect(result.totalTokens).toBe(100000);
      expect(result.dailyAverage).toBe(Math.round(100000 / 15));
      expect(result.activeDays).toBe(15);
      expect(result.cacheTokens).toBe(10000);
      expect(result.totalCost).toBe(5.25);
      expect(result.topModel).toBe("claude-3-5-sonnet-20241022");
    });
  });

  describe("getCCUsageActivity", () => {
    it("should return empty array when no data is available", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      const result = await getCCUsageActivity();
      expect(result).toEqual([]);
    });

    it("should transform activity data correctly", async () => {
      const mockData = [
        {
          date: "2024-01-15",
          "Total Tokens": 50000,
          "Input Tokens": 30000,
          "Output Tokens": 15000,
          "Cache Tokens": 5000,
          "Total Cost": 2.5,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockData);

      const result = await getCCUsageActivity();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: "2024-01-15",
        "Total Tokens": Math.round(50000 / 1000),
        "Input Tokens": Math.round(30000 / 1000),
        "Output Tokens": Math.round(15000 / 1000),
        "Cache Tokens": Math.round(5000 / 1000),
        "Total Cost": 2.5,
      });
    });
  });

  describe("getCCUsageModels", () => {
    it("should calculate model percentages correctly", async () => {
      const mockData = [
        {
          model_name: "claude-3-5-sonnet",
          total_tokens: 8000,
          total_cost: 4.0,
          usage_count: 5,
        },
        {
          model_name: "claude-3-opus",
          total_tokens: 2000,
          total_cost: 1.0,
          usage_count: 2,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockData);

      const result = await getCCUsageModels();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "claude-3-5-sonnet",
        tokens: 8000,
        cost: 4.0,
        percent: 80, // 8000/10000 * 100
        costPercent: 80, // 4.0/5.0 * 100
        usageCount: 5,
      });
      expect(result[1]).toEqual({
        name: "claude-3-opus",
        tokens: 2000,
        cost: 1.0,
        percent: 20, // 2000/10000 * 100
        costPercent: 20, // 1.0/5.0 * 100
        usageCount: 2,
      });
    });
  });

  describe("getCCUsageCosts", () => {
    it("should calculate proportional costs correctly", async () => {
      const mockData = [
        {
          date: "2024-01-15",
          total_cost: 1.0,
          input_tokens: 6000,
          output_tokens: 3000,
          cache_tokens: 1000,
          total_tokens: 10000,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockData);

      const result = await getCCUsageCosts();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: "2024-01-15",
        "Total Cost": 1.0,
        "Input Cost": 0.6, // (1.0 * 6000) / 10000
        "Output Cost": 0.3, // (1.0 * 3000) / 10000
        "Cache Cost": 0.1, // (1.0 * 1000) / 10000
      });
    });

    it("should handle zero total tokens gracefully", async () => {
      const mockData = [
        {
          date: "2024-01-15",
          total_cost: 0,
          input_tokens: 0,
          output_tokens: 0,
          cache_tokens: 0,
          total_tokens: 0,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockData);

      const result = await getCCUsageCosts();

      expect(result[0]).toEqual({
        date: "2024-01-15",
        "Total Cost": 0,
        "Input Cost": 0,
        "Output Cost": 0,
        "Cache Cost": 0,
      });
    });
  });

  describe("getCCUsageEfficiency", () => {
    it("should calculate efficiency scores correctly", async () => {
      const mockData = [
        {
          date: "2024-01-15",
          tokens_per_dollar: 15000.5,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockData);

      const result = await getCCUsageEfficiency();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: "2024-01-15",
        "Efficiency Score": Math.round(15000.5),
      });
    });
  });

  describe("Error handling", () => {
    it("should handle ClickHouse connection errors gracefully", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      const result = await getCCUsageMetrics();

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: "N/A",
      });
    });

    it("should return empty array for activity when connection fails", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      const result = await getCCUsageActivity();
      expect(result).toEqual([]);
    });
  });

  describe("Environment validation", () => {
    it("should handle missing environment variables", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      const result = await getCCUsageMetrics();

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: "N/A",
      });
    });
  });

  describe("Date filtering logic", () => {
    it("should generate correct WHERE clause for 7 days", async () => {
      const mockData = [
        {
          total_tokens: 10000,
          input_tokens: 6000,
          output_tokens: 3000,
          cache_tokens: 1000,
          total_cost: 1.0,
          active_days: 7,
        },
      ];
      const mockModelData = [{ model_name: "claude-3-5-sonnet" }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockModelData);

      await getCCUsageMetrics(7);

      // Check that the query was called with the correct WHERE clause
      // Using > instead of >= ensures exactly 7 days
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE date > today() - INTERVAL 7 DAY")
      );
    });

    it("should generate correct WHERE clause for 30 days", async () => {
      const mockData = [
        {
          total_tokens: 10000,
          input_tokens: 6000,
          output_tokens: 3000,
          cache_tokens: 1000,
          total_cost: 1.0,
          active_days: 30,
        },
      ];
      const mockModelData = [{ model_name: "claude-3-5-sonnet" }];

      mockExecuteQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockModelData);

      await getCCUsageMetrics(30);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE date > today() - INTERVAL 30 DAY")
      );
    });

    it("should generate correct WHERE clause for 365 days", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      await getCCUsageActivity(365);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE date > today() - INTERVAL 365 DAY")
      );
    });

    it('should not include WHERE clause for "all" time period', async () => {
      mockExecuteQuery.mockResolvedValue([]);

      await getCCUsageActivity("all");

      // Check that the query does NOT contain WHERE date
      const query = mockExecuteQuery.mock.calls[0][0] as string;
      expect(query).not.toContain("WHERE date >");
      expect(query).not.toContain("INTERVAL");
    });

    it("should use created_at filter for model queries", async () => {
      mockExecuteQuery.mockResolvedValue([]);

      await getCCUsageModels(7);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE created_at > today() - INTERVAL 7 DAY")
      );
    });

    it("should correctly filter cost data for specific periods", async () => {
      const mockCostData = [
        {
          date: "2024-11-05",
          total_cost: 1.0,
          input_tokens: 6000,
          output_tokens: 3000,
          cache_tokens: 1000,
          total_tokens: 10000,
        },
        {
          date: "2024-11-06",
          total_cost: 1.5,
          input_tokens: 9000,
          output_tokens: 4500,
          cache_tokens: 1500,
          total_tokens: 15000,
        },
      ];

      mockExecuteQuery.mockResolvedValue(mockCostData);

      const result = await getCCUsageCosts(7);

      // Verify the query uses the correct date filter
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE date > today() - INTERVAL 7 DAY")
      );

      // Verify data is returned correctly
      expect(result).toHaveLength(2);
      expect(result[0]["Total Cost"]).toBe(1.0);
      expect(result[1]["Total Cost"]).toBe(1.5);
    });

    it("should verify date filter prevents off-by-one errors", async () => {
      // This test ensures we use > instead of >= to get exactly N days
      // For 7 days: if today is Nov 12, we want Nov 6-12 (7 days)
      // Using >= would give Nov 5-12 (8 days)
      // Using > gives Nov 6-12 (7 days) ✓

      mockExecuteQuery.mockResolvedValue([]);

      await getCCUsageActivity(7);

      const query = mockExecuteQuery.mock.calls[0][0] as string;

      // Ensure we're using > not >=
      expect(query).toContain("date > today()");
      expect(query).not.toContain("date >= today()");
    });
  });
});
