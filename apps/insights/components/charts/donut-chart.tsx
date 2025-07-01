"use client"

import { Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface DonutChartProps {
  data: Array<Record<string, unknown>>
  index: string
  category: string
  variant?: "donut" | "pie"
  showLabel?: boolean
  className?: string
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export function DonutChart({ data, index, category, variant = "donut", showLabel = false, className }: DonutChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((item, i) => {
      const key = String(item[index])
      return [key, { label: key, color: CHART_COLORS[i % CHART_COLORS.length] }]
    })
  )

  return (
    <ChartContainer config={chartConfig} className={className}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          innerRadius={variant === "donut" ? "60%" : "0%"}
          outerRadius="80%"
          paddingAngle={2}
          label={showLabel}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}