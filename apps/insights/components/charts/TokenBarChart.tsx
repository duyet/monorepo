'use client'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
} from 'recharts'

interface TokenBarChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  className?: string
  stack?: boolean
  showInThousands?: boolean
}

/**
 * Client-side wrapper for token usage charts with distinct colors
 * Input Tokens: Blue (chart-1)
 * Output Tokens: Orange (chart-2)
 * Cache Tokens: Purple (chart-3)
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

  // Explicit color mapping for token categories
  const chartConfig: ChartConfig = {
    'Input Tokens': {
      label: 'Input Tokens',
      color: 'hsl(var(--chart-1))',
    },
    'Output Tokens': {
      label: 'Output Tokens',
      color: 'hsl(var(--chart-2))',
    },
    'Cache Tokens': {
      label: 'Cache Tokens',
      color: 'hsl(var(--chart-3))',
    },
  }

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={valueFormatter ? (value) => valueFormatter(value) : undefined}
            />
          }
        />
        {categories.map((category, i) => {
          // For stacked bars, only the last (top) bar should have rounded corners
          const isLastInStack = stack && i === categories.length - 1
          const radius: [number, number, number, number] = stack
            ? (isLastInStack ? [4, 4, 0, 0] : [0, 0, 0, 0])
            : [4, 4, 0, 0]

          return (
            <Bar
              key={category}
              dataKey={category}
              stackId={stack ? 'stack' : undefined}
              fill={chartConfig[category]?.color || 'hsl(var(--chart-1))'}
              radius={radius}
            />
          )
        })}
      </RechartsBarChart>
    </ChartContainer>
  )
}
