import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { DailyEntry } from "../lib/types";
import { buildSeries, RANGES, toDays } from "../lib/usage";
import { DailyChart } from "./DailyChart";

/**
 * The legend line has to agree with the bars: its total covers the selected
 * range only, names that range, and lists just the agents drawn in it.
 */
const B = 1_000_000_000;

function day(date: string, by: Record<string, number>): DailyEntry {
  return {
    date,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    total_tokens: 0,
    cost: 0,
    by_source: Object.entries(by).map(([source, total_tokens]) => ({
      source,
      total_tokens,
      cost: 1,
    })),
  };
}

/** 120 days, newest first. Codex is 1B a day; Grok is a sliver on day 120. */
const DAILY = Array.from({ length: 120 }, (_, i) =>
  day(
    new Date(Date.UTC(2026, 5, 30) - i * 86_400_000).toISOString().slice(0, 10),
    i === 119 ? { Codex: B, Grok: 1_000 } : { Codex: B }
  )
);

const SERIES = buildSeries(["Codex", "Grok", "pi"]);

function markup(
  rangeKey: (typeof RANGES)[number]["key"],
  filter: string | null = null
) {
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];
  return renderToStaticMarkup(
    <DailyChart
      days={toDays(DAILY)}
      series={SERIES}
      filter={filter}
      onClearFilter={() => {}}
      range={range}
      view="daily"
    />
  );
}

describe("DailyChart legend", () => {
  test("totals the newest days of the range and names the scope", () => {
    expect(markup("30d")).toContain("<b>30B</b> tokens · last 30 days");
    expect(markup("90d")).toContain("<b>90B</b> tokens · last 90 days");
    expect(markup("all")).toContain("<b>120B</b> tokens · all time");
  });

  test("lists only agents with usage in the range, with their share", () => {
    const html = markup("all");
    expect(html).toContain("Codex");
    expect(html).toContain("Grok");
    // Grok is far under 1% of the total.
    expect(html).toContain("&lt;1");
    expect(html).not.toContain(">pi<");
    // Grok only appears on the oldest day, so a 30 day range has no Grok key.
    expect(markup("30d")).not.toContain("Grok");
  });

  test("an agent filter swaps the legend for one clear key", () => {
    const html = markup("30d", "Codex");
    expect(html).toContain("× clear");
    expect(html).not.toContain("<small>100%</small>");
  });

  test("the total is plain text, not a control", () => {
    expect(markup("30d")).toMatch(/<div class="burns-total">/);
  });
});
