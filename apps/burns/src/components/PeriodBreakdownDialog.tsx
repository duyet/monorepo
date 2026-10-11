import { type JSX, useState } from "react";
import { BurnsDialog } from "./BurnsDialog";
import type { PeriodSummary } from "../lib/period";
import { rangeScope } from "../lib/period";
import { fmtCompactTokens, fmtCost } from "../lib/sources";
import { SourceBreakdown } from "./SourceBreakdown";
import { TokenBreakdown } from "./TokenBreakdown";

interface PeriodBreakdownDialogProps {
  period: PeriodSummary;
  /** The selected range, e.g. `{ label: "90 days", days: 90 }`. */
  range: { label: string; days: number | null };
  /** Display name of the active source filter, when one is set. */
  filterLabel?: string | null;
}

/**
 * The selected period's total, right-aligned on the legend line, and the
 * dialog it opens.
 *
 * A button rather than plain text because the same numbers itemised are one
 * click away. The count stays the accessible name so the dialog is not the
 * only way to the detail.
 */
export function PeriodBreakdownDialog({
  period,
  range,
  filterLabel = null,
}: PeriodBreakdownDialogProps): JSX.Element | null {
  const [open, setOpen] = useState(false);

  if (period.entries === 0) return null;

  const scope = filterLabel
    ? `${filterLabel} · ${rangeScope(range)}`
    : rangeScope(range);

  return (
    <>
      <button
        type="button"
        className="burns-period-total"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {fmtCompactTokens(period.totalTokens)} tokens
        <span className="burns-period-scope">{scope}</span>
      </button>
      <BurnsDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Token breakdown, ${scope}`}
      >
        <section className="burns-section" style={{ paddingTop: 0 }}>
          <div className="burns-section-head">
            <h2 className="burns-section-title">By source</h2>
            <p className="burns-section-meta">{scope}</p>
          </div>
          <SourceBreakdown totals={period.bySource} />
        </section>

        {/*
            The per-day mix is not split by agent, so a filtered period has no
            mix to show. A zero-filled bar would read as "no cache reads".
          */}
        {period.mix ? (
          <section className="burns-section">
            <div className="burns-section-head">
              <h2 className="burns-section-title">Token mix</h2>
              <p className="burns-section-meta">
                {fmtCost(period.totalCost)} total
              </p>
            </div>
            <TokenBreakdown totals={period.mix} />
          </section>
        ) : null}
      </BurnsDialog>
    </>
  );
}
