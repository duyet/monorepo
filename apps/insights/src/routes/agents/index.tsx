"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AgentKpiCards,
  AgentTrendsChart,
  type AgentAnalyticsData,
  type AgentTrendRow,
} from "@/app/agents/components";

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Agent Intelligence Analytics" },
      {
        name: "description",
        content:
          "Deep analytics on agent usage, LLM models, and conversation trends.",
      },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const [data, setData] = useState<AgentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/agents", { signal: controller.signal })
      .then((res) => res.json())
      .then((d: AgentAnalyticsData & { error?: string }) => {
        if (!d.error) {
          // Re-shape for Recharts AreaChart using Map for O(n)
          const trendMap = new Map<string, AgentTrendRow>();
          for (const row of d.dailyVolume ?? []) {
            let existing = trendMap.get(row.date);
            if (!existing) {
              existing = { date: row.date, fast: 0, agent: 0 };
              trendMap.set(row.date, existing);
            }
            existing[row.mode as "fast" | "agent"] = row.count;
          }
          const trends = Array.from(trendMap.values());
          setData({ ...d, trends });
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load agent analytics:", err);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Duyet Agent Intelligence
        </h1>
        <p className="mt-2 text-muted-foreground">
          Deep analytics on agent usage, LLM models, and conversation trends.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-muted/20">
          <p className="animate-pulse text-muted-foreground">
            Loading intelligence...
          </p>
        </div>
      ) : data ? (
        <>
          <AgentKpiCards data={data} />
          <AgentTrendsChart data={data.trends ?? []} />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-destructive/10 text-sm text-destructive">
          Failed to load intelligence data.
        </div>
      )}
    </div>
  );
}
