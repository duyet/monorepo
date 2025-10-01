'use client'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  XAxis,
} from 'recharts'

interface AreaChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  showGridLines?: boolean
  className?: string
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function AreaChart({
  data,
  index,
  categories,
  showGridLines = true,
  className,
}: AreaChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { label: category, color: CHART_COLORS[i % CHART_COLORS.length] },
    ]),
  )

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsAreaChart accessibilityLayer data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={index} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {categories.map((category, i) => (
          <Area
            key={category}
            dataKey={category}
            type="monotone"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.3}
            strokeWidth={2.5}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  )
}
