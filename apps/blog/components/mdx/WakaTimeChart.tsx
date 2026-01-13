"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WakaTimeData {
  date: string;
  hours: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
}

export function WakaTimeChart({ data, title = "Coding Activity" }: WakaTimeChartProps) {
  const [chartData, setChartData] = useState<WakaTimeData[]>([]);

  useEffect(() => {
    // Sort data by date and format for display
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setChartData(sorted);
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(label)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {formatHours(payload[0].value)} hours
          </p>
        </div>
      );
    }
    return null;
  };

  const totalHours = chartData.reduce((sum, day) => sum + day.hours, 0);
  const averageHours = chartData.length > 0 ? totalHours / chartData.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatHours(totalHours)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Total Hours</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatHours(averageHours)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Daily Avg</p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatHours}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#3b82f6"
              fill="url(#colorGradient)"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Showing {chartData.length} days of coding data
      </div>
    </div>
  );
}