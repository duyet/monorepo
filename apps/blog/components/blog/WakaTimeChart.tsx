"use client";

import type { WakaTimeChartProps } from "./types";

/**
 * WakaTimeChart - Activity analytics
 * Semantic layout with consistent typography and spacing
 */
export function WakaTimeChart({
  data,
  title = "Coding Activity",
}: WakaTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  // Extract unique languages
  const languages = Array.from(
    new Set(
      data.flatMap((point) =>
        Object.keys(point).filter((key) => key !== "date" && key !== "name")
      )
    )
  ).sort();

  // Calculate totals
  const totals = languages.reduce(
    (acc, lang) => {
      acc[lang] = data.reduce((sum, point) => sum + (Number(point[lang]) || 0), 0);
      return acc;
    },
    {} as Record<string, number>
  );

  const totalHours = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3 text-xs">
      {title && (
        <h3 className="font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      {/* Summary metrics as inline text */}
      <div className="text-gray-700 dark:text-gray-300">
        <span className="text-gray-500 dark:text-gray-400">Activity:</span>{" "}
        <span>
          {totalHours.toFixed(0)}h total • {data.length} days • {languages.length} languages •{" "}
          {(totalHours / data.length).toFixed(1)}h/day
        </span>
      </div>

      {/* Language breakdown */}
      <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
        {languages.map((lang) => {
          const hours = totals[lang];
          const percent = totalHours > 0 ? (hours / totalHours) * 100 : 0;

          return (
            <div key={lang} className="flex items-baseline gap-2">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 w-16">
                {lang}:
              </span>
              <span>
                {hours.toFixed(1)}h ({percent.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      {[...data].slice(-7).length > 0 && (
        <div className="space-y-1 text-gray-700 dark:text-gray-300 mt-2">
          <span className="text-gray-500 dark:text-gray-400">Last 7 days:</span>
          <div className="space-y-0.5">
            {[...data].slice(-7).reverse().map((point, idx) => {
              const total = languages.reduce(
                (sum, lang) => sum + (Number(point[lang]) || 0),
                0
              );
              const date = new Date(point.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div key={idx} className="flex gap-3 text-gray-600 dark:text-gray-400">
                  <span className="flex-shrink-0">{date}:</span>
                  <span>{total.toFixed(1)}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WakaTimeChart;
