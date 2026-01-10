"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
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
  const { theme } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(0);

  // Check for prefers-reduced-motion
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;
  }, []);

  // Intersection Observer for scroll-into-view animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!prefersReducedMotion.current) {
            setAnimationDuration(1500);
          }
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

  // Theme colors
  const isDark = theme === "dark";
  const textColor = isDark ? "#d4d4d8" : "#18181b";
  const gridColor = isDark ? "#3f3f46" : "#e4e4e7";
  const tooltipBg = isDark ? "#27272a" : "#ffffff";
  const tooltipBorder = isDark ? "#52525b" : "#e4e4e7";

  return (
    <div ref={chartRef} className="w-full">
      {title && (
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      <div className="overflow-x-auto rounded border border-amber-200 bg-white p-2 dark:border-amber-900/30 dark:bg-gray-950">
        {/* Mobile: Horizontal scroll layout */}
        <div className="md:hidden">
          <ResponsiveContainer width="100%" height={200} minWidth={300}>
            <AreaChart
              data={isVisible ? data : []}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
              <defs>
                {languages.map((lang) => (
                  <linearGradient
                    key={`gradient-${lang}`}
                    id={`gradient-${lang}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={
                        LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
                      }
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
                      }
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke={textColor}
                tick={{ fontSize: 10 }}
                interval={Math.floor(data.length / 4)}
              />
              <YAxis stroke={textColor} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "4px",
                  color: textColor,
                  fontSize: 11,
                }}
                wrapperStyle={{ outline: "none" }}
              />
              {languages.map((lang) => (
                <Area
                  key={lang}
                  type="monotone"
                  dataKey={lang}
                  stackId="activity"
                  stroke={LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other}
                  fill={`url(#gradient-${lang})`}
                  isAnimationActive={isVisible && !prefersReducedMotion.current}
                  animationDuration={animationDuration}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Desktop: Full width layout */}
        <div className="hidden md:block">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={isVisible ? data : []}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                {languages.map((lang) => (
                  <linearGradient
                    key={`gradient-${lang}`}
                    id={`gradient-${lang}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={
                        LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
                      }
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
                      }
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke={textColor}
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke={textColor} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "4px",
                  color: textColor,
                  fontSize: 12,
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend
                wrapperStyle={{ color: textColor, fontSize: 11 }}
                verticalAlign="top"
                height={24}
              />
              {languages.map((lang) => (
                <Area
                  key={lang}
                  type="monotone"
                  dataKey={lang}
                  stackId="activity"
                  stroke={LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other}
                  fill={`url(#gradient-${lang})`}
                  isAnimationActive={isVisible && !prefersReducedMotion.current}
                  animationDuration={animationDuration}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with color indicators (Mobile only) */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 md:hidden">
          {languages.map((lang) => (
            <div key={lang} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other,
                }}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {lang}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WakaTimeChart;
