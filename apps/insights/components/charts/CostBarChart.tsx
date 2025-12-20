"use client";

import { BarChart } from "./BarChart";

interface CostBarChartProps {
  data: Array<Record<string, unknown>>;
  index: string;
  categories: string[];
  className?: string;
  stack?: boolean;
}

/**
 * Client-side wrapper for BarChart with cost formatting
 * Formats values with $ prefix and 2 decimal places
 */
export function CostBarChart({
  data,
  index,
  categories,
  className,
  stack = false,
}: CostBarChartProps) {
  const valueFormatter = (value: unknown) => `$${Number(value).toFixed(2)}`;

  return (
    <BarChart
      data={data}
      index={index}
      categories={categories}
      className={className}
      stack={stack}
      valueFormatter={valueFormatter}
    />
  );
}
