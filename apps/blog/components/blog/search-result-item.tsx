import type { Post } from "@duyet/interfaces";
import { cn } from "@duyet/libs/utils";
import Link from "next/link";
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
  const highlightText = (text: string) => {
    if (!highlight) return text;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="rounded bg-yellow-200 px-0.5 text-neutral-900 dark:bg-yellow-800 dark:text-neutral-100"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <article
      className={cn(
        "group flex flex-row items-center gap-4 py-2",
        className
      )}
    >
      <Link
        className="text-base text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4 dark:text-neutral-200 dark:hover:text-neutral-100"
        href={post.slug}
      >
        {highlightText(post.title)}
        <IsNewPost date={post.date} />
        <IsFeatured featured={post.featured} />
      </Link>
      <hr className="shrink grow border-dotted border-neutral-300 dark:border-neutral-700" />
      <time className="flex-shrink-0 whitespace-nowrap text-sm text-neutral-500">
        {post.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </time>
    </article>
  );
}
