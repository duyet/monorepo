import { Columns2, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePrefs } from "../lib/prefs";
import type { FeedItem, Lang } from "../lib/types";
import { StoryDetail } from "./StoryDetail";

/**
 * Modal that fetches and renders a single story by id prefix. No new deps:
 * a fixed overlay + centered panel, Escape/backdrop/× to close, a body
 * scroll lock while open, and a light focus trap (focuses the panel on
 * open, restores focus to the trigger on close).
 */
export function StoryDialog({
  idPrefix,
  lang,
  onClose,
}: {
  idPrefix: string;
  lang: Lang;
  onClose: () => void;
}) {
  const [item, setItem] = useState<FeedItem | null | undefined>(undefined);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);
  const { prefs, setPrefs } = usePrefs();
  const bilingual = prefs.bilingualDialog;
  const hasVi = Boolean(item?.title_vi || item?.summary_vi);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setItem(undefined);
    fetch(`/api/story/${encodeURIComponent(idPrefix)}`)
      .then((res) => (res.ok ? (res.json() as Promise<FeedItem>) : null))
      .then((res) => {
        if (!cancelled) setItem(res);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });
    return () => {
      cancelled = true;
    };
  }, [idPrefix]);

  const title =
    item && lang === "vi" && item.title_vi ? item.title_vi : item?.title;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Story"}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[85vh] w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-background p-5 text-foreground shadow-xl transition-[max-width] ${
          bilingual ? "max-w-2xl md:max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          {item ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 font-semibold leading-snug hover:text-accent"
            >
              {title}{" "}
              <ExternalLink className="inline h-3.5 w-3.5 align-baseline" />
            </a>
          ) : (
            <span className="flex-1" />
          )}
          <div className="flex shrink-0 items-center gap-1">
            {hasVi && (
              <button
                type="button"
                aria-pressed={bilingual}
                onClick={() => setPrefs({ bilingualDialog: !bilingual })}
                title={
                  lang === "vi"
                    ? "Xem song song Anh/Việt"
                    : "View English/Vietnamese side by side"
                }
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition-colors ${
                  bilingual
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground hover:border-accent/60"
                }`}
              >
                <Columns2 className="h-3.5 w-3.5" aria-hidden />
                Dual language
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === "vi" ? "Đóng" : "Close"}
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {item === undefined && (
          <p className="text-sm text-muted-foreground">
            {lang === "vi" ? "Đang tải..." : "Loading..."}
          </p>
        )}
        {item === null && (
          <p className="text-sm text-muted-foreground">
            {lang === "vi" ? "Không tìm thấy tin." : "Story not found."}
          </p>
        )}
        {item && <StoryDetail item={item} lang={lang} bilingual={bilingual} />}
      </div>
    </div>
  );
}
