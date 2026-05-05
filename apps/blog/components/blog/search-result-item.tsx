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
        "surface-card-base surface-card-warm group flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4",
        className
      )}
    >
      <a
        className="min-w-0 text-base font-medium text-[#1a1a1a] transition-colors hover:opacity-80 hover:underline hover:underline-offset-4 dark:text-[#f8f8f2]"
        href={post.slug}
      >
        {highlightText(post.title)}
        <IsNewPost date={post.date} />
        <IsFeatured featured={post.featured} />
      </a>
      <hr className="hidden shrink grow border-dotted border-[#1a1a1a]/30 dark:border-[#f8f8f2]/30 sm:block" />
      <time className="flex-shrink-0 whitespace-nowrap text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
        {post.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </article>
  );
}
