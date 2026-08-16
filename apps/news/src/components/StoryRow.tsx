import { ExternalLink, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { highlightTitle } from "../lib/highlight";
import { categoryLabel, timeAgo } from "../lib/lang";
import { topicColor } from "../lib/topic-color";
import type { FeedItem, Lang } from "../lib/types";
import { StoryDetail } from "./StoryDetail";

function HighlightedTitle({ title, tags }: { title: string; tags: string[] }) {
  const segments = highlightTitle(title, tags);
  return (
    <>
      {segments.map((s, i) => {
        if (s.highlighted && s.tag) {
          const color = topicColor(s.tag);
          return (
            <span
              key={i}
              className="topic-colored font-semibold"
              style={
                {
                  "--tc-light": color.light,
                  "--tc-dark": color.dark,
                } as CSSProperties
              }
            >
              {s.text}
            </span>
          );
        }
        return s.highlighted ? (
          <span key={i} className="font-semibold text-accent">
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        );
      })}
    </>
  );
}

export function StoryRow({
  item,
  index,
  lang,
  hot,
  defaultExpanded,
  selectedTag,
}: {
  item: FeedItem;
  index: number;
  lang: Lang;
  hot?: boolean;
  defaultExpanded?: boolean;
  selectedTag?: string | null;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const title = lang === "vi" && item.title_vi ? item.title_vi : item.title;
  const summary =
    lang === "vi" && item.summary_vi ? item.summary_vi : item.summary;
  const hasDetails =
    Boolean(summary) || item.tags.length > 0 || item.sources.length > 0;
  const isMatch = Boolean(
    selectedTag &&
      item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
  );

  return (
    <div id={`item-${item.id}`} className="border-b border-border">
      <div
        className={`flex items-baseline gap-3 ${
          hasDetails ? "cursor-pointer" : ""
        } ${expanded ? "bg-muted/60" : isMatch ? "bg-muted/40" : ""}`}
        style={{
          paddingTop: "var(--reader-pad, 0.5rem)",
          paddingBottom: "var(--reader-pad, 0.5rem)",
        }}
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
        {hot && (
          <TrendingUp
            className="h-4 w-4 shrink-0 self-center text-accent"
            aria-hidden
          />
        )}
        <span
          className={`min-w-0 flex-1 font-semibold leading-snug ${
            isMatch ? "text-accent" : ""
          }`}
        >
          <HighlightedTitle title={title} tags={item.tags} />{" "}
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
