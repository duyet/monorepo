import { useNavigate } from "@tanstack/react-router";
import { Search, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchFeedOnce, getCachedFeed } from "../lib/feed-cache";
import { categoryLabel, timeAgo } from "../lib/lang";
import {
  type FilterSuggestion,
  matchFilterTarget,
  matchStories,
  type StorySuggestion,
} from "../lib/search-match";
import type { FeedResponse, Lang } from "../lib/types";
import { StoryDialog } from "./StoryDialog";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LEN = 2;

function HighlightedMatch({
  text,
  start,
  end,
}: {
  text: string;
  start: number;
  end: number;
}) {
  return (
    <>
      {text.slice(0, start)}
      <span className="font-semibold text-accent">
        {text.slice(start, end)}
      </span>
      {text.slice(end)}
    </>
  );
}

export function SearchBox({
  placeholder,
  lang,
}: {
  placeholder: string;
  lang: Lang;
}) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [feed, setFeed] = useState<FeedResponse | null>(() => getCachedFeed());
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dialogIdPrefix, setDialogIdPrefix] = useState<string | null>(null);
  const containerRef = useRef<HTMLFormElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQ(value);
    setOpen(value.trim().length >= MIN_QUERY_LEN);
    setActiveIndex(-1);
    if (!feed && value.trim().length >= MIN_QUERY_LEN) {
      fetchFeedOnce().then((res) => {
        if (res) setFeed(res);
      });
    }
  };

  const allItems = feed?.days.flatMap((d) => d.items) ?? [];
  const storyMatches: StorySuggestion[] =
    debouncedQ.trim().length >= MIN_QUERY_LEN
      ? matchStories(allItems, debouncedQ, lang, 7)
      : [];
  const filterMatch: FilterSuggestion | null = feed
    ? matchFilterTarget(debouncedQ, feed.categories, feed.trending)
    : null;

  const rowCount = (filterMatch ? 1 : 0) + storyMatches.length;
  const showDropdown =
    open && debouncedQ === q && q.trim().length >= MIN_QUERY_LEN;

  const selectFilter = () => {
    if (!filterMatch) return;
    setOpen(false);
    setQ("");
    navigate({
      to: "/",
      search:
        filterMatch.kind === "topic"
          ? { tag: filterMatch.value }
          : { category: filterMatch.value },
    });
  };

  const selectStory = (item: StorySuggestion["item"]) => {
    setOpen(false);
    setDialogIdPrefix(item.id);
  };

  const submitFullSearch = () => {
    if (q.trim()) {
      setOpen(false);
      navigate({ to: "/", search: { q: q.trim() } });
    }
  };

  return (
    <>
      <form
        ref={containerRef}
        className="relative w-full max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (activeIndex === -1 || !showDropdown) {
            submitFullSearch();
            return;
          }
          if (filterMatch && activeIndex === 0) {
            selectFilter();
          } else {
            const idx = filterMatch ? activeIndex - 1 : activeIndex;
            const match = storyMatches[idx];
            if (match) selectStory(match.item);
          }
        }}
      >
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (q.trim().length >= MIN_QUERY_LEN) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!showDropdown || rowCount === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1 >= rowCount ? 0 : i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 < 0 ? rowCount - 1 : i - 1));
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background py-1 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          autoComplete="off"
        />

        {showDropdown && rowCount > 0 && (
          <div
            role="listbox"
            className="scrollbar-hide absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-background text-left shadow-lg"
          >
            {filterMatch && (
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === 0}
                onMouseDown={(e) => e.preventDefault()}
                onClick={selectFilter}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs ${
                  activeIndex === 0 ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                <Tag className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  {filterMatch.value}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {lang === "vi" ? "Lọc theo chủ đề" : "Filter by topic"}
                </span>
              </button>
            )}
            {storyMatches.map((m, i) => {
              const rowIndex = filterMatch ? i + 1 : i;
              return (
                <button
                  key={m.item.id}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === rowIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectStory(m.item)}
                  className={`flex w-full flex-col gap-0.5 border-t border-border px-3 py-2 text-left text-xs ${
                    activeIndex === rowIndex ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  <span className="truncate text-foreground">
                    <HighlightedMatch
                      text={m.title}
                      start={m.matchStart}
                      end={m.matchEnd}
                    />
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {m.item.category && categoryLabel(m.item.category, lang)}
                    {m.item.category && " · "}
                    {timeAgo(m.item.published_at, Date.now(), lang)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </form>

      {dialogIdPrefix && (
        <StoryDialog
          idPrefix={dialogIdPrefix}
          lang={lang}
          onClose={() => setDialogIdPrefix(null)}
        />
      )}
    </>
  );
}
