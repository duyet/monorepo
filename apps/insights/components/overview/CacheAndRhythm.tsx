/**
 * The cache-efficiency area chart and the weekday token distribution, side by
 * side.
 *
 * Both are unguarded; the chart wrappers fall back to their own "No data
 * available" panel when the series is empty, so the two card shells stay.
 */
import { Eyebrow } from "@duyet/components";
import { InsightAreaChart, InsightDistributionChart } from "./charts";
import type { CacheRatioRow } from "./derive";

/** A titled card wrapping a chart, with the standard eyebrow/heading/lede. */
function ChartCard({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
      <div className="mb-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="text-[1.35rem] mt-[10px] tracking-[-0.03em]">
          {title}
        </h3>
        <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
          {lede}
        </p>
      </div>
      {children}
    </div>
  );
}

function CacheAndRhythm({
  cacheRatio,
  weekday,
}: {
  cacheRatio: CacheRatioRow[];
  weekday: Array<{ label: string; Tokens: number; key: number }>;
}) {
  return (
    <div className="rd-g2 mt-3">
      <ChartCard
        eyebrow="AI · caching"
        title="Cache hit ratio"
        lede="Share of tokens served from cache, last 30 days."
      >
        <InsightAreaChart
          ariaLabel="Daily cache hit ratio over the last 30 days"
          data={cacheRatio}
          keys={["pct"]}
          labelMap={{ pct: "Cache %" }}
        />
      </ChartCard>

      <ChartCard
        eyebrow="AI · when"
        title="Activity by weekday"
        lede="Token volume per day of the week."
      >
        <InsightDistributionChart
          ariaLabel="Token volume by day of week"
          data={weekday}
          dataKey="Tokens"
        />
      </ChartCard>
    </div>
  );
}

export { CacheAndRhythm };
export { ChartCard };
