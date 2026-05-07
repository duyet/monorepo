import type { TokenTotals } from "../lib/types";

interface TokenBreakdownProps {
  totals: TokenTotals;
}

function fmt(n: number): string {
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
