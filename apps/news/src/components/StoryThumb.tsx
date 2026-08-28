import { type ReactElement, useState } from "react";

/** Branded site mark — used when a story has no og/thumbnail, or the
 * remote image fails. Same asset as the favicon so it never 404s. */
export const STORY_THUMB_PLACEHOLDER = "/favicon.svg";

/**
 * Compact story thumbnail matching the feed card language: rounded,
 * bordered, object-cover. Sized to two lines of the surrounding
 * `leading-snug` copy (`2lh`) so it fills an AI;DR row.
 */
export function StoryThumb({
  src,
  alt = "",
}: {
  src?: string | null;
  alt?: string;
}): ReactElement {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const remote = src && src !== failedSrc ? src : null;
  const showSrc = remote ?? STORY_THUMB_PLACEHOLDER;

  return (
    <img
      src={showSrc}
      alt={alt}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      aria-hidden={alt ? undefined : true}
      onError={(event) => {
        if (remote) {
          setFailedSrc(remote);
          return;
        }
        event.currentTarget.style.visibility = "hidden";
      }}
      className="size-[2lh] min-h-[2lh] min-w-[2lh] shrink-0 self-stretch overflow-hidden rounded-md border border-border bg-brand-soft object-cover"
    />
  );
}
