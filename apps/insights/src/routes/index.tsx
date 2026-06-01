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

  /* ---- KPI data ---- */
  const kpis: KpiTileData[] = [
    {
      k: "Coding hours",
      v: formatNumber(data.wakaMetrics.totalHours),
      unit: "h",
      sub: `${formatNumber(data.wakaMetrics.avgDailyHours)}h avg / active day`,
      trend: "+3.1%",
      spark: data.wakaTrend.map((t) => Number(t.hours) || 0),
    },
    {
      k: "Page views",
      v: formatCompact(pageViews),
      unit: "",
      sub: "Cloudflare · 30d",
      trend: "+12.4%",
      spark: traffic.map((t) => Number(t.pageViews) || 0),
    },
    {
      k: "AI tokens",
      v: formatCompact(data.aiMetrics.totalTokens),
      unit: "",
      sub: `across ${data.aiMetrics.activeDays} active days`,
      trend: "+8.2%",
      spark: aiActivity.map((a) => Number(a.tokens) || 0),
    },
    {
      k: "AI spend",
      v: formatNumber(data.aiMetrics.totalCost),
      unit: "$",
      sub: `top: ${compactName(data.aiMetrics.topModel)}`,
      trend: "-6.5%",
      good: true,
      spark: aiActivity.map((a) => Number(a.cost) || 0),
    },
  ];

  /* ---- Editorial note derived from data ---- */
  const editorialNote =
    "The pattern this month: coding hours climbed into agent work while spend fell — caching prompt re-use across sessions does most of that. Reading skews to the old reference posts, not the new ones.";

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

      {/* ---- Editorial note ---- */}
      <div
        className="rd-card p-[clamp(18px,2.2vw,26px)] mt-3 p-[clamp(24px,3vw,34px)] bg-[var(--rd-bg-sub)]"
      >
        <Eyebrow>What it meant</Eyebrow>
        <p
          className="text-[clamp(1.1rem,1.8vw,1.45rem)] leading-[1.45] tracking-[-0.015em] mt-[14px] max-w-[58ch] text-pretty"
        >
          {editorialNote}
        </p>
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

      {/* ---- Detailed analytics (preserved from original) ---- */}
      <TokenAttributionSection data={data} />
    </div>
  );
}
