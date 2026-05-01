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
          "mb-4 text-3xl font-semibold tracking-tight text-neutral-950",
          "sm:text-4xl"
        )}
      >
        {year}
      </h1>

      <div className="flex flex-col gap-3">
        {posts.map((post: Post) => (
          <article
            className="group flex flex-row items-center gap-3 py-0.5"
            key={post.slug}
          >
            <a
              className="cursor-pointer text-sm leading-5 text-neutral-800 transition-colors hover:text-neutral-950 hover:underline hover:underline-offset-4"
              href={post.slug}
            >
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </a>
            <hr className="shrink grow border-dotted border-neutral-300" />
            <div className="flex flex-shrink-0 items-center gap-2 text-xs text-neutral-500">
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
