'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface WakaTimeData {
  date: string
  hours: number
  language: string
}

interface WakaTimeChartProps {
  data: WakaTimeData[]
  title?: string
  description?: string
  height?: number
}

export function WakaTimeChart({ data, title = "WakaTime Activity", description, height = 400 }: WakaTimeChartProps) {
  // Group data by date and sum hours for each language
  const groupedData = data.reduce((acc, item) => {
    const existingDate = acc.find(d => d.date === item.date)
    if (existingDate) {
      existingDate[item.language] = (existingDate[item.language] || 0) + item.hours
    } else {
      acc.push({
        date: item.date,
        [item.language]: item.hours,
      })
    }
    return acc
  }, [] as any[])

  // Get all unique languages
  const languages = Array.from(new Set(data.map(item => item.language)))

  // Generate colors for languages
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f7df1e',
      'Python': '#3776ab',
      'Rust': '#ce422b',
      'Go': '#00add8',
      'Java': '#007396',
      'C++': '#00599c',
      'HTML': '#e34f26',
      'CSS': '#1572b6',
      'Shell': '#89e051',
      'SQL': '#336791',
      'JSON': '#000000',
      'Markdown': '#083fa1',
      'Vue': '#4fc08d',
      'React': '#61dafb',
    }
    return colors[language] || `hsl(${Math.random() * 360}, 70%, 50%)`
  }

  // Prepare chart data
  const chartData = groupedData.map(dateData => {
    const dataPoint: any = { date: dateData.date }
    languages.forEach(lang => {
      dataPoint[lang] = dateData[lang] || 0
    })
    return dataPoint
  })

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {languages.map((language, index) => (
              <Area
                key={language}
                type="monotone"
                dataKey={language}
                stackId="1"
                stroke={getLanguageColor(language)}
                fill={getLanguageColor(language)}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {languages.map((language) => (
          <div key={language} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(language) }}
            />
            <span className="text-sm">{language}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        <p>Total tracked time: {data.reduce((sum, item) => sum + item.hours, 0).toFixed(1)} hours</p>
        <p>Time period: {chartData.length} days</p>
      </div>
    </div>
  )
}