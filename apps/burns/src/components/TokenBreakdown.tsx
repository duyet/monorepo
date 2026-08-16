import { fmtCompactTokens } from "../lib/sources";
import type { TokenTotals } from "../lib/types";

interface TokenBreakdownProps {
  totals: TokenTotals;
}

const MIX = [
  { key: "input_tokens", label: "Input", swatch: "burns-mix-input" },
  { key: "output_tokens", label: "Output", swatch: "burns-mix-output" },
  {
    key: "cache_creation_tokens",
    label: "Cache write",
    swatch: "burns-mix-write",
  },
  { key: "cache_read_tokens", label: "Cache read", swatch: "burns-mix-read" },
] as const;

export function TokenBreakdown({ totals }: TokenBreakdownProps) {
  const parts = MIX.map((m) => ({
    ...m,
    value: totals[m.key],
  }));
  const sum = parts.reduce((acc, p) => acc + p.value, 0);

  return (
    <div>
      <div className="burns-mix-bar" aria-hidden="true">
        {parts.map((p) => {
          if (p.value <= 0 || sum <= 0) return null;
          return (
            <i
              key={p.key}
              className={p.swatch}
              style={{ width: `${(p.value / sum) * 100}%` }}
            />
          );
        })}
      </div>
      <ul className="burns-mix-rows">
        {parts.map((p) => (
          <li key={p.key} className="burns-mix-row">
            <span className={`burns-swatch ${p.swatch}`} />
            <span>{p.label}</span>
            <span>{fmtCompactTokens(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
