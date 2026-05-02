import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AIPercentageChart } from "../../components/AIPercentageChart";
import { AIPercentageHero } from "../../components/AIPercentageHero";
import { AIPercentageTrend } from "../../components/AIPercentageTrend";
import { DATE_RANGES } from "../../lib/utils";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="sticky top-3 z-10 mb-10 rounded-xl border border-border bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                AI code signal
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                AI Code Usage
              </h1>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Percentage of code written by AI across all repositories.
            </p>
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Detected via co-author signatures and email patterns
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl">
              Measuring how much of my code is written with AI.
            </h2>
          </div>
          <TimeRange />
        </section>

        <div className="space-y-5">
          <AIPercentageHero />

          <div className="grid gap-5 xl:grid-cols-2">
            <AIPercentageTrend />
            <AIPercentageChart />
          </div>

          <p className="rounded-xl border border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
            Data Source: GitHub + ClickHouse | Detection: Co-author & email
            patterns | Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}

function TimeRange() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y");

  return (
    <div className="flex items-center gap-2 lg:justify-end">
      <label htmlFor="time-range" className="text-xs text-muted-foreground">
        Time range:
      </label>
      <select
        id="time-range"
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
      >
        {DATE_RANGES.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}
