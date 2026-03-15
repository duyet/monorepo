"use client";

import { useEffect, useState } from "react";
import {
  AgentKpiCards,
  AgentTrendsChart,
  type AgentAnalyticsData,
  type AgentTrendRow,
} from "./components";

export default function AgentsAnalyticsPage() {
  const [data, setData] = useState<AgentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((d: AgentAnalyticsData & { error?: string }) => {
        if (!d.error) {
          // Re-shape for Recharts AreaChart
          const trends = d.dailyVolume?.reduce(
            (acc: AgentTrendRow[], row) => {
              let existing = acc.find((a) => a.date === row.date);
              if (!existing) {
                existing = { date: row.date, fast: 0, agent: 0 };
                acc.push(existing);
              }
              existing[row.mode as "fast" | "agent"] = row.count;
              return acc;
            },
            []
          );

          setData({ ...d, trends });
        }
      })
      .catch((err) => console.error("Failed to load agent analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Duyet Agent Intelligence
        </h1>
        <p className="text-muted-foreground mt-2">
          Deep analytics on agent usage, LLM models, and conversation trends.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center border border-border rounded-xl bg-muted/20">
          <p className="text-muted-foreground animate-pulse">
            Loading intelligence...
          </p>
        </div>
      ) : data ? (
        <>
          <AgentKpiCards data={data} />
          <AgentTrendsChart data={data.trends ?? []} />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center border border-border rounded-xl bg-destructive/10 text-destructive text-sm">
          Failed to load intelligence data.
        </div>
      )}
    </div>
  );
}
