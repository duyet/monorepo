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
          "mb-8 font-serif text-5xl font-bold text-neutral-900",
          "sm:text-6xl",
          "md:mb-10 md:text-7xl"
        )}
      >
        {year}
      </h1>

      <div className="flex flex-col gap-4">
        {posts.map((post: Post) => (
          <article
            className="group flex flex-row items-center gap-4 py-1"
            key={post.slug}
          >
            <a
              className="cursor-pointer text-base text-neutral-800 transition-colors hover:text-neutral-900 hover:underline hover:underline-offset-4"
              href={post.slug}
            >
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </a>
            <hr className="shrink grow border-dotted border-neutral-300" />
            <div className="flex-shrink-0 flex items-center gap-2 text-sm text-neutral-500">
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
