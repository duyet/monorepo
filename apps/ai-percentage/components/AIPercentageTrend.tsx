import useSWR from "swr";
import { getAICodePercentageHistory } from "../lib/queries";
import type { DateRangeDays } from "../lib/types";

interface AIPercentageTrendProps {
  days?: DateRangeDays;
}

export function AIPercentageTrend({ days = 365 }: AIPercentageTrendProps) {
  const { data, error, isLoading } = useSWR(`ai-percentage-trend-${days}`, () =>
    getAICodePercentageHistory(days)
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white p-5 dark:bg-[#171815]">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-[#eeeee5] dark:bg-[#242420]" />
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-white p-5 dark:bg-[#171815]">
        <p className="text-[#686862] dark:text-[#b7b7aa]">
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
    "AI %": row.ai_percentage,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.08),0_22px_60px_rgba(0,0,0,0.06)] dark:bg-[#171815]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">AI Code Percentage Trend</h3>
        <p className="text-xs text-[#686862] dark:text-[#b7b7aa]">
          Percentage of AI-written code over time
        </p>
      </div>
      <div className="h-64">
        <svg viewBox="0 0 800 200" className="h-full w-full">
          <defs>
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(70.5% 0.213 47.604)"
                stopOpacity={0.28}
              />
              <stop
                offset="100%"
                stopColor="oklch(70.5% 0.213 47.604)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <polyline
            points={chartData
              .map((row, i) => {
                const x = (i / (chartData.length - 1)) * 750 + 25;
                const y = 180 - (row["AI %"] / 100) * 150;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="url(#trendGradient)"
            stroke="oklch(70.5% 0.213 47.604)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="mt-2 text-right text-xs text-[#686862] dark:text-[#b7b7aa]">
        Trend:{" "}
        {data.length > 1 &&
        data[data.length - 1].ai_percentage > data[0].ai_percentage
          ? "↑"
          : "↓"}{" "}
        {Math.abs(
          (data[data.length - 1]?.ai_percentage || 0) -
            (data[0]?.ai_percentage || 0)
        ).toFixed(1)}
        %
      </div>
    </div>
  );
}
