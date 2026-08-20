import { describe, expect, it } from "vitest";
import { deriveBilling, deriveSuggestions } from "./suggestions";
import type { LoaderData } from "./types";

function emptyLoader(): LoaderData {
  return {
    aiActivity: [],
    aiMetrics: {
      activeDays: 0,
      cacheTokens: 0,
      dailyAverage: 0,
      topModel: "",
      totalCost: 0,
      totalTokens: 0,
    },
    aiModels: [],
    ccByModel: [],
    ccEfficiency: [],
    ccProjects: [],
    cacheRatio: [],
    modelCostShare: [],
    activityByWeekday: [],
    activityByHour: [],
    projectLeaderboard: [],
    cloudflare: {
      data: { viewer: { zones: [] } },
      days: 30,
      generatedAt: "",
      totalPageviews: 0,
      totalRequests: 0,
    },
    githubRepos: [],
    posthog: {
      avgVisitorsPerPage: 0,
      blogUrl: "",
      paths: [],
      totalViews: 0,
      totalVisitors: 0,
    },
    wakaLanguages: [],
    wakaMetrics: {
      avgDailyHours: 0,
      daysActive: 0,
      topLanguage: "",
      totalHours: 0,
    },
    wakaTrend: [],
  };
}

describe("deriveSuggestions", () => {
  it("flags a dominant cost driver and a coding-hours drop", () => {
    const data = emptyLoader();
    data.modelCostShare = [
      { name: "claude-opus", cost: 80, tokens: 1, pct: 80 },
      { name: "gpt-4o", cost: 20, tokens: 1, pct: 20 },
    ];
    data.wakaTrend = [
      { displayDate: "Jan", hours: 40, yearMonth: "2026-01" },
      { displayDate: "Feb", hours: 38, yearMonth: "2026-02" },
      { displayDate: "Mar", hours: 20, yearMonth: "2026-03" },
      { displayDate: "Apr", hours: 18, yearMonth: "2026-04" },
    ];
    const cards = deriveSuggestions(data);
    expect(cards.some((card) => card.id === "cost-driver")).toBe(true);
    expect(cards.some((card) => card.id === "coding-hours")).toBe(true);
  });
});

describe("deriveBilling", () => {
  it("computes daily average and ranks cost drivers", () => {
    const data = emptyLoader();
    data.aiMetrics.totalCost = 90;
    data.aiMetrics.activeDays = 30;
    data.modelCostShare = [
      { name: "b", cost: 10, tokens: 1, pct: 10 },
      { name: "a", cost: 80, tokens: 1, pct: 80 },
    ];
    const billing = deriveBilling(data);
    expect(billing.dailyAverage).toBe(3);
    expect(billing.topDrivers[0].name).toBe("a");
  });
});
