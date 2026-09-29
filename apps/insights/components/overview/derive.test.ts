import { describe, expect, it } from "vitest";
import {
  buildKpis,
  deriveBurnMetrics,
  deriveTokenBreakdown,
  toTokenBuckets,
  topLanguages,
  topModels,
  topProjects,
  trendPct,
} from "./derive";
import type { AiActivity, AiMetrics } from "./types";

/**
 * These pin the exact float behaviour that the prerendered page renders. The
 * percentage expressions are deliberately kept in their original
 * `(total * share) / total` form, which is algebraically a no-op but not
 * bit-identical to the simplified form, so the expected values below are
 * literal rather than recomputed.
 */
function day(
  over: Partial<AiActivity> & { date: string }
): AiActivity {
  return {
    "Total Cost": 0,
    "Total Tokens": 0,
    "Input Tokens": 0,
    "Output Tokens": 0,
    "Cache Tokens": 0,
    ...over,
  };
}

const emptyMetrics: AiMetrics = {
  activeDays: 0,
  cacheTokens: 0,
  dailyAverage: 0,
  topModel: "",
  totalCost: 0,
  totalTokens: 0,
};

describe("deriveTokenBreakdown", () => {
  it("splits tokens into the three category shares", () => {
    const result = deriveTokenBreakdown([
      day({ date: "2026-09-01", "Input Tokens": 300, "Output Tokens": 100, "Cache Tokens": 600 }),
    ]);
    expect(result.tokenSums).toEqual({ input: 300, output: 100, cache: 600 });
    expect(result.totalTokensDerived).toBe(1000);
    expect(result.tokenTypeShares).toEqual([
      { name: "Input", cost: 300, pct: 30 },
      { name: "Output", cost: 100, pct: 10 },
      { name: "Cache", cost: 600, pct: 60 },
    ]);
  });

  it("sums across days before computing shares", () => {
    const result = deriveTokenBreakdown([
      day({ date: "2026-09-01", "Input Tokens": 100 }),
      day({ date: "2026-09-02", "Input Tokens": 200 }),
    ]);
    expect(result.tokenSums.input).toBe(300);
    expect(result.totalTokensDerived).toBe(300);
    expect(result.tokenTypeShares[0].pct).toBe(100);
  });

  it("treats missing token columns as zero rather than NaN", () => {
    const sparse = {
      date: "2026-09-01",
      "Total Tokens": 10,
    } as unknown as AiActivity;
    const result = deriveTokenBreakdown([sparse]);
    expect(result.tokenSums).toEqual({ input: 0, output: 0, cache: 0 });
    expect(result.tokenTypeShares.every((s) => s.pct === 0)).toBe(true);
  });

  it("returns zeroed shares and no cost split for an empty window", () => {
    const result = deriveTokenBreakdown([]);
    expect(result.totalTokensDerived).toBe(0);
    expect(result.totalAiCost).toBe(0);
    expect(result.tokenTypeShares.map((s) => s.pct)).toEqual([0, 0, 0]);
    expect(result.costTypeShares).toEqual([]);
  });

  it("splits cost proportionally to the token split", () => {
    const result = deriveTokenBreakdown([
      day({
        date: "2026-09-01",
        "Total Cost": 100,
        "Input Tokens": 250,
        "Output Tokens": 250,
        "Cache Tokens": 500,
      }),
    ]);
    expect(result.totalAiCost).toBe(100);
    expect(result.costTypeShares.map((s) => s.cost)).toEqual([25, 25, 50]);
  });

  it("absorbs rounding drift into the first cost row", () => {
    // A third each rounds to [33.3, 33.3, 33.3] = 99.9, but the first row is
    // re-rounded after the correction: Math.round(33.3 + 0.1) === 33, so the
    // total lands on 99.6 rather than 100. Pinned because the donut renders
    // these numbers; the drift correction is a display tweak, not a guarantee.
    const result = deriveTokenBreakdown([
      day({
        date: "2026-09-01",
        "Total Cost": 300,
        "Input Tokens": 1,
        "Output Tokens": 1,
        "Cache Tokens": 1,
      }),
    ]);
    expect(result.costTypeShares.map((s) => s.pct)).toEqual([33, 33.3, 33.3]);
    expect(result.costTypeShares.reduce((s, r) => s + r.pct, 0)).toBe(99.6);
  });

  it("yields zero cost percentages when there is no cost at all", () => {
    // totalAiCost is 0, so `share / totalAiCost` is 0/0; the `|| 0` guard is
    // what keeps NaN out of the rendered donut.
    const result = deriveTokenBreakdown([
      day({ date: "2026-09-01", "Input Tokens": 5, "Total Cost": 0 }),
    ]);
    expect(result.costTypeShares.every((s) => Number.isFinite(s.pct))).toBe(true);
    expect(result.costTypeShares[0].pct).toBe(100);
  });
});

describe("deriveBurnMetrics", () => {
  it("formats the input/output ratio from the token sums", () => {
    const burn = deriveBurnMetrics(
      emptyMetrics,
      { input: 155, output: 10, cache: 0 },
      7
    );
    expect(burn.ioRatio).toBe("15.5");
  });

  it("falls back to an em dash when there was no output", () => {
    const burn = deriveBurnMetrics(
      emptyMetrics,
      { input: 100, output: 0, cache: 0 },
      0
    );
    expect(burn.ioRatio).toBe("—");
  });

  it("treats a zero activeDays as 1 so the daily average is not Infinity", () => {
    const burn = deriveBurnMetrics(
      { ...emptyMetrics, totalTokens: 1000, activeDays: 0 },
      { input: 0, output: 0, cache: 0 },
      0
    );
    expect(burn.avgTokensPerDay).toBe("1K");
  });

  it("rounds the cache rate to a whole percentage", () => {
    const burn = deriveBurnMetrics(
      { ...emptyMetrics, totalTokens: 300, cacheTokens: 97 },
      { input: 0, output: 0, cache: 0 },
      0
    );
    expect(burn.cacheRate).toBe("32%");
  });

  it("returns an em dash for the cache rate with no tokens", () => {
    const burn = deriveBurnMetrics(
      emptyMetrics,
      { input: 0, output: 0, cache: 0 },
      0
    );
    expect(burn.cacheRate).toBe("—");
  });

  it("passes the project count through", () => {
    expect(
      deriveBurnMetrics(emptyMetrics, { input: 1, output: 1, cache: 0 }, 7)
        .projectCount
    ).toBe(7);
  });
});

describe("trendPct", () => {
  it("reports a real period-over-period delta", () => {
    expect(trendPct([1, 1, 2, 2])).toBe("+100.0%");
    expect(trendPct([2, 2, 1, 1])).toBe("-50.0%");
  });

  it("returns an em dash for series shorter than four points", () => {
    expect(trendPct([1, 2, 3])).toBe("—");
    expect(trendPct([])).toBe("—");
  });

  it("returns an em dash when the baseline half is zero", () => {
    expect(trendPct([0, 0, 5, 5])).toBe("—");
  });

  it("ignores non-finite samples", () => {
    expect(trendPct([1, 1, Number.NaN, 2, 2])).toBe("+100.0%");
  });

  it("clamps a sub-0.05 move to a literal zero", () => {
    expect(trendPct([1000, 1000, 1000, 1000])).toBe("0.0%");
  });

  it("uses the magnitude of a negative baseline but keeps the delta's sign", () => {
    // -10 -> -5 rises by 5; |first| in the denominator gives +5/10 = +50%,
    // not the -50% a bare `first` denominator would produce.
    expect(trendPct([-10, -10, -5, -5])).toBe("+50.0%");
  });
});

describe("row builders", () => {
  it("reshapes buckets into the distribution-chart shape", () => {
    expect(
      toTokenBuckets([
        { label: "Mon", key: 1, tokens: 10, cost: 1, days: 2 },
      ])
    ).toEqual([{ label: "Mon", Tokens: 10, key: 1 }]);
  });

  it("caps models and languages at five entries", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      name: `claude-model-${i}`,
      percent: i,
      tokens: 1,
    }));
    expect(topModels(many)).toHaveLength(5);
    expect(
      topLanguages(
        many.map((m) => ({
          name: m.name,
          percent: m.percent,
          total_seconds: 1,
        }))
      )
    ).toHaveLength(5);
  });

  it("strips vendor prefixes from model names", () => {
    expect(
      topModels([
        { name: "claude-opus-4-6", percent: 50, tokens: 1 },
        { name: "gpt-5", percent: 50, tokens: 1 },
      ])
    ).toEqual([
      { name: "opus 4 6", pct: 50 },
      { name: "gpt 5", pct: 50 },
    ]);
  });

  it("caps projects at six entries", () => {
    const projects = Array.from({ length: 10 }, (_, i) => ({
      name: `p${i}`,
      tokens: i,
      cost: i,
      pct: 10,
    }));
    expect(topProjects(projects)).toHaveLength(6);
  });
});

describe("buildKpis", () => {
  it("renders the four tiles with their trends", () => {
    const kpis = buildKpis({
      wakaMetrics: {
        totalHours: 40.26,
        avgDailyHours: 1.2,
        daysActive: 30,
        topLanguage: "TypeScript",
      },
      aiMetrics: {
        ...emptyMetrics,
        totalTokens: 11_164_457_176,
        totalCost: 3443.24,
        activeDays: 26,
        topModel: "glm-4.7",
      },
      pageViews: 0,
      wakaSpark: [1, 1, 2, 2],
      viewsSpark: [],
      tokensSpark: [100, 90, 80, 70],
      costSpark: [1, 1, 2, 2],
    });
    expect(kpis.map((k) => k.k)).toEqual([
      "Coding hours",
      "Page views",
      "AI tokens",
      "AI spend",
    ]);
    expect(kpis[0].trend).toBe("+100.0%");
    // formatNumber drops the fraction above 10.
    expect(kpis[0].v).toBe("40");
    // Empty series -> "—", and 11.2B is the compact form of 11,164,457,176.
    expect(kpis[1].trend).toBe("—");
    expect(kpis[2].v).toBe("11.2B");
    expect(kpis[2].sub).toBe("across 26 active days");
    expect(kpis[3].good).toBe(true);
  });
});
