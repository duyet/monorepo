import type { TokenData } from "./types";
import { toDays, weekTrend } from "./usage";

/**
 * A small, Claude-Code-style insight note comparing the all-time token burn to
 * a familiar magnitude. Computed deterministically from `token-data.json` so it
 * stays correct on every daily refresh without an LLM round-trip; an
 * LLM-generated override can be supplied via `TokenData.insight` when available.
 */

/** Approximate token counts (words × ~1.3) for familiar texts. */
const BOOKS: ReadonlyArray<{ name: string; tokens: number }> = [
  { name: "Fahrenheit 451", tokens: 60_000 },
  { name: "The Great Gatsby", tokens: 61_000 },
  { name: "1984", tokens: 115_000 },
  { name: "Harry Potter and the Sorcerer's Stone", tokens: 100_000 },
  { name: "The Lord of the Rings", tokens: 630_000 },
  { name: "War and Peace", tokens: 760_000 },
  { name: "the King James Bible", tokens: 1_020_000 },
];

function fmtRatio(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

export function buildInsightNotes(data: TokenData): string[] {
  const notes: string[] = [];
  const total = data.totals.total_tokens;

  // Book comparisons.
  for (const book of BOOKS) {
    if (total >= book.tokens) {
      const ratio = total / book.tokens;
      notes.push(`~${fmtRatio(ratio)}× the tokens in ${book.name}`);
    }
  }

  // Last week vs. the week before.
  const days = toDays(data.daily);
  const { last, prior } = weekTrend(days);
  if (prior > 0 && last > 0) {
    const ratio = last / prior;
    notes.push(
      ratio >= 1
        ? `~${fmtRatio(ratio)}× last week's burn`
        : `~${fmtRatio(1 / ratio)}× less than last week`,
    );
  }

  // Tokens per day of activity.
  const activeDays = days.filter((d) =>
    Object.values(d.by).some((u) => u.tokens > 0),
  ).length;
  if (activeDays > 0) {
    const perDay = total / activeDays;
    notes.push(`~${fmtCompact(perDay)} tokens/day across ${activeDays} active days`);
  }

  return notes;
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString("en-US");
}

/** Pick a single insight note, rotating daily. */
export function pickInsight(data: TokenData): string | null {
  if (data.insight) return data.insight;
  const notes = buildInsightNotes(data);
  if (notes.length === 0) return null;
  const seed = data.generatedAt ? new Date(data.generatedAt).getUTCDate() : 0;
  return notes[seed % notes.length];
}
