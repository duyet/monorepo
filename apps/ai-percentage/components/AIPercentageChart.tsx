"use client";

import useSWR from "swr";
import { getAICodePercentageHistory } from "../lib/queries";
import type { DateRangeDays } from "../lib/types";

interface AIPercentageChartProps {
  days?: DateRangeDays;
}

export function AIPercentageChart({ days = 365 }: AIPercentageChartProps) {
  const { data, error, isLoading } = useSWR(`ai-percentage-chart-${days}`, () =>
    getAICodePercentageHistory(days)
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card p-8">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-card p-8">
        <p className="text-muted-foreground">
          {error ? "Failed to load data" : "No data available"}
        </p>
      </div>
    );
  }

  const chartData = data.map((row) => ({
    date: new Date(row.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    "AI Code": row.ai_lines_added / 1000,
    "Human Code": row.human_lines_added / 1000,
  }));

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-medium">AI vs Human Code Over Time</h3>
        <p className="text-xs text-muted-foreground">
          Daily lines added by AI and human contributors (in thousands)
        </p>
      </div>
      <div className="h-64">
        <svg viewBox="0 0 800 200" className="h-full w-full">
          <defs>
            <linearGradient id="aiGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#9333ea" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="humanGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          {data.map((row, i) => {
            const x = (i / (data.length - 1)) * 750 + 25;
            const maxY = Math.max(
              ...chartData.map((d) => Math.max(d["AI Code"], d["Human Code"]))
            );
            const aiY = 180 - (row.ai_lines_added / 1000 / maxY) * 150;
            const humanY = 180 - (row.human_lines_added / 1000 / maxY) * 150;

            return (
              <g key={row.date}>
                <circle cx={x} cy={aiY} r="3" fill="#9333ea" />
                <circle cx={x} cy={humanY} r="3" fill="#2563eb" />
              </g>
            );
          })}

          <polyline
            points={chartData
              .map((row, i) => {
                const maxY = Math.max(
                  ...chartData.map((d) =>
                    Math.max(d["AI Code"], d["Human Code"])
                  )
                );
                const x = (i / (chartData.length - 1)) * 750 + 25;
                const aiY = 180 - (row["AI Code"] / maxY) * 150;
                return `${x},${aiY}`;
              })
              .join(" ")}
            fill="none"
            stroke="#9333ea"
            strokeWidth="2"
            strokeOpacity="0.8"
          />

          <polyline
            points={chartData
              .map((row, i) => {
                const maxY = Math.max(
                  ...chartData.map((d) =>
                    Math.max(d["AI Code"], d["Human Code"])
                  )
                );
                const x = (i / (chartData.length - 1)) * 750 + 25;
                const humanY = 180 - (row["Human Code"] / maxY) * 150;
                return `${x},${humanY}`;
              })
              .join(" ")}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-purple-600" />
          <span className="text-muted-foreground">AI Code</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-600" />
          <span className="text-muted-foreground">Human Code</span>
        </div>
      </div>
    </div>
  );
}
