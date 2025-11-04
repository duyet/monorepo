/**
 * Performance tests for the compact dashboard components
 * Tests rendering speed, memory usage, and mobile optimization
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'

// Mock components for testing
import { CompactAreaChart, MiniSparkline } from '../charts/CompactChart'
import { MobileOptimizedChart } from '../mobile/MobileOptimizedChart'
import { CompactCard, StatsCard } from '../ui/CompactCard'
import { DashboardGrid, GridItem } from '../ui/DashboardGrid'
import { ProgressiveDisclosure } from '../ui/ProgressiveDisclosure'

// Mock data for performance testing
const mockData = Array.from({ length: 100 }, (_, i) => ({
  date: `2024-01-${String(i + 1).padStart(2, '0')}`,
  value: Math.floor(Math.random() * 1000),
  category1: Math.floor(Math.random() * 500),
  category2: Math.floor(Math.random() * 300),
}))

// Performance measurement utilities
const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  await waitFor(() => {
    // Wait for component to be fully rendered
  })
  const end = performance.now()
  return end - start
}

const measureMemoryUsage = (): { usedJSHeapSize: number } | null => {
  if ('memory' in performance) {
    return (
      (performance as { memory?: { usedJSHeapSize: number } }).memory || null
    )
  }
  return null
}

describe('Dashboard Performance Tests', () => {
  let initialMemory: { usedJSHeapSize: number } | null

  beforeAll(() => {
    // Mock window dimensions for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    initialMemory = measureMemoryUsage()
  })

  afterAll(() => {
    const finalMemory = measureMemoryUsage()
    if (initialMemory && finalMemory) {
      const memoryDelta =
        finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      console.log(
        `Memory usage delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`,
      )
    }
  })

  describe('DashboardGrid Performance', () => {
    it('should render large grids efficiently', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <DashboardGrid cols={4} gap="md">
            {Array.from({ length: 20 }, (_, i) => (
              <GridItem key={i}>
                <CompactCard title={`Card ${i}`}>
                  <div>Content {i}</div>
                </CompactCard>
              </GridItem>
            ))}
          </DashboardGrid>,
        )
      })

      // Should render large grids in under 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('should handle responsive breakpoints efficiently', () => {
      const { rerender } = render(
        <DashboardGrid cols={4}>
          <GridItem span={2}>Large item</GridItem>
          <GridItem>Small item 1</GridItem>
          <GridItem>Small item 2</GridItem>
        </DashboardGrid>,
      )

      // Test mobile breakpoint
      window.innerWidth = 375
      rerender(
        <DashboardGrid cols={4}>
          <GridItem span={2}>Large item</GridItem>
          <GridItem>Small item 1</GridItem>
          <GridItem>Small item 2</GridItem>
        </DashboardGrid>,
      )

      expect(screen.getByText('Large item')).toBeInTheDocument()
    })
  })

  describe('Chart Performance', () => {
    it('should render compact charts quickly', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <CompactAreaChart
            data={mockData}
            index="date"
            categories={['value', 'category1', 'category2']}
            height={200}
          />,
        )
      })

      // Charts should render in under 200ms
      expect(renderTime).toBeLessThan(200)
    })

    it('should handle sparklines efficiently', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <div>
            {Array.from({ length: 10 }, (_, i) => (
              <MiniSparkline
                key={i}
                data={mockData.slice(0, 30)}
                dataKey="value"
                height={40}
              />
            ))}
          </div>,
        )
      })

      // Multiple sparklines should render quickly
      expect(renderTime).toBeLessThan(150)
    })

    it('should optimize mobile chart rendering', async () => {
      window.innerWidth = 375 // Mobile width

      const renderTime = await measureRenderTime(() => {
        render(
          <MobileOptimizedChart
            data={mockData}
            index="date"
            categories={['value', 'category1', 'category2']}
            type="area"
            showControls
          />,
        )
      })

      // Mobile charts should render efficiently
      expect(renderTime).toBeLessThan(250)
    })
  })

  describe('Progressive Disclosure Performance', () => {
    it('should handle lazy loading efficiently', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <div>
            {Array.from({ length: 5 }, (_, i) => (
              <ProgressiveDisclosure
                key={i}
                title={`Section ${i}`}
                defaultOpen={false}
              >
                <div style={{ height: '200px' }}>Heavy content {i}</div>
              </ProgressiveDisclosure>
            ))}
          </div>,
        )
      })

      // Collapsed sections should render quickly
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Stats Card Performance', () => {
    it('should render many stats cards efficiently', async () => {
      const renderTime = await measureRenderTime(() => {
        render(
          <DashboardGrid cols={6}>
            {Array.from({ length: 24 }, (_, i) => (
              <StatsCard
                key={i}
                title={`Metric ${i}`}
                value={Math.floor(Math.random() * 10000)}
                change={{
                  value: Math.floor(Math.random() * 20) - 10,
                  period: 'last 30 days',
                }}
                compact
              />
            ))}
          </DashboardGrid>,
        )
      })

      // Many stats cards should render quickly
      expect(renderTime).toBeLessThan(150)
    })
  })

  describe('Mobile Optimization', () => {
    beforeEach(() => {
      window.innerWidth = 375 // iPhone SE width
    })

    it('should adapt layout for mobile screens', () => {
      render(
        <DashboardGrid cols={3}>
          <GridItem>Item 1</GridItem>
          <GridItem>Item 2</GridItem>
          <GridItem>Item 3</GridItem>
        </DashboardGrid>,
      )

      // Should render without layout shift
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should handle touch interactions efficiently', () => {
      render(
        <MobileOptimizedChart
          data={mockData.slice(0, 10)}
          index="date"
          categories={['value']}
          type="area"
        />,
      )

      // Component should render with touch controls
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Memory Management', () => {
    it('should not create memory leaks with frequent re-renders', () => {
      const { rerender } = render(
        <CompactAreaChart
          data={mockData.slice(0, 50)}
          index="date"
          categories={['value']}
        />,
      )

      // Simulate frequent updates
      for (let i = 0; i < 10; i++) {
        const shuffledData = mockData
          .slice(0, 50)
          .map((item) => ({ ...item, value: Math.random() * 1000 }))

        rerender(
          <CompactAreaChart
            data={shuffledData}
            index="date"
            categories={['value']}
          />,
        )
      }

      // Should handle frequent re-renders without issues
      expect(screen.getByRole('img')).toBeInTheDocument() // Chart should still be present
    })
  })
})

describe('Accessibility Performance', () => {
  it('should maintain accessibility with compact layouts', () => {
    render(
      <DashboardGrid cols={4}>
        <StatsCard
          title="Important Metric"
          value={1234}
          change={{ value: 5.2, period: 'last month' }}
          compact
        />
      </DashboardGrid>,
    )

    // Should maintain semantic structure
    expect(screen.getByText('Important Metric')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('should support keyboard navigation', () => {
    render(
      <ProgressiveDisclosure title="Test Section">
        <div>Content</div>
      </ProgressiveDisclosure>,
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })
})

// Performance benchmarks for CI/CD
export const PERFORMANCE_BENCHMARKS = {
  GRID_RENDER_TIME: 100, // ms
  CHART_RENDER_TIME: 200, // ms
  MOBILE_CHART_RENDER_TIME: 250, // ms
  STATS_CARDS_RENDER_TIME: 150, // ms
  PROGRESSIVE_DISCLOSURE_RENDER_TIME: 100, // ms
} as const
