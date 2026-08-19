import { BarList, Eyebrow } from "@duyet/components";
import { compactName, formatNumber } from "./helpers";
import type { BillingSummary } from "./suggestions";

export function BillingSection({ billing }: { billing: BillingSummary }) {
  return (
    <div id="ins-billing" className="rd-card mt-3 p-[clamp(22px,2.6vw,30px)]">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <Eyebrow>Billing · 30d</Eyebrow>
          <h3 className="mt-[10px] text-[1.35rem] tracking-[-0.03em]">
            Usage and burn-down
          </h3>
          <p className="mt-1 font-[var(--font-mono)] text-xs text-[var(--rd-text-3)]">
            Cost per model, daily average, and a 30-day run rate from the same
            ccusage totals already on this page.
          </p>
        </div>
      </div>
      <div className="rd-g3 mb-6">
        <div>
          <div className="rd-eyebrow text-[10.5px]">30d spend</div>
          <div className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.04em]">
            ${formatNumber(billing.totalCost)}
          </div>
        </div>
        <div>
          <div className="rd-eyebrow text-[10.5px]">daily average</div>
          <div className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.04em]">
            ${formatNumber(billing.dailyAverage)}
          </div>
        </div>
        <div>
          <div className="rd-eyebrow text-[10.5px]">30d run rate</div>
          <div className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.04em]">
            ${formatNumber(billing.runRate30d)}
          </div>
        </div>
      </div>
      <BarList
        ariaLabel="Top cost drivers by model"
        data={billing.topDrivers.map((row) => ({
          name: `${compactName(row.name)} · ${Math.round(row.pct)}%`,
          value: Math.round(row.cost * 100) / 100,
        }))}
        formatValue={(value) => `$${formatNumber(value)}`}
      />
    </div>
  );
}
