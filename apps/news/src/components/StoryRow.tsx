import { ExternalLink, TrendingUp } from "lucide-react";
import { useState } from "react";
import { categoryLabel, timeAgo } from "../lib/lang";
import { storyPath } from "../lib/slug";
import type { FeedItem, Lang } from "../lib/types";

function fmtTime(epochSec: number, lang: Lang): string {
  return new Date(epochSec * 1000).toLocaleString(
    lang === "vi" ? "vi-VN" : "en-US",
    { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
  );
}

function SourceRow({
  source,
  lang,
}: {
  source: FeedItem["sources"][number];
  lang: Lang;
}) {
  const label =
    source.kind === "discussion"
      ? lang === "vi"
        ? "THẢO LUẬN"
        : "DISCUSSION"
      : source.kind.toUpperCase();
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
      <span className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-accent">
        {label}
      </span>
      {source.author && <span className="font-semibold">{source.author}</span>}
      {source.posted_at && (
        <span className="text-xs text-muted-foreground">
          {fmtTime(source.posted_at, lang)}
        </span>
      )}
      {source.quote && (
        <span className="text-muted-foreground">— {source.quote}</span>
      )}
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
          aria-label="Open source"
        >
          <ExternalLink className="inline h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function StoryRow({
  item,
  index,
  lang,
  hot,
  defaultExpanded,
}: {
  item: FeedItem;
  index: number;
  lang: Lang;
  hot?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const title = lang === "vi" && item.title_vi ? item.title_vi : item.title;
  const summary =
    lang === "vi" && item.summary_vi ? item.summary_vi : item.summary;
  const hasDetails =
    Boolean(summary) || item.tags.length > 0 || item.sources.length > 0;
  const paragraphs = summary
    ? summary
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(item.image_url) && !imageFailed;

  return (
    <div id={`item-${item.id}`} className="border-b border-border">
      <div
        className={`flex items-baseline gap-3 py-2 ${
          hasDetails ? "cursor-pointer" : ""
        } ${expanded ? "bg-muted/60" : ""}`}
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
        <span className="min-w-0 flex-1 font-semibold leading-snug">
          {title}{" "}
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
        <div className="space-y-4 border-l-2 border-accent/60 bg-muted/30 px-4 py-4 md:mx-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              {(item.tags.length > 0 || item.category) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "vi" ? "Chủ đề" : "Topics"}
                  </span>
                  {item.category && (
                    <span className="rounded-full border border-border bg-background px-3 py-0.5 text-sm">
                      {categoryLabel(item.category, lang)}
                    </span>
                  )}
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background px-3 py-0.5 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {paragraphs.length > 0 && (
                <div className="max-w-3xl space-y-3 text-[15px] leading-relaxed">
                  {paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              )}
            </div>

            {showImage && (
              <img
                src={item.image_url ?? undefined}
                alt=""
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="hidden max-h-40 w-40 shrink-0 rounded-md border border-border object-cover md:block"
              />
            )}
          </div>

          {item.sources.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "vi" ? "Nguồn chính" : "Key sources"}
              </div>
              {item.sources.map((source) => (
                <SourceRow
                  key={`${source.kind}-${source.url ?? source.author}`}
                  source={source}
                  lang={lang}
                />
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {fmtTime(item.published_at, lang)} · {item.source_id} · score{" "}
            {item.rank_score.toFixed(1)}
            {item.llm_tokens > 0 && <> · {item.llm_tokens} tokens</>} ·{" "}
            <a
              href={storyPath(item)}
              className="underline underline-offset-2 hover:text-accent"
            >
              {lang === "vi" ? "Trang tin" : "Permalink"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
