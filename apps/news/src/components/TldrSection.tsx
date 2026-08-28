import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useState } from "react";
import { type AidrLayout, DEFAULT_AIDR_LAYOUT } from "../lib/aidr-layout";
import { timeAgo } from "../lib/lang";
import { type TldrCount, usePrefs } from "../lib/prefs";
import { topicColor } from "../lib/topic-color";
import type { Lang, TldrBullet } from "../lib/types";
import { StoryDialog } from "./StoryDialog";
import { StoryThumb } from "./StoryThumb";

function TldrBulletRow({
  layout,
  n,
  thumbSrc,
  children,
}: {
  layout: AidrLayout;
  n: number;
  thumbSrc: string | null;
  children: ReactNode;
}): ReactElement {
  const copy = <span className="min-w-0 flex-1">{children}</span>;
  switch (layout) {
    case "a":
    case "b":
      return (
        <span className="flex items-start gap-2">
          {copy}
          <StoryThumb src={thumbSrc} />
        </span>
      );
    case "c":
      return (
        <span className="flex items-start gap-2">
          {copy}
          <span className="relative shrink-0">
            <StoryThumb src={thumbSrc} />
            <span className="absolute bottom-0.5 left-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-foreground/80 px-0.5 text-[10px] font-bold tabular-nums text-background">
              {n}
            </span>
          </span>
        </span>
      );
    default: {
      const _exhaustive: never = layout;
      throw new Error(`unhandled AI;DR layout: ${_exhaustive}`);
    }
  }
}

export function TldrSection({
  bullets,
  defaultCount,
  lang,
  totalStories,
  updatedAt,
  lastFetchedAt,
  topicByItemId,
  imageByItemId,
  snapshotDate,
  layout = DEFAULT_AIDR_LAYOUT,
  layoutLabeled = false,
}: {
  bullets: TldrBullet[];
  defaultCount: number;
  lang: Lang;
  totalStories: number;
  updatedAt: number;
  lastFetchedAt: number | null;
  topicByItemId?: Map<string, string>;
  /** Fallback when a bullet has no read-time `image_url` (cached feeds). */
  imageByItemId?: Map<string, string>;
  snapshotDate?: string;
  layout?: AidrLayout;
  /** Show a tiny "Layout A/B/C" chip when `?aidr=` is set for QA. */
  layoutLabeled?: boolean;
}): ReactElement | null {
  const [openBullet, setOpenBullet] = useState<{
    itemId: string;
    relatedIds: string[];
  } | null>(null);
  const { setPrefs } = usePrefs();

  if (bullets.length === 0) return null;

  // Only offer count options meaningful for how many bullets exist. With
  // x = bullets.length: x <= 8 hides the selector (show all, no picker).
  // x > 8 shows 8 | min(x, 12), and if x > 12 also | min(x, 16) — each
  // higher (nominal) option's effective/displayed value capped at x, with
  // the persisted pref staying one of the nominal 8/12/16 values.
  const options: { effective: number; nominal: TldrCount }[] = [];
  if (bullets.length > 8) {
    options.push({ effective: 8, nominal: 8 });
    const cap12 = Math.min(bullets.length, 12);
    options.push({ effective: cap12, nominal: 12 });
    if (bullets.length > 12) {
      const cap16 = Math.min(bullets.length, 16);
      if (cap16 !== cap12) options.push({ effective: cap16, nominal: 16 });
    }
  }

  const selectedOption =
    options.find((o) => o.nominal === defaultCount) ??
    options[options.length - 1];
  const effectiveDefault = selectedOption
    ? selectedOption.effective
    : bullets.length;

  const shown = bullets.slice(0, effectiveDefault);
  const mid = Math.ceil(shown.length / 2);
  const cols = [shown.slice(0, mid), shown.slice(mid)];

  const selectedIndex = selectedOption ? options.indexOf(selectedOption) : -1;
  const nextOption =
    selectedIndex >= 0 ? options[selectedIndex + 1] : undefined;
  const canCollapse = selectedIndex > 0;
  const numbered = layout === "a";

  return (
    <section className="border-y-2 border-brand py-4" data-aidr-layout={layout}>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold tracking-widest">AI;DR</h2>
          <span className="text-xs text-muted-foreground">
            {snapshotDate
              ? snapshotDate
              : lang === "vi"
                ? "24 giờ qua"
                : "past 24 hours"}
          </span>
          {layoutLabeled && (
            <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Layout {layout.toUpperCase()}
            </span>
          )}
        </div>
        {options.length > 0 && (
          <div className="flex gap-1 text-xs">
            {options.map((o) => (
              <button
                key={o.nominal}
                type="button"
                onClick={() => setPrefs({ tldrCount: o.nominal })}
                aria-pressed={selectedOption === o}
                className={`rounded-md px-1.5 py-0.5 ${
                  selectedOption === o
                    ? "font-bold text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.effective}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-x-10 md:grid-cols-2">
        {cols.map((col, ci) => (
          <ol
            key={col[0]?.text ?? ci}
            start={ci * mid + 1}
            className={
              numbered
                ? "list-decimal space-y-2 pl-6 leading-snug marker:text-muted-foreground"
                : "list-none space-y-2 pl-0 leading-snug"
            }
          >
            {col.map((b, i) => {
              const n = ci * mid + i + 1;
              const primaryId = b.item_ids?.[0];
              const otherIds = (b.item_ids ?? []).slice(1);
              const tag = primaryId ? topicByItemId?.get(primaryId) : undefined;
              const color = tag ? topicColor(tag) : null;
              const thumbSrc =
                b.image_url ??
                (primaryId ? imageByItemId?.get(primaryId) : undefined) ??
                null;
              return (
                <li key={b.text}>
                  <TldrBulletRow layout={layout} n={n} thumbSrc={thumbSrc}>
                    {color && tag && (
                      <span
                        className="topic-colored mr-1.5 text-xs font-semibold uppercase tracking-wide"
                        style={
                          {
                            "--tc-light": color.light,
                            "--tc-dark": color.dark,
                          } as CSSProperties
                        }
                      >
                        {tag}
                      </span>
                    )}
                    {primaryId ? (
                      <a
                        href={`/ai/${primaryId}`}
                        onClick={(e) => {
                          if (
                            e.button !== 0 ||
                            e.metaKey ||
                            e.ctrlKey ||
                            e.shiftKey ||
                            e.altKey
                          ) {
                            return;
                          }
                          e.preventDefault();
                          setOpenBullet({
                            itemId: primaryId,
                            relatedIds: otherIds,
                          });
                        }}
                        className="underline decoration-border underline-offset-2 hover:decoration-accent"
                      >
                        {b.text}
                      </a>
                    ) : (
                      b.text
                    )}
                    {otherIds.length > 0 && (
                      <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                        +{otherIds.length}
                      </span>
                    )}
                  </TldrBulletRow>
                </li>
              );
            })}
          </ol>
        ))}
      </div>

      {nextOption ? (
        <button
          type="button"
          onClick={() => setPrefs({ tldrCount: nextOption.nominal })}
          className="mt-3 text-xs font-semibold text-accent hover:underline"
        >
          {lang === "vi" ? "Xem thêm ↓" : "Show more ↓"}
        </button>
      ) : (
        canCollapse && (
          <button
            type="button"
            onClick={() => setPrefs({ tldrCount: options[0].nominal })}
            className="mt-3 text-xs font-semibold text-accent hover:underline"
          >
            {lang === "vi" ? "Thu gọn" : "Show less ↑"}
          </button>
        )
      )}

      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>
          {totalStories} {lang === "vi" ? "tin" : "stories"}
        </span>
        <span>
          {lastFetchedAt
            ? `${lang === "vi" ? "Cập nhật" : "Updated"} ${timeAgo(
                lastFetchedAt,
                updatedAt,
                lang
              )}`
            : lang === "vi"
              ? "Cập nhật lúc"
              : "News as of"}
        </span>
      </div>

      {openBullet && (
        <StoryDialog
          idPrefix={openBullet.itemId}
          relatedIds={openBullet.relatedIds}
          lang={lang}
          onClose={() => setOpenBullet(null)}
        />
      )}
    </section>
  );
}
