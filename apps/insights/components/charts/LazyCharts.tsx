/**
 * Lazy-loaded chart components for better performance
 *
 * Charts are heavy due to recharts library and should only be loaded when needed.
 * This file provides lazy-loaded versions with proper loading states.
 *
 * Usage:
 *   import { LazyAreaChart, LazyBarChart } from '@/components/charts/LazyCharts'
 *   <LazyAreaChart data={data} index="day" categories={["value"]} />
 */

"use client";

import type { ComponentType } from "react";
import { Suspense, lazy } from "react";
import { Skeleton } from "@duyet/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

function ChartSkeleton({ height = 200, className = "" }: ChartSkeletonProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-muted/30 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="w-full space-y-2 p-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// Wrapper component for lazy-loaded charts
function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallbackHeight = 200
) {
  return function LazyChart(props: P) {
    return (
      <Suspense fallback={<ChartSkeleton height={fallbackHeight} />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Lazy load AreaChart component
export const LazyAreaChart = lazy(() =>
  import("./AreaChart").then((module) => ({
    default: withLazyLoading(module.AreaChart, 200),
  }))
);

// Lazy load BarChart component
export const LazyBarChart = lazy(() =>
  import("./BarChart").then((module) => ({
    default: withLazyLoading(module.BarChart, 200),
  }))
);

// Lazy load DonutChart component
export const LazyDonutChart = lazy(() =>
  import("./DonutChart").then((module) => ({
    default: withLazyLoading(module.DonutChart, 200),
  }))
);

// Lazy load CompactChart components (heavier, more feature-rich charts)
export const LazyCompactAreaChart = lazy(() =>
  import("./CompactChart").then((module) => ({
    default: (props: React.ComponentProps<typeof module.CompactAreaChart>) =>
      withLazyLoading(module.CompactAreaChart, props.height ?? 200)(props),
  }))
);

export const LazyCompactLineChart = lazy(() =>
  import("./CompactChart").then((module) => ({
    default: (props: React.ComponentProps<typeof module.CompactLineChart>) =>
      withLazyLoading(module.CompactLineChart, props.height ?? 200)(props),
  }))
);

export const LazyCompactBarChart = lazy(() =>
  import("./CompactChart").then((module) => ({
    default: (props: React.ComponentProps<typeof module.CompactBarChart>) =>
      withLazyLoading(module.CompactBarChart, props.height ?? 200)(props),
  }))
);

export const LazyCompactPieChart = lazy(() =>
  import("./CompactChart").then((module) => ({
    default: (props: React.ComponentProps<typeof module.CompactPieChart>) =>
      withLazyLoading(module.CompactPieChart, props.height ?? 200)(props),
  }))
);

export const LazyMiniSparkline = lazy(() =>
  import("./CompactChart").then((module) => ({
    default: (props: React.ComponentProps<typeof module.MiniSparkline>) =>
      withLazyLoading(module.MiniSparkline, props.height ?? 40)(props),
  }))
);

// Re-export for convenience - use these in your components
export {
  LazyAreaChart as AreaChart,
  LazyBarChart as BarChart,
  LazyDonutChart as DonutChart,
  LazyCompactAreaChart as CompactAreaChart,
  LazyCompactLineChart as CompactLineChart,
  LazyCompactBarChart as CompactBarChart,
  LazyCompactPieChart as CompactPieChart,
  LazyMiniSparkline as MiniSparkline,
};
