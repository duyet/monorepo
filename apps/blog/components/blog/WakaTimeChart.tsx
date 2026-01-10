"use client";

import { useState, useEffect, useRef } from "react";
import type { WakaTimeChartProps } from "./types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3776ab",
  Rust: "#dea584",
  Go: "#00add8",
  Other: "#718096",
};

export function WakaTimeChart({
  data,
  title = "Coding Activity",
}: WakaTimeChartProps) {
  return <WakaTimeChartContent data={data} title={title} />;
}

function WakaTimeChartContent({
  data,
  title = "Coding Activity",
}: WakaTimeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for scroll-into-view animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        ref={chartRef}
        className="flex items-center justify-center rounded border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-gray-950"
      >
        <p className="text-center text-xs text-gray-600 dark:text-gray-400">
          No data available
        </p>
      </div>
    );
  }

  // Get unique languages from data
  const languages = Array.from(
    new Set(
      data.flatMap((point) =>
        Object.keys(point).filter((key) => key !== "date" && key !== "name")
      )
    )
  ).sort();

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.map((point) =>
      languages.reduce((sum, lang) => sum + (Number(point[lang]) || 0), 0)
    )
  );

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };


  return (
    <div ref={chartRef} className="w-full">
      {title && (
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div className="rounded border border-amber-200 bg-white p-3 dark:border-amber-900/30 dark:bg-gray-950">
        {/* Chart Container */}
        <div className="space-y-3">
          {/* Stacked Bar Chart */}
          <div className="space-y-1">
            <div className="flex items-end justify-between gap-0.5 h-48">
              {isVisible &&
                data.map((point, idx) => {
                  const total = languages.reduce(
                    (sum, lang) => sum + (Number(point[lang]) || 0),
                    0
                  );
                  const height = total > 0 ? (total / maxValue) * 100 : 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center group"
                      title={`${point.date}: ${total}h`}
                    >
                      {/* Stacked bars */}
                      <div className="w-full flex flex-col-reverse items-center h-40 gap-0">
                        {languages.map((lang) => {
                          const value = Number(point[lang]) || 0;
                          const barHeight = total > 0 ? (value / total) * height : 0;

                          return (
                            <div
                              key={lang}
                              className="w-full transition-all duration-300 hover:opacity-80"
                              style={{
                                height: `${barHeight}%`,
                                backgroundColor:
                                  LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other,
                                minHeight: barHeight > 0 ? "2px" : "0",
                              }}
                              title={`${lang}: ${value}h`}
                            />
                          );
                        })}
                      </div>

                      {/* Date label */}
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center whitespace-nowrap">
                        {formatDate(point.date)}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Grid background */}
            <div className="relative h-40 pointer-events-none border-l border-b border-amber-200 dark:border-amber-900/30" />
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-amber-200 dark:border-amber-900/30">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {languages.map((lang) => (
                <div key={lang} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other,
                    }}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {lang}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WakaTimeChart;
