import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { DailyEntry } from "../lib/types";
import { DailyChart, RANGES } from "./DailyChart";

/**
 * Guards the two things the legend line has to get right: the total is scoped
 * to the selected range, and it carries the label that names its own scope.
 * Both read as correct in review, since the arithmetic is one line either way.
 */
const B = 1_000_000_000;

function day(date: string, tokens: number): DailyEntry {
  return {
    date,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: tokens,
    cost: 1,
    by_source: [{ source: "Codex", total_tokens: tokens, cost: 1 }],
  };
}

/** Newest-first, matching what `scripts/fetch-burns-data.ts` writes. */
function series(count: number, newestFirst: boolean): DailyEntry[] {
  const entries = Array.from({ length: count }, (_, i) =>
    // Day 0 is the oldest, at 1B, rising by 1B a day.
    day(`2026-03-${String(i + 1).padStart(2, "0")}`, (i + 1) * B)
  );
  return newestFirst ? entries.reverse() : entries;
}

function range(key: (typeof RANGES)[number]["key"]) {
  const found = RANGES.find((r) => r.key === key);
  if (!found) throw new Error(`no range ${key}`);
  return found;
}

function total(html: string): string {
  const match =
    /burns-period-total[^>]*>([\d.,]+[KMBT]?)\s*(?:<!-- -->)?\s*tokens/.exec(
      html
    );
  if (!match) throw new Error(`no period total in ${html.slice(0, 200)}`);
  return match[1];
}

/** 120 days, so 90 days and 30 days both cut inside it. */
const DAILY = series(120, true);

function markup(
  key: (typeof RANGES)[number]["key"],
  filter: string | null = null
): string {
  return renderToStaticMarkup(
    <DailyChart daily={DAILY} range={range(key)} filter={filter} />
  );
}

describe("DailyChart period total", () => {
  test("scopes the total to the range, taking the newest days", () => {
    // Sums of the newest N entries: 91B..120B, then 31B..120B.
    expect(total(markup("30d"))).toBe("3.2T");
    expect(total(markup("90d"))).toBe("6.8T");
    expect(total(markup("12m"))).toBe("7.3T");
    expect(total(markup("all"))).toBe("7.3T");
  });

  test("a range wider than the data shows all of it", () => {
    const three = series(3, true);
    const html = renderToStaticMarkup(
      <DailyChart daily={three} range={range("90d")} />
    );
    expect(total(html)).toBe("6.0B");
  });

  test("names its own scope, and switches to All-time for the open range", () => {
    expect(markup("30d")).toContain(
      '<span class="burns-period-scope">Last 30 days</span>'
    );
    expect(markup("all")).toContain(
      '<span class="burns-period-scope">All-time</span>'
    );
  });

  test("carries the source filter into the scope", () => {
    expect(markup("all", "Codex")).toContain("Codex · All-time");
  });

  test("puts the total on the legend line, after the legend", () => {
    const html = markup("30d");
    const legend = html.indexOf('class="burns-legend"');
    const period = html.indexOf('class="burns-period-total"');
    expect(legend).toBeGreaterThan(-1);
    expect(period).toBeGreaterThan(legend);
    expect(html.slice(legend - 60, legend)).toContain("burns-legend-line");
  });

  test("keeps the total on the line when a range has no legend", () => {
    const bare: DailyEntry[] = [{ ...day("2026-03-01", 5_000), by_source: [] }];
    const html = renderToStaticMarkup(
      <DailyChart daily={bare} range={range("all")} />
    );
    expect(html).not.toContain('class="burns-legend"');
    expect(html).toContain('class="burns-legend-line"');
    expect(total(html)).toBe("5.0K");
  });
});