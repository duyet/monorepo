"use client";

import { useState } from "react";
import { AIPercentageChart } from "@/components/AIPercentageChart";
import { AIPercentageHero } from "@/components/AIPercentageHero";
import { AIPercentageTrend } from "@/components/AIPercentageTrend";
import { DATE_RANGES } from "@/lib/utils";

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Code Usage</h1>
        <p className="mt-1 text-muted-foreground">
          Percentage of code written by AI across all repositories
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Detected via co-author signatures and email patterns
        </p>
      </div>

      <div className="mt-8 space-y-8">
        <AIPercentageHero />

        <div className="space-y-8">
          <TimeRange />
          <AIPercentageTrend />
          <AIPercentageChart />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Data Source: GitHub + ClickHouse | Detection: Co-author & email
          patterns | Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}

function TimeRange() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y");

  const periods = DATE_RANGES;
  const _currentPeriod =
    periods.find((p) => p.value === selectedPeriod) || periods[3];

  return (
    <div className="flex items-center justify-end gap-2">
      <label htmlFor="time-range" className="text-sm text-muted-foreground">
        Time range:
      </label>
      <select
        id="time-range"
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="rounded border bg-card px-3 py-1.5 text-sm"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}
