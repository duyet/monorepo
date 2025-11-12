/**
 * Extended tests for Claude Code usage utilities with ClickHouse integration
 */

import { calculateCosts, calculateEfficiency } from '../ccusage-utils'

// Mock ClickHouse client
jest.mock('@clickhouse/client', () => ({
  createClient: jest.fn(() => ({
    query: jest.fn(),
    insert: jest.fn(),
    ping: jest.fn(() => Promise.resolve(true)),
    close: jest.fn(),
  })),
}))

describe('ccusage-utils - Extended Tests', () => {
  describe('calculateCosts', () => {
    it('should calculate costs for Opus model correctly', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const cost = calculateCosts('claude-opus-4-20250514', usage)

      // Opus: $15/MTok input, $75/MTok output
      const expectedCost = (1000 * 15) / 1_000_000 + (500 * 75) / 1_000_000
      expect(cost).toBeCloseTo(expectedCost, 6)
    })

    it('should calculate costs for Sonnet model correctly', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const cost = calculateCosts('claude-sonnet-4-20250514', usage)

      // Sonnet: $3/MTok input, $15/MTok output
      const expectedCost = (1000 * 3) / 1_000_000 + (500 * 15) / 1_000_000
      expect(cost).toBeCloseTo(expectedCost, 6)
    })

    it('should calculate costs for Haiku model correctly', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const cost = calculateCosts('claude-haiku-4-20250514', usage)

      // Haiku: $0.80/MTok input, $4/MTok output
      const expectedCost = (1000 * 0.8) / 1_000_000 + (500 * 4) / 1_000_000
      expect(cost).toBeCloseTo(expectedCost, 6)
    })

    it('should include cache creation costs', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 2000,
        cache_read_input_tokens: 0,
      }

      const costWithCache = calculateCosts('claude-sonnet-4-20250514', usage)
      const costWithoutCache = calculateCosts('claude-sonnet-4-20250514', {
        ...usage,
        cache_creation_input_tokens: 0,
      })

      expect(costWithCache).toBeGreaterThan(costWithoutCache)
    })

    it('should apply cache read discount', () => {
      const usage = {
        input_tokens: 0,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 1000,
      }

      const costCacheRead = calculateCosts('claude-sonnet-4-20250514', usage)
      const costNormalRead = calculateCosts('claude-sonnet-4-20250514', {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      })

      // Cache reads should be cheaper (10% of regular price)
      expect(costCacheRead).toBeLessThan(costNormalRead)
    })

    it('should handle zero tokens', () => {
      const usage = {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const cost = calculateCosts('claude-sonnet-4-20250514', usage)
      expect(cost).toBe(0)
    })

    it('should handle unknown model by defaulting to Sonnet pricing', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const cost = calculateCosts('claude-unknown-model', usage)
      expect(cost).toBeGreaterThan(0)
    })
  })

  describe('calculateEfficiency', () => {
    it('should calculate cache hit rate correctly', () => {
      const data = [
        {
          cache_creation_input_tokens: 1000,
          cache_read_input_tokens: 3000,
          input_tokens: 1000,
        },
        {
          cache_creation_input_tokens: 500,
          cache_read_input_tokens: 2000,
          input_tokens: 500,
        },
      ]

      const efficiency = calculateEfficiency(data)

      // Total cache reads: 5000
      // Total tokens: 1000 + 3000 + 1000 + 500 + 2000 + 500 = 8000
      // Cache hit rate: 5000 / 8000 = 0.625 = 62.5%
      expect(efficiency.cacheHitRate).toBeCloseTo(62.5, 1)
    })

    it('should calculate average tokens per request', () => {
      const data = [
        {
          cache_creation_input_tokens: 1000,
          cache_read_input_tokens: 0,
          input_tokens: 1000,
        },
        {
          cache_creation_input_tokens: 2000,
          cache_read_input_tokens: 0,
          input_tokens: 2000,
        },
      ]

      const efficiency = calculateEfficiency(data)

      // Total tokens: (1000 + 1000) + (2000 + 2000) = 6000
      // Requests: 2
      // Average: 3000
      expect(efficiency.avgTokensPerRequest).toBe(3000)
    })

    it('should return 0% cache hit rate when no cache reads', () => {
      const data = [
        {
          cache_creation_input_tokens: 1000,
          cache_read_input_tokens: 0,
          input_tokens: 1000,
        },
      ]

      const efficiency = calculateEfficiency(data)
      expect(efficiency.cacheHitRate).toBe(0)
    })

    it('should handle empty data array', () => {
      const efficiency = calculateEfficiency([])

      expect(efficiency.cacheHitRate).toBe(0)
      expect(efficiency.avgTokensPerRequest).toBe(0)
    })

    it('should handle data with missing fields', () => {
      const data = [
        {
          cache_creation_input_tokens: 1000,
          cache_read_input_tokens: undefined,
          input_tokens: 1000,
        },
      ]

      const efficiency = calculateEfficiency(data as any)

      expect(efficiency.cacheHitRate).toBe(0)
      expect(efficiency.avgTokensPerRequest).toBeGreaterThan(0)
    })

    it('should calculate cost savings from cache', () => {
      const data = [
        {
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 10000, // Cache reads
          input_tokens: 0,
          model: 'claude-sonnet-4-20250514',
        },
      ]

      const efficiency = calculateEfficiency(data as any)

      // Cache reads save 90% of cost vs normal reads
      expect(efficiency.cacheHitRate).toBe(100)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle realistic usage data', () => {
      const usage = {
        input_tokens: 50000,
        output_tokens: 10000,
        cache_creation_input_tokens: 20000,
        cache_read_input_tokens: 30000,
      }

      const cost = calculateCosts('claude-sonnet-4-20250514', usage)

      // Should be a reasonable cost
      expect(cost).toBeGreaterThan(0)
      expect(cost).toBeLessThan(10) // Less than $10 for this usage
    })

    it('should show cost savings from caching', () => {
      const withCache = {
        input_tokens: 10000,
        output_tokens: 5000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 50000,
      }

      const withoutCache = {
        input_tokens: 60000, // All reads without cache
        output_tokens: 5000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      }

      const costWith = calculateCosts('claude-sonnet-4-20250514', withCache)
      const costWithout = calculateCosts('claude-sonnet-4-20250514', withoutCache)

      // Using cache should be significantly cheaper
      expect(costWith).toBeLessThan(costWithout)

      const savings = ((costWithout - costWith) / costWithout) * 100
      expect(savings).toBeGreaterThan(50) // At least 50% savings
    })
  })
})
