import { describe, expect, test } from "vitest";
import { pivotActivityByModel } from "../data-fetchers";

/**
 * `pivotActivityByModel` turns daily ClickHouse rows into
 * `[{ date, <model>: tokensInK }]` for a Recharts stacked area chart.
 *
 * The bug this covers: the pivot used to be `pivoted[date][model] = tokens`,
 * last-write-wins. `normalizeModelName` deliberately maps several real model
 * names onto one chart series (date and version suffixes are noise for a
 * stacked area chart), and four real pairs collide —
 *
 *   claude-haiku-4-5   <- claude-haiku-4-5-20251001
 *   claude-opus-4-5    <- claude-opus-4-5-20251101
 *   claude-3-5-sonnet  <- claude-3-5-sonnet-20241022
 *   glm-5              <- glm-5:cloud
 *
 * so one of each pair's totals was silently discarded, and *which* one depended
 * on the order the database returned rows in. DuckDB's parallel GROUP BY does
 * not guarantee that order, so the same data could render two different charts
 * on two consecutive builds.
 */

const row = (
  date: string,
  model_name: string,
  total_tokens?: number,
): Record<string, unknown> =>
  total_tokens === undefined
    ? { date, model_name }
    : { date, model_name, total_tokens };

describe("pivotActivityByModel", () => {
  test("sums names that normalize to the same series", () => {
    const out = pivotActivityByModel([
      row("2026-09-01", "claude-haiku-4-5", 100_000),
      row("2026-09-01", "claude-haiku-4-5-20251001", 300_000),
    ]);

    // 100K + 300K -> 400. The old code kept whichever row came last.
    expect(out).toEqual([{ date: "2026-09-01", "claude-haiku-4-5": 400 }]);
  });

  test("is independent of row order", () => {
    const forward = [
      row("2026-09-01", "claude-opus-4-5", 10_000),
      row("2026-09-01", "claude-opus-4-5-20251101", 90_000),
      row("2026-09-01", "glm-5", 5_000),
      row("2026-09-01", "glm-5:cloud", 7_000),
    ];

    const a = pivotActivityByModel(forward);
    const b = pivotActivityByModel([...forward].reverse());

    expect(b).toEqual(a);
    expect(a[0]["claude-opus-4-5"]).toBe(100);
    expect(a[0]["glm-5"]).toBe(12);
  });

  test("covers every real colliding pair", () => {
    const pairs: [string, string][] = [
      ["claude-haiku-4-5", "claude-haiku-4-5-20251001"],
      ["claude-opus-4-5", "claude-opus-4-5-20251101"],
      ["claude-3-5-sonnet", "claude-3-5-sonnet-20241022"],
      ["glm-5", "glm-5:cloud"],
    ];

    for (const [plain, decorated] of pairs) {
      const out = pivotActivityByModel([
        row("2026-09-01", plain, 1_000),
        row("2026-09-01", decorated, 2_000),
      ]);
      expect(Object.keys(out[0]), plain).toEqual(["date", plain]);
      expect(out[0][plain], plain).toBe(3);
    }
  });

  test("keeps genuinely distinct models on separate series", () => {
    const out = pivotActivityByModel([
      row("2026-09-01", "claude-sonnet-4-5-20250929", 1_000),
      row("2026-09-01", "claude-opus-4-5", 2_000),
    ]);

    expect(out[0]).toEqual({
      date: "2026-09-01",
      "claude-sonnet-4-5": 1,
      "claude-opus-4-5": 2,
    });
  });

  test("accumulates per date independently", () => {
    const out = pivotActivityByModel([
      row("2026-09-01", "claude-opus-4-5", 1_000),
      row("2026-09-01", "claude-opus-4-5-20251101", 1_000),
      row("2026-09-02", "claude-opus-4-5", 4_000),
    ]);

    expect(out).toEqual([
      { date: "2026-09-01", "claude-opus-4-5": 2 },
      { date: "2026-09-02", "claude-opus-4-5": 4 },
    ]);
  });

  test("rounds to thousands, and a missing total counts as zero", () => {
    const out = pivotActivityByModel([
      row("2026-09-01", "claude-opus-4-5", 1_499),
      row("2026-09-01", "claude-opus-4-5-20251101"),
    ]);

    expect(out[0]["claude-opus-4-5"]).toBe(1);
  });

  test("returns nothing for an empty result set", () => {
    expect(pivotActivityByModel([])).toEqual([]);
  });
});
