import { type JSX, useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="burns-link-button"
        onClick={() => setOpen(true)}
      >
        Breakdown
      </button>
      <dialog
        ref={ref}
        className="burns-dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
      >
        <div className="burns-dialog-body">
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
        </div>
      </dialog>
    </>
  );
}
