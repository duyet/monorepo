import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { IsFeatured, IsNewPost } from "./PostBadges";

export interface YearPostProps {
  year: number;
  posts: Post[];
  className?: string;
}

export function YearPost({ year, posts, className }: YearPostProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h1
        className={cn(
          "mb-4 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2]",
          "sm:text-4xl"
        )}
      >
        {year}
      </h1>

      <div className="flex flex-col gap-3">
        {posts.map((post: Post) => (
          <article
            className="group flex flex-row items-center gap-3 rounded-lg py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
            key={post.slug}
          >
            <a
              className="min-w-0 flex-1 cursor-pointer break-words text-sm leading-5 text-neutral-800 transition-colors hover:text-neutral-950 hover:underline hover:underline-offset-4 dark:text-[#f8f8f2]/80 dark:hover:text-[#f8f8f2]"
              href={post.slug}
            >
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </a>
            <hr className="hidden shrink grow border-dotted border-neutral-300 dark:border-white/15 sm:block" />
            <div className="flex flex-shrink-0 items-center gap-2 text-xs text-neutral-500 dark:text-[#f8f8f2]/50">
              <time className="whitespace-nowrap">
                {dateFormat(post.date, "MMM dd")}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
