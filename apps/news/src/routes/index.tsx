import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { TldrSection } from "../components/TldrSection";
import { TrendingChips } from "../components/TrendingChips";
import { setCachedFeed } from "../lib/feed-cache";
import { timeAgo } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { usePrefs } from "../lib/prefs";
import type { FeedResponse } from "../lib/types";

export interface IndexSearch {
  q?: string;
  tag?: string;
  category?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    const out: IndexSearch = {};
    if (typeof search.q === "string" && search.q) out.q = search.q;
    if (typeof search.tag === "string" && search.tag) out.tag = search.tag;
    if (typeof search.category === "string" && search.category) {
      out.category = search.category;
    }
    return out;
  },
  component: IndexPage,
});

function SkeletonRow({ i }: { i: number }) {
  const widths = ["w-3/4", "w-2/3", "w-3/4", "w-1/2", "w-2/3", "w-3/4", "w-1/2", "w-2/3"];
  return (
    <div className="flex items-baseline gap-3 border-b border-border py-2">
      <span className="h-4 w-5 shrink-0 rounded bg-muted" />
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className={`block h-4 ${widths[i % widths.length]} rounded bg-muted`} />
        <span className="block h-3 w-1/4 rounded bg-muted" />
      </span>
      <span className="hidden h-4 w-14 shrink-0 rounded bg-muted sm:block" />
      <span className="h-4 w-10 shrink-0 rounded bg-muted" />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Category nav */}
      <div className="flex items-center gap-1.5 border-b border-border py-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="h-7 w-16 shrink-0 rounded-full bg-muted" />
        ))}
      </div>

      {/* Trending chips */}
      <div className="flex items-center gap-2 py-3">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="h-7 w-20 shrink-0 rounded-full bg-muted" />
        ))}
      </div>

      {/* TL;DR */}
      <div className="space-y-2 border-y-2 border-border py-4">
        <div className="mb-2.5 h-5 w-24 rounded bg-muted" />
        <div className="grid gap-x-10 md:grid-cols-2">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-1.5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-3.5 w-full rounded bg-muted" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Day section */}
      <div className="pt-6">
        <div className="flex items-baseline gap-x-4 border-b-2 border-border pb-2">
          <span className="h-6 w-40 rounded bg-muted" />
          <span className="h-3.5 w-16 rounded bg-muted" />
        </div>
        <div>
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonRow key={i} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IndexPage() {
  const { q, tag, category } = Route.useSearch();
  const lang = useLang();
  const { prefs } = usePrefs();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [error, setError] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(tag ?? null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(category ? [category] : [])
  );

  // Picking a "filter" suggestion from the header SearchBox navigates here
  // with ?tag=/?category= — sync it in even if this component was already
  // mounted (SPA nav doesn't remount).
  useEffect(() => {
    if (tag) setSelectedTag(tag);
  }, [tag]);
  useEffect(() => {
    if (category) setSelectedCategories(new Set([category]));
  }, [category]);

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
        if (res) {
          setFeed(res);
          if (!q) setCachedFeed(res);
        } else {
          setError(true);
        }
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

  const topicByItemId = new Map<string, string>();
  for (const day of feed.days) {
    for (const item of day.items) {
      const topic = item.tags[0] ?? item.category;
      if (topic) topicByItemId.set(item.id, topic);
    }
  }

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
            topicByItemId={topicByItemId}
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
