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

/**
 * Wraps a lazy component with a Suspense boundary and skeleton fallback.
 * The Suspense here catches the thrown promise from React.lazy() during
 * the dynamic import, displaying the skeleton until the chunk loads.
 */
function withLazyLoading<P extends object>(
  LazyComponent: ComponentType<P>,
  fallbackHeight = 200
) {
  return function LazyChart(props: P) {
    return (
      <Suspense fallback={<ChartSkeleton height={fallbackHeight} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy load chart components — withLazyLoading wraps lazy() so Suspense
// catches the dynamic import promise and shows the skeleton fallback.

const RawLazyAreaChart = lazy(() =>
  import("./AreaChart").then((m) => ({ default: m.AreaChart }))
);
export const LazyAreaChart = withLazyLoading(RawLazyAreaChart, 200);

const RawLazyBarChart = lazy(() =>
  import("./BarChart").then((m) => ({ default: m.BarChart }))
);
export const LazyBarChart = withLazyLoading(RawLazyBarChart, 200);

const RawLazyDonutChart = lazy(() =>
  import("./DonutChart").then((m) => ({ default: m.DonutChart }))
);
export const LazyDonutChart = withLazyLoading(RawLazyDonutChart, 200);

const RawLazyCompactAreaChart = lazy(() =>
  import("./CompactChart").then((m) => ({ default: m.CompactAreaChart }))
);
export const LazyCompactAreaChart = withLazyLoading(
  RawLazyCompactAreaChart,
  200
);

const RawLazyCompactLineChart = lazy(() =>
  import("./CompactChart").then((m) => ({ default: m.CompactLineChart }))
);
export const LazyCompactLineChart = withLazyLoading(
  RawLazyCompactLineChart,
  200
);

const RawLazyCompactBarChart = lazy(() =>
  import("./CompactChart").then((m) => ({ default: m.CompactBarChart }))
);
export const LazyCompactBarChart = withLazyLoading(
  RawLazyCompactBarChart,
  200
);

const RawLazyCompactPieChart = lazy(() =>
  import("./CompactChart").then((m) => ({ default: m.CompactPieChart }))
);
export const LazyCompactPieChart = withLazyLoading(
  RawLazyCompactPieChart,
  200
);

const RawLazyMiniSparkline = lazy(() =>
  import("./CompactChart").then((m) => ({ default: m.MiniSparkline }))
);
export const LazyMiniSparkline = withLazyLoading(RawLazyMiniSparkline, 40);

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
