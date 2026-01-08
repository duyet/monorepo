"use client";

import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DateRangeDays } from "../lib/types";
import { getAICodePercentageHistory } from "../lib/queries";

interface AIPercentageTrendProps {
  days?: DateRangeDays;
}

export function AIPercentageTrend({ days = 365 }: AIPercentageTrendProps) {
  const { data, error, isLoading } = useSWR(`ai-percentage-trend-${days}`, () =>
    getAICodePercentageHistory(days)
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-card p-8">
        <div className="h-8 w-8 animate-pulse rounded-full bg-purple-200 dark:bg-purple-900/20" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-card p-8">
        <p className="text-muted-foreground">
          {error ? "Failed to load data" : "No data available"}
        </p>
      </div>
    );
  }

  const chartData = data.map((row) => {
    const date = new Date(row.date);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      fullDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      percentage: Number(row.ai_percentage.toFixed(1)),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {payload[0].value}%
          </p>
          <p className="text-xs text-muted-foreground">AI Code</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold">AI Code Percentage Over Time</h3>
        <p className="text-sm text-muted-foreground">Last 12 months</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fill: "currentColor" }}
              className="text-xs text-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "currentColor" }}
              className="text-xs text-muted-foreground"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#9333ea"
              strokeWidth={3}
              dot={{ fill: "#9333ea", r: 4 }}
              activeDot={{ r: 6, fill: "#9333ea" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
