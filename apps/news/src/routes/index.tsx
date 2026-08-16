import { createFileRoute } from "@tanstack/react-router";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { TldrSection } from "../components/TldrSection";
import { TrendingChips } from "../components/TrendingChips";
import { fetchFeed } from "../lib/feed-fn";
import { timeAgo } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { usePrefs } from "../lib/prefs";
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
  const { prefs } = usePrefs();
  const bullets = lang === "vi" ? feed.tldr?.bullets_vi : feed.tldr?.bullets_en;

  return (
    <div>
      {prefs.sections.categories && (
        <CategoryNav categories={feed.categories} lang={lang} />
      )}
      {prefs.sections.trending && (
        <TrendingChips
          trending={feed.trending}
          label={lang === "vi" ? "Xu hướng" : "Trending"}
        />
      )}
      {q ? (
        <p className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm text-muted-foreground">
          <span>
            {lang === "vi" ? "Kết quả cho" : "Results for"}{" "}
            <span className="font-semibold text-foreground">“{q}”</span> —{" "}
            {feed.totalStories}
          </span>
          {feed.lastFetchedAt && (
            <span className="text-xs">
              {lang === "vi" ? "Cập nhật" : "Updated"}{" "}
              {timeAgo(feed.lastFetchedAt, feed.updatedAt, lang)}
            </span>
          )}
        </p>
      ) : (
        prefs.sections.tldr && (
          <TldrSection
            bullets={bullets ?? []}
            lang={lang}
            totalStories={feed.totalStories}
            updatedAt={feed.updatedAt}
            lastFetchedAt={feed.lastFetchedAt}
          />
        )
      )}
      {prefs.sections.days &&
        feed.days.map((day) => (
          <DaySection key={day.date} day={day} lang={lang} />
        ))}
      {prefs.sections.days && feed.days.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {lang === "vi" ? "Chưa có tin nào." : "No stories yet."}
        </p>
      )}
    </div>
  );
}
