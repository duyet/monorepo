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

  const metrics = [
    {
      label: "Total Visitors",
      value: currentData.totalVisitors.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      change: currentData.totalVisitors > 0 ? { value: 18 } : undefined,
    },
    {
      label: "Page Views",
      value: currentData.totalViews.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
      change: currentData.totalViews > 0 ? { value: 25 } : undefined,
    },
    {
      label: "Avg per Page",
      value: currentData.avgVisitorsPerPage.toLocaleString(),
      icon: <TrendingUp className="h-4 w-4" />,
      change: currentData.avgVisitorsPerPage > 0 ? { value: 10 } : undefined,
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
            change={metric.change}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Popular Content Table */}
      <PopularContentTable
        data={currentData.paths.map((path) => {
          const blogUrl = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "";
          if (!blogUrl) {
            console.warn("NEXT_PUBLIC_DUYET_BLOG_URL is not defined");
          }
          return {
            name: path.path,
            value: path.visitors,
            href: `${blogUrl}${path.path}`,
          };
        })}
      />

      <p className="text-xs text-muted-foreground">
        Data from PostHog • Last {activePeriodInfo?.label || activePeriod} •
        Updated {new Date(currentData.generatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
