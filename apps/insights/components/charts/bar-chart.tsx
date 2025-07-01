"use client"

import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface BarChartProps {
  data: Array<Record<string, unknown>>
  index: string
  categories: string[]
  className?: string
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)", 
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
]

export function BarChart({ 
  data, 
  index, 
  categories, 
  className 
}: BarChartProps) {
  const chartConfig: ChartConfig = categories.reduce((config, category, i) => {
    config[category] = {
      label: category,
      color: chartColors[i % chartColors.length]
    }
    return config
  }, {} as ChartConfig)

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsBarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={chartColors[i % chartColors.length]}
            radius={4}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  )
}