import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CategoryNav } from "../components/CategoryNav";
import { DaySection } from "../components/DaySection";
import { TldrSection } from "../components/TldrSection";
import { TrendingChips } from "../components/TrendingChips";
import { parseAidrLayout } from "../lib/aidr-layout";
import { emptyFeedCopy, showFeedBrowseChrome } from "../lib/empty-feed";
import { setCachedFeed } from "../lib/feed-cache";
import { fetchFeed } from "../lib/feed-fn";
import { timeAgo } from "../lib/lang";
import { useLang } from "../lib/lang-context";
import { usePrefs } from "../lib/prefs";
import { homepageHead } from "../lib/seo";
import { displayTldrBullets } from "../lib/tldr-fallback";
import type { FeedResponse } from "../lib/types";

export interface IndexSearch {
  q?: string;
  tag?: string;
  category?: string;
  /** QA-only AI;DR layout: a (default) | b | c. */
  aidr?: "a" | "b" | "c";
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    const out: IndexSearch = {};
    if (typeof search.q === "string" && search.q) out.q = search.q;
    if (typeof search.tag === "string" && search.tag) out.tag = search.tag;
    if (typeof search.category === "string" && search.category) {
      out.category = search.category;
    }
    if (search.aidr === "a" || search.aidr === "b" || search.aidr === "c") {
      out.aidr = search.aidr;
    }
    return out;
  },
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) =>
    fetchFeed({
      data: deps.q ? { q: deps.q } : { days: 3 },
    }),
  head: () => homepageHead(),
  component: IndexPage,
});

function SkeletonRow({ i }: { i: number }) {
  const widths = [
    "w-3/4",
    "w-2/3",
    "w-3/4",
    "w-1/2",
    "w-2/3",
    "w-3/4",
    "w-1/2",
    "w-2/3",
  ];
  return (
    <div className="flex items-baseline gap-3 border-b border-border py-2">
      <span className="h-4 w-5 shrink-0 rounded bg-muted" />
      <span className="min-w-0 flex-1 space-y-1.5">
        <span
          className={`block h-4 ${widths[i % widths.length]} rounded bg-muted`}
        />
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
            <div key={col} className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 h-3.5 w-full rounded bg-muted" />
                  <span className="h-10 w-10 shrink-0 rounded-md bg-muted" />
                </div>
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
  const { q, tag, category, aidr } = Route.useSearch();
  const lang = useLang();
  const { prefs } = usePrefs();
  const loaderFeed = Route.useLoaderData();
  const [feed, setFeed] = useState<FeedResponse | null>(
    () => loaderFeed ?? null
  );
  const [error, setError] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
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

  useEffect(() => {
    if (loaderFeed) {
      setFeed(loaderFeed);
      setError(false);
      if (!q) setCachedFeed(loaderFeed);
    }
  }, [loaderFeed, q]);

  // Client refresh (and first paint when the loader had no D1, e.g. prerender).
  useEffect(() => {
    let cancelled = false;
    if (!loaderFeed) {
      setFeed(null);
      setError(false);
      const params = q ? `?q=${encodeURIComponent(q)}` : "?days=3";
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
    }
    const refresh = window.setInterval(() => {
      if (q) return;
      fetch("/api/feed?days=3")
        .then((res) => (res.ok ? (res.json() as Promise<FeedResponse>) : null))
        .then((res) => {
          if (!cancelled && res) {
            setFeed((prev) => {
              if (!prev) return res;
              const older = prev.days.filter(
                (d) => !res.days.some((n) => n.date === d.date)
              );
              return {
                ...res,
                days: [...res.days, ...older],
                hasMore: prev.hasMore || res.hasMore,
              };
            });
            setCachedFeed(res);
          }
        })
        .catch(() => {
          // keep the last good feed
        });
    }, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [q, loaderFeed]);

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

  const bullets = displayTldrBullets(feed.tldr, lang);

  const topicByItemId = new Map<string, string>();
  const imageByItemId = new Map<string, string>();
  for (const day of feed.days) {
    for (const item of day.items) {
      const topic = item.tags[0] ?? item.category;
      if (topic) topicByItemId.set(item.id, topic);
      if (item.image_url) imageByItemId.set(item.id, item.image_url);
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

  const browseChrome = showFeedBrowseChrome(q);

  return (
    <div>
      {prefs.sections.categories && browseChrome && (
        <CategoryNav
          categories={feed.categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
          lang={lang}
        />
      )}
      {prefs.sections.trending && browseChrome && (
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
            imageByItemId={imageByItemId}
            snapshotDate={feed.tldr?.date}
            layout={parseAidrLayout(aidr)}
            layoutLabeled={Boolean(aidr)}
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
      {prefs.sections.days && !q && feed.hasMore && (
        <div className="pt-8 text-center">
          <button
            type="button"
            disabled={loadingOlder}
            onClick={async () => {
              const oldest = feed.days[feed.days.length - 1]?.date;
              if (!oldest) return;
              setLoadingOlder(true);
              try {
                const res = await fetch(
                  `/api/feed?days=5&before=${encodeURIComponent(oldest)}`
                );
                if (!res.ok) return;
                const older = (await res.json()) as FeedResponse;
                setFeed((prev) => {
                  if (!prev) return older;
                  const seen = new Set(prev.days.map((d) => d.date));
                  const merged = [
                    ...prev.days,
                    ...older.days.filter((d) => !seen.has(d.date)),
                  ];
                  return {
                    ...prev,
                    days: merged,
                    hasMore: older.hasMore,
                    totalStories: prev.totalStories + older.totalStories,
                  };
                });
              } finally {
                setLoadingOlder(false);
              }
            }}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {loadingOlder
              ? lang === "vi"
                ? "Đang tải…"
                : "Loading…"
              : lang === "vi"
                ? "Ngày cũ hơn"
                : "Older days"}
          </button>
        </div>
      )}
      {prefs.sections.days && days.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {emptyFeedCopy({
            lang,
            q,
            selectedCategoryCount: selectedCategories.size,
          })}
        </p>
      )}
    </div>
  );
}
