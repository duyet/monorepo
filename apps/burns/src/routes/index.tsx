import ThemeToggle from "@duyet/components/ThemeToggle";
import { createFileRoute } from "@tanstack/react-router";
import { type JSX, useState } from "react";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { BreakdownDialog } from "../components/BreakdownDialog";
import {
  DailyChart,
  GRANULARITIES,
  type Granularity,
  RANGES,
  type RangeKey,
} from "../components/DailyChart";
import { SourceIcons } from "../components/SourceIcons";
import { dataLabel } from "../lib/dates";
import { readPublicJson } from "../lib/read-public-json";
import { fmtCost } from "../lib/sources";
import type { TokenData } from "../lib/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const data = await readPublicJson<TokenData>("token-data.json");
    return data;
  },
  component: Page,
});

function Page(): JSX.Element {
  const data = Route.useLoaderData();
  const [filter, setFilter] = useState<string | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("90d");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const label = dataLabel(data.firstDate, data.lastDate, data.generatedAt);
  const labelParts = label ? label.split(" · ") : [];
  const selectedRange = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];

  return (
    <div className="burns-page">
      <header className="burns-header">
        <div>
          <p className="burns-eyebrow">Burns</p>
          <h1 className="burns-title">Token usage</h1>
        </div>
        <div className="burns-header-actions">
          <BreakdownDialog
            sourceTotals={data.source_totals ?? []}
            totals={data.totals}
          />
          <ThemeToggle />
        </div>
      </header>

      <section className="burns-hero">
        <AnimatedCounter target={data.totals.total_tokens} />
        <p className="burns-hero-kicker">tokens all-time</p>
        <p className="burns-hero-meta">
          {fmtCost(data.totals.total_cost)}
          {/*
            Each part of the label is its own nowrap span, so the line breaks
            at the " · " separators and never inside a date.
          */}
          {labelParts.map((part) => (
            <span key={part}>
              {" · "}
              <span className="burns-nowrap">{part}</span>
            </span>
          ))}
        </p>
        <SourceIcons
          sources={data.sources}
          sourceTotals={data.source_totals ?? []}
          selected={filter}
          onSelect={setFilter}
        />
      </section>

      <section className="burns-section burns-section-chart">
        <div className="burns-section-head burns-section-head-switches">
          <div className="burns-switch">
            {GRANULARITIES.map((g) => (
              <button
                key={g.key}
                type="button"
                aria-pressed={granularity === g.key}
                onClick={() => setGranularity(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="burns-switch">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={rangeKey === r.key}
                onClick={() => setRangeKey(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <DailyChart
          daily={data.daily}
          filter={filter}
          range={selectedRange}
          granularity={granularity}
        />
      </section>

      <footer className="burns-footer">
        <a href="https://duyet.net">duyet.net</a>
      </footer>
    </div>
  );
}
