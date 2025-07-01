"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface LanguageData {
  name: string
  percent: number
  color?: string
}

interface LanguageBarChartProps {
  data: LanguageData[]
  className?: string
}

const chartConfig = {
  percent: {
    label: "Usage %",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

export function LanguageBarChart({ data, className }: LanguageBarChartProps) {
  // Format data for the chart and limit to top 8
  const chartData = data.slice(0, 8).map((language) => ({
    name: language.name,
    percent: language.percent,
    displayName: language.name.length > 10 ? `${language.name.slice(0, 10)}...` : language.name
  }))

  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          right: 40,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          hide
        />
        <XAxis dataKey="percent" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="percent"
          fill="hsl(var(--chart-1))"
          radius={4}
        >
          <LabelList
            dataKey="displayName"
            position="insideLeft"
            offset={8}
            className="fill-background"
            fontSize={12}
            fontWeight="500"
          />
          <LabelList
            dataKey="percent"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: unknown) => `${Number(value || 0).toFixed(1)}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}