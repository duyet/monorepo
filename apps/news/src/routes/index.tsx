import { createFileRoute } from "@tanstack/react-router";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { TldrSection } from "../components/TldrSection";
import { TrendingChips } from "../components/TrendingChips";
import { fetchFeed } from "../lib/feed-fn";
import { useLang } from "../lib/lang-context";
import type { FeedResponse } from "../lib/types";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }): Promise<FeedResponse> =>
    fetchFeed({ data: { q: deps.q } }),
  component: IndexPage,
});

function IndexPage() {
  const feed = Route.useLoaderData();
  const { q } = Route.useSearch();
  const lang = useLang();
  const bullets = lang === "vi" ? feed.tldr?.bullets_vi : feed.tldr?.bullets_en;

  return (
    <div>
      <CategoryNav categories={feed.categories} />
      <TrendingChips
        trending={feed.trending}
        label={lang === "vi" ? "Xu hướng" : "Trending"}
      />
      {q ? (
        <p className="py-3 text-sm text-muted-foreground">
          {lang === "vi" ? "Kết quả cho" : "Results for"}{" "}
          <span className="font-semibold text-foreground">“{q}”</span> —{" "}
          {feed.totalStories}
        </p>
      ) : (
        <TldrSection
          bullets={bullets ?? []}
          lang={lang}
          totalStories={feed.totalStories}
          updatedAt={feed.updatedAt}
        />
      )}
      {feed.days.map((day) => (
        <DaySection key={day.date} day={day} lang={lang} />
      ))}
      {feed.days.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {lang === "vi" ? "Chưa có tin nào." : "No stories yet."}
        </p>
      )}
    </div>
  );
}
