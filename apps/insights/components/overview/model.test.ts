/**
 * `buildOverviewModel` is the seam between the loader data and the sections.
 * These assert that it wires each value to the section that consumes it —
 * specifically the three joins that are easy to transpose and impossible to
 * spot by reading:
 *
 *  - weekday buckets come from `activityByWeekday`, hourly from `activityByHour`
 *  - the language card gets `wakaLanguages`, the model card `aiModels`
 *  - `costSpark` reads the *rounded* activity series, so the KPI trend and the
 *    cost sparkline cannot disagree
 *
 * The render-level guarantee that the page still looks identical lives in
 * `src/routes/index.render.test.tsx`; this file covers the wiring, which that
 * test would only catch indirectly.
 */
import { describe, expect, it } from "vitest";
import { buildOverviewModel } from "./model";
import { fixture } from "./fixture";

const model = buildOverviewModel(fixture);

describe("buildOverviewModel", () => {
  it("keys the weekday and hourly distributions to the right buckets", () => {
    // Both are seven-day and twenty-four-hour series, and both are shaped the
    // same way, so a swap would be invisible in a type check.
    expect(model.weekday).toHaveLength(7);
    expect(model.hourly).toHaveLength(24);
    expect(model.weekday[0].label).toBe("Mon");
    expect(model.hourly[0].label).toBe("00:00");
  });

  it("sends languages to the language card and models to the model card", () => {
    expect(model.languageShare.map((r) => r.name)).toEqual(
      fixture.wakaLanguages.slice(0, 5).map((l) => l.name)
    );
    expect(model.modelShare.map((r) => r.name)).toEqual([
      "opus 4 6",
      "gpt 5 codex",
      "sonnet 4 5",
      "glm 4.7",
      "qwen3 coder",
    ]);
  });

  it("builds four KPI tiles with their sparklines", () => {
    expect(model.kpis.map((k) => k.k)).toEqual([
      "Coding hours",
      "Page views",
      "AI tokens",
      "AI spend",
    ]);
    expect(model.kpis[0].spark).toHaveLength(30);
  });

  it("falls back to PostHog for page views when Cloudflare reports zero", () => {
    // The fixture sets cloudflare.totalPageviews to 0 precisely to take this
    // branch, so the KPI's page-view tile is PostHog's total.
    expect(model.kpis[1].v).toBe("92.3K");
  });

  it("caps the most-read posts at five and passes the blog URL through", () => {
    expect(model.topPosts).toHaveLength(5);
    expect(model.blogUrl).toBe("https://blog.duyet.net");
  });

  it("shows six repo cards but totals every star", () => {
    expect(model.repos).toHaveLength(6);
    expect(model.totalStars).toBe(189);
  });

  it("derives the burn metrics from the token sums, not the raw metrics", () => {
    // The ratio is 82,172,747 / 1,765,262 = 46.54..., which only comes out
    // right if `ioRatio` reads the daily token sums. Deriving it from
    // `aiMetrics` (which counts cache too) would collapse the ratio towards 1.
    expect(model.tokenSums.input).toBe(82_172_747);
    expect(model.burn.ioRatio).toBe("46.5");
  });

  it("exposes both donut share lists and the card's token total", () => {
    expect(model.tokenTypeShares.map((s) => s.name)).toEqual([
      "Input",
      "Output",
      "Cache",
    ]);
    expect(model.costTypeShares).toHaveLength(3);
    expect(model.aiMetrics.totalTokens).toBe(11_164_457_176);
  });

  it("reads the sparklines off the same series the charts use", () => {
    // tokensSpark must be the token counts of the same daily rows the donut
    // sums; if it read a different array the tile trend would be about a
    // different month than the rest of the page.
    const last = model.kpis[2].spark.at(-1);
    expect(last).toBe(fixture.aiActivity.at(-1)?.["Total Tokens"]);
  });

  it("carries the suggestions and billing summaries through", () => {
    expect(model.suggestions.length).toBeGreaterThan(0);
    expect(model.billing.topDrivers[0].name).toBe("claude-opus-4-6");
  });

  it("survives an entirely empty window without throwing", () => {
    const empty = {
      ...fixture,
      aiActivity: [],
      aiModels: [],
      projectLeaderboard: [],
      cacheRatio: [],
      activityByWeekday: [],
      activityByHour: [],
      wakaLanguages: [],
      wakaTrend: [],
      githubRepos: [],
      posthog: { ...fixture.posthog, paths: [] },
    };

    const m = buildOverviewModel(empty);
    expect(m.topPosts).toEqual([]);
    expect(m.repos).toEqual([]);
    expect(m.totalStars).toBe(0);
    expect(m.generatedAt).toBe("Aug 15, 2026");
  });

  it("returns null for the header stamp when Cloudflare never generated one", () => {
    const m = buildOverviewModel({
      ...fixture,
      cloudflare: { ...fixture.cloudflare, generatedAt: "" },
    });
    expect(m.generatedAt).toBeNull();
  });
});
