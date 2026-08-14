import ThemeToggle from "@duyet/components/ThemeToggle";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { DailyChart } from "../components/DailyChart";
import { SourceBreakdown } from "../components/SourceBreakdown";
import { SourceIcons } from "../components/SourceIcons";
import { TokenBreakdown } from "../components/TokenBreakdown";
import { formatDay } from "../lib/dates";
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
  return `Updated ${d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function Page() {
  const data = Route.useLoaderData();
  const range = formatRange(data.firstDate, data.lastDate);
  const updated = formatUpdated(data.generatedAt);

  return (
    <div className="burns-page">
      <header className="burns-header">
        <div>
          <p className="burns-eyebrow">Burns</p>
          <h1 className="burns-title">Token usage</h1>
        </div>
        <ThemeToggle />
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
        />
      </section>

      <section className="burns-section">
        <div className="burns-section-head">
          <h2 className="burns-section-title">Daily</h2>
          <p className="burns-section-meta">Last 90 days</p>
        </div>
        <DailyChart daily={data.daily} />
      </section>

      <section className="burns-section">
        <div className="burns-section-head">
          <h2 className="burns-section-title">By source</h2>
          <p className="burns-section-meta">All-time</p>
        </div>
        <SourceBreakdown totals={data.source_totals ?? []} />
      </section>

      <section className="burns-section">
        <div className="burns-section-head">
          <h2 className="burns-section-title">Token mix</h2>
        </div>
        <TokenBreakdown totals={data.totals} />
      </section>

      <footer className="burns-footer">
        <a href="https://duyet.net">duyet.net</a>
      </footer>
    </div>
  );
}
