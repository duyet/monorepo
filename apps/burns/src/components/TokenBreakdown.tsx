import type { TokenTotals } from "../lib/types";

interface TokenBreakdownProps {
  totals: TokenTotals;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export function TokenBreakdown({ totals }: TokenBreakdownProps) {
  const cost = totals.total_cost.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  return (
    <p style={{
      textAlign: "center",
      fontSize: 13,
      color: "var(--muted)",
      fontVariantNumeric: "tabular-nums",
      lineHeight: 1.8,
    }}>
      Input {fmt(totals.input_tokens)}
      <Sep />
      Output {fmt(totals.output_tokens)}
      <Sep />
      Cache Write {fmt(totals.cache_creation_tokens)}
      <Sep />
      Cache Read {fmt(totals.cache_read_tokens)}
      <Sep />
      {cost}
    </p>
  );
}

function Sep() {
  return <span style={{ margin: "0 8px", color: "var(--hairline)" }}>·</span>;
}
