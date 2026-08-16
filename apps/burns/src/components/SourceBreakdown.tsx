import type { JSX } from "react";
import {
  fmtCompactTokens,
  fmtCost,
  normalizeSource,
  sourceSwatch,
} from "../lib/sources";
import type { SourceTotal } from "../lib/types";

interface SourceBreakdownProps {
  totals: readonly SourceTotal[];
}

export function SourceBreakdown({
  totals,
}: SourceBreakdownProps): JSX.Element | null {
  if (totals.length === 0) return null;

  const merged = new Map<string, SourceTotal>();
  for (const s of totals) {
    const source = normalizeSource(s.source);
    const existing = merged.get(source);
    if (existing) {
      existing.total_tokens += s.total_tokens;
      existing.cost += s.cost;
      continue;
    }
    merged.set(source, { ...s, source });
  }
  const rows = [...merged.values()].sort(
    (a, b) => b.total_tokens - a.total_tokens
  );

  const max = Math.max(...rows.map((s) => s.total_tokens), 1);

  return (
    <ol className="burns-sources">
      {rows.map((s) => {
        const pct = Math.max(
          (s.total_tokens / max) * 100,
          s.total_tokens > 0 ? 0.8 : 0
        );
        const color = sourceSwatch(s.source);
        return (
          <li key={s.source}>
            <div className="burns-source-head">
              <span className="burns-swatch" style={{ background: color }} />
              <span className="burns-source-name">{s.source}</span>
              <span className="burns-source-tokens">
                {fmtCompactTokens(s.total_tokens)}
              </span>
              <span className="burns-source-cost">{fmtCost(s.cost)}</span>
            </div>
            <div className="burns-source-bar">
              <i style={{ width: `${pct}%`, background: color }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
