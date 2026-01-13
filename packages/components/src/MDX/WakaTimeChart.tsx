"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface WakaTimeData {
  name: string;
  hours: number;
  color: string;
  percentage: number;
}

interface WakaTimeChartProps {
  data: WakaTimeData[];
  title?: string;
  period?: "daily" | "weekly" | "monthly";
}

/**
 * WakaTimeChart - Interactive coding time visualization
 * Features: Toggle between bar/pie charts, time period selection, hover details
 */
export default function WakaTimeChart({ data, title = "Coding Time Distribution", period = "weekly" }: WakaTimeChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calculate totals
  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
  const averagePerDay = totalHours / (period === "daily" ? 1 : period === "weekly" ? 7 : 30);

  // Format hours display
  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 10) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours)}h`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatHours(data.hours)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded text-sm transition ${
                  chartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`px-3 py-1 rounded text-sm transition ${
                  chartType === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Pie Chart
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatHours(totalHours)} | Avg/day: {formatHours(averagePerDay)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {chartType === "bar" ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatHours(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="hours"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                  onMouseEnter={(_, index) => setHoveredItem(data[index].name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={hoveredItem && hoveredItem !== entry.name ? "#374151" : "transparent"}
                      strokeWidth={hoveredItem && hoveredItem !== entry.name ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all ${
                hoveredItem === item.name
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatHours(item.hours)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.percentage}% of total
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}