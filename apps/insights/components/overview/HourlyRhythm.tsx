/**
 * The hourly rhythm card: a full-width distribution chart of token volume by
 * hour of day.
 *
 * Unlike its weekday sibling this one spans the whole grid rather than sitting
 * in a `rd-g2` pair, and its header aligns to `items-end` rather than carrying
 * a lede paragraph.
 */
import { Eyebrow } from "@duyet/components";
import { InsightDistributionChart } from "./charts";

function HourlyRhythm({
  hourly,
}: {
  hourly: Array<{ label: string; Tokens: number; key: number }>;
}) {
  return (
    <div className="rd-card p-[clamp(22px,2.6vw,30px)] mt-3">
      <div className="flex justify-between items-end mb-5">
        <div>
          <Eyebrow>AI · rhythm</Eyebrow>
          <h3
            className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
          >
            Activity by hour of day
          </h3>
        </div>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
          UTC · token volume
        </span>
      </div>
      <InsightDistributionChart
        ariaLabel="Token volume by hour of day"
        data={hourly}
        dataKey="Tokens"
      />
    </div>
  );
}

export { HourlyRhythm };
