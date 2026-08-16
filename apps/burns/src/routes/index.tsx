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
import { BURNS_LOCALE, formatDay } from "../lib/dates";
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

function formatRange(first: string | null, last: string | null): string | null {
  if (!first || !last) return null;
  return `${formatDay(first, true)} — ${formatDay(last, true)}`;
}

function formatUpdated(iso: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `Updated ${d.toLocaleDateString(BURNS_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function Page(): JSX.Element {
  const data = Route.useLoaderData();
  const [filter, setFilter] = useState<string | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("90d");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const range = formatRange(data.firstDate, data.lastDate);
  const updated = formatUpdated(data.generatedAt);

  return (
    <div className="burns-page">
      <header className="burns-header">
        <div>
          <p className="burns-eyebrow">Burns</p>
          <h1 className="burns-title">Token usage</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
          {range ? ` · ${range}` : ""}
          {updated ? ` · ${updated}` : ""}
        </p>
        <SourceIcons
          sources={data.sources}
          sourceTotals={data.source_totals ?? []}
          selected={filter}
          onSelect={setFilter}
        />
      </section>

      <section className="burns-section burns-section-chart">
        <div className="burns-section-head">
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
          days={RANGES.find((r) => r.key === rangeKey)?.days ?? null}
          granularity={granularity}
        />
      </section>

      <footer className="burns-footer">
        <a href="https://duyet.net">duyet.net</a>
      </footer>
    </div>
  );
}
