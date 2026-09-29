import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AIPercentageChart } from "../../components/AIPercentageChart";
import { AIPercentageHero } from "../../components/AIPercentageHero";
import { AIPercentageTrend } from "../../components/AIPercentageTrend";
import { DATE_RANGES } from "../../lib/utils";

export const Route = createFileRoute("/")({
  component: Page,
});

export function Page() {
  // The selected range lives here rather than inside the selector, so both
  // charts are re-requested when it changes.
  const [period, setPeriod] = useState<string>("1y");
  const days = DATE_RANGES.find((range) => range.value === period)?.days ?? 365;

  return (
    <main className="relative z-10 px-5 pb-16 pt-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1360px]">
        <header className="mb-10 pt-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                AI code signal
              </p>
              <h1 className="max-w-5xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                Measuring how much code is written with AI.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
                Percentage of code written by AI across all repositories,
                detected via co-author signatures and email patterns.
              </p>
            </div>
            <TimeRange value={period} onChange={setPeriod} />
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Detected via co-author signatures and email patterns
            </p>
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Repository-level signal, not a vanity counter.
            </h2>
          </div>
        </section>

        <div className="space-y-5">
          <AIPercentageHero />

          <div className="grid gap-5 xl:grid-cols-2">
            <AIPercentageTrend days={days} />
            <AIPercentageChart days={days} />
          </div>

          <p className="border-t border-border px-4 py-4 text-center text-sm text-muted-foreground">
            Data Source: GitHub + ClickHouse | Detection: Co-author & email
            patterns | Last updated:{" "}
            <span suppressHydrationWarning>
              {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}

function TimeRange({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 lg:justify-end">
      <label
        htmlFor="time-range"
        className="text-sm text-muted-foreground"
      >
        Time range:
      </label>
      <select
        id="time-range"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-foreground"
      >
        {DATE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
}
