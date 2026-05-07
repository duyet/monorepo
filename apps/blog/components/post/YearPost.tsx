import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

export interface YearPostProps {
  year: number;
  posts: Post[];
  className?: string;
}

export function YearPost({ year, posts, className }: YearPostProps) {
  if (!posts.length) return null;

  return (
    <div className={cn(className)}>
      <h2 className="mb-4 font-serif text-[36px] font-normal leading-[1.15] tracking-[-0.5px] text-[#141413] dark:text-[#f8f8f2]">
        {year}
      </h2>

      <div className="divide-y divide-[#e6dfd8] dark:divide-white/8 rounded-xl border border-[#e6dfd8] dark:border-white/8 bg-white/60 dark:bg-white/[0.02] overflow-hidden">
        {posts.map((post: Post) => {
          const [, year, month, slug] = post.slug.split("/");
          return (
            <Link
              className="group flex flex-row items-center gap-3 px-5 py-4 transition-colors hover:bg-[#efe9de]/50 dark:hover:bg-white/[0.03]"
              to="/$year/$month/$slug/"
              params={{ year, month, slug }}
              key={post.slug}
            >
              <div className="min-w-0 flex-1 text-[16px] font-medium leading-[1.4] text-[#141413] transition-colors group-hover:text-[#cc785c] dark:text-[#f8f8f2] dark:group-hover:text-[#cc785c]">
                {post.title}
              </div>
              <time className="flex-shrink-0 whitespace-nowrap text-[13px] font-medium text-[#8e8b82] dark:text-[#f8f8f2]/40">
                {dateFormat(post.date, "MMM dd")}
              </time>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
