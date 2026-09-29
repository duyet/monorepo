/**
 * A deterministic, fully-populated `LoaderData` for render tests.
 *
 * Two things make it useful as an equivalence fixture:
 *
 * 1. Every number is a closed-form function of the row index, so the rendered
 *    HTML is byte-stable across machines and runs. `Math.random` and
 *    `Date.now` would make a golden-file diff useless.
 * 2. The values are deliberately *unrounded and non-uniform* — the
 *    one-in-three thirds that trigger the cost-drift correction, a zero-output
 *    day that forces the `—` em-dash fallbacks, a `null`-ish
 *    `cloudflare.totalPageviews` that must fall through to PostHog. A fixture
 *    of tidy round numbers would render the same before and after almost any
 *    refactor, including a wrong one.
 *
 * It is exported so both the snapshot test and the component tests can use it;
 * nothing in `src/` should.
 */
import type { LoaderData } from "./types";

/** Deterministic pseudo-noise in [0, 1) from an index. */
function wave(i: number, period: number, amplitude = 1): number {
  return (Math.sin((i * Math.PI * 2) / period) / 2 + 0.5) * amplitude;
}

const DAY = 86_400_000;
const EPOCH = Date.UTC(2026, 0, 5, 12, 0, 0);

function isoDate(i: number): string {
  return new Date(EPOCH + i * DAY).toISOString().slice(0, 10);
}

function aiActivity() {
  return Array.from({ length: 30 }, (_, i) => {
    // Every third day has zero output tokens, so `ioRatio` exercises both the
    // numeric branch and the em-dash branch across the burn tiles.
    const input = 1_200_000 + Math.round(wave(i, 7) * 3_000_000);
    const output = i % 3 === 0 ? 0 : 40_000 + Math.round(wave(i, 11) * 90_000);
    const cache = 2_000_000 + Math.round(wave(i, 5) * 4_000_000);
    return {
      "Total Cost": Math.round(wave(i, 13, 40) * 100) / 100,
      "Total Tokens": input + output + cache,
      "Input Tokens": input,
      "Output Tokens": output,
      "Cache Tokens": cache,
      date: isoDate(i),
    };
  });
}

const MODEL_NAMES = [
  "claude-opus-4-6",
  "gpt-5-codex",
  "claude-sonnet-4-5",
  "glm-4.7",
  "qwen3-coder",
  "gpt-4o-mini",
  "deepseek-v3",
];

const LANGUAGES = [
  "TypeScript",
  "Rust",
  "Python",
  "Go",
  "Shell",
  "CSS",
  "Markdown",
];

const PROJECTS = [
  "monorepo",
  "insights",
  "dotfiles",
  "wasm-labs",
  "blog",
  "kb",
  "herdr",
  "scratch",
];

const MODEL_COSTS = [180.11, 95.4, 61.02, 44.31, 22.9, 12.5, 8.13];

const fixture: LoaderData = {
  aiActivity: aiActivity(),

  aiMetrics: {
    activeDays: 26,
    cacheTokens: 78_431_990,
    dailyAverage: 402_113,
    topModel: "claude-opus-4-6",
    totalCost: 3443.24,
    totalTokens: 11_164_457_176,
  },

  aiModels: MODEL_NAMES.map((name, i) => ({
    name,
    percent: Math.round(wave(i, 4, 60) * 10) / 10,
    tokens: 400_000 + i * 310_000,
    cost: MODEL_COSTS[i],
  })),

  ccByModel: MODEL_NAMES.slice(0, 4).flatMap((name, m) =>
    Array.from({ length: 6 }, (_, i) => ({
      date: isoDate(i * 5 + m),
      [name]: Math.round(wave(i + m, 9, 40) * 10) / 10,
    }))
  ).map((row) => ({ ...row })),

  ccEfficiency: Array.from({ length: 14 }, (_, i) => ({
    date: isoDate(i * 2),
    "Efficiency Score": Math.round(wave(i, 6, 4_000_000) * 10) / 10,
  })),

  ccProjects: PROJECTS.slice(0, 5).map((projectName, i) => ({
    projectName,
    relativeUsage: Math.round(wave(i, 3, 100) * 10) / 10,
    tokens: 1_000_000 + i * 470_000,
    lastActivity: isoDate(i * 3),
  })),

  cacheRatio: Array.from({ length: 30 }, (_, i) => ({
    date: isoDate(i),
    pct: Math.round(wave(i, 8, 60) * 10) / 10,
    totalTokens: 300_000_000 + i * 1_100_000,
    cacheTokens: 200_000_000 + Math.round(wave(i, 8) * 40_000_000),
  })),

  modelCostShare: MODEL_NAMES.map((name, i) => ({
    name,
    cost: MODEL_COSTS[i],
    tokens: 1_100_000 + i * 240_000,
    pct: Math.round(wave(i, 5, 100) * 10) / 10,
  })),

  activityByWeekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label, i) => ({
      label,
      key: i + 1,
      tokens: 1_200_000 + Math.round(wave(i, 3, 900_000)),
      cost: Math.round(wave(i, 3, 40) * 100) / 100,
      days: 4,
    })
  ),

  activityByHour: Array.from({ length: 24 }, (_, i) => ({
    label: `${String(i).padStart(2, "0")}:00`,
    key: i,
    tokens: Math.round(wave(i, 12, 700_000)),
    cost: Math.round(wave(i, 12, 9) * 100) / 100,
    days: 1,
  })),

  projectLeaderboard: PROJECTS.map((name, i) => ({
    name,
    tokens: 2_400_000 + Math.round(wave(i, 4, 1_800_000)),
    cost: Math.round(wave(i, 4, 300) * 100) / 100,
    pct: Math.round(wave(i, 4, 100) * 10) / 10,
  })),

  cloudflare: {
    // 0 so the `|| data.posthog.totalViews` fallback is the branch that runs.
    totalPageviews: 0,
    totalRequests: 0,
    days: 30,
    generatedAt: "2026-08-15T09:30:00.000Z",
    data: {
      viewer: {
        zones: [
          {
            httpRequests1dGroups: Array.from({ length: 30 }, (_, i) => ({
              date: { date: isoDate(i) },
              sum: {
                pageViews: 1_800 + Math.round(wave(i, 6, 2_400)),
                requests: 2_100 + Math.round(wave(i, 6, 3_100)),
              },
              uniq: { uniques: 400 + Math.round(wave(i, 6, 900)) },
            })),
          },
        ],
      },
    },
  },

  posthog: {
    avgVisitorsPerPage: 41.7,
    blogUrl: "https://blog.duyet.net",
    totalViews: 92_310,
    totalVisitors: 12_884,
    paths: Array.from({ length: 8 }, (_, i) => ({
      path: `/posts/hello-world-${i}`,
      views: 4_200 - i * 411,
      visitors: 1_030 - i * 97,
    })),
  },

  wakaLanguages: LANGUAGES.map((name, i) => ({
    name,
    percent: Math.round(wave(i, 3, 70) * 10) / 10,
    total_seconds: 40_000 + i * 3_100,
  })),

  wakaMetrics: {
    avgDailyHours: 1.34,
    daysActive: 30,
    topLanguage: "TypeScript",
    totalHours: 40.26,
  },

  wakaTrend: Array.from({ length: 30 }, (_, i) => ({
    displayDate: isoDate(i),
    hours: Math.round(wave(i, 9, 6) * 100) / 100,
    yearMonth: isoDate(i).slice(0, 7),
  })),

  githubRepos: Array.from({ length: 9 }, (_, i) => ({
    name: `project-${i}`,
    stars: 41 - i * 5,
    description: `Fixture repository ${i}`,
    forks: 12 - i,
    watchers: 40 - i,
    // i === 3 drops the language chip and i === 4 drops the license, so the
    // two `&&` guards in the repo grid are both exercised.
    language: i === 3 ? null : LANGUAGES[i % LANGUAGES.length],
    license: i === 4 ? null : "MIT",
    updatedAt: isoDate(i),
  })),
};

export { fixture };
