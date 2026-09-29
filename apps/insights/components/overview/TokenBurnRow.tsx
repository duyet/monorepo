/**
 * The four "token burn" tiles: input/output ratio, average tokens per active
 * day, cache savings rate, and the distinct project count.
 *
 * Guarded on `aiActivity.length > 0` — with no daily rows the four values are
 * all `—` and the row would be four identical dashes.
 */
import { formatCompact } from "./helpers";
import type { BurnMetrics, TokenTotals } from "./derive";
import type { AiMetrics } from "./types";

/** A single burn tile: a label, a pre-formatted value, and a sub-line. */
function BurnTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col gap-2">
      <span className="rd-eyebrow text-[10.5px]">{label}</span>
      <div className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.04em] leading-none">
        {value}
      </div>
      <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
        {sub}
      </div>
    </div>
  );
}

function TokenBurnRow({
  burn,
  tokenSums,
  aiMetrics,
}: {
  burn: BurnMetrics;
  tokenSums: TokenTotals;
  aiMetrics: AiMetrics;
}) {
  const { ioRatio, avgTokensPerDay, cacheRate, projectCount } = burn;

  return (
    <div className="rd-g4 mt-3">
      {[
        {
          label: "Input / Output ratio",
          value: ioRatio,
          sub: `${formatCompact(tokenSums.input)} in · ${formatCompact(tokenSums.output)} out`,
        },
        {
          label: "Avg tokens / active day",
          value: avgTokensPerDay,
          sub: `${aiMetrics.activeDays} active days`,
        },
        {
          label: "Cache savings rate",
          value: cacheRate,
          sub: `${formatCompact(aiMetrics.cacheTokens)} of ${formatCompact(aiMetrics.totalTokens)} total`,
        },
        {
          label: "Active projects",
          value: String(projectCount),
          sub: "distinct project directories",
        },
      ].map((m, i) => (
        <BurnTile key={i} label={m.label} value={m.value} sub={m.sub} />
      ))}
    </div>
  );
}

export { TokenBurnRow };
export { BurnTile };
