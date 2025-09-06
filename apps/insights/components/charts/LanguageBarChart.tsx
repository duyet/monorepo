'use client'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

interface LanguageData {
  name: string
  percent: number
  color?: string
}

interface LanguageBarChartProps {
  data: LanguageData[]
  className?: string
}

interface LabelProps {
  payload?: {
    isShortBar?: boolean
    percent?: number
    name?: string
    displayName?: string
  }
  x?: string | number
  y?: string | number
  width?: string | number
  height?: string | number
  value?: string | number
}

const chartConfig = {
  percent: {
    label: 'Usage %',
    color: 'hsl(var(--chart-1))',
  },
  label: {
    color: 'hsl(var(--background))',
  },
} satisfies ChartConfig


// Custom label component that combines model name and percentage
const CombinedLabel = (props: LabelProps) => {
  const { payload, x = 0, y = 0, width = 0, height = 0, value } = props
  
  // Handle case where payload might be undefined
  if (!payload) return null
  
  // Convert string|number to number
  const numX = typeof x === 'string' ? parseFloat(x) : x
  const numY = typeof y === 'string' ? parseFloat(y) : y
  const numWidth = typeof width === 'string' ? parseFloat(width) : width
  const numHeight = typeof height === 'string' ? parseFloat(height) : height
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  const isShortBar = payload.isShortBar || (payload.percent || 0) < 15
  const displayName = payload.displayName || payload.name || ''
  const percentage = `${Number(numValue || payload.percent || 0).toFixed(1)}%`
  
  // Combine name and percentage into a single string to avoid positioning issues
  const combinedText = isShortBar ? `${displayName} (${percentage})` : percentage
  
  // For short bars, position outside; for long bars, position at the right edge
  const textX = isShortBar ? numX + numWidth + 8 : numX + numWidth - 8
  const textAnchor = isShortBar ? 'start' : 'end'
  const fill = isShortBar ? 'hsl(var(--foreground))' : 'hsl(var(--background))'
  
  return (
    <text
      x={textX}
      y={numY + numHeight / 2}
      textAnchor={textAnchor}
      dominantBaseline="middle"
      fontSize={12}
      fill={fill}
    >
      {combinedText}
    </text>
  )
}

export function LanguageBarChart({ data, className }: LanguageBarChartProps) {
  // Format data for the chart and limit to top 8
  // Calculate threshold for short bars (e.g., less than 15% means text likely won't fit inside)
  const chartData = data.slice(0, 8).map((language) => ({
    name: language.name,
    percent: language.percent,
    displayName: language.name,
    isShortBar: language.percent < 15, // Threshold for moving text outside
  }))

  return (
    <ChartContainer config={chartConfig} className={className}>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          right: 120, // Increased to accommodate text outside bars
          left: 10,
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
        <Bar dataKey="percent" fill="hsl(var(--chart-1))" radius={4}>
          <LabelList
            content={CombinedLabel}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
