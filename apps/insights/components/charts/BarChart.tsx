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

interface BarChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  className?: string
  stack?: boolean
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function BarChart({
  data,
  index,
  categories,
  className,
  stack = false,
}: BarChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ]),
  )

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
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
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={radius}
            />
          )
        })}
      </RechartsBarChart>
    </ChartContainer>
  )
}
