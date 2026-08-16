import { useState } from "react";
import { timeAgo } from "../lib/lang";
import { type TldrCount, usePrefs } from "../lib/prefs";
import type { Lang, TldrBullet } from "../lib/types";
import { StoryDialog } from "./StoryDialog";

const TLDR_COUNTS: TldrCount[] = [8, 12, 16];

export function TldrSection({
  bullets,
  defaultCount,
  lang,
  totalStories,
  updatedAt,
  lastFetchedAt,
}: {
  bullets: TldrBullet[];
  defaultCount: number;
  lang: Lang;
  totalStories: number;
  updatedAt: number;
  lastFetchedAt: number | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const { setPrefs } = usePrefs();

  if (bullets.length === 0) return null;
  const shown = showAll ? bullets : bullets.slice(0, defaultCount);
  const mid = Math.ceil(shown.length / 2);
  const cols = [shown.slice(0, mid), shown.slice(mid)];

  return (
    <section className="border-y-2 border-brand py-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold tracking-widest">TL;DR</h2>
          <span className="text-xs text-muted-foreground">
            {lang === "vi" ? "24 giờ qua" : "past 24 hours"}
          </span>
        </div>
        <div className="flex gap-1 text-xs">
          {TLDR_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPrefs({ tldrCount: n })}
              aria-pressed={defaultCount === n}
              className={`rounded-md px-1.5 py-0.5 ${
                defaultCount === n
                  ? "font-bold text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-x-10 md:grid-cols-2">
        {cols.map((col, ci) => (
          <ol
            key={col[0]?.text ?? ci}
            start={ci * mid + 1}
            className="list-decimal space-y-1.5 pl-6 leading-snug marker:text-muted-foreground"
          >
            {col.map((b) => (
              <li key={b.text}>
                {b.item_id ? (
                  <a
                    href={`/ai/${b.item_id}`}
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
                      setOpenItemId(b.item_id ?? null);
                    }}
                    className="underline decoration-border underline-offset-2 hover:decoration-accent"
                  >
                    {b.text}
                  </a>
                ) : (
                  b.text
                )}
              </li>
            ))}
          </ol>
        ))}
      </div>

      {bullets.length > defaultCount && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs font-semibold text-accent hover:underline"
        >
          {showAll
            ? lang === "vi"
              ? "Thu gọn"
              : "Show less ↑"
            : lang === "vi"
              ? "Xem thêm ↓"
              : "Show more ↓"}
        </button>
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

      {openItemId && (
        <StoryDialog
          idPrefix={openItemId}
          lang={lang}
          onClose={() => setOpenItemId(null)}
        />
      )}
    </section>
  );
}
