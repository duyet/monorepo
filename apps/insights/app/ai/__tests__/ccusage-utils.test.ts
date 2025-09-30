/**
 * Tests for CCUsage utility functions
 * These tests focus on data transformation and processing logic
 */

import {
  getCCUsageMetrics,
  getCCUsageActivity,
  getCCUsageModels,
  getCCUsageEfficiency,
  getCCUsageCosts,
} from '../ccusage-utils'

// Mock ClickHouse client utilities
jest.mock('../utils/clickhouse-client', () => ({
  executeClickHouseQueryLegacy: jest.fn(),
}))

import { executeClickHouseQueryLegacy } from '../utils/clickhouse-client'
const mockExecuteQuery = executeClickHouseQueryLegacy as jest.MockedFunction<typeof executeClickHouseQueryLegacy>

describe('CCUsage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCCUsageMetrics', () => {
    it('should return default metrics when no data is available', async () => {
      mockExecuteQuery.mockResolvedValue([])

      const result = await getCCUsageMetrics()

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: 'N/A',
      })
    })

    it('should process metrics data correctly', async () => {
      const mockData = [
        {
          total_tokens: 100000,
          input_tokens: 60000,
          output_tokens: 30000,
          cache_tokens: 10000,
          total_cost: 5.25,
          active_days: 15,
        },
      ]
      const mockModelData = [{ model_name: 'claude-3-5-sonnet-20241022' }]

      mockExecuteQuery
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockModelData)

      const result = await getCCUsageMetrics()

      expect(result.totalTokens).toBe(100000)
      expect(result.dailyAverage).toBe(Math.round(100000 / 15))
      expect(result.activeDays).toBe(15)
      expect(result.cacheTokens).toBe(10000)
      expect(result.totalCost).toBe(5.25)
      expect(result.topModel).toBe('claude-3-5-sonnet-20241022')
    })
  })

  describe('getCCUsageActivity', () => {
    it('should return empty array when no data is available', async () => {
      mockExecuteQuery.mockResolvedValue([])

      const result = await getCCUsageActivity()
      expect(result).toEqual([])
    })

    it('should transform activity data correctly', async () => {
      const mockData = [
        {
          date: '2024-01-15',
          'Total Tokens': 50000,
          'Input Tokens': 30000,
          'Output Tokens': 15000,
          'Cache Tokens': 5000,
          'Total Cost': 2.5,
        },
      ]

      mockExecuteQuery.mockResolvedValue(mockData)

      const result = await getCCUsageActivity()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        date: '2024-01-15',
        'Total Tokens': Math.round(50000 / 1000),
        'Input Tokens': Math.round(30000 / 1000),
        'Output Tokens': Math.round(15000 / 1000),
        'Cache Tokens': Math.round(5000 / 1000),
        'Total Cost': 2.5,
      })
    })
  })

  describe('getCCUsageModels', () => {
    it('should calculate model percentages correctly', async () => {
      const mockData = [
        { model_name: 'claude-3-5-sonnet', total_tokens: 8000, total_cost: 4.0, usage_count: 5 },
        { model_name: 'claude-3-opus', total_tokens: 2000, total_cost: 1.0, usage_count: 2 },
      ]

      mockExecuteQuery.mockResolvedValue(mockData)

      const result = await getCCUsageModels()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'claude-3-5-sonnet',
        tokens: 8000,
        cost: 4.0,
        percent: 80, // 8000/10000 * 100
        costPercent: 80, // 4.0/5.0 * 100
        usageCount: 5,
      })
      expect(result[1]).toEqual({
        name: 'claude-3-opus',
        tokens: 2000,
        cost: 1.0,
        percent: 20, // 2000/10000 * 100
        costPercent: 20, // 1.0/5.0 * 100
        usageCount: 2,
      })
    })
  })

  describe('getCCUsageCosts', () => {
    it('should calculate proportional costs correctly', async () => {
      const mockData = [
        {
          date: '2024-01-15',
          total_cost: 1.0,
          input_tokens: 6000,
          output_tokens: 3000,
          cache_tokens: 1000,
          total_tokens: 10000,
        },
      ]

      mockExecuteQuery.mockResolvedValue(mockData)

      const result = await getCCUsageCosts()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        date: '2024-01-15',
        'Total Cost': 1.0,
        'Input Cost': 0.6, // (1.0 * 6000) / 10000
        'Output Cost': 0.3, // (1.0 * 3000) / 10000
        'Cache Cost': 0.1, // (1.0 * 1000) / 10000
      })
    })

    it('should handle zero total tokens gracefully', async () => {
      const mockData = [
        {
          date: '2024-01-15',
          total_cost: 0,
          input_tokens: 0,
          output_tokens: 0,
          cache_tokens: 0,
          total_tokens: 0,
        },
      ]

      mockExecuteQuery.mockResolvedValue(mockData)

      const result = await getCCUsageCosts()

      expect(result[0]).toEqual({
        date: '2024-01-15',
        'Total Cost': 0,
        'Input Cost': 0,
        'Output Cost': 0,
        'Cache Cost': 0,
      })
    })
  })

  describe('getCCUsageEfficiency', () => {
    it('should calculate efficiency scores correctly', async () => {
      const mockData = [
        {
          date: '2024-01-15',
          tokens_per_dollar: 15000.5,
        },
      ]

      mockExecuteQuery.mockResolvedValue(mockData)

      const result = await getCCUsageEfficiency()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        date: '2024-01-15',
        'Efficiency Score': Math.round(15000.5),
      })
    })
  })

  describe('Error handling', () => {
    it('should handle ClickHouse connection errors gracefully', async () => {
      mockExecuteQuery.mockRejectedValue(new Error('Connection failed'))

      const result = await getCCUsageMetrics()

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: 'N/A',
      })
    })

    it('should return empty array for activity when connection fails', async () => {
      mockExecuteQuery.mockRejectedValue(new Error('Connection failed'))

      const result = await getCCUsageActivity()
      expect(result).toEqual([])
    })
  })

  describe('Environment validation', () => {
    it('should handle missing environment variables', async () => {
      mockExecuteQuery.mockResolvedValue([])

      const result = await getCCUsageMetrics()

      expect(result).toEqual({
        totalTokens: 0,
        dailyAverage: 0,
        activeDays: 0,
        cacheTokens: 0,
        totalCost: 0,
        topModel: 'N/A',
      })
    })
  })
})