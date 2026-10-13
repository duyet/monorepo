import { createFileRoute } from "@tanstack/react-router";
import { type JSX, useMemo, useState } from "react";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { BreakdownDialog } from "../components/BreakdownDialog";
import { DailyChart } from "../components/DailyChart";
import { SourceIcons } from "../components/SourceIcons";
import { TextTabs } from "../components/TextTabs";
import { ThemeTabs } from "../components/ThemeTabs";
import { readPublicJson } from "../lib/read-public-json";
import { fmtCompactTokens, fmtCost } from "../lib/sources";
import type { TokenData } from "../lib/types";
import {
  buildSeries,
  RANGES,
  type RangeKey,
  toDays,
  VIEWS,
  type View,
  weekTrend,
} from "../lib/usage";

export const Route = createFileRoute("/")({
  loader: async () => {
    const data = await readPublicJson<TokenData>("token-data.json");
    return data;
  },
  component: Page,
});

const RANGE_OPTIONS = RANGES.map(({ key, label }) => ({ key, label }));

function Page(): JSX.Element {
  const data = Route.useLoaderData();
  const [filter, setFilter] = useState<string | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("90d");
  const [view, setView] = useState<View>("daily");

  const sourceTotals = useMemo(
    () =>
      [...data.source_totals].sort((a, b) => b.total_tokens - a.total_tokens),
    [data.source_totals]
  );
  const series = useMemo(
    () => buildSeries(sourceTotals.map((s) => s.source)),
    [sourceTotals]
  );
  const days = useMemo(() => toDays(data.daily), [data.daily]);
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];
  const { last, prior } = weekTrend(days);

  return (
    <div className="burns-page">
      <header className="burns-header">
        <h1 className="burns-eyebrow">Burns · token usage</h1>
        <div className="burns-header-actions">
          <BreakdownDialog
            sourceTotals={sourceTotals}
            totals={data.totals}
            days={days}
            series={series}
          />
          <ThemeTabs />
        </div>
      </header>

      <section className="burns-hero">
        <AnimatedCounter target={data.totals.total_tokens} />
        <p className="burns-sub">
          <span>tokens · {fmtCost(data.totals.total_cost)}</span>
          <span className="burns-delta">
            {last >= prior ? "↑" : "↓"} {fmtCompactTokens(last)} last 7 days
          </span>
        </p>
        <SourceIcons
          sourceTotals={sourceTotals}
          selected={filter}
          onSelect={setFilter}
        />
      </section>

      <div className="burns-controls">
        <TextTabs<View>
          label="Chart view"
          options={VIEWS}
          value={view}
          onChange={setView}
        />
        <TextTabs<RangeKey>
          label="Chart range"
          options={RANGE_OPTIONS}
          value={rangeKey}
          onChange={setRangeKey}
        />
      </div>

      <DailyChart
        days={days}
        series={series}
        filter={filter}
        onClearFilter={() => setFilter(null)}
        range={range}
        view={view}
      />
    </div>
  );
}
