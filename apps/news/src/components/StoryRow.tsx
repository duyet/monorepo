import { ExternalLink, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import {
  ARTICLE_TITLE_TAG,
  FEED_TITLE_TAG,
  type StoryTitleTag,
} from "../lib/article-headings";
import { localizedTitle } from "../lib/display-title";
import { categoryLabel, timeAgo } from "../lib/lang";
import { storyPath } from "../lib/slug";
import { topicColor } from "../lib/topic-color";
import type { FeedItem, Lang } from "../lib/types";
import { HighlightedText } from "./HighlightedText";
import { StoryDetail } from "./StoryDetail";

export function StoryRow({
  item,
  index,
  lang,
  hot,
  defaultExpanded,
  selectedTag,
  titleAs = FEED_TITLE_TAG,
}: {
  item: FeedItem;
  index: number;
  lang: Lang;
  hot?: boolean;
  defaultExpanded?: boolean;
  selectedTag?: string | null;
  /** Article route only — homepage feed keeps a non-heading title. */
  titleAs?: StoryTitleTag;
}) {
  const TitleTag = titleAs;
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const { text: title, fallbackFromEnglish } = localizedTitle(item, lang);
  const summary =
    lang === "vi" && item.summary_vi ? item.summary_vi : item.summary;
  const hasDetails =
    Boolean(summary) || item.tags.length > 0 || item.sources.length > 0;
  const isMatch = Boolean(
    selectedTag &&
      item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
  );
  // Selected-topic rows tint with THAT topic's own deterministic color
  // (same palette as the in-title keyword highlights) instead of a
  // generic accent, so the highlight visually matches the clicked chip.
  const matchColor = isMatch && selectedTag ? topicColor(selectedTag) : null;

  return (
    <div id={`item-${item.id}`} className="border-b border-border">
      <div
        className={`flex items-baseline gap-3 ${
          hasDetails ? "cursor-pointer" : ""
        } ${expanded ? "bg-muted/60" : matchColor ? "topic-hl-row" : ""}`}
        style={
          {
            paddingTop: "var(--reader-pad, 0.5rem)",
            paddingBottom: "var(--reader-pad, 0.5rem)",
            ...(matchColor && {
              "--tc-light": matchColor.light,
              "--tc-dark": matchColor.dark,
            }),
          } as CSSProperties
        }
        onClick={() => hasDetails && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        role={hasDetails ? "button" : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
      >
        <span className="w-5 shrink-0 text-right text-sm text-muted-foreground">
          {index}
        </span>
        <span
          className={`min-w-0 flex-1 font-semibold leading-snug ${
            matchColor ? "topic-colored" : ""
          }`}
        >
          {hot && (
            <TrendingUp
              className="mr-1 inline h-4 w-4 align-[-2px] text-accent"
              aria-hidden
            />
          )}
          <TitleTag
            className={titleAs === ARTICLE_TITLE_TAG ? "inline" : undefined}
          >
            <a
              href={storyPath(item)}
              lang={fallbackFromEnglish ? "en" : undefined}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:underline-offset-2"
            >
              <HighlightedText text={title} tags={item.tags} />
            </a>
          </TitleTag>
          {fallbackFromEnglish && (
            <span
              className="ml-1 align-middle text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              title={
                lang === "vi"
                  ? "Tiêu đề gốc tiếng Anh — chưa có bản dịch"
                  : "Original English title — no Vietnamese translation yet"
              }
            >
              EN
            </span>
          )}{" "}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-accent"
            aria-label="Open story link"
          >
            <ExternalLink className="inline h-3.5 w-3.5 align-baseline" />
          </a>
        </span>
        <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
          {item.category && categoryLabel(item.category, lang)}
        </span>
        <span className="hidden w-20 shrink-0 text-right text-sm text-muted-foreground md:block">
          {timeAgo(item.published_at, Date.now(), lang)}
        </span>
        <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums">
          {item.points}/{item.comments}
        </span>
      </div>

      {expanded && hasDetails && (
        <div className="border-l-2 border-accent/60 bg-muted/30 px-4 py-2.5 md:mx-6">
          <StoryDetail item={item} lang={lang} />
        </div>
      )}
    </div>
  );
}
