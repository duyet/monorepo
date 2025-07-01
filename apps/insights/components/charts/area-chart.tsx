"use client"

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface AreaChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  showGridLines?: boolean
  showYAxis?: boolean
  className?: string
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)", 
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
]

export function AreaChart({ 
  data, 
  index, 
  categories, 
  showGridLines = true,
  className 
}: AreaChartProps) {
  const chartConfig: ChartConfig = categories.reduce((config, category, i) => {
    config[category] = {
      label: category,
      color: chartColors[i % chartColors.length]
    }
    return config
  }, {} as ChartConfig)

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsAreaChart accessibilityLayer data={data}>
        {showGridLines && <CartesianGrid vertical={false} />}
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        {categories.map((category, i) => (
          <Area
            key={category}
            dataKey={category}
            type="natural"
            fill={chartColors[i % chartColors.length]}
            fillOpacity={0.4}
            stroke={chartColors[i % chartColors.length]}
            stackId="1"
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  )
}