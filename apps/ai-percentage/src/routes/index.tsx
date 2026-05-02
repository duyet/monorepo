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
    <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] px-5 pb-16 pt-8 text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2] sm:px-8 lg:px-10 2xl:rounded-b-[4rem]">
      <div className="mx-auto max-w-[1360px]">
        <header className="mb-10 pt-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-[#ff6a00]" />
                AI code signal
              </p>
              <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Measuring how much code is written with AI.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-[#4d4d4d] dark:text-[#cfcfc8]">
                Percentage of code written by AI across all repositories,
                detected via co-author signatures and email patterns.
              </p>
            </div>
            <TimeRange />
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
            <AIPercentageTrend />
            <AIPercentageChart />
          </div>

          <p className="border-t border-black/10 px-4 py-4 text-center text-sm text-[#686862] dark:border-white/15 dark:text-[#b7b7aa]">
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

function TimeRange() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y");

  return (
    <div className="flex items-center gap-2 lg:justify-end">
      <label
        htmlFor="time-range"
        className="text-sm text-[#686862] dark:text-[#b7b7aa]"
      >
        Time range:
      </label>
      <select
        id="time-range"
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition focus:border-[#1a1a1a] dark:border-white/15 dark:bg-[#171815] dark:text-[#f8f8f2]"
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
