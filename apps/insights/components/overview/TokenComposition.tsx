/**
 * The token-composition and cost-composition donuts, side by side.
 *
 * Guarded on `aiActivity.length > 0`; with no daily rows the token shares are
 * all 0 and the cost split is an empty array, so the chart falls back to "No
 * model cost data available." twice.
 */
import { ChartCard } from "./CacheAndRhythm";
import { InsightDonutChart } from "./charts";
import type { Share } from "./derive";

function TokenComposition({
  tokenTypeShares,
  costTypeShares,
}: {
  tokenTypeShares: Share[];
  costTypeShares: Share[];
}) {
  return (
    <div className="rd-g2 mt-3">
      <ChartCard
        eyebrow="AI · token composition"
        title="How tokens are spent"
        lede="Input vs output vs cache, as share of total tokens."
      >
        <InsightDonutChart
          ariaLabel="Token type breakdown over the last 30 days"
          data={tokenTypeShares}
        />
      </ChartCard>

      <ChartCard
        eyebrow="AI · cost composition"
        title="How the money was split"
        lede="Share of cost by token type, derived from token ratios."
      >
        <InsightDonutChart
          ariaLabel="Cost type breakdown over the last 30 days"
          data={costTypeShares}
        />
      </ChartCard>
    </div>
  );
}

export { TokenComposition };
