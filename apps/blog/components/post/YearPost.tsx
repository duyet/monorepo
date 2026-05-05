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

      <div className="overflow-hidden rounded-2xl border border-[#1a1a1a]/12 bg-white dark:border-white/10 dark:bg-[#171815]">
        {posts.map((post: Post) => (
          <a
            className="group flex flex-row items-center gap-3 border-b border-[#1a1a1a]/10 bg-white p-5 transition-colors first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 dark:border-white/10 dark:bg-transparent lg:p-6"
            href={post.slug}
            key={post.slug}
          >
            <div className="min-w-0 flex-1 break-words text-base font-medium leading-6 text-[#1a1a1a]/80 transition-colors group-hover:text-[#1a1a1a] dark:text-[#f8f8f2]/80 dark:group-hover:text-[#f8f8f2]">
              {post.title}
              <IsNewPost date={post.date} />
              <IsFeatured featured={post.featured} />
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
              <time className="whitespace-nowrap">
                {dateFormat(post.date, "MMM dd")}
              </time>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
