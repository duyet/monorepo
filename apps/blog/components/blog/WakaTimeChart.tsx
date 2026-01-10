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
      <div className="text-sm text-gray-500 dark:text-gray-400">
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

  const colorMap: Record<string, string> = {
    TypeScript: "bg-blue-500 dark:bg-blue-400",
    JavaScript: "bg-yellow-500 dark:bg-yellow-400",
    Python: "bg-green-500 dark:bg-green-400",
    Rust: "bg-orange-600 dark:bg-orange-400",
    Go: "bg-cyan-500 dark:bg-cyan-400",
    Other: "bg-gray-500 dark:bg-gray-400",
  };

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 p-4 border border-gray-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Hours
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalHours.toFixed(0)}h
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 p-4 border border-gray-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Days Tracked
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.length}
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 p-4 border border-gray-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Languages
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {languages.length}
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50 p-4 border border-gray-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
            Daily Average
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(totalHours / data.length).toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Language breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Language Distribution
        </h4>
        <div className="space-y-3">
          {languages.map((lang) => {
            const hours = totals[lang];
            const percent = totalHours > 0 ? (hours / totalHours) * 100 : 0;
            const colorClass = colorMap[lang] || colorMap.Other;

            return (
              <div key={lang} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lang}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {hours.toFixed(1)}h ({percent.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${colorClass} transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity table */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h4>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {[...data].slice(-14).reverse().map((point, idx) => {
                const total = languages.reduce(
                  (sum, lang) => sum + (Number(point[lang]) || 0),
                  0
                );
                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 dark:border-slate-900/50 ${
                      idx % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-gray-50/50 dark:bg-slate-900/30"
                    } hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-200">
                      {new Date(point.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </td>
                    <td className="text-right px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                      {total.toFixed(1)}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WakaTimeChart;
