import { Clock, Cpu, ExternalLink, Link2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { categoryLabel } from "../lib/lang";
import { detectSuggestField, type SuggestField } from "../lib/selection-field";
import { storyPath } from "../lib/slug";
import { topicColor } from "../lib/topic-color";
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
interface SelectionButtonState {
  field: SuggestField;
  text: string;
  top: number;
  left: number;
}

function splitParagraphs(text: string | null): string[] {
  return text
    ? text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
}

/**
 * @param bilingual When true (and the item has a Vietnamese translation),
 * renders title + summary as two side-by-side columns (EN | VI) instead of
 * a single language — used by StoryDialog's "Dual language" toggle.
 */
export function StoryDetail({
  item,
  lang,
  bilingual,
}: {
  item: FeedItem;
  lang: Lang;
  bilingual?: boolean;
}) {
  const hasVi = Boolean(item.title_vi || item.summary_vi);
  const showBilingual = Boolean(bilingual) && hasVi;
  // The suggest-a-correction UI (and its selection listener) targets the
  // Vietnamese text — available whenever VI text is actually on screen,
  // whether that's because lang="vi" or the bilingual view is showing it.
  const vietnameseVisible = lang === "vi" || (showBilingual && hasVi);

  const summary =
    lang === "vi" && item.summary_vi ? item.summary_vi : item.summary;
  const paragraphs = splitParagraphs(summary);
  const paragraphsEn = splitParagraphs(item.summary);
  const paragraphsVi = splitParagraphs(item.summary_vi);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectionButton, setSelectionButton] =
    useState<SelectionButtonState | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    field: SuggestField;
    text: string;
  } | null>(null);

  // Medium-style "select text → suggest a correction" for the Vietnamese
  // translation. Scoped to this story's content only, listeners attached
  // client-side only (SSR-safe).
  useEffect(() => {
    if (!vietnameseVisible) return;
    const container = containerRef.current;
    if (!container) return;

    const BUTTON_HEIGHT = 32;
    const GAP = 6;

    const onMouseUp = (e: MouseEvent) => {
      // The floating "suggest" button lives inside `container`, so a
      // mouseup on it bubbles here too — and since this listener is a
      // native addEventListener on `container`, it fires *before* React's
      // root-delegated click handler ever runs. Recomputing/clearing
      // selectionButton here would re-render (and can unmount) the button
      // before the click event reaches it, silently swallowing the click.
      if (
        e.target instanceof Node &&
        (e.target as HTMLElement).closest?.("[data-selection-button]")
      ) {
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelectionButton(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelectionButton(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) {
        setSelectionButton(null);
        return;
      }
      const field = detectSuggestField(range.commonAncestorContainer);
      if (!field) {
        setSelectionButton(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const aboveTop = rect.top - BUTTON_HEIGHT - GAP;
      const flip = aboveTop < 0;
      setSelectionButton({
        field,
        text,
        top: flip ? rect.bottom + GAP : aboveTop,
        left: rect.left,
      });
    };

    const hide = () => setSelectionButton(null);
    const onSelectionChange = () => {
      if (window.getSelection()?.isCollapsed) hide();
    };
    const onDocMouseDown = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) hide();
    };

    container.addEventListener("mouseup", onMouseUp);
    window.addEventListener("scroll", hide, true);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mousedown", onDocMouseDown);

    return () => {
      container.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("scroll", hide, true);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [vietnameseVisible]);

  return (
    <div ref={containerRef} className="relative space-y-2">
      {selectionButton && (
        <button
          type="button"
          data-selection-button=""
          style={{
            position: "fixed",
            top: selectionButton.top,
            left: selectionButton.left,
            zIndex: 1100,
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setPendingSuggestion({
              field: selectionButton.field,
              text: selectionButton.text,
            });
            setSelectionButton(null);
          }}
          className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-lg"
        >
          ✎ {lang === "vi" ? "Góp ý" : "Suggest"}
        </button>
      )}
      {/* Two-section layout: story content on the left, a meta sidebar
          (image, topics, details, sources) on the right. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 space-y-3">
          {showBilingual ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:divide-x md:divide-border">
              {/* Current language on the left, the other on the right. The
                  suggest-a-correction target stays on the VI column either
                  way. */}
              {[
                {
                  key: "en",
                  title: item.title,
                  paragraphs: paragraphsEn,
                  isVi: false,
                },
                {
                  key: "vi",
                  title: item.title_vi ?? item.title,
                  paragraphs: paragraphsVi,
                  isVi: true,
                },
              ]
                .sort((a) => (a.key === lang ? -1 : 1))
                .map((col, i) => (
                  <div
                    key={col.key}
                    data-suggest-field={col.isVi ? "summary" : undefined}
                    className={
                      i === 0 ? "space-y-2" : "space-y-2 pt-4 md:pt-0 md:pl-6"
                    }
                  >
                    <h3 className="text-sm font-bold leading-snug text-foreground">
                      {col.title}
                    </h3>
                    {col.paragraphs.length > 0 && (
                      <div className="space-y-3 leading-relaxed">
                        {col.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            paragraphs.length > 0 && (
              <div
                data-suggest-field="summary"
                className="max-w-3xl space-y-3 leading-relaxed"
              >
                {paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )
          )}

          {vietnameseVisible && (
            <div className="flex flex-wrap items-center gap-2">
              <SuggestTranslation
                itemId={item.id}
                field="summary"
                lang={lang}
                initialText={
                  pendingSuggestion?.field === "summary"
                    ? pendingSuggestion.text
                    : undefined
                }
                onInitialTextConsumed={() => setPendingSuggestion(null)}
              />
              <SuggestionBadge itemId={item.id} expanded lang={lang} />
            </div>
          )}

          {item.sources.length > 0 && (
            <div className="space-y-1.5 border-t border-border pt-3">
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

        <aside className="min-w-0 space-y-4 md:border-l md:border-border md:pl-5">
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="max-h-40 w-full rounded-md border border-border object-cover"
            />
          )}

          {(item.tags.length > 0 || item.category) && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {lang === "vi" ? "Chủ đề" : "Topics"}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {item.category && (
                  <span className="rounded-full border border-border bg-background px-2 py-0 text-xs">
                    {categoryLabel(item.category, lang)}
                  </span>
                )}
                {item.tags.map((tag) => {
                  const color = topicColor(tag);
                  return (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background px-2 py-0 text-xs"
                    >
                      <span
                        className="topic-colored"
                        style={
                          {
                            "--tc-light": color.light,
                            "--tc-dark": color.dark,
                          } as CSSProperties
                        }
                      >
                        {tag}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-xs leading-relaxed text-muted-foreground">
            <Clock className="inline h-3 w-3 align-[-1px]" aria-hidden />{" "}
            {fmtTime(item.published_at, lang)} · {item.source_id} · score{" "}
            {item.rank_score.toFixed(1)}
            {item.llm_tokens > 0 && (
              <>
                {" · "}
                <Cpu className="inline h-3 w-3 align-[-1px]" aria-hidden />{" "}
                {item.llm_tokens} tokens
              </>
            )}
            {" · "}
            <a
              href={storyPath(item)}
              className="underline underline-offset-2 hover:text-accent"
            >
              <Link2 className="inline h-3 w-3 align-[-1px]" aria-hidden />{" "}
              {lang === "vi" ? "Trang tin" : "Permalink"}
            </a>
          </div>

        </aside>
      </div>
    </div>
  );
}
