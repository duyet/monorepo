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
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
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
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            stackId={stack ? 'stack' : undefined}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={stack ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}
