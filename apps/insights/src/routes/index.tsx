import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Eyebrow, DistRows, Reveal } from "@duyet/components";
import type { LoaderData } from "@/components/overview/types";
import {
  loadOverviewDataForStaticBuild,
  fetchOverviewDataFromApi,
} from "@/components/overview/data-loader";
import { KpiTile } from "@/components/overview/KpiTile";
import type { KpiTileData } from "@/components/overview/KpiTile";
import { TokenAttributionSection } from "@/components/overview/TokenAttributionSection";
import {
  InsightAreaChart,
  InsightDistributionChart,
  InsightDonutChart,
} from "@/components/overview/charts";
import {
  getTrafficData,
  shortDate,
  compactName,
  formatNumber,
  formatCompact,
} from "@/components/overview/helpers";

export const Route = createFileRoute("/")({
  loader: async (): Promise<LoaderData> =>
    import.meta.env.SSR
      ? loadOverviewDataForStaticBuild()
      : fetchOverviewDataFromApi(),
  head: () => ({
    meta: [
      { title: "@duyet Insights" },
      {
        name: "description",
        content:
          "Editorial dashboard for duyet.net across traffic, AI usage, coding activity, and content.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const data: LoaderData = Route.useLoaderData();
  const traffic = getTrafficData(data.cloudflare);
  const aiActivity = data.aiActivity.map((item) => ({
    cost: Number(item["Total Cost"].toFixed(2)),
    date: shortDate(item.date),
    tokens: item["Total Tokens"],
  }));
  const cacheRatio = data.cacheRatio.map((d) => ({
    date: shortDate(d.date),
    pct: d.pct,
    tokens: d.totalTokens,
  }));
  // ---- Derived breakdowns from daily activity ----
  const tokenSums = data.aiActivity.reduce(
    (acc, day) => {
      acc.input += day["Input Tokens"] ?? 0;
      acc.output += day["Output Tokens"] ?? 0;
      acc.cache += day["Cache Tokens"] ?? 0;
      return acc;
    },
    { input: 0, output: 0, cache: 0 },
  );
  const totalTokensDerived =
    tokenSums.input + tokenSums.output + tokenSums.cache;
  const inpPct =
    totalTokensDerived > 0
      ? Math.round((tokenSums.input / totalTokensDerived) * 1000) / 10
      : 0;
  const outPct =
    totalTokensDerived > 0
      ? Math.round((tokenSums.output / totalTokensDerived) * 1000) / 10
      : 0;
  const cachePct =
    totalTokensDerived > 0
      ? Math.round((tokenSums.cache / totalTokensDerived) * 1000) / 10
      : 0;
  const tokenTypeShares = [
    { name: "Input", cost: tokenSums.input, pct: inpPct },
    { name: "Output", cost: tokenSums.output, pct: outPct },
    { name: "Cache", cost: tokenSums.cache, pct: cachePct },
  ];
  // Cost breakdown by token type (proportional using token ratios)
  const totalAiCost = data.aiActivity.reduce(
    (s, d) => s + (d["Total Cost"] ?? 0),
    0,
  );
  const costTypeShares =
    totalTokensDerived > 0
      ? [
          {
            name: "Input Cost",
            cost: (totalAiCost * tokenSums.input) / totalTokensDerived,
            pct:
              Math.round(
                ((totalAiCost * tokenSums.input) / totalTokensDerived /
                  totalAiCost) *
                  1000,
              ) / 10 || 0,
          },
          {
            name: "Output Cost",
            cost: (totalAiCost * tokenSums.output) / totalTokensDerived,
            pct:
              Math.round(
                ((totalAiCost * tokenSums.output) / totalTokensDerived /
                  totalAiCost) *
                  1000,
              ) / 10 || 0,
          },
          {
            name: "Cache Cost",
            cost: (totalAiCost * tokenSums.cache) / totalTokensDerived,
            pct:
              Math.round(
                ((totalAiCost * tokenSums.cache) / totalTokensDerived /
                  totalAiCost) *
                  1000,
              ) / 10 || 0,
          },
        ]
      : [];
  // Normalise cost pct to sum exactly 100
  const costPctSum = costTypeShares.reduce((s, r) => s + r.pct, 0);
  const costDrift = 100 - costPctSum;
  if (costTypeShares.length > 0 && Math.abs(costDrift) > 0.01) {
    costTypeShares[0].pct = Math.max(
      0,
      Math.round(costTypeShares[0].pct + costDrift),
    );
  }

  // ---- Token burn metrics ----
  const activeDays = data.aiMetrics.activeDays || 1;
  const ioRatio =
    tokenSums.output > 0
      ? (tokenSums.input / tokenSums.output).toFixed(1)
      : "—";
  const avgTokensPerDay = formatCompact(
    data.aiMetrics.totalTokens / activeDays,
  );
  const cacheRate =
    data.aiMetrics.totalTokens > 0
      ? `${Math.round((data.aiMetrics.cacheTokens / data.aiMetrics.totalTokens) * 100)}%`
      : "—";
  const projectCount = data.projectLeaderboard.length;

  const weekday = data.activityByWeekday.map((d) => ({
    label: d.label,
    Tokens: d.tokens,
    key: d.key,
  }));
  const hourly = data.activityByHour.map((d) => ({
    label: d.label,
    Tokens: d.tokens,
    key: d.key,
  }));
  const projectLeaderboard = data.projectLeaderboard
    .slice(0, 6)
    .map((p) => ({
      name: p.name,
      pct: p.pct,
      tokens: p.tokens,
      cost: p.cost,
    }));
  const topModels = data.aiModels.slice(0, 5).map((model) => ({
    name: compactName(model.name),
    pct: model.percent,
  }));
  const topLanguages = data.wakaLanguages.slice(0, 5).map((language) => ({
    name: language.name,
    pct: language.percent,
  }));
  const topPosts = data.posthog.paths.slice(0, 5);
  const pageViews =
    data.cloudflare.totalPageviews || data.posthog.totalViews;

  const generatedAt = data.cloudflare.generatedAt
    ? new Date(data.cloudflare.generatedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  /* ---- KPI data ----
   * Trend is a real period-over-period delta: mean of the second half of the
   * series vs the first half. Returns "—" when the series is too short or the
   * baseline is zero (an undefined ratio, not a synthetic +100%). */
  const trendPct = (series: number[]): string => {
    const s = series.filter((n) => Number.isFinite(n));
    if (s.length < 4) return "—";
    const mid = Math.floor(s.length / 2);
    const mean = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const first = mean(s.slice(0, mid));
    const second = mean(s.slice(mid));
    if (first === 0) return "—";
    // |first| in the denominator keeps the real sign for a negative baseline.
    const pct = Math.round(((second - first) / Math.abs(first)) * 1000) / 10;
    if (Math.abs(pct) < 0.05) return "0.0%";
    return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const wakaSpark = data.wakaTrend.map((t) => Number(t.hours) || 0);
  const viewsSpark = traffic.map((t) => Number(t.pageViews) || 0);
  const tokensSpark = aiActivity.map((a) => Number(a.tokens) || 0);
  const costSpark = aiActivity.map((a) => Number(a.cost) || 0);

  const kpis: KpiTileData[] = [
    {
      k: "Coding hours",
      v: formatNumber(data.wakaMetrics.totalHours),
      unit: "h",
      sub: `${formatNumber(data.wakaMetrics.avgDailyHours)}h avg / active day`,
      trend: trendPct(wakaSpark),
      spark: wakaSpark,
    },
    {
      k: "Page views",
      v: formatCompact(pageViews),
      unit: "",
      sub: "Cloudflare · 30d",
      trend: trendPct(viewsSpark),
      spark: viewsSpark,
    },
    {
      k: "AI tokens",
      v: formatCompact(data.aiMetrics.totalTokens),
      unit: "",
      sub: `across ${data.aiMetrics.activeDays} active days`,
      trend: trendPct(tokensSpark),
      spark: tokensSpark,
    },
    {
      k: "AI spend",
      v: formatNumber(data.aiMetrics.totalCost),
      unit: "$",
      sub: `top: ${compactName(data.aiMetrics.topModel)}`,
      trend: trendPct(costSpark),
      good: true,
      spark: costSpark,
    },
  ];

  /* ---- Repo data for grid ---- */
  const totalStars = data.githubRepos.reduce(
    (sum, r) => sum + (r.stars || 0),
    0,
  );
  const displayRepos = data.githubRepos.slice(0, 6);

  return (
    <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(44px,6vw,76px)] pb-[clamp(56px,8vw,96px)]">
      {/* ---- Header ---- */}
      <Eyebrow>Insights · Last 30 days</Eyebrow>
      <h1 className="text-[clamp(2rem,4.6vw,3.4rem)] font-semibold tracking-[-0.04em] mt-[18px] max-w-[20ch]">
        A quiet view of what shipped, what ran, and what was read.
      </h1>
      <p
        className="rd-lead mt-5 max-w-[64ch]"
      >
        One editorial page across coding time, AI usage, traffic, and the
        most-read posts. No dashboards, no chrome — just the numbers and
        what they meant this month.
      </p>
      <div
        className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-4"
      >
        {generatedAt
          ? `Last updated ${generatedAt}`
          : `Last 30 days`}{" "}
        · sources: Cloudflare, PostHog, ClickHouse, WakaTime
      </div>

      {/* ---- KPI tiles ---- */}
      <div className="rd-g4 mt-[34px]">
        {kpis.map((t, i) => (
          <Reveal key={i} delay={i * 50}>
            <KpiTile t={t} />
          </Reveal>
        ))}
      </div>

      {/* ---- Coding + AI split ---- */}
      <div className="rd-g2 mt-3">
        {/* Languages */}
        <div
          id="ins-coding"
          className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-center mb-5"
          >
            <div>
              <Eyebrow>Coding · WakaTime</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Where the hours went
              </h3>
            </div>
            <span className="rd-chip font-[var(--font-mono)] text-[11px]">
              30d
            </span>
          </div>
          <DistRows rows={topLanguages} />
        </div>

        {/* Models */}
        <div
          id="ins-models"
          className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-center mb-5"
          >
            <div>
              <Eyebrow>AI · model share</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Where the tokens went
              </h3>
            </div>
            <span className="rd-chip font-[var(--font-mono)] text-[11px]">
              {formatCompact(data.aiMetrics.totalTokens)}
            </span>
          </div>
          <DistRows rows={topModels} />
        </div>
      </div>

      {/* ---- Token burn metrics ---- */}
      {data.aiActivity.length > 0 && (
        <div className="rd-g4 mt-3">
          {[
            {
              label: "Input / Output ratio",
              value: ioRatio,
              sub: `${formatCompact(tokenSums.input)} in · ${formatCompact(tokenSums.output)} out`,
            },
            {
              label: "Avg tokens / active day",
              value: avgTokensPerDay,
              sub: `${data.aiMetrics.activeDays} active days`,
            },
            {
              label: "Cache savings rate",
              value: cacheRate,
              sub: `${formatCompact(data.aiMetrics.cacheTokens)} of ${formatCompact(data.aiMetrics.totalTokens)} total`,
            },
            {
              label: "Active projects",
              value: String(projectCount),
              sub: "distinct project directories",
            },
          ].map((m, i) => (
            <div
              key={i}
              className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col gap-2"
            >
              <span className="rd-eyebrow text-[10.5px]">{m.label}</span>
              <div className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.04em] leading-none">
                {m.value}
              </div>
              <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Cache efficiency + rhythm ---- */}
      <div className="rd-g2 mt-3">
        <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>AI · caching</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Cache hit ratio
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Share of tokens served from cache, last 30 days.
            </p>
          </div>
          <InsightAreaChart
            ariaLabel="Daily cache hit ratio over the last 30 days"
            data={cacheRatio}
            keys={["pct"]}
            labelMap={{ pct: "Cache %" }}
          />
        </div>

        <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
          <div className="mb-5">
            <Eyebrow>AI · when</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Activity by weekday
            </h3>
            <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
              Token volume per day of the week.
            </p>
          </div>
          <InsightDistributionChart
            ariaLabel="Token volume by day of week"
            data={weekday}
            dataKey="Tokens"
          />
        </div>
      </div>

      {/* ---- Hourly rhythm ---- */}
      <div className="rd-card p-[clamp(22px,2.6vw,30px)] mt-3">
        <div className="flex justify-between items-end mb-5">
          <div>
            <Eyebrow>AI · rhythm</Eyebrow>
            <h3
              className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
            >
              Activity by hour of day
            </h3>
          </div>
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
            UTC · token volume
          </span>
        </div>
        <InsightDistributionChart
          ariaLabel="Token volume by hour of day"
          data={hourly}
          dataKey="Tokens"
        />
      </div>

      {/* ---- Token & cost breakdown (donuts) ---- */}
      {data.aiActivity.length > 0 && (
        <div className="rd-g2 mt-3">
          <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
            <div className="mb-5">
              <Eyebrow>AI · token composition</Eyebrow>
              <h3 className="text-[1.35rem] mt-[10px] tracking-[-0.03em]">
                How tokens are spent
              </h3>
              <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
                Input vs output vs cache, as share of total tokens.
              </p>
            </div>
            <InsightDonutChart
              ariaLabel="Token type breakdown over the last 30 days"
              data={tokenTypeShares}
            />
          </div>
          <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
            <div className="mb-5">
              <Eyebrow>AI · cost composition</Eyebrow>
              <h3 className="text-[1.35rem] mt-[10px] tracking-[-0.03em]">
                How the money was split
              </h3>
              <p className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-1">
                Share of cost by token type, derived from token ratios.
              </p>
            </div>
            <InsightDonutChart
              ariaLabel="Cost type breakdown over the last 30 days"
              data={costTypeShares}
            />
          </div>
        </div>
      )}

      {/* ---- Most-read pages ---- */}
      {topPosts.length > 0 && (
        <div
          id="ins-reading"
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-end mb-2"
          >
            <div>
              <Eyebrow>Reading · PostHog</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Most-read pages
              </h3>
            </div>
            <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
              unique visitors · 30d
            </span>
          </div>
          <div className="rd-rows">
            {topPosts.map((r, i) => {
              const max = topPosts[0].views;
              return (
                <a
                  key={i}
                  className="rd-row grid-cols-[auto_1fr_auto] no-underline text-inherit"
                  href={`${data.posthog.blogUrl || "https://blog.duyet.net"}${r.path}`}
                >
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs w-[22px]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="font-[var(--font-mono)] text-[13.5px] block truncate"
                    >
                      {r.path}
                    </span>
                    <div
                      className="rd-meter mt-2 max-w-[360px]"
                    >
                      <i
                        style={{
                          width: `${(r.views / max) * 100}%`,
                        }}
                      />
                    </div>
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-sm font-semibold"
                  >
                    {formatNumber(r.visitors)}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Open source repos ---- */}
      {displayRepos.length > 0 && (
        <div
          id="ins-repos"
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-end mb-[18px]"
          >
            <div>
              <Eyebrow>Open source · GitHub</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Public repositories
              </h3>
            </div>
            <a
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] rd-ulink text-[12.5px]"
              href="https://github.com/duyet"
              target="_blank"
              rel="noreferrer"
            >
              {displayRepos.length} repos · {totalStars} stars
            </a>
          </div>
          <div className="rd-g3">
            {displayRepos.map((r) => (
              <a
                key={r.name}
                className="rd-card p-[clamp(18px,2.2vw,26px)] bg-[var(--rd-bg-sub)] px-[18px] py-[16px] no-underline text-inherit"
                href={`https://github.com/duyet/${r.name}`}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className="font-[var(--font-mono)] text-sm font-semibold truncate"
                >
                  {r.name}
                </div>
                <div
                  className="flex items-center gap-3 mt-3"
                >
                  {r.language && (
                    <span className="rd-chip text-[11px]">
                      {r.language}
                    </span>
                  )}
                  {r.license && (
                    <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px]">
                      {r.license}
                    </span>
                  )}
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] ml-auto inline-flex items-center gap-1"
                  >
                    <Star size={12} /> {r.stars}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ---- Project leaderboard ---- */}
      {projectLeaderboard.length > 0 && (
        <div
          id="ins-projects"
          className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(22px,2.6vw,30px)]"
        >
          <div
            className="flex justify-between items-end mb-2"
          >
            <div>
              <Eyebrow>AI · projects</Eyebrow>
              <h3
                className="text-[1.35rem] mt-[10px] tracking-[-0.03em]"
              >
                Where the work happened
              </h3>
            </div>
            <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
              top projects by tokens · 30d
            </span>
          </div>
          <div className="rd-rows">
            {projectLeaderboard.map((item, i) => {
              const max = projectLeaderboard[0].tokens;
              return (
                <div
                  key={i}
                  className="rd-row grid-cols-[auto_1fr_auto] gap-[18px] items-center"
                >
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs w-[22px]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="font-[var(--font-mono)] text-[13.5px] block truncate"
                    >
                      {item.name}
                    </span>
                    <div
                      className="rd-meter mt-2 max-w-[360px]"
                    >
                      <i
                        style={{
                          width: `${(item.tokens / max) * 100}%`,
                        }}
                      />
                    </div>
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-sm font-semibold"
                  >
                    {formatCompact(item.tokens)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Detailed analytics (preserved from original) ---- */}
      <TokenAttributionSection data={data} />
    </div>
  );
}
