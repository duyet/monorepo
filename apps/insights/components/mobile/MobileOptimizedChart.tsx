'use client'

import {
  CompactAreaChart,
  CompactBarChart,
  CompactLineChart,
  MiniSparkline,
} from '@/components/charts/CompactChart'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'

interface MobileOptimizedChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  type?: 'area' | 'bar' | 'line' | 'sparkline'
  title?: string
  className?: string
  showControls?: boolean
  height?: number
}

export function MobileOptimizedChart({
  data,
  index,
  categories,
  type = 'area',
  title,
  className,
  showControls = true,
  height,
}: MobileOptimizedChartProps) {
  const [currentCategory, setCurrentCategory] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentView, setCurrentView] = useState<'chart' | 'data'>('chart')

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // For mobile, show one category at a time if multiple categories
  const shouldPaginate = isMobile && categories.length > 1
  const displayCategories = shouldPaginate
    ? [categories[currentCategory]]
    : categories
  const chartHeight = isExpanded ? height || 300 : height || 200

  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % categories.length)
  }

  const prevCategory = () => {
    setCurrentCategory(
      (prev) => (prev - 1 + categories.length) % categories.length,
    )
  }

  const renderChart = () => {
    const chartProps = {
      data,
      index,
      categories: displayCategories,
      height: chartHeight,
      className: 'w-full',
      showGrid: !isMobile, // Hide grid on mobile for cleaner look
      showTooltip: true,
    }

    switch (type) {
      case 'bar':
        return <CompactBarChart {...chartProps} />
      case 'line':
        return <CompactLineChart {...chartProps} />
      case 'sparkline':
        return (
          <MiniSparkline
            data={data}
            dataKey={categories[0]}
            height={chartHeight}
            className="w-full"
          />
        )
      default:
        return <CompactAreaChart {...chartProps} />
    }
  }

  const renderDataTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left font-medium text-muted-foreground">
              {index}
            </th>
            {displayCategories.map((category) => (
              <th
                key={category}
                className="p-2 text-right font-medium text-muted-foreground"
              >
                {category}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map(
            (
              row,
              i, // Limit to 10 rows on mobile
            ) => (
              <tr key={i} className="border-border/50 border-b">
                <td className="p-2 font-medium">{String(row[index])}</td>
                {displayCategories.map((category) => (
                  <td key={category} className="p-2 text-right font-mono">
                    {typeof row[category] === 'number'
                      ? row[category].toLocaleString()
                      : String(row[category])}
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
      {data.length > 10 && (
        <p className="py-2 text-center text-xs text-muted-foreground">
          Showing first 10 of {data.length} rows
        </p>
      )}
    </div>
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with controls */}
      {(title || showControls) && (
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="truncate text-sm font-semibold">{title}</h3>
            )}
            {shouldPaginate && (
              <p className="text-xs text-muted-foreground">
                {categories[currentCategory]} ({currentCategory + 1} of{' '}
                {categories.length})
              </p>
            )}
          </div>

          {showControls && (
            <div className="flex shrink-0 items-center space-x-1">
              {/* Category navigation for mobile */}
              {shouldPaginate && (
                <>
                  <button
                    onClick={prevCategory}
                    className="rounded p-1 hover:bg-accent"
                    disabled={categories.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextCategory}
                    className="rounded p-1 hover:bg-accent"
                    disabled={categories.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* View toggle */}
              <div className="flex rounded border">
                <button
                  onClick={() => setCurrentView('chart')}
                  className={cn(
                    'rounded-l px-2 py-1 text-xs',
                    currentView === 'chart'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                  )}
                >
                  Chart
                </button>
                <button
                  onClick={() => setCurrentView('data')}
                  className={cn(
                    'rounded-r border-l px-2 py-1 text-xs',
                    currentView === 'data'
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                  )}
                >
                  Data
                </button>
              </div>

              {/* Expand/collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 hover:bg-accent"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="min-h-0">
        {currentView === 'chart' ? renderChart() : renderDataTable()}
      </div>

      {/* Mobile indicators */}
      {shouldPaginate && categories.length > 1 && (
        <div className="flex justify-center space-x-1">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCategory(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === currentCategory
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SwipeableChartProps extends MobileOptimizedChartProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function SwipeableChart({
  onSwipeLeft,
  onSwipeRight,
  ...props
}: SwipeableChartProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <MobileOptimizedChart {...props} />
    </div>
  )
}
