import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { TldrSection } from "../components/TldrSection";
import { TrendingChips } from "../components/TrendingChips";
import { timeAgo } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { usePrefs } from "../lib/prefs";
import type { FeedResponse } from "../lib/types";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  component: IndexPage,
});

function FeedSkeleton() {
  return (
    <div className="animate-pulse space-y-3 py-6">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-5 rounded bg-muted" />
      ))}
    </div>
  );
}

function IndexPage() {
  const { q } = Route.useSearch();
  const lang = useLang();
  const { prefs } = usePrefs();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [error, setError] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set()
  );

  // Static shell — the feed is bound entirely client-side from /api/feed so
  // this page's HTML is cacheable and never blocks on Clerk/data-fetch JS.
  useEffect(() => {
    let cancelled = false;
    setFeed(null);
    setError(false);
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    fetch(`/api/feed${params}`)
      .then((res) => (res.ok ? (res.json() as Promise<FeedResponse>) : null))
      .then((res) => {
        if (cancelled) return;
        if (res) setFeed(res);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (error) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {lang === "vi"
          ? "Không tải được bảng tin. Thử tải lại trang."
          : "Couldn't load the feed. Try reloading the page."}
      </p>
    );
  }

  if (!feed) return <FeedSkeleton />;

  const bullets = lang === "vi" ? feed.tldr?.bullets_vi : feed.tldr?.bullets_en;

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const days =
    selectedCategories.size === 0
      ? feed.days
      : feed.days
          .map((day) => {
            const items = day.items.filter(
              (item) => item.category && selectedCategories.has(item.category)
            );
            const categoryCounts: Record<string, number> = {};
            for (const item of items) {
              if (item.category) {
                categoryCounts[item.category] =
                  (categoryCounts[item.category] ?? 0) + 1;
              }
            }
            return { ...day, items, categoryCounts };
          })
          .filter((day) => day.items.length > 0);

  return (
    <div>
      {prefs.sections.categories && (
        <CategoryNav
          categories={feed.categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
          lang={lang}
        />
      )}
      {prefs.sections.trending && (
        <TrendingChips
          trending={feed.trending}
          label={lang === "vi" ? "Xu hướng" : "Trending"}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
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
            defaultCount={prefs.tldrCount}
            lang={lang}
            totalStories={feed.totalStories}
            updatedAt={feed.updatedAt}
            lastFetchedAt={feed.lastFetchedAt}
          />
        )
      )}
      {prefs.sections.days &&
        days.map((day) => (
          <DaySection
            key={day.date}
            day={day}
            lang={lang}
            selectedTag={selectedTag}
          />
        ))}
      {prefs.sections.days && days.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {selectedCategories.size > 0
            ? lang === "vi"
              ? "Không có tin phù hợp với bộ lọc."
              : "No stories match the selected filters."
            : lang === "vi"
              ? "Chưa có tin nào."
              : "No stories yet."}
        </p>
      )}
    </div>
  );
}
