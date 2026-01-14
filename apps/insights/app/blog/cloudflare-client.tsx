"use client";

import { Activity, Eye, Globe, Users } from "lucide-react";
import { useState } from "react";
import { AreaChart } from "@/components/charts";
import { PeriodSelector } from "@/components/period-selector";
import { CompactMetric } from "@/components/ui/CompactMetric";
import {
  DEFAULT_PERIOD,
  type PeriodData,
  TIME_PERIODS,
  type TimePeriod,
} from "@/types/periods";
import type { CloudflareDataByPeriod } from "./cloudflare-with-periods";

interface CloudflareClientProps {
  data: PeriodData<CloudflareDataByPeriod>;
}

function dataFormatter(number: number) {
  return Intl.NumberFormat("en-US").format(number).toString();
}

export function CloudflareClient({ data }: CloudflareClientProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(DEFAULT_PERIOD);

  const currentData = data[activePeriod];
  const activePeriodInfo = TIME_PERIODS.find((p) => p.value === activePeriod);

  if (!currentData || !currentData.data.viewer.zones[0]) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <PeriodSelector
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
          />
        </div>
        <div className="py-8 text-center text-muted-foreground">
          No data available for this period
        </div>
      </div>
    );
  }

  const chartData = currentData.data.viewer.zones[0]?.httpRequests1dGroups?.map(
    (item) => {
      return {
        date: item.date.date, // Already in YYYY-MM-DD format from Cloudflare API
        "Page Views": item.sum.pageViews,
        Requests: item.sum.requests,
        "Unique Visitors": item.uniq.uniques,
      };
    }
  );

  // Find the latest day with actual data (non-zero values)
  const httpGroups =
    currentData.data.viewer.zones[0]?.httpRequests1dGroups || [];
  const latestDataDay = httpGroups
    .slice()
    .reverse() // Start from most recent
    .find(
      (item) =>
        item.sum.requests > 0 || item.sum.pageViews > 0 || item.uniq.uniques > 0
    );

  // Use latest day data or fallback to totals if no recent data
  const latestRequests =
    latestDataDay?.sum.requests || currentData.totalRequests || 0;
  const latestPageviews =
    latestDataDay?.sum.pageViews || currentData.totalPageviews || 0;
  const latestUniques = latestDataDay?.uniq.uniques || 0;
  const latestDate =
    latestDataDay?.date.date || new Date().toISOString().split("T")[0];

  const metrics = [
    {
      label: "Daily Requests",
      value: dataFormatter(latestRequests),
      icon: <Activity className="h-4 w-4" />,
      change: latestRequests > 0 ? { value: 12 } : undefined,
    },
    {
      label: "Daily Page Views",
      value: dataFormatter(latestPageviews),
      icon: <Eye className="h-4 w-4" />,
      change: latestPageviews > 0 ? { value: 8 } : undefined,
    },
    {
      label: "Daily Visitors",
      value: dataFormatter(latestUniques),
      icon: <Users className="h-4 w-4" />,
      change: latestUniques > 0 ? { value: 15 } : undefined,
    },
    {
      label: `Total (${activePeriodInfo?.label || activePeriod})`,
      value: dataFormatter(currentData.totalRequests || 0),
      icon: <Globe className="h-4 w-4" />,
      change: (currentData.totalRequests || 0) > 0 ? { value: 5 } : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div />
        <PeriodSelector
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <CompactMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4">
          <h3 className="font-medium">Traffic Trends</h3>
          <p className="text-xs text-muted-foreground">
            {activePeriodInfo?.label || activePeriod} overview
          </p>
        </div>
        <AreaChart
          categories={["Requests", "Page Views", "Unique Visitors"]}
          data={chartData}
          index="date"
          showGridLines={true}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Data from Cloudflare • Latest day: {latestDate} • Updated{" "}
        {new Date(currentData.generatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
