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
      <h2
        className={cn(
          "mb-5 text-2xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2]",
          "sm:text-3xl"
        )}
      >
        {year}
      </h2>

      <div className="divide-y divide-[#1a1a1a]/10 rounded-xl bg-white dark:divide-white/10 dark:bg-[#1a1a1a]">
        {posts.map((post: Post) => (
          <article
            className="group flex flex-row items-center gap-3 px-5 py-4 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-[#f2f2eb] dark:hover:bg-[#242420] sm:px-6"
            key={post.slug}
          >
            <a
              className="min-w-0 flex-1 cursor-pointer break-words text-base font-medium leading-6 text-[#1a1a1a]/80 transition-colors hover:text-[#1a1a1a] hover:underline hover:underline-offset-4 dark:text-[#f8f8f2]/80 dark:hover:text-[#f8f8f2]"
              href={post.slug}
            >
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </a>
            <hr className="hidden shrink grow border-dotted border-[#1a1a1a]/15 dark:border-white/15 sm:block" />
            <div className="flex flex-shrink-0 items-center gap-2 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
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
