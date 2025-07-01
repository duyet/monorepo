"use client"

import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface DonutChartProps {
  data: Array<Record<string, unknown>>
  index: string
  category: string
  variant?: "donut" | "pie"
  showLabel?: boolean
  className?: string
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
]

export function DonutChart({ 
  data, 
  index, 
  category, 
  variant = "donut",
  showLabel = false,
  className 
}: DonutChartProps) {
  const chartData = data.map((item, i) => ({
    ...item,
    fill: chartColors[i % chartColors.length]
  }))

  const chartConfig: ChartConfig = {}
  data.forEach((item, i) => {
    const key = String(item[index])
    chartConfig[key] = {
      label: key,
      color: chartColors[i % chartColors.length]
    }
  })

  return (
    <ChartContainer config={chartConfig} className={className}>
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey={category}
          nameKey={index}
          innerRadius={variant === "donut" ? "50%" : "0%"}
          strokeWidth={5}
          labelLine={false}
          label={showLabel ? (entry) => String(entry[index]) : false}
        />
      </PieChart>
    </ChartContainer>
  )
}