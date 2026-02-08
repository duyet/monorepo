/**
 * Enhanced Skeleton Loading Components
 * Provides realistic loading states for different UI patterns
 */

"use client";

import { Skeleton } from "@duyet/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@duyet/components/ui/card";

/**
 * Skeleton for metric cards
 */
export function MetricCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton for chart containers
 */
export function ChartSkeleton({
  height = 200,
  showLegend = false,
}: {
  height?: number;
  showLegend?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div
          className="relative rounded-lg bg-muted/30"
          style={{ height: `${height}px` }}
        >
          {/* Animated loading bars */}
          <div className="absolute inset-0 flex items-end justify-around p-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-primary/20 animate-pulse rounded-t"
                style={{
                  height: `${30 + Math.random() * 50}%`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </div>
        {showLegend && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for data tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="w-full min-w-[600px]">
            {/* Table Header */}
            <div className="flex border-b pb-2">
              {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="flex-1 px-4">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            {/* Table Rows */}
            <div className="divide-y">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex py-3">
                  {Array.from({ length: columns }).map((_, j) => (
                    <div key={j} className="flex-1 px-4">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for dashboard overview
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Metrics */}
      <MetricCardSkeleton count={4} />

      {/* Charts Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSkeleton height={200} />
          </div>
          <ChartSkeleton height={200} showLegend />
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <TableSkeleton rows={5} columns={6} />
      </div>
    </div>
  );
}

/**
 * Skeleton for activity feed
 */
export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for language/stats breakdown
 */
export function StatsBreakdownSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-20 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-4 w-12 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Combined page loading skeleton
 */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-ping rounded-full bg-primary" />
        <span>Loading analytics data...</span>
      </div>

      {/* Dashboard Content */}
      <DashboardSkeleton />
    </div>
  );
}
