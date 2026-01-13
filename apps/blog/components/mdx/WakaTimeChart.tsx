"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface WakaTimeData {
  date: string;
  hours: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
  height?: number;
  colors?: string[];
}

const defaultColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c"];

export function WakaTimeChart({
  data,
  title = "Coding Activity Over Time",
  height = 300,
  colors = defaultColors
}: WakaTimeChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date)
  }));

  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={formattedData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip
              formatter={(value) => [`${value} hours`, 'Hours']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              name="Hours"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Total coding hours: {data.reduce((sum, item) => sum + item.hours, 0)} hours
      </div>
    </div>
  );
}