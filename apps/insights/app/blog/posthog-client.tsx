"use client";

import { FileText, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { PopularContentTable } from "@/components/PopularContentTable";
import { PeriodSelector } from "@/components/period-selector";
import { CompactMetric } from "@/components/ui/CompactMetric";
import {
  DEFAULT_PERIOD,
  type PeriodData,
  TIME_PERIODS,
  type TimePeriod,
} from "@/types/periods";
import type { PostHogDataByPeriod } from "./posthog-with-periods";

interface PostHogClientProps {
  data: PeriodData<PostHogDataByPeriod>;
}

export function PostHogClient({ data }: PostHogClientProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(DEFAULT_PERIOD);

  const currentData = data[activePeriod];
  const activePeriodInfo = TIME_PERIODS.find((p) => p.value === activePeriod);

  if (!currentData) {
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

  const blogUrl = import.meta.env.VITE_DUYET_BLOG_URL || "";
  if (!blogUrl) {
    console.warn("VITE_DUYET_BLOG_URL is not defined");
  }

  const metrics = [
    {
      label: "Total Visitors",
      value: currentData.totalVisitors.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Page Views",
      value: currentData.totalViews.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Avg per Page",
      value: currentData.avgVisitorsPerPage.toLocaleString(),
      icon: <TrendingUp className="h-4 w-4" />,
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

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <CompactMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Popular Content Table */}
      <PopularContentTable
        data={currentData.paths.map(
          (path: { path: string; visitors: number }) => ({
            name: path.path,
            value: path.visitors,
            href: `${blogUrl}${path.path}`,
          })
        )}
      />

      <p className="text-xs text-muted-foreground">
        Data from PostHog • Last {activePeriodInfo?.label || activePeriod} •
        Updated {new Date(currentData.generatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
