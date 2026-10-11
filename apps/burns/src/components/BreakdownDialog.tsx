import { type JSX, useState } from "react";
import { BurnsDialog } from "./BurnsDialog";
import type { SourceTotal, TokenTotals } from "../lib/types";
import { SourceBreakdown } from "./SourceBreakdown";
import { TokenBreakdown } from "./TokenBreakdown";

interface BreakdownDialogProps {
  sourceTotals: readonly SourceTotal[];
  totals: TokenTotals;
}

export function BreakdownDialog({
  sourceTotals,
  totals,
}: BreakdownDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="burns-link-button"
        onClick={() => setOpen(true)}
      >
        Breakdown
      </button>
      <BurnsDialog
        open={open}
        onClose={() => setOpen(false)}
        title="All-time breakdown"
      >
        <section className="burns-section" style={{ paddingTop: 0 }}>
          <div className="burns-section-head">
            <h2 className="burns-section-title">By source</h2>
            <p className="burns-section-meta">All-time</p>
          </div>
          <SourceBreakdown totals={sourceTotals} />
        </section>

        <section className="burns-section">
          <div className="burns-section-head">
            <h2 className="burns-section-title">Token mix</h2>
          </div>
          <TokenBreakdown totals={totals} />
        </section>
      </BurnsDialog>
    </>
  );
}
