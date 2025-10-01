'use client'

import { BarChart } from './BarChart'

interface TokenBarChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  className?: string
  stack?: boolean
  showInThousands?: boolean
}

/**
 * Client-side wrapper for BarChart with token formatting
 * Formats values with 'K' suffix when showInThousands is true
 */
export function TokenBarChart({
  data,
  index,
  categories,
  className,
  stack = false,
  showInThousands = false,
}: TokenBarChartProps) {
  const valueFormatter = showInThousands
    ? (value: unknown) => `${value}K`
    : undefined

  return (
    <BarChart
      data={data}
      index={index}
      categories={categories}
      className={className}
      stack={stack}
      valueFormatter={valueFormatter}
    />
  )
}
