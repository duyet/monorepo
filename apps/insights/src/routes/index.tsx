import { createFileRoute } from "@tanstack/react-router";
import { ogMeta } from "@duyet/config/og";
import { SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import type { LoaderData } from "@/components/overview/types";
import {
  loadOverviewDataForStaticBuild,
  fetchOverviewDataFromApi,
} from "@/components/overview/data-loader";
import { buildOverviewModel } from "@/components/overview/model";
import { OverviewHeader } from "@/components/overview/OverviewHeader";
import { KpiTiles } from "@/components/overview/KpiTiles";
import { SuggestionsAndChat } from "@/components/overview/AgentChatPanel";
import { BillingSection } from "@/components/overview/BillingSection";
import { CodingAndAiSplit } from "@/components/overview/CodingAndAiSplit";
import { TokenBurnRow } from "@/components/overview/TokenBurnRow";
import { CacheAndRhythm } from "@/components/overview/CacheAndRhythm";
import { HourlyRhythm } from "@/components/overview/HourlyRhythm";
import { TokenComposition } from "@/components/overview/TokenComposition";
import { TopPosts } from "@/components/overview/TopPosts";
import { RepoGrid } from "@/components/overview/RepoGrid";
import { ProjectLeaderboard } from "@/components/overview/ProjectLeaderboard";
import { TokenAttributionSection } from "@/components/overview/TokenAttributionSection";

export const Route = createFileRoute("/")({
  loader: async (): Promise<LoaderData> =>
    import.meta.env.SSR
      ? loadOverviewDataForStaticBuild()
      : fetchOverviewDataFromApi(),
  head: () => {
    const title = "@duyet Insights";
    const description =
      "Editorial dashboard for duyet.net across traffic, AI usage, coding activity, and content.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...ogMeta({ url: SITE_URL, title, description, image: SITE_OG_IMAGE }),
      ],
    };
  },
  component: IndexPage,
});

/**
 * The overview page: a list of card families, top to bottom.
 *
 * All arithmetic lives in `buildOverviewModel`, all markup in the section
 * components under `components/overview/`. What is left here is the order of
 * the sections, which is the one thing the page actually decides.
 */
function IndexPage() {
  const data: LoaderData = Route.useLoaderData();
  const model = buildOverviewModel(data);

  return (
    <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(44px,6vw,76px)] pb-[clamp(56px,8vw,96px)]">
      <OverviewHeader generatedAt={model.generatedAt} />

      <KpiTiles kpis={model.kpis} />

      <SuggestionsAndChat suggestions={model.suggestions} />
      <BillingSection billing={model.billing} />

      <CodingAndAiSplit
        languageShare={model.languageShare}
        modelShare={model.modelShare}
        totalTokens={model.aiMetrics.totalTokens}
      />

      {data.aiActivity.length > 0 && (
        <TokenBurnRow
          burn={model.burn}
          tokenSums={model.tokenSums}
          aiMetrics={model.aiMetrics}
        />
      )}

      <CacheAndRhythm
        cacheRatio={model.cacheRatio}
        weekday={model.weekday}
      />

      <HourlyRhythm hourly={model.hourly} />

      {data.aiActivity.length > 0 && (
        <TokenComposition
          tokenTypeShares={model.tokenTypeShares}
          costTypeShares={model.costTypeShares}
        />
      )}

      <TopPosts posts={model.topPosts} blogUrl={model.blogUrl} />

      <RepoGrid repos={model.repos} totalStars={model.totalStars} />

      <ProjectLeaderboard projects={model.projectLeaderboard} />

      {/* ---- Detailed analytics (preserved from original) ---- */}
      <TokenAttributionSection data={data} />
    </div>
  );
}
