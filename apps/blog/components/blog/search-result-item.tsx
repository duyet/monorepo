import type { Post } from "@duyet/interfaces";
import { escapeRegExp } from "@duyet/libs/string";
import { cn } from "@duyet/libs/utils";
import { useMemo } from "react";
import { IsFeatured, IsNewPost } from "@/components/post";

export interface SearchResultItemProps {
  post: Post;
  highlight?: string;
  className?: string;
}

/**
 * Individual search result item with optional highlighting.
 */
export function SearchResultItem({
  post,
  highlight,
  className,
}: SearchResultItemProps) {
  // Memoize regex to avoid recompilation on every render
  const highlightRegex = useMemo(() => {
    if (!highlight) return null;
    return new RegExp(`(${escapeRegExp(highlight)})`, "i");
  }, [highlight]);

  const highlightText = (text: string) => {
    if (!highlightRegex) return text;

    const parts = text.split(highlightRegex);

    return parts.map((part, i) => {
      return highlightRegex.test(part) ? (
        <mark
          key={i}
          className="rounded bg-yellow-200 px-0.5 text-neutral-900 dark:bg-yellow-800 dark:text-neutral-100"
        >
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  return (
    <article
      className={cn(
        "group flex flex-col gap-1 py-3 border-t border-border first:border-t-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
        className
      )}
    >
      <a
        className="min-w-0 text-lg font-medium text-foreground underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-foreground"
        href={post.slug}
      >
        {highlightText(post.title)}
        <IsNewPost date={post.date} />
        <IsFeatured featured={post.featured} />
      </a>
      <time className="flex-shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
        {post.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </article>
  );
}
