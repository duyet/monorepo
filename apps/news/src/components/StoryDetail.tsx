import { ExternalLink } from "lucide-react";
import { categoryLabel } from "../lib/lang";
import { storyPath } from "../lib/slug";
import type { FeedItem, Lang } from "../lib/types";
import { SuggestionBadge, SuggestTranslation } from "./SuggestTranslation";

export function fmtTime(epochSec: number, lang: Lang): string {
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

/**
 * The expanded-story body — topics, meta line, summary paragraphs,
 * thumbnail, translation-suggestion action, and key sources. Shared by
 * StoryRow's inline expansion and StoryDialog's modal so both stay in sync.
 */
export function StoryDetail({ item, lang }: { item: FeedItem; lang: Lang }) {
  const summary =
    lang === "vi" && item.summary_vi ? item.summary_vi : item.summary;
  const paragraphs = summary
    ? summary
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          {(item.tags.length > 0 || item.category) && (
            <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "vi" ? "Chủ đề" : "Topics"}
              </span>
              {item.category && (
                <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0 text-xs">
                  {categoryLabel(item.category, lang)}
                </span>
              )}
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 rounded-full border border-border bg-background px-2 py-0 text-xs"
                >
                  {tag}
                </span>
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

          {paragraphs.length > 0 && (
            <div className="max-w-3xl space-y-3 leading-relaxed">
              {paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}

          {lang === "vi" && (
            <div className="flex flex-wrap items-center gap-2">
              <SuggestTranslation
                itemId={item.id}
                field="summary"
                lang={lang}
              />
              <SuggestionBadge itemId={item.id} expanded lang={lang} />
            </div>
          )}
        </div>

        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
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
    </div>
  );
}
